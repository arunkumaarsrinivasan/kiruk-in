import "server-only";
import { z } from "zod";
import { baseFrontmatter, defineCollection, getEntries, type Entry } from "@/lib/content";

/**
 * Work collection: the cases /work leads with, under `content/work/`. Each
 * file is one case as a portfolio presentation: frontmatter for the header
 * and the work map (sector, headline number, links), MDX for the body (hero
 * shot, metrics, iterations, facts). The components live in
 * components/work-showcase/mdx.tsx.
 */

/** The frontmatter reader is flat, so a link is one line: "Label | https://… | live". */
const link = z
  .string()
  .transform((v) => v.split("|").map((p) => p.trim()))
  .pipe(z.tuple([z.string().min(1), z.string().url(), z.enum(["live", "figma", "behance", "github"])]))
  .transform(([label, href, kind]) => ({ label, href, kind }));

/** And a headline number: "45% | more student engagement". */
const number = z
  .string()
  .transform((v) => v.split("|").map((p) => p.trim()))
  .pipe(z.tuple([z.string().min(1), z.string().min(1)]))
  .transform(([value, label]) => ({ value, label }));

const workSchema = baseFrontmatter.extend({
  /** Position on the page, 1 first. */
  order: z.number(),
  /** The portfolio-data project this case opens from. */
  project: z.string(),
  /** Other projects folded into this case. */
  also: z.array(z.string()).optional(),
  /** Where the work was made: its sector on the work map. */
  sector: z.enum(["spera", "hp", "sns", "peoplegamez", "independent"]),
  /** The one number the map and the case list lead with. */
  headline: number,
  pitch: z.string(),
  role: z.string(),
  when: z.string(),
  nda: z.boolean().default(false),
  /** First one is the main door. */
  links: z.array(link).min(1),
});

export type WorkFrontmatter = z.infer<typeof workSchema>;
export type WorkEntry = Entry<WorkFrontmatter>;

export const work = defineCollection({
  id: "work",
  schema: workSchema,
  route: (slug) => `/work#${slug}`,
});

/** The cases in page order. */
export function getWorkCases(): WorkEntry[] {
  return [...getEntries(work)].sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}
