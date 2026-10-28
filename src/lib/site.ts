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

/**
 * Share card for every page without its own (notebook posts bake theirs).
 * Baked by scripts/og-card.tsx. Set it on each `openGraph` explicitly: a
 * child segment's `openGraph` replaces the parent's, image included, and
 * Next copies it into `twitter` when that has no images of its own.
 */
export const SHARE_IMAGE = {
  url: "/og/share.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "Arun Kumaar Sreenivasan, Design Engineer: one eye seen through ten eras of screens, 1970 to 2026",
};
