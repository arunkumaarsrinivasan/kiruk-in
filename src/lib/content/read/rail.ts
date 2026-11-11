import "server-only";
import GithubSlugger from "github-slugger";
import type { RailGroup } from "@/components/read/ReadShell";
import { getReadDirectory, type ReadShelf } from "./directory";

/**
 * The rail every Read page shows (docs/READ_DIRECTORY_PLAN.md): Read and its
 * shelves, then this page's numbered sections, then the other pages on the
 * same shelf. Built from the directory, so it never drifts from the home.
 */

export interface PageSection {
  id: string;
  text: string;
}

/**
 * A page's `## ` headings with the ids rehype-slug gives them (same slugger),
 * so the rail's links land. Code fences are skipped.
 */
export function sectionsOf(markdown: string): PageSection[] {
  const slugger = new GithubSlugger();
  const out: PageSection[] = [];
  let fenced = false;
  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const m = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    // the visible text: no links, emphasis or code ticks
    const text = m[1].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").trim();
    out.push({ id: slugger.slug(text), text });
  }
  return out;
}

const two = (n: number) => String(n).padStart(2, "0");

export function readRail({ shelf, href, sections = [] }: {
  /** The shelf this page sits on. */
  shelf: ReadShelf["id"];
  /** This page's own address, to mark it on its shelf. */
  href?: string;
  sections?: PageSection[];
}): RailGroup[] {
  const all = getReadDirectory();
  const here = all.find((s) => s.id === shelf);
  const groups: RailGroup[] = [
    {
      label: "Read",
      items: [
        { label: "Read", href: "/notebook" },
        ...all.map((s) => ({ label: s.title, href: s.id === "making" ? "/making" : `/notebook#${s.id}`, n: String(s.count), current: s.id === shelf && !href })),
      ],
    },
  ];
  if (sections.length) {
    groups.push({
      label: "On this page",
      title: "On this page",
      deep: true,
      items: sections.map((s, i) => ({ label: s.text, href: `#${s.id}`, n: two(i + 1) })),
    });
  }
  if (here) {
    const pages = here.groups.flatMap((g) => g.pages).filter((p) => p.href);
    groups.push({
      label: `On ${here.title}`,
      title: here.title,
      deep: true,
      items: pages.map((p) => ({ label: p.title, href: p.href as string, current: p.href === href })),
    });
  }
  return groups;
}
