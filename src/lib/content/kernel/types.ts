/**
 * Kiruk OS — shared entry type.
 *
 * A *collection* is a directory of MDX files under `content/<id>/`; each file
 * is an {@link Entry} with Zod-validated frontmatter + an MDX body. Frontmatter
 * types are `z.infer`red from each collection's schema (see `schema.ts`), so
 * this file holds only the structural entry shape — never field vocabulary.
 */

/**
 * A single loaded content entry — the canonical kernel shape.
 *
 * `slug` is the resolved **public** slug (an explicit frontmatter `slug` wins
 * over the file path); `fileSlug` is always the path-derived slug, kept for
 * uniqueness diagnostics. `frontmatter` is `z.infer`red from the collection's
 * schema, so it carries whatever the consumer declared.
 */
export interface Entry<F = unknown> {
  /** Owning collection id. */
  collection: string;
  /** Resolved public slug (explicit frontmatter slug wins over file path). */
  slug: string;
  /** Path-derived slug (diagnostics + uniqueness). */
  fileSlug: string;
  /** Public slug split on "/". */
  segments: string[];
  /** Validated frontmatter (inferred from the collection schema). */
  frontmatter: F;
  /** MDX source with the frontmatter block stripped. */
  body: string;
  /** Absolute source path (diagnostics only). */
  filePath: string;
}
