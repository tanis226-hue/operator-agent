/**
 * Rewrites a "share with anyone" URL from common cloud providers into a
 * direct-download URL we can fetch server-side without auth.
 *
 * Supported:
 *  - Google Drive files  (drive.google.com/file/d/<ID>/...)
 *  - Google Sheets       (docs.google.com/spreadsheets/d/<ID>/...)  → CSV export
 *  - Google Docs         (docs.google.com/document/d/<ID>/...)      → TXT export
 *  - Google Slides       (docs.google.com/presentation/d/<ID>/...)  → TXT export
 *  - SharePoint / OneDrive (sharepoint.com / onedrive.live.com / 1drv.ms)
 *  - Plain http(s)       (passthrough)
 */

export type RewriteResult = {
  url: string;
  /** Hint about the format we expect to receive. Used as a fallback when the response Content-Type is missing or generic. */
  expectedFormat: "csv" | "txt" | "raw";
  /** A short label to display (often the document id). */
  displayName: string;
  provider: "gdrive" | "gsheet" | "gdoc" | "gslides" | "sharepoint" | "onedrive" | "other";
};

function extractGid(url: string): string | null {
  // gid can appear in fragment (#gid=123) or query (?gid=123)
  const m = url.match(/[#?&]gid=(\d+)/);
  return m ? m[1] : null;
}

export function rewriteShareUrl(rawUrl: string): RewriteResult {
  let u: URL;
  try {
    u = new URL(rawUrl.trim());
  } catch {
    throw new Error("Invalid URL.");
  }

  const host = u.hostname.toLowerCase();

  // ── Google Sheets ────────────────────────────────────────────────────────
  if (host === "docs.google.com" && u.pathname.startsWith("/spreadsheets/")) {
    const idMatch = u.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!idMatch) throw new Error("Could not parse Google Sheets URL.");
    const id = idMatch[1];
    const gid = extractGid(rawUrl);
    const exportUrl = gid
      ? `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`
      : `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
    return { url: exportUrl, expectedFormat: "csv", displayName: `Sheet ${id.slice(0, 8)}`, provider: "gsheet" };
  }

  // ── Google Docs ──────────────────────────────────────────────────────────
  if (host === "docs.google.com" && u.pathname.startsWith("/document/")) {
    const idMatch = u.pathname.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (!idMatch) throw new Error("Could not parse Google Docs URL.");
    const id = idMatch[1];
    return {
      url: `https://docs.google.com/document/d/${id}/export?format=txt`,
      expectedFormat: "txt",
      displayName: `Doc ${id.slice(0, 8)}`,
      provider: "gdoc",
    };
  }

  // ── Google Slides ────────────────────────────────────────────────────────
  if (host === "docs.google.com" && u.pathname.startsWith("/presentation/")) {
    const idMatch = u.pathname.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (!idMatch) throw new Error("Could not parse Google Slides URL.");
    const id = idMatch[1];
    return {
      url: `https://docs.google.com/presentation/d/${id}/export/txt`,
      expectedFormat: "txt",
      displayName: `Slides ${id.slice(0, 8)}`,
      provider: "gslides",
    };
  }

  // ── Google Drive (file) ─────────────────────────────────────────────────
  if (host === "drive.google.com") {
    let id: string | null = null;
    const pathMatch = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (pathMatch) id = pathMatch[1];
    if (!id) id = u.searchParams.get("id");
    if (!id) throw new Error("Could not parse Google Drive URL — expected a file/d/<ID> link.");
    return {
      url: `https://drive.google.com/uc?export=download&id=${id}`,
      expectedFormat: "raw",
      displayName: `Drive ${id.slice(0, 8)}`,
      provider: "gdrive",
    };
  }

  // ── SharePoint ──────────────────────────────────────────────────────────
  if (host.endsWith(".sharepoint.com")) {
    // Append download=1 to force a direct download response.
    const newUrl = new URL(u.toString());
    newUrl.searchParams.set("download", "1");
    return {
      url: newUrl.toString(),
      expectedFormat: "raw",
      displayName: u.pathname.split("/").pop() || "SharePoint file",
      provider: "sharepoint",
    };
  }

  // ── OneDrive (consumer + 1drv.ms) ───────────────────────────────────────
  if (host === "onedrive.live.com" || host === "1drv.ms") {
    // 1drv.ms shortlinks redirect to onedrive.live.com — safeFetch follows redirects.
    const newUrl = new URL(u.toString());
    newUrl.searchParams.set("download", "1");
    return {
      url: newUrl.toString(),
      expectedFormat: "raw",
      displayName: u.pathname.split("/").pop() || "OneDrive file",
      provider: "onedrive",
    };
  }

  // ── Plain http(s) — pass through ────────────────────────────────────────
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http(s) URLs are supported.");
  }

  const tail = u.pathname.split("/").pop() || u.hostname;
  return {
    url: u.toString(),
    expectedFormat: "raw",
    displayName: tail,
    provider: "other",
  };
}
