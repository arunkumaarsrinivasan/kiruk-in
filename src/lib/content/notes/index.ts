import "server-only";
import { z } from "zod";
import {
  baseFrontmatter,
  defineCollection,
  getEntries,
  getEntry,
  type Entry,
} from "@/lib/content";

/**
 * Notes collection — short thoughts / TILs / seedlings under `content/notes/`.
 * A second consumer of the Kiruk OS kernel, added with ZERO kernel changes —
 * just a schema + a route. Lighter frontmatter than blog; `stage`/`source`/
 * `tags` come from the shared base.
 */

const notesSchema = baseFrontmatter.extend({
  /** One-line teaser for the notes index + feed. */
  excerpt: z.string().optional(),
  /** Publication date (ISO, YYYY-MM-DD). Sorts newest first. */
  date: z.string().optional(),
});

export type NoteFrontmatter = z.infer<typeof notesSchema>;
export type NoteEntry = Entry<NoteFrontmatter>;

export const notes = defineCollection({
  id: "notes",
  schema: notesSchema,
  route: (slug) => `/notes/${slug}`,
  syndicate: true,
});

export interface NoteSummary {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  stage: NoteFrontmatter["stage"];
  tags: string[];
}

function toSummary(entry: NoteEntry): NoteSummary {
  const { title, excerpt, date, stage, tags } = entry.frontmatter;
  return {
    slug: entry.slug,
    title,
    excerpt: excerpt ?? "",
    date: date ?? "",
    stage,
    tags: tags ?? [],
  };
}

/** All notes as summaries, newest first by `date`. */
export function getNotes(): NoteSummary[] {
  return [...getEntries(notes)]
    .sort((a, b) =>
      (b.frontmatter.date ?? "").localeCompare(a.frontmatter.date ?? ""),
    )
    .map(toSummary);
}

/** One note by its public slug — frontmatter + raw MDX body + summary. */
export function getNote(slug: string):
  | { frontmatter: NoteFrontmatter; body: string; summary: NoteSummary }
  | undefined {
  const entry = getEntry(notes, slug);
  if (!entry) return undefined;
  return { frontmatter: entry.frontmatter, body: entry.body, summary: toSummary(entry) };
}
