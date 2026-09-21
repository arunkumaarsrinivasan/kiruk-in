import type { MetadataRoute } from "next";
import { getNotebookEntries } from "@/lib/content/notebook";
import { SITE_URL } from "@/lib/site";

type Route = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const STATIC_ROUTES: Route[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.9, changeFrequency: "monthly" },
  { path: "/work", priority: 0.9, changeFrequency: "monthly" },
  { path: "/notebook", priority: 0.8, changeFrequency: "weekly" },
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

  const notebookEntries: MetadataRoute.Sitemap = getNotebookEntries().flatMap((post) => {
    const lastModified = toLastModified(post.date);
    return [
      {
        url: `${SITE_URL}${post.href}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${SITE_URL}${post.href}/agent.md`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.3,
      },
    ];
  });

  return [...staticEntries, ...notebookEntries];
}
