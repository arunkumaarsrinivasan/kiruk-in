import { getProjectCoverLabel, isProjectNda } from "@/data/project-media";
import type { Project } from "./types";

/** A node in the virtual "Work" filesystem shared by Terminal & Finder. */
export type FsNode = DirNode | DocNode | LinkNode;

export interface DirNode {
  kind: "dir";
  name: string; // filesystem name, e.g. "spera-platform"
  label: string; // human label, e.g. "Spera"
  project?: Project; // set for project folders
  children: FsNode[];
}

export interface DocNode {
  kind: "doc";
  name: string; // e.g. "overview.md"
  label: string; // e.g. "Overview"
  icon: "doc" | "note" | "chart" | "stack";
  lines: string[];
}

export interface LinkNode {
  kind: "link";
  name: string; // e.g. "live.url"
  label: string; // e.g. "Live site"
  linkType: "live" | "demo" | "figma" | "behance" | "github";
  href: string;
}

const LINK_GLYPH: Record<LinkNode["linkType"], string> = {
  live: "🌐", demo: "▶", figma: "✎", behance: "Bē", github: "⌥",
};
const LINK_LABEL: Record<LinkNode["linkType"], string> = {
  live: "Live site", demo: "Demo", figma: "Figma", behance: "Behance", github: "Source",
};

export function linkGlyph(type: LinkNode["linkType"]): string {
  return LINK_GLYPH[type];
}

/* ── Per-era file dialects — each era family names its files differently ── */

export type Dialect = "unix" | "mac" | "next" | "dos" | "win";

type DocKey = "overview" | "role" | "impact" | "stack";

const DOC_NAMES: Record<Dialect, Record<DocKey, string>> = {
  unix: { overview: "readme.md", role: "role.txt", impact: "impact.log", stack: "stack.txt" },
  mac: { overview: "Read Me", role: "The Role", impact: "Impact", stack: "Tech Stack" },
  next: { overview: "Overview.rtf", role: "Role.rtf", impact: "Impact.rtf", stack: "Stack.rtf" },
  dos: { overview: "README.TXT", role: "ROLE.TXT", impact: "IMPACT.TXT", stack: "STACK.TXT" },
  win: { overview: "Overview.txt", role: "Role.txt", impact: "Impact.txt", stack: "Stack.txt" },
};

const LINK_NAMES: Record<Dialect, Record<LinkNode["linkType"], string>> = {
  unix: { live: "live.url", demo: "demo.sh", figma: "design.fig", behance: "gallery.url", github: "repo.git" },
  mac: { live: "Live Site", demo: "Demo", figma: "Figma", behance: "Behance", github: "Source" },
  next: { live: "Live.webloc", demo: "Demo.webloc", figma: "Design.webloc", behance: "Gallery.webloc", github: "Source.webloc" },
  dos: { live: "LIVE.URL", demo: "DEMO.URL", figma: "DESIGN.URL", behance: "GALLERY.URL", github: "SOURCE.URL" },
  win: { live: "Live.url", demo: "Demo.url", figma: "Design.url", behance: "Gallery.url", github: "Source.url" },
};

/** Map an era id to its file dialect. */
export function dialectFor(eraId?: string): Dialect {
  switch (eraId) {
    case "term70": return "unix";
    case "gui84":
    case "macos8":
    case "aqua06":
    case "vision23": return "mac";
    case "next91": return "next";
    case "win31":
    case "win95":
    case "win2k": return "dos";
    default: return "win";
  }
}

function projectFiles(p: Project, d: Dialect): FsNode[] {
  const files: FsNode[] = [];
  const docName = DOC_NAMES[d];

  const overview: string[] = [getProjectCoverLabel(p.id, p.title), "", p.longDescription ?? p.description];
  if (p.features?.length) {
    overview.push("", "What I built:");
    p.features.slice(0, 6).forEach((f) => overview.push(`  - ${f}`));
  }
  files.push({ kind: "doc", name: docName.overview, label: "Overview", icon: "doc", lines: overview });

  const role: string[] = [
    `Role:      ${p.role}`,
    `Duration:  ${p.timeline.duration}`,
    `Category:  ${p.category}`,
    `Status:    ${p.status}`,
  ];
  if (isProjectNda(p.id)) role.push("", "[ Internal case visuals withheld under NDA ]");
  files.push({ kind: "doc", name: docName.role, label: "Role", icon: "note", lines: role });

  if (p.metrics?.impact || p.challenges?.length || p.learnings?.length) {
    const impact: string[] = [];
    if (p.metrics?.impact) impact.push("Impact:", `  ${p.metrics.impact}`, "");
    if (p.challenges?.length) { impact.push("Challenges:"); p.challenges.forEach((c) => impact.push(`  - ${c}`)); impact.push(""); }
    if (p.learnings?.length) { impact.push("Learnings:"); p.learnings.forEach((l) => impact.push(`  - ${l}`)); }
    files.push({ kind: "doc", name: docName.impact, label: "Impact", icon: "chart", lines: impact });
  }

  files.push({ kind: "doc", name: docName.stack, label: "Stack", icon: "stack", lines: ["Tech stack:", "", ...p.technologies.map((t) => `  • ${t}`)] });

  const links = (p.links ?? {}) as Record<string, string | undefined>;
  (Object.keys(LINK_NAMES[d]) as LinkNode["linkType"][]).forEach((type) => {
    const href = links[type];
    if (href) files.push({ kind: "link", name: LINK_NAMES[d][type], label: LINK_LABEL[type], linkType: type, href });
  });

  return files;
}

/** Build the `~/work` directory for an era's dialect: one folder per project. */
export function buildWorkDir(projects: Project[], eraId?: string): DirNode {
  const d = dialectFor(eraId);
  return {
    kind: "dir",
    name: "work",
    label: "Work",
    children: projects.map((p) => ({
      kind: "dir",
      name: p.id,
      label: getProjectCoverLabel(p.id, p.title),
      project: p,
      children: projectFiles(p, d),
    })),
  };
}

export function findDir(root: DirNode, segments: string[]): DirNode | null {
  let cur: DirNode = root;
  for (const seg of segments) {
    if (seg === "" || seg === ".") continue;
    const next = cur.children.find((c) => c.kind === "dir" && c.name === seg) as DirNode | undefined;
    if (!next) return null;
    cur = next;
  }
  return cur;
}
