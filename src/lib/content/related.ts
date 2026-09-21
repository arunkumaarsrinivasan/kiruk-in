import "server-only";
import { getNotebookEntries } from "@/lib/content/notebook";
import { portfolioData } from "@/data/portfolio-data";

export type RelatedHit = {
  href: string;
  title: string;
  kind: "page" | "work";
};

/**
 * Resolve manual `related:` slugs against the public notebook, then Work.
 * Unknown slugs are skipped — the graph is a hint, not a hard link.
 */
export function resolveRelated(slugs: string[] | undefined): RelatedHit[] {
  if (!slugs?.length) return [];
  const pages = new Map(getNotebookEntries().map((p) => [p.slug, p]));
  const projects = new Map(portfolioData.projects.map((p) => [p.id, p]));
  const hits: RelatedHit[] = [];
  const seen = new Set<string>();
  for (const raw of slugs) {
    const slug = raw.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const page = pages.get(slug);
    if (page) {
      hits.push({ href: page.href, title: page.title, kind: "page" });
      continue;
    }
    const project = projects.get(slug);
    if (project) {
      hits.push({ href: `/work#${project.id}`, title: project.title, kind: "work" });
    }
  }
  return hits;
}
