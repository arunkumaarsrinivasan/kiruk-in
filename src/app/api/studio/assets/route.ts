import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { studioEnabled } from "@/lib/studio";
import { isCollection, isSafeSlug } from "@/lib/studio/posts";

/**
 * Studio asset gallery — list the images already generated for a post
 * (from the manifest, falling back to a directory scan). Author-only.
 */
export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  if (!studioEnabled()) return Response.json({ error: "studio disabled" }, { status: 403 });

  const url = new URL(req.url);
  const collection = url.searchParams.get("collection");
  const slug = url.searchParams.get("slug");
  if (!isCollection(collection) || !isSafeSlug(slug)) {
    return Response.json({ error: "collection + valid slug required" }, { status: 400 });
  }

  const dir = join(process.cwd(), "public", collection, slug);
  if (!existsSync(dir)) return Response.json({ assets: [] });

  const manifestPath = join(dir, "manifest.json");
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    return Response.json({ assets: manifest.assets ?? [] });
  }

  // Fallback: ink pages + shots + legacy sketches on disk.
  const files = readdirSync(dir)
  const inkIds = [
    ...new Set(files.map((f) => f.match(/^(ink-\d+)\./)?.[1]).filter(Boolean)),
  ] as string[]
  const inkAssets = inkIds.map((id) => ({
    id,
    vector: files.includes(`${id}.svg`) ? `/${collection}/${slug}/${id}.svg` : null,
    raster: null,
    medium: 'digital',
    kind: 'ink',
  }))
  const shotIds = [
    ...new Set(files.map((f) => f.match(/^(shot-\d+)\./)?.[1]).filter(Boolean)),
  ] as string[]
  const shotAssets = shotIds.map((id) => {
    const raster = files.find((f) => f.startsWith(`${id}.`))
    return {
      id,
      vector: null,
      raster: raster ? `/${collection}/${slug}/${raster}` : null,
      medium: 'digital',
      kind: 'shot',
    }
  })
  const sketchIds = [
    ...new Set(files.map((f) => f.match(/^(sketch-\d+)\./)?.[1]).filter(Boolean)),
  ] as string[]
  const sketchAssets = sketchIds.map((id) => ({
    id,
    vector: files.includes(`${id}.svg`) ? `/${collection}/${slug}/${id}.svg` : null,
    raster: files.includes(`${id}.webp`) ? `/${collection}/${slug}/${id}.webp` : null,
    medium: 'pen',
    kind: 'sketch',
  }))
  return Response.json({ assets: [...inkAssets, ...shotAssets, ...sketchAssets] })
}
