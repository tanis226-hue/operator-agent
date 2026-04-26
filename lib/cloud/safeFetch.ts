import { promises as dns } from "dns";
import net from "net";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 15_000;

export type SafeFetchResult = {
  body: Buffer;
  contentType: string;
  finalUrl: string;
  fileName: string | null;
};

/** Throws if hostname resolves to a private / loopback / link-local address. */
async function assertPublicHost(hostname: string): Promise<void> {
  // Reject literal IPs in private ranges right away.
  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new Error("Refusing to fetch from a private network address.");
    }
    return;
  }

  // Resolve and check every record.
  let addrs: { address: string }[];
  try {
    addrs = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error(`Could not resolve host: ${hostname}`);
  }
  for (const { address } of addrs) {
    if (isPrivateAddress(address)) {
      throw new Error("Refusing to fetch from a private network address.");
    }
  }
}

function isPrivateAddress(addr: string): boolean {
  if (net.isIPv4(addr)) {
    const [a, b] = addr.split(".").map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;
    return false;
  }
  if (net.isIPv6(addr)) {
    const lower = addr.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7
    if (lower.startsWith("fe80")) return true; // link-local
    return false;
  }
  return false;
}

function parseFileNameFromContentDisposition(cd: string | null): string | null {
  if (!cd) return null;
  // RFC 5987 filename* takes precedence
  const star = cd.match(/filename\*=(?:UTF-8'')?"?([^";]+)"?/i);
  if (star) {
    try {
      return decodeURIComponent(star[1]);
    } catch {
      return star[1];
    }
  }
  const plain = cd.match(/filename="?([^";]+)"?/i);
  return plain ? plain[1] : null;
}

/**
 * Fetches a remote URL with SSRF protection, redirect following, timeout,
 * and a hard byte cap. Returns the body as a Buffer plus content metadata.
 */
export async function safeFetch(initialUrl: string): Promise<SafeFetchResult> {
  let url = initialUrl;
  let redirects = 0;

  // Single AbortController for the full chain so the total timeout is honoured.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    while (true) {
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        throw new Error("Invalid URL.");
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Only http(s) URLs are supported.");
      }
      await assertPublicHost(parsed.hostname);

      const res = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          // Some providers (e.g. SharePoint) block requests without a UA.
          "User-Agent": "OpsAdvisorBot/1.0 (+https://opsadvisor.example)",
          Accept: "*/*",
        },
      });

      // Manual redirect handling so we can re-validate every hop against SSRF.
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        if (redirects >= MAX_REDIRECTS) {
          throw new Error("Too many redirects.");
        }
        const loc = res.headers.get("location")!;
        url = new URL(loc, url).toString();
        redirects++;
        continue;
      }

      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        (err as Error & { status?: number }).status = res.status;
        throw err;
      }

      // Stream-read with a byte cap.
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Empty response body.");
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          total += value.byteLength;
          if (total > MAX_BYTES) {
            try { await reader.cancel(); } catch { /* ignore */ }
            throw new Error(`File is larger than the ${Math.round(MAX_BYTES / (1024 * 1024))} MB cap.`);
          }
          chunks.push(value);
        }
      }
      const body = Buffer.concat(chunks.map((c) => Buffer.from(c)));

      return {
        body,
        contentType: res.headers.get("content-type") ?? "",
        finalUrl: url,
        fileName: parseFileNameFromContentDisposition(res.headers.get("content-disposition")),
      };
    }
  } finally {
    clearTimeout(timer);
  }
}
