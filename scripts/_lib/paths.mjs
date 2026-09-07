import { join } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Repo paths for the content CLIs. Cross-platform via node:path — never
 * hardcode "/". `process.cwd()` is the package root when run via npm scripts.
 */
const ROOT = process.cwd();

export const CONTENT_DIR = join(ROOT, "content");
export const PUBLIC_DIR = join(ROOT, "public");
export const INBOX_DIR = join(ROOT, "inbox");
export const THOUGHTS_DIR = join(INBOX_DIR, "thoughts");
export const SCANS_DIR = join(INBOX_DIR, "scans");

export const collectionDir = (id) => join(CONTENT_DIR, id);
export const entryFile = (id, slug) => join(collectionDir(id), `${slug}.mdx`);
export const assetDir = (collection, slug) => join(PUBLIC_DIR, collection, slug);

// Self-test: `node scripts/_lib/paths.mjs`
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sample = entryFile("blog", "my-post");
  const publicSample = assetDir("blog", "my-post");
  console.log("entryFile:", sample);
  console.log("assetDir :", publicSample);
  // Slugs the loader produces are forward-slash; asset URLs must be too.
  console.log("url form :", "/blog/my-post/sketch-01.svg");
}
