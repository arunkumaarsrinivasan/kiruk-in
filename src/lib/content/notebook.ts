import "server-only";
import { getEntries, type Stage } from "@/lib/content";
import { blog, getBlogPost, type BlogFrontmatter } from "@/lib/content/blog";
import { notes, getNote, type NoteFrontmatter } from "@/lib/content/notes";

export type NotebookSummary = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  href: string;
  coverImage?: string;
  stage: Stage;
  tags: string[];
  related: string[];
  domain: string[];
};

export function notebookHref(slug: string): string {
  return `/notebook/${slug}`;
}

/** Perspectives first (`craft` / `method` / `walk`), then topical tags. */
export function pageLabels(entry: Pick<NotebookSummary, "domain" | "tags">): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...entry.domain, ...entry.tags]) {
    const value = raw.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function fromBlog(slug: string, fm: BlogFrontmatter): NotebookSummary {
  return {
    slug,
    title: fm.title,
    excerpt: fm.excerpt ?? "",
    date: fm.date ?? "",
    href: notebookHref(slug),
    coverImage: fm.cover,
    stage: fm.stage,
    tags: fm.tags ?? [],
    related: fm.related ?? [],
    domain: fm.domain ?? [],
  };
}

function fromNote(slug: string, fm: NoteFrontmatter): NotebookSummary {
  return {
    slug,
    title: fm.title,
    excerpt: fm.excerpt ?? "",
    date: fm.date ?? "",
    href: notebookHref(slug),
    stage: fm.stage,
    tags: fm.tags ?? [],
    related: fm.related ?? [],
    domain: [],
  };
}

function byDateDesc(a: NotebookSummary, b: NotebookSummary): number {
  return (b.date || "").localeCompare(a.date || "");
}

/** Public notebook pages, newest first. Blog wins if a slug exists in both. */
export function getNotebookEntries(): NotebookSummary[] {
  const pages = [...getEntries(blog)].map((e) => fromBlog(e.slug, e.frontmatter));
  const seen = new Set(pages.map((e) => e.slug));
  const extras = [...getEntries(notes)]
    .map((e) => fromNote(e.slug, e.frontmatter))
    .filter((n) => !seen.has(n.slug));
  return [...pages, ...extras].sort(byDateDesc);
}

export type NotebookEntry = {
  body: string;
  frontmatter: BlogFrontmatter | NoteFrontmatter;
  summary: NotebookSummary;
};

export function getNotebookEntry(slug: string): NotebookEntry | undefined {
  const post = getBlogPost(slug);
  if (post) {
    return {
      body: post.body,
      frontmatter: post.frontmatter,
      summary: fromBlog(post.summary.slug, post.frontmatter),
    };
  }
  const note = getNote(slug);
  if (note) {
    return {
      body: note.body,
      frontmatter: note.frontmatter,
      summary: fromNote(note.summary.slug, note.frontmatter),
    };
  }
  return undefined;
}

export function getNotebookNeighbors(slug: string): {
  prev: NotebookSummary | null;
  next: NotebookSummary | null;
} {
  const all = getNotebookEntries();
  const index = all.findIndex((e) => e.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: all[index + 1] ?? null,
    next: all[index - 1] ?? null,
  };
}
