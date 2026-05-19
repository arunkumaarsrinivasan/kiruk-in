import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://kiruk.in");

type Route = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const STATIC_ROUTES: Route[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.9, changeFrequency: "monthly" },
  { path: "/work", priority: 0.9, changeFrequency: "monthly" },
  { path: "/case-studies", priority: 0.9, changeFrequency: "monthly" },
  { path: "/portfolio", priority: 0.8, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/progress", priority: 0.6, changeFrequency: "weekly" },
  { path: "/roadmap", priority: 0.6, changeFrequency: "monthly" },
  { path: "/life-roadmap", priority: 0.5, changeFrequency: "monthly" },
];

async function fetchBlogSlugs(): Promise<{ slug: string; lastModified?: string }[]> {
  try {
    const res = await fetch(`${SITE_URL}/api/blog`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const articles: Array<{ slug?: string; updatedAt?: string; publishedAt?: string }> =
      data?.articles ?? [];
    return articles
      .filter((a) => typeof a.slug === "string" && a.slug.length > 0)
      .map((a) => ({ slug: a.slug as string, lastModified: a.updatedAt ?? a.publishedAt }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const blogPosts = await fetchBlogSlugs();
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.lastModified ? new Date(p.lastModified) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
