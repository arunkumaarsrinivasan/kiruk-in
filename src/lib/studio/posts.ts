import "server-only";
import {
  readdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "@/lib/content";

/**
 * Studio post store — author-side read/write over `content/<collection>/*.mdx`.
 * Identity is the **file slug** (filename without `.mdx`); the frontmatter
 * `slug` is just an editable field. Kept separate from the read-only kernel:
 * this module mutates the repo and is only reachable through gated APIs.
 */

export const COLLECTIONS = ["blog", "notes"] as const;
export type StudioCollection = (typeof COLLECTIONS)[number];
export function isCollection(x: unknown): x is StudioCollection {
  return typeof x === "string" && (COLLECTIONS as readonly string[]).includes(x);
}

const CONTENT = join(process.cwd(), "content");
const collDir = (c: StudioCollection) => join(CONTENT, c);
const fileFor = (c: StudioCollection, fileSlug: string) => {
  if (!isSafeSlug(fileSlug)) throw new Error(`unsafe slug: ${fileSlug}`);
  return join(collDir(c), `${fileSlug}.mdx`);
};

/**
 * File slugs become path segments under `content/` and `public/`, so anything
 * that could escape those directories (`..`, separators, drive letters) must be
 * rejected before it reaches `join`. Matches what `slugify` produces.
 */
export function isSafeSlug(x: unknown): x is string {
  return typeof x === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ── frontmatter serialization (YAML subset the kernel parser reads) ──
function needsQuote(v: string): boolean {
  return /[:#[\]"']/.test(v) || /^\s|\s$/.test(v) || v === "";
}
function scalar(v: unknown): string {
  if (typeof v === "string") return needsQuote(v) ? JSON.stringify(v) : v;
  return String(v);
}
export function serializeFrontmatter(fm: Record<string, unknown>): string {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) {
    if (v === undefined || v === null) continue;
    // Drop flat notebook* aliases if nested `notebook` is present.
    if (
      k.startsWith("notebook") &&
      k !== "notebook" &&
      fm.notebook &&
      typeof fm.notebook === "object"
    ) {
      continue;
    }
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map(scalar).join(", ")}]`);
    } else if (typeof v === "object") {
      lines.push(`${k}:`);
      for (const [ck, cv] of Object.entries(v as Record<string, unknown>)) {
        if (cv === undefined || cv === null) continue;
        lines.push(`  ${ck}: ${scalar(cv)}`);
      }
    } else {
      lines.push(`${k}: ${scalar(v)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

export interface PostListItem {
  collection: StudioCollection;
  fileSlug: string;
  title: string;
  draft: boolean;
  stage: string;
  date: string;
}

export function listPosts(): PostListItem[] {
  const out: PostListItem[] = [];
  for (const c of COLLECTIONS) {
    const dir = collDir(c);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".mdx")) continue;
      const fileSlug = f.replace(/\.mdx$/, "");
      let data: Record<string, unknown> = {};
      try {
        data = parseFrontmatter(readFileSync(join(dir, f), "utf8")).data;
      } catch {
        // malformed — still list it so it can be fixed in the editor
      }
      out.push({
        collection: c,
        fileSlug,
        title: String(data.title ?? fileSlug),
        draft: data.draft === true,
        stage: String(data.stage ?? "seedling"),
        date: String(data.date ?? ""),
      });
    }
  }
  return out.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export interface PostDoc {
  collection: StudioCollection;
  fileSlug: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

export function readPost(c: StudioCollection, fileSlug: string): PostDoc | undefined {
  const file = fileFor(c, fileSlug);
  if (!existsSync(file)) return undefined;
  const { data, body } = parseFrontmatter(readFileSync(file, "utf8"));
  return { collection: c, fileSlug, frontmatter: data, body };
}

export function writePost(
  c: StudioCollection,
  fileSlug: string,
  frontmatter: Record<string, unknown>,
  body: string,
): void {
  mkdirSync(collDir(c), { recursive: true });
  writeFileSync(fileFor(c, fileSlug), `${serializeFrontmatter(frontmatter)}\n\n${body.trim()}\n`, "utf8");
}

/** Create a draft scaffold; returns the (collision-safe) file slug. */
export function createPost(c: StudioCollection, title: string): string {
  const base = slugify(title) || "untitled";
  let fileSlug = base;
  let i = 2;
  while (existsSync(fileFor(c, fileSlug))) fileSlug = `${base}-${i++}`;

  const frontmatter = {
    title,
    slug: fileSlug,
    excerpt: "",
    date: today(),
    draft: true,
  };

  writePost(
    c,
    fileSlug,
    frontmatter,
    [
      "Start writing…",
      "",
      `{/* Draw in studio → <InkPage />, or drop a screenshot → <Figure /> */}`,
    ].join("\n"),
  );
  return fileSlug;
}

/** Delete a post's MDX. Assets under public/ are left unless `withAssets`. */
export function deletePost(c: StudioCollection, fileSlug: string, withAssets = false): boolean {
  const file = fileFor(c, fileSlug);
  if (!existsSync(file)) return false;
  unlinkSync(file);
  if (withAssets) {
    const assetDir = join(process.cwd(), "public", c, fileSlug);
    if (existsSync(assetDir)) rmSync(assetDir, { recursive: true, force: true });
  }
  return true;
}
