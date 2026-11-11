import "server-only";
import { z } from "zod";
import { baseFrontmatter, defineCollection, getEntries, getEntry, type Entry } from "@/lib/content";

/**
 * Practice: how the work is done, as pages on Read's Work shelf
 * (docs/READ_DIRECTORY_PLAN.md). `content/practice/*.mdx`, one page each at
 * /practice/<slug>. A page marked `review` is a draft written for Arun to
 * edit: it is listed and readable, but not indexed, and says so at the top.
 */

const practiceSchema = baseFrontmatter.extend({
  /** One or two sentences: the page, for its header and its row on Read. */
  summary: z.string().min(1),
  /** Position on the shelf, 1 first. */
  order: z.number().default(50),
  /** A draft for Arun to edit: shown with a note, kept out of search engines. */
  review: z.boolean().default(false),
  updated: z.string().optional(),
});

export type PracticeFrontmatter = z.infer<typeof practiceSchema>;
export type PracticeEntry = Entry<PracticeFrontmatter>;

export const PRACTICE_PATH = "/practice";

export const practice = defineCollection({
  id: "practice",
  schema: practiceSchema,
  route: (slug) => `${PRACTICE_PATH}/${slug}`,
});

export function getPracticeEntries(): PracticeEntry[] {
  return [...getEntries(practice)].sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getPracticeEntry(slug: string): PracticeEntry | undefined {
  return getEntry(practice, slug);
}
