import { writeFileSync } from "node:fs";
import { studioEnabled } from "@/lib/studio";
import { PREVIEW_FILE } from "@/lib/studio/preview-path";

/**
 * Live-preview stash. The editor POSTs the current MDX body here; the preview
 * page (`/studio/preview`) reads it back and server-renders it exactly like a
 * real post (era CSS, theme ink, everything). Single-author, single temp file.
 */
export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  if (!studioEnabled()) return Response.json({ error: "studio disabled" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { body?: unknown } | null;
  const source = typeof body?.body === "string" ? body.body : "";
  writeFileSync(PREVIEW_FILE, source, "utf8");
  return Response.json({ ok: true });
}
