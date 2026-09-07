import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/content/blog";
import { getNotes } from "@/lib/content/notes";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap — built directly from the content kernel (no HTTP self-fetch, which
 * coupled the build to network/SITE_URL and mis-read the article date field).
 * `lastModified` uses each post's real `publishedDate`.
 */

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const toLastModified = (date: string) => {
    const parsed = date ? new Date(date) : now;
    return Number.isNaN(parsed.getTime()) ? now : parsed;
  };

  const blogEntries: MetadataRoute.Sitemap = getBlogPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: toLastModified(post.publishedDate),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const noteEntries: MetadataRoute.Sitemap = getNotes().map((note) => ({
    url: `${SITE_URL}/notes/${note.slug}`,
    lastModified: toLastModified(note.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries, ...noteEntries];
}
