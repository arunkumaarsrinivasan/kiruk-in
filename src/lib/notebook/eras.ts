import { AVAILABLE_THEMES } from "@/data/portfolio-data";

/** Default public notebook skin — Era 1 (Terminal & ASCII). */
export const DEFAULT_NOTEBOOK_ERA = "1970";

/** Persists the reader's notebook-only era shuffle (does not touch site theme). */
export const NOTEBOOK_ERA_STORAGE_KEY = "kiruk-notebook-era";

/**
 * Eras with a reading-tuned blog skin. Shuffle still paints every year via
 * existing `data-era-surface` tokens; unfinished years show a chrome hint.
 */
export const BLOG_READY_ERAS = ["1970"] as const;

export type NotebookEraLite = {
  id: string;
  name: string;
  description?: string;
  colors: { accent: string };
};

export const NOTEBOOK_ERA_LITES: NotebookEraLite[] = AVAILABLE_THEMES.map((theme) => ({
  id: theme.id,
  name: theme.name,
  description: theme.description,
  colors: { accent: theme.colors.accent },
}));

const ERA_IDS = new Set(NOTEBOOK_ERA_LITES.map((era) => era.id));

export function isBlogReadyEra(id: string): boolean {
  return (BLOG_READY_ERAS as readonly string[]).includes(id);
}

export function parseNotebookEraId(value: string | null | undefined): string | null {
  if (!value) return null;
  return ERA_IDS.has(value) ? value : null;
}

export function notebookEraLabel(name: string): string {
  const [, ...rest] = name.split(":");
  return rest.join(":").trim() || name;
}

/** Stamp the year onto notebook paths so reading stays inside that machine. */
export function withNotebookEraHref(href: string, eraId: string): string {
  if (!eraId || !href.startsWith("/notebook")) return href;
  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const qIndex = withoutHash.indexOf("?");
  const path = qIndex >= 0 ? withoutHash.slice(0, qIndex) : withoutHash;
  const params = new URLSearchParams(qIndex >= 0 ? withoutHash.slice(qIndex + 1) : "");
  params.set("era", eraId);
  return `${path}?${params.toString()}${hash}`;
}
