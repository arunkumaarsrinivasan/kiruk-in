import { z } from "zod";

/**
 * Kiruk OS — frontmatter schema primitives.
 *
 * Every collection declares a Zod schema; entry types are `z.infer`red from it,
 * so the schema is the single source of truth (no parallel hand-written
 * interfaces). Consumers `.extend()` `baseFrontmatter` with surface-specific
 * fields — the kernel never learns those field names.
 */

/** Growth stage — digital-garden signal that unfinished thinking is allowed. */
export const stageEnum = z.enum(["seedling", "growing", "evergreen"]);
export type Stage = z.infer<typeof stageEnum>;

/** Notebook geometry — scroll sheet vs book spread (studio + reader). */
export const notebookViewSchema = z.object({
  layout: z.enum(["scroll", "spread"]).default("scroll"),
  ruler: z.enum(["none", "margin", "ruled"]).default("none"),
  paper: z.enum(["clean", "rough"]).default("clean"),
  fit: z.boolean().default(false),
});

/** Frontmatter shared by every collection. */
export const baseFrontmatter = z.object({
  /** Human title (also the H1). */
  title: z.string().min(1),
  /** Explicit public slug; defaults to the file path when omitted. */
  slug: z.string().min(1).optional(),
  /** Hide from public listings/builds when true. */
  draft: z.boolean().default(false),
  /** Garden growth stage. */
  stage: stageEnum.default("seedling"),
  /** Capture provenance (thought, pen, tablet, figma, studio, note, import). */
  source: z.string().optional(),
  /** Manual related-slug graph, until a wikilink index exists. */
  related: z.array(z.string()).optional(),
  /** Freeform tags. */
  tags: z.array(z.string()).optional(),
  /** Page geometry: scroll | spread, ruler, paper feel, fit-to-screen. */
  notebook: notebookViewSchema.optional(),
  /** Flat aliases (older drafts / manual edits). */
  notebookLayout: z.enum(["scroll", "spread"]).optional(),
  notebookRuler: z.enum(["none", "margin", "ruled"]).optional(),
  notebookPaper: z.enum(["clean", "rough"]).optional(),
  notebookFit: z.boolean().optional(),
});

export type BaseFrontmatter = z.infer<typeof baseFrontmatter>;
