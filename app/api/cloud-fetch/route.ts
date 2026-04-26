import { NextResponse } from "next/server";
import { rewriteShareUrl } from "@/lib/cloud/rewriteShareUrl";
import { safeFetch } from "@/lib/cloud/safeFetch";
import { extractText } from "@/lib/cloud/extractText";

export const maxDuration = 30;

type RequestBody = { url?: string };

function friendlyError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const m = raw.toLowerCase();
  const status = (err as { status?: number })?.status;

  if (status === 401 || status === 403 || m.includes("http 401") || m.includes("http 403")) {
    return {
      status: 403,
      message: "The link isn't public. Set sharing to 'Anyone with the link can view' and try again.",
    };
  }
  if (status === 404 || m.includes("http 404")) {
    return { status: 404, message: "File not found at that URL." };
  }
  if (m.includes("aborted") || m.includes("timeout") || m.includes("timed out")) {
    return { status: 504, message: "The download took too long. The file may be too large or the host unreachable." };
  }
  if (m.includes("private network")) {
    return { status: 400, message: "Refusing to fetch from a private or local address." };
  }
  if (m.includes("too many redirects")) {
    return { status: 502, message: "The host returned too many redirects." };
  }
  if (m.includes("larger than")) {
    return { status: 413, message: raw };
  }
  if (m.includes("unsupported file type") || m.includes("workbook has no sheets")) {
    return { status: 415, message: raw };
  }
  if (m.includes("sign-in page")) {
    return { status: 403, message: raw };
  }
  if (m.includes("invalid url") || m.includes("could not parse") || m.includes("only http")) {
    return { status: 400, message: raw };
  }
  return { status: 500, message: `Fetch failed: ${raw.slice(0, 200)}` };
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  try {
    const rewritten = rewriteShareUrl(url);
    const fetched = await safeFetch(rewritten.url);
    const extracted = await extractText({
      body: fetched.body,
      contentType: fetched.contentType,
      url: fetched.finalUrl,
      fileName: fetched.fileName,
      expectedFormat: rewritten.expectedFormat,
    });

    const displayName = fetched.fileName ?? rewritten.displayName;

    return NextResponse.json({
      tsv: extracted.text,
      rowCount: extracted.rowCount,
      name: displayName,
      kind: extracted.kind,
      provider: rewritten.provider,
    });
  } catch (err) {
    const { status, message } = friendlyError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
