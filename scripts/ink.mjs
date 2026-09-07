import { readdirSync, existsSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import * as vectorizer from "@neplex/vectorizer";
import { SCANS_DIR, assetDir } from "./_lib/paths.mjs";
import { slugify, warnIfIgnoredSlug } from "./_lib/slugify.mjs";
import { vectorConfig, themePassSvg, hasTool } from "./_lib/ink.mjs";

/**
 * `npm run ink -- <slug> [--collection blog|notes] [--mode auto|vector|raster]
 *                        [--medium pen|digital|mixed] [--force] [--no-bg]`
 *
 * Turns scans in inbox/scans/ into theme-native assets under
 * public/<collection>/<slug>/ + a manifest + ready <Figure> snippets.
 *
 * Local-first & degrades gracefully: sharp (raster) + @neplex/vectorizer
 * (SVG) are npm deps and always run. Background removal uses `rembg` only if
 * it's on PATH — otherwise that step is skipped with a note, never a crash.
 */

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const MAX_WIDTH = 2000;
const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const slug = slugify(positional[0] || "");
if (!slug) {
  console.error('usage: npm run ink -- <slug> [--collection blog|notes] [--mode auto|vector|raster]');
  process.exit(1);
}
warnIfIgnoredSlug(slug);

const collection = opt("collection") || "blog";
const mode = opt("mode") || "auto"; // auto | vector | raster
const medium = opt("medium") || "pen";
const force = flag("force");
const noBg = flag("no-bg");
// Single-file mode (`--input <path>`, used by the studio API) or batch the
// whole inbox/scans/ dir.
const inputOpt = opt("input");
let sources;
if (inputOpt) {
  if (!existsSync(inputOpt)) {
    console.error(`input not found: ${inputOpt}`);
    process.exit(1);
  }
  sources = [inputOpt];
} else {
  sources = readdirSync(SCANS_DIR)
    .filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()))
    .sort()
    .map((f) => join(SCANS_DIR, f));
  if (sources.length === 0) {
    console.error("no images in inbox/scans/ (png/jpg/jpeg/webp)");
    process.exit(1);
  }
}

const outDir = assetDir(collection, slug);
mkdirSync(outDir, { recursive: true });

// Continue numbering from existing assets so re-runs / studio inserts append
// rather than clobber sketch-01.
const existingNums = readdirSync(outDir)
  .map((f) => f.match(/^sketch-(\d+)\.(?:svg|webp)$/))
  .filter(Boolean)
  .map((m) => parseInt(m[1], 10));

const rembgAvailable = !noBg && hasTool("rembg");
if (!noBg && !rembgAvailable) {
  console.warn("ℹ  rembg not on PATH — skipping paper/background removal (raster keeps its background).");
}

const assets = [];
let n = existingNums.length ? Math.max(...existingNums) : 0;

for (const src of sources) {
  n += 1;
  const id = `sketch-${String(n).padStart(2, "0")}`;
  const file = basename(src);

  // 1. Normalize: auto-rotate (EXIF), trim uniform margins, boost contrast.
  const normalized = await sharp(src).rotate().trim().normalise().toBuffer();

  // 2. Quality gate — greyscale contrast (stdev). Low = muddy scan.
  const stats = await sharp(normalized).greyscale().stats();
  const stdev = stats.channels[0].stdev;
  if (stdev < 18 && !force) {
    console.warn(`⚠  ${file}: low contrast (stdev ${stdev.toFixed(1)}) — skipped. Re-shoot or pass --force.`);
    n -= 1;
    continue;
  }

  // 3. Optional paper removal via rembg.
  let working = normalized;
  let hasAlpha = false;
  if (rembgAvailable) {
    try {
      const inTmp = join(tmpdir(), `ink-${slug}-${id}-in.png`);
      const outTmp = join(tmpdir(), `ink-${slug}-${id}-out.png`);
      writeFileSync(inTmp, await sharp(normalized).png().toBuffer());
      execFileSync("rembg", ["i", inTmp, outTmp], { stdio: "ignore", timeout: 120000 });
      working = readFileSync(outTmp);
      hasAlpha = true;
    } catch {
      console.warn(`⚠  ${file}: rembg failed — continuing with original background.`);
    }
  }

  // 4. Vector (unless --mode raster). Threshold → binary trace → theme-pass.
  let vectorRel = null;
  if (mode !== "raster") {
    try {
      const binary = await sharp(working)
        .flatten({ background: "#ffffff" })
        .greyscale()
        .threshold(180)
        .png()
        .toBuffer();
      const raw = await vectorizer.vectorize(binary, vectorConfig(vectorizer));
      writeFileSync(join(outDir, `${id}.svg`), themePassSvg(raw), "utf8");
      vectorRel = `/${collection}/${slug}/${id}.svg`;
    } catch (err) {
      console.warn(`⚠  ${file}: vectorize failed (${err.message}) — raster only.`);
    }
  }

  // 5. Raster sibling — always emitted (fallback + OG + dense pages).
  const rasterName = `${id}.webp`;
  await sharp(working)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(join(outDir, rasterName));
  const rasterRel = `/${collection}/${slug}/${rasterName}`;
  const rmeta = await sharp(join(outDir, rasterName)).metadata();

  assets.push({
    id,
    source: file,
    vector: vectorRel,
    raster: rasterRel,
    mode: vectorRel ? "vector" : "raster",
    medium,
    alt: "",
    width: rmeta.width,
    height: rmeta.height,
    background: hasAlpha ? "transparent" : "original",
  });
}

if (assets.length === 0) {
  console.error("no assets produced.");
  process.exit(1);
}

// Manifest — source of truth for draft-post / OG picks later.
const manifest = { slug, collection, assets };
writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

// Ready-to-paste <Figure> snippets.
const snippets = assets
  .map((a) => {
    const srcLine = `  src="${a.vector ?? a.raster}"`;
    const rasterLine = a.vector ? `\n  srcRaster="${a.raster}"` : "";
    const inkLine = a.vector ? `\n  ink="theme"` : "";
    return `<Figure\n${srcLine}${rasterLine}${inkLine}\n  medium="${a.medium}"\n  alt="TODO: describe this sketch"\n/>`;
  })
  .join("\n\n");

console.log(`✎ ${assets.length} asset(s) → public/${collection}/${slug}/ (+ manifest.json)`);
console.log("\nPaste into your MDX (fill in alt):\n");
console.log(snippets);
