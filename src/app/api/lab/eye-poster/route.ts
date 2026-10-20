import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { POSTER_DIR, POSTER_VARIANTS, type PosterVariant } from "@/components/three/eye/posters";

/**
 * Dev-only poster writer for /lab/eye.
 *   POST /api/lab/eye-poster  { era, variant, png }  → public/eye/posters/<era>-<variant>.avif
 *
 * The lab captures a frame of the eye as a PNG data URL; this encodes it to
 * AVIF at the variant's output width and writes it where the loader looks.
 * Production never imports this route, and it refuses to run there.
 */
export const runtime = "nodejs";

const MAX_BYTES = 24 * 1024 * 1024;

function isDev(): boolean {
  return process.env.NODE_ENV !== "production";
}

export async function POST(req: Request): Promise<Response> {
  if (!isDev()) {
    return Response.json({ error: "eye posters are dev-only" }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as {
    era?: unknown;
    variant?: unknown;
    png?: unknown;
  } | null;

  const era = typeof body?.era === "string" && /^(19|20)\d{2}$/.test(body.era) ? body.era : null;
  const variant =
    typeof body?.variant === "string" && body.variant in POSTER_VARIANTS
      ? (body.variant as PosterVariant)
      : null;
  const png =
    typeof body?.png === "string" && body.png.startsWith("data:image/png;base64,")
      ? body.png.slice("data:image/png;base64,".length)
      : null;
  if (!era || !variant || !png) {
    return Response.json({ error: "era, variant and a PNG data URL are required" }, { status: 400 });
  }

  const input = Buffer.from(png, "base64");
  if (input.byteLength > MAX_BYTES) {
    return Response.json({ error: "capture too large" }, { status: 413 });
  }

  const out = await sharp(input)
    .resize({ width: POSTER_VARIANTS[variant].outW })
    .avif({ quality: 52, effort: 6 })
    .toBuffer();

  const base = POSTER_DIR;
  const dir = join(process.cwd(), "public", ...base.split("/").filter(Boolean));
  mkdirSync(dir, { recursive: true });
  const file = `${era}-${variant}.avif`;
  writeFileSync(join(dir, file), out);

  return Response.json({ path: `${base}/${file}`, bytes: out.byteLength });
}
