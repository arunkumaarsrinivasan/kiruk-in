import type { z } from "zod";
import type { ComponentType } from "react";
import { baseFrontmatter } from "./schema";

/**
 * Kiruk OS — collection definition.
 *
 * A collection is declared once by a consumer (`blog`, `notes`, later
 * `progress`/`work`/`docs`) and describes a directory of MDX under
 * `content/<id>/`. The kernel's loader/queries operate on this shape alone —
 * adding a surface is `defineCollection` + a route, with no kernel change.
 */

export interface CollectionDefinition<S extends z.ZodTypeAny> {
  /** Directory under `content/` and asset root under `public/<id>/`. */
  id: string;
  /** Zod frontmatter schema; defaults to {@link baseFrontmatter}. Extend it. */
  schema?: S;
  /** Public route for a slug. Defaults to `/<id>/<slug>`. */
  route?: (slug: string) => string;
  /** MDX component scope for `renderEntry`. */
  components?: Record<string, ComponentType<never>>;
  /** Include this collection in RSS/sitemap aggregation. */
  syndicate?: boolean;
}

export interface Collection<S extends z.ZodTypeAny = typeof baseFrontmatter> {
  id: string;
  schema: S;
  route: (slug: string) => string;
  components?: Record<string, ComponentType<never>>;
  syndicate: boolean;
}

export function defineCollection<S extends z.ZodTypeAny = typeof baseFrontmatter>(
  def: CollectionDefinition<S>,
): Collection<S> {
  return {
    id: def.id,
    // When no schema is supplied, S defaults to the baseFrontmatter type.
    schema: (def.schema ?? baseFrontmatter) as unknown as S,
    route: def.route ?? ((slug: string) => `/${def.id}/${slug}`),
    components: def.components,
    syndicate: def.syndicate ?? false,
  };
}
