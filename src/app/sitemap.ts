import type { MetadataRoute } from "next";
import { getMakingEntries, making } from "@/lib/content/making";
import { getNotebookEntries } from "@/lib/content/notebook";
import { SITE_URL } from "@/lib/site";

type Route = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const STATIC_ROUTES: Route[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/arun-kumaar-sreenivasan", priority: 0.95, changeFrequency: "monthly" },
  { path: "/hire", priority: 0.9, changeFrequency: "monthly" },
  { path: "/about.md", priority: 0.8, changeFrequency: "monthly" },
  { path: "/work", priority: 0.9, changeFrequency: "monthly" },
  { path: "/notebook", priority: 0.8, changeFrequency: "weekly" },
  { path: "/making", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/progress", priority: 0.6, changeFrequency: "weekly" },
  { path: "/roadmap", priority: 0.6, changeFrequency: "monthly" },
];

/** Content date for routes that are not a single dated essay. */
const STATIC_UPDATED = new Date("2026-11-04T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
    lastModified: STATIC_UPDATED,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const toLastModified = (date: string) => {
    const parsed = date ? new Date(date) : STATIC_UPDATED;
    return Number.isNaN(parsed.getTime()) ? STATIC_UPDATED : parsed;
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

  // How this was made: each entry and its markdown twin.
  const makingEntries: MetadataRoute.Sitemap = getMakingEntries().flatMap((entry) => {
    const lastModified = toLastModified(entry.frontmatter.updated ?? "");
    const url = `${SITE_URL}${making.route(entry.slug)}`;
    return [
      { url, lastModified, changeFrequency: "monthly" as const, priority: entry.frontmatter.kind === "interface" ? 0.7 : 0.5 },
      { url: `${url}/agent.md`, lastModified, changeFrequency: "monthly" as const, priority: 0.3 },
    ];
  });

  return [...staticEntries, ...notebookEntries, ...makingEntries];
}
