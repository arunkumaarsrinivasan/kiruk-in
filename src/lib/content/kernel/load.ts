import "server-only";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { z } from "zod";
import { parseFrontmatter } from "./frontmatter";
import type { Collection } from "./define-collection";
import type { Entry } from "./types";

/**
 * Kiruk OS kernel — loader + queries.
 *
 * Reads every `.mdx` under `content/<id>/` at build time (server only; no
 * client fs), parses + **Zod-validates** frontmatter, resolves a public slug,
 * and returns typed entries. Results cache at module scope in production so a
 * build resolves each collection once; in dev we re-read every call because
 * content files live outside Next's module graph and never trigger HMR.
 *
 * The loader is collection-agnostic: a collection supplies only its id + schema
 * (+ route/components). Slugs, sorting, draft policy, and uniqueness are shared.
 */

const CONTENT_ROOT = join(process.cwd(), "content");
const entryCache = new Map<string, Entry[]>();

function walkMdx(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const dirent of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, dirent.name);
    if (dirent.isDirectory()) out.push(...walkMdx(full));
    else if (dirent.isFile() && dirent.name.endsWith(".mdx")) out.push(full);
  }
  return out;
}

export interface QueryOptions {
  /** Include drafts. Defaults to the `INCLUDE_DRAFTS=1` env flag. */
  includeDrafts?: boolean;
}

function wantDrafts(opts?: QueryOptions): boolean {
  return opts?.includeDrafts ?? process.env.INCLUDE_DRAFTS === "1";
}

/**
 * Load + Zod-validate every entry in a collection (drafts included), cached in
 * production. Throws loud — prefixed with the offending file path — on a bad
 * fence, invalid frontmatter, or a duplicate resolved slug.
 */
function loadAll<S extends z.ZodTypeAny>(collection: Collection<S>): Entry<z.infer<S>>[] {
  const useCache = process.env.NODE_ENV === "production";
  if (useCache) {
    const cached = entryCache.get(collection.id);
    if (cached) return cached as Entry<z.infer<S>>[];
  }

  const dir = join(CONTENT_ROOT, collection.id);
  const entries: Entry<z.infer<S>>[] = [];
  const bySlug = new Map<string, string>();

  for (const filePath of walkMdx(dir)) {
    const fileSlug = relative(dir, filePath).replace(/\.mdx$/, "").split(sep).join("/");

    let parsed: ReturnType<typeof parseFrontmatter>;
    try {
      parsed = parseFrontmatter(readFileSync(filePath, "utf8"));
    } catch (err) {
      throw new Error(`content/${collection.id}/${fileSlug}.mdx: ${(err as Error).message}`);
    }

    const result = collection.schema.safeParse(parsed.data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("; ");
      throw new Error(
        `content/${collection.id}/${fileSlug}.mdx: invalid frontmatter — ${issues}`,
      );
    }

    const fm = result.data as z.infer<S> & { slug?: unknown };
    const explicit = typeof fm.slug === "string" ? fm.slug.trim() : "";
    const slug = explicit || fileSlug;

    const clash = bySlug.get(slug);
    if (clash) {
      throw new Error(
        `content/${collection.id}: duplicate slug "${slug}" — "${clash}" and "${filePath}"`,
      );
    }
    bySlug.set(slug, filePath);

    entries.push({
      collection: collection.id,
      slug,
      fileSlug,
      segments: slug.split("/"),
      frontmatter: fm,
      body: parsed.body,
      filePath,
    });
  }

  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  if (useCache) entryCache.set(collection.id, entries as Entry[]);
  return entries;
}

/**
 * Public entries for a collection, slug-sorted. Drafts are excluded unless
 * `includeDrafts` (or `INCLUDE_DRAFTS=1`) is set — this policy is explicit and
 * independent of `NODE_ENV`.
 */
export function getEntries<S extends z.ZodTypeAny>(
  collection: Collection<S>,
  opts?: QueryOptions,
): Entry<z.infer<S>>[] {
  const all = loadAll(collection);
  if (wantDrafts(opts)) return all;
  return all.filter((e) => (e.frontmatter as { draft?: boolean }).draft !== true);
}

/** One entry by resolved public slug, falling back to the file-path slug. */
export function getEntry<S extends z.ZodTypeAny>(
  collection: Collection<S>,
  slug: string,
  opts?: QueryOptions,
): Entry<z.infer<S>> | undefined {
  const entries = getEntries(collection, opts);
  return entries.find((e) => e.slug === slug) ?? entries.find((e) => e.fileSlug === slug);
}

/** Public entries across several collections (feed / sitemap / search). */
export function getAllEntries(
  collections: Collection<z.ZodTypeAny>[],
  opts?: QueryOptions,
): Entry[] {
  return collections.flatMap((c) => getEntries(c, opts) as Entry[]);
}
