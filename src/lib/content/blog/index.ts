import "server-only";
import { z } from "zod";
import {
  baseFrontmatter,
  defineCollection,
  getEntries,
  getEntry,
  type Entry,
} from "@/lib/content";
import type { BlogArticleSummary } from "@/types/blog";

/**
 * Blog collection — MDX files under `content/blog/`, a consumer of the Kiruk OS
 * kernel. Blog-specific frontmatter (`domain`, `excerpt`, `date`, `cover`) is
 * declared here and mapped onto the existing blog UI shapes so `ArticleCard`
 * and the article page need no rework. The kernel never learns these names.
 */

const blogSchema = baseFrontmatter.extend({
  /** Categories/tags — drives the domain filter on the listing page. */
  domain: z.array(z.string()).optional(),
  /** One-line teaser for cards, the detail header, and meta description. */
  excerpt: z.string().optional(),
  /** Publication date (ISO, YYYY-MM-DD). Sorts posts newest first. */
  date: z.string().optional(),
  /** Cover image path under /public. */
  cover: z.string().optional(),
  /** Optional Substack (or other) syndicate URL — shown next to agent.md. */
  substack: z.string().url().optional(),
});

export type BlogFrontmatter = z.infer<typeof blogSchema>;
export type BlogEntry = Entry<BlogFrontmatter>;

export const blog = defineCollection({
  id: "blog",
  schema: blogSchema,
  route: (slug) => `/notebook/${slug}`,
  syndicate: true,
});

/** Map a loaded entry to the summary shape the listing UI expects. */
function toSummary(entry: BlogEntry): BlogArticleSummary {
  const { title, domain, excerpt, date, cover } = entry.frontmatter;
  return {
    id: entry.slug,
    title,
    slug: entry.slug,
    domain: domain ?? [],
    excerpt: excerpt ?? "",
    publishedDate: date ?? "",
    coverImage: cover,
    published: true,
  };
}

/** All posts as listing summaries, newest first by `date`. */
export function getBlogPosts(): BlogArticleSummary[] {
  return [...getEntries(blog)]
    .sort((a, b) =>
      (b.frontmatter.date ?? "").localeCompare(a.frontmatter.date ?? ""),
    )
    .map(toSummary);
}

/** One post by its public slug — frontmatter + raw MDX body for rendering. */
export function getBlogPost(slug: string):
  | { frontmatter: BlogFrontmatter; body: string; summary: BlogArticleSummary }
  | undefined {
  const entry = getEntry(blog, slug);
  if (!entry) return undefined;
  return {
    frontmatter: entry.frontmatter,
    body: entry.body,
    summary: toSummary(entry),
  };
}
