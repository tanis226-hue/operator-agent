/**
 * Convert a downloaded file body into plain text we can feed into the analysis
 * prompt. Routes by Content-Type first, then file extension as a fallback.
 */

export type ExtractedFile = {
  text: string;
  rowCount: number; // number of newlines in the text — informational
  kind: "csv" | "tsv" | "text" | "json" | "xlsx" | "docx";
};

export type ExtractInput = {
  body: Buffer;
  contentType: string;
  /** Final URL after redirects — used for extension sniffing. */
  url: string;
  /** Filename from Content-Disposition or the share-link helper. */
  fileName?: string | null;
  /** Hint from the rewriter (e.g. Google Sheets export → "csv"). */
  expectedFormat?: "csv" | "txt" | "raw";
};

const TEXTY_TYPES = [
  "text/plain",
  "text/csv",
  "text/tab-separated-values",
  "text/markdown",
  "application/json",
  "text/json",
];

const HTML_TYPES = ["text/html", "application/xhtml+xml"];

function getExt(url: string, fileName?: string | null): string {
  const candidate = (fileName ?? url).toLowerCase();
  const m = candidate.match(/\.([a-z0-9]+)(?:\?|$|#)/);
  return m ? m[1] : "";
}

function countRows(text: string): number {
  // Counts non-empty lines minus 1 for the header (mirrors DB connector behaviour).
  const lines = text.split("\n").filter((l) => l.length > 0).length;
  return Math.max(0, lines - 1);
}

export async function extractText(input: ExtractInput): Promise<ExtractedFile> {
  const ct = input.contentType.toLowerCase().split(";")[0].trim();
  const ext = getExt(input.url, input.fileName);

  // Catch the "Google says you need to log in" case: the export endpoint returns
  // an HTML sign-in page with a 200 status when a file isn't actually public.
  if (HTML_TYPES.includes(ct) && input.expectedFormat !== "raw") {
    throw new Error(
      "The link returned a sign-in page instead of the file. Make sure sharing is set to 'Anyone with the link can view' and try again."
    );
  }

  // ── XLSX ──────────────────────────────────────────────────────────────
  if (
    ct === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    ct === "application/vnd.ms-excel" ||
    ext === "xlsx" ||
    ext === "xls"
  ) {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(input.body, { type: "buffer" });
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) throw new Error("Workbook has no sheets.");
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[firstSheetName]);
    return { text: csv, rowCount: countRows(csv), kind: "xlsx" };
  }

  // ── DOCX ──────────────────────────────────────────────────────────────
  if (
    ct === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: input.body });
    return { text: value, rowCount: countRows(value), kind: "docx" };
  }

  // ── JSON ──────────────────────────────────────────────────────────────
  if (ct === "application/json" || ct === "text/json" || ext === "json") {
    const text = input.body.toString("utf-8");
    return { text, rowCount: countRows(text), kind: "json" };
  }

  // ── TSV ───────────────────────────────────────────────────────────────
  if (ct === "text/tab-separated-values" || ext === "tsv") {
    const text = input.body.toString("utf-8");
    return { text, rowCount: countRows(text), kind: "tsv" };
  }

  // ── CSV ───────────────────────────────────────────────────────────────
  if (ct === "text/csv" || ext === "csv" || input.expectedFormat === "csv") {
    const text = input.body.toString("utf-8");
    return { text, rowCount: countRows(text), kind: "csv" };
  }

  // ── Plain text / markdown / log ───────────────────────────────────────
  if (
    TEXTY_TYPES.includes(ct) ||
    ext === "txt" ||
    ext === "md" ||
    ext === "log" ||
    input.expectedFormat === "txt"
  ) {
    const text = input.body.toString("utf-8");
    return { text, rowCount: countRows(text), kind: "text" };
  }

  // Anything else → reject with a clear, actionable error.
  throw new Error(
    `Unsupported file type${ct ? ` (${ct})` : ""}. Try CSV, TSV, TXT, MD, JSON, XLSX, or DOCX.`
  );
}
