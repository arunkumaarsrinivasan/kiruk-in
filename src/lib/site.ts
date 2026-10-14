/**
 * Canonical site origin + name.
 *
 * Single source for server-side URL building (sitemap, RSS). Prefer importing
 * from here rather than re-deriving the origin inline.
 *
 * Apex kiruk.in 308s to www.kiruk.in, which is the URL that returns 200.
 * Canonicals, the sitemap, and JSON-LD follow that host so they do not point
 * at a redirect. An env value of https://kiruk.in is normalized the same way.
 * Preview deploys still use VERCEL_URL.
 */
function resolveSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.kiruk.in");
  const origin = configured.replace(/\/$/, "");
  if (origin === "https://kiruk.in") return "https://www.kiruk.in";
  return origin;
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Kiruk Studio";
