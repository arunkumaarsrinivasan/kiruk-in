import "server-only";
import { cache } from "react";
import { portfolioData } from "@/data/portfolio-data";
import { getProjectCoverLabel } from "@/data/project-media";
import { readingTime } from "@/lib/content";
import { getKindGroups, getMakingGraph } from "@/lib/content/making";
import { getNotebookEntries, getNotebookEntry } from "@/lib/content/notebook";
import { getWorkCases } from "@/lib/content/work";
import { getSkills } from "@/lib/content/skills";
import { getPracticeEntries, practice } from "@/lib/content/practice";

/**
 * Read as a directory (docs/READ_DIRECTORY_PLAN.md). A shelf is one kind of
 * writing, a page is one thing to read, and this is the one list of both: the
 * Read home, the rail on every reading page and the search all draw from it.
 * Each shelf is an adapter over a collection that already exists; nothing is
 * stored twice.
 */

export interface ReadPage {
  title: string;
  /** Left out while the page is not built yet: it is listed, not linked. */
  href?: string;
  summary?: string;
  /** A short fact for the edge of a row: a year, a kind, a reading time. */
  meta?: string;
  /** A picture of the thing, a path under public/. */
  image?: string;
  /** The one number the page leads with: "334" and what it counts. */
  stat?: { value: string; label: string };
}

export interface ReadGroup {
  /** Named when a shelf has more than one kind of page. */
  label?: string;
  /**
   * How the group is shown, by what its pages have to show:
   * "lead" one page, large, with its picture; "tiles" pictures in a grid;
   * "figures" a number each; "rows" a line and a summary each;
   * "links" many titles packed under one label.
   */
  as: "lead" | "tiles" | "figures" | "rows" | "links";
  pages: ReadPage[];
}

export interface ReadShelf {
  id: "life" | "making" | "work" | "skills";
  title: string;
  /** One word for what kind of writing is on it. */
  kind: string;
  blurb: string;
  /** The shelf's own page, when it has one. */
  href?: string;
  hrefLabel?: string;
  /** What else there is to know about this shelf, in a line. */
  note: string;
  count: number;
  groups: ReadGroup[];
}

const year = (iso: string) => iso.slice(0, 4);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-09-20" as "20 Sep 2026". */
const day = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${d} ${MONTHS[m - 1]} ${y}` : iso;
};

function lifeShelf(): ReadShelf {
  const posts = getNotebookEntries();
  const pages: ReadPage[] = posts.map((p) => {
    const body = getNotebookEntry(p.slug)?.body ?? "";
    // A post without a cover is pictured by the first image it shows.
    const image = p.coverImage ?? body.match(/src="(\/[^"]+\.(?:jpe?g|png|webp|avif))"/)?.[1];
    return {
      title: p.title,
      href: p.href,
      summary: p.excerpt,
      meta: [p.date ? day(p.date) : "", body ? readingTime(body).text : ""].filter(Boolean).join(" · "),
      image,
    };
  });
  return {
    id: "life",
    title: "Life",
    kind: "Essays",
    blurb: "What I notice, what I change my mind about, and why I keep moving.",
    href: "/feed.xml",
    hrefLabel: "Feed",
    note: posts[0]?.date ? `Newest ${day(posts[0].date)}` : "",
    count: posts.length,
    // The newest essay leads; the rest follow as rows.
    groups: [
      { as: "lead" as const, pages: pages.slice(0, 1) },
      { as: "rows" as const, pages: pages.slice(1) },
    ].filter((g) => g.pages.length),
  };
}

function makingShelf(): ReadShelf {
  const { nodes, edges } = getMakingGraph();
  const groups = getKindGroups();
  return {
    id: "making",
    title: "How this was made",
    kind: "Making-of",
    blurb: "The loader eye and each era, taken apart: what each came from, what it is built with, and what was thrown away to reach it.",
    href: "/making",
    hrefLabel: "The whole map",
    note: `${nodes.length} entries, ${edges.length} links between them`,
    count: nodes.length,
    // Tiles are for pages that have a picture; an interface without one joins the index.
    groups: groups.flatMap((g): ReadGroup[] => {
      const all = g.nodes.map((n) => ({ title: n.title, href: n.href, summary: n.tldr, meta: n.made, image: n.image }));
      if (g.kind !== "interface") return [{ label: g.label, as: "links", pages: all }];
      const pictured = all.filter((p) => p.image);
      const plain = all.filter((p) => !p.image);
      return [
        { as: "tiles" as const, pages: pictured },
        ...(plain.length ? [{ label: "Earlier", as: "links" as const, pages: plain }] : []),
      ];
    }),
  };
}

const PROJECT_KIND: Record<string, string> = { ai: "AI", web: "Web", mobile: "Mobile", design: "Design", other: "Other" };

function workShelf(): ReadShelf {
  const cases = getWorkCases();
  const inCase = new Set(cases.map((c) => c.frontmatter.project));
  const projects = portfolioData.projects.filter((p) => !inCase.has(p.id));
  const kinds = [...new Set(projects.map((p) => p.category))];
  return {
    id: "work",
    title: "Work",
    kind: "Cases",
    blurb: "Where I have worked and what I built there, as pages to read: the role, what shipped, the numbers and the links.",
    href: "/work",
    hrefLabel: "Drive it on the desktops",
    note: "The same work as the era desktops, in words",
    count: cases.length + projects.length + getPracticeEntries().length,
    groups: [
      {
        as: "figures",
        pages: cases.map((c) => ({
          title: c.frontmatter.title,
          href: `/work/${c.frontmatter.project}/read`,
          summary: c.frontmatter.pitch,
          meta: `${c.frontmatter.role} · ${c.frontmatter.when}`,
          stat: c.frontmatter.headline,
        })),
      },
      // how the work is done: experience and process, as pages
      {
        label: "How I work",
        as: "rows" as const,
        pages: getPracticeEntries().map((e) => ({
          title: e.frontmatter.title,
          href: practice.route(e.slug),
          summary: e.frontmatter.summary,
          meta: e.frontmatter.review ? "Draft" : e.frontmatter.updated,
        })),
      },
      ...kinds.map((kind) => ({
        label: PROJECT_KIND[kind] ?? kind,
        as: "links" as const,
        pages: projects
          .filter((p) => p.category === kind)
          .map((p) => ({ title: getProjectCoverLabel(p.id, p.title), href: `/work/${p.id}/read`, summary: p.description, meta: year(p.timeline.startDate) })),
      })),
    ],
  };
}

/** The skills this site was built with: the project's own, each its own page. */
function skillsShelf(): ReadShelf {
  const pages: ReadPage[] = getSkills().map((sk) => ({ title: sk.name, href: sk.href, summary: sk.summary }));
  return {
    id: "skills",
    title: "Skills",
    kind: "Rules",
    blurb: "The written rules I build with. Each skill is one job with its reasons, so the next change starts from what was learned.",
    note: "The same files an agent reads before it touches the eye",
    count: pages.length,
    groups: [{ as: "links", pages }],
  };
}

/** Cached per request: the home, its search, its featured row and every rail read it. Treat as read-only. */
export const getReadDirectory = cache(function getReadDirectory(): ReadShelf[] {
  return [lifeShelf(), makingShelf(), workShelf(), skillsShelf()];
});

/** The directory narrowed to pages that match a word; shelves with nothing left are dropped. */
export function searchReadDirectory(query: string): ReadShelf[] {
  const needle = query.trim().toLowerCase();
  const all = getReadDirectory();
  if (!needle) return all;
  return all
    .map((shelf) => {
      const groups = shelf.groups
        .map((g) => ({
          ...g,
          pages: g.pages.filter((p) => `${p.title} ${p.summary ?? ""} ${p.meta ?? ""} ${g.label ?? ""} ${shelf.title}`.toLowerCase().includes(needle)),
        }))
        .filter((g) => g.pages.length);
      return { ...shelf, groups, count: groups.reduce((n, g) => n + g.pages.length, 0) };
    })
    .filter((shelf) => shelf.groups.length);
}

/** The pages that open the Read home: one picture from each shelf that has one. */
export function getReadFeatured(): (ReadPage & { shelf: string })[] {
  const out: (ReadPage & { shelf: string })[] = [];
  for (const shelf of getReadDirectory()) {
    for (const g of shelf.groups) {
      for (const p of g.pages) {
        if (p.image && p.href && out.length < 5) out.push({ ...p, shelf: shelf.kind });
      }
    }
  }
  return out;
}
