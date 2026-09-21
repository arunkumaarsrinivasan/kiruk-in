/**
 * Canonical site origin + name.
 *
 * Single source for server-side URL building (sitemap, RSS). Mirrors the
 * derivation used in the route layouts. Prefer importing from here in new code
 * rather than re-deriving the origin inline.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

export const SITE_NAME = "Kiruk Studio";
