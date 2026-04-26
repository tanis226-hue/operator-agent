import { loadDemoResult } from "@/lib/demoOutput";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const result = loadDemoResult();
    return Response.json({ ...result, usedFallback: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
