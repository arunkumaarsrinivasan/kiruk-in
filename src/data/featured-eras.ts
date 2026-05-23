/**
 * Curated design eras for the coronal eye loading picker (6 eyes, horizontal).
 * Full era list remains in AVAILABLE_THEMES / Era Time Machine.
 */

export const FEATURED_ERA_IDS = [
  "1970",
  "1995",
  "2003",
  "2013",
  "2023",
  "2026",
] as const;

export type FeaturedEraId = (typeof FEATURED_ERA_IDS)[number];

/** Short tagline under each eye in the picker */
export const FEATURED_ERA_TAGLINES: Record<FeaturedEraId, string> = {
  "1970": "Terminal",
  "1995": "GeoCities",
  "2003": "Web 2.0",
  "2013": "Flat iOS",
  "2023": "AI-native",
  "2026": "Generative",
};
