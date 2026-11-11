import "server-only";
import { cache } from "react";
import { z } from "zod";
import { baseFrontmatter, defineCollection, getEntries, getEntry, type Entry } from "@/lib/content";

/**
 * Making collection: how the site was made, as a lineage (docs/MAKING_OF_PLAN.md).
 * Every file under `content/making/` is one entry with its own page at
 * /making/<slug>. An entry names its neighbours in `lineage`, and the graph
 * below reads every edge from both ends, so a page always shows what it came
 * from, what it uses, what it obeys and what was thrown away to reach it.
 */

export const KINDS = ["interface", "pattern", "principle", "dead-end", "source"] as const;
export type Kind = (typeof KINDS)[number];

export const KIND_LABEL: Record<Kind, string> = {
  interface: "Interface",
  pattern: "Pattern",
  principle: "Principle",
  "dead-end": "Dead end",
  source: "Source",
};

/** An edge is written once, on the entry that owns it; `back` is how the other end reads it. */
export const RELS = {
  from: { out: "Came from", back: "Led to" },
  uses: { out: "Built with", back: "Used by" },
  obeys: { out: "Obeys", back: "Holds for" },
  through: { out: "Seen through", back: "A way of seeing" },
  cut: { out: "Thrown away to get here", back: "Cut for" },
} as const;
export type Rel = keyof typeof RELS;
const REL_ORDER: Rel[] = ["from", "uses", "obeys", "through", "cut"];

/** The frontmatter reader is flat, so an edge is one line: "uses | blink-cut". */
const edge = z
  .string()
  .transform((v) => v.split("|").map((p) => p.trim()))
  .pipe(z.tuple([z.enum(["from", "uses", "obeys", "through", "cut"]), z.string().min(1)]))
  .transform(([rel, to]) => ({ rel, to }));

/** And a source: "Label | https://…". */
const source = z
  .string()
  .transform((v) => v.split("|").map((p) => p.trim()))
  .pipe(z.tuple([z.string().min(1), z.string().url()]))
  .transform(([label, href]) => ({ label, href }));

const makingSchema = baseFrontmatter.extend({
  kind: z.enum(KINDS),
  /** When it was made, as printed: "2026", "Oct 2026". */
  made: z.string(),
  /** One or two sentences: the whole entry, for the header and the cards. */
  tldr: z.string().min(1),
  /** Position inside its kind, 1 first. */
  order: z.number().default(50),
  /** An era id: the page wears that era's own document form. */
  era: z.string().optional(),
  /** Card picture, a path under public/. */
  image: z.string().optional(),
  lineage: z.array(edge).default([]),
  sources: z.array(source).default([]),
  /** Last checked against the code, ISO date. */
  updated: z.string().optional(),
});

export type MakingFrontmatter = z.infer<typeof makingSchema>;
export type MakingEntry = Entry<MakingFrontmatter>;

export const MAKING_PATH = "/making";

export const making = defineCollection({
  id: "making",
  schema: makingSchema,
  route: (slug) => `${MAKING_PATH}/${slug}`,
});

/** What a card needs; safe to hand to a client component. */
export interface MakingNode {
  slug: string;
  href: string;
  title: string;
  kind: Kind;
  kindLabel: string;
  made: string;
  tldr: string;
  era?: string;
  image?: string;
}

export interface MakingEdge {
  from: string;
  to: string;
  rel: Rel;
}

export interface LineageGroup {
  label: string;
  nodes: MakingNode[];
}

const toNode = (e: MakingEntry): MakingNode => ({
  slug: e.slug,
  href: making.route(e.slug),
  title: e.frontmatter.title,
  kind: e.frontmatter.kind,
  kindLabel: KIND_LABEL[e.frontmatter.kind],
  made: e.frontmatter.made,
  tldr: e.frontmatter.tldr,
  era: e.frontmatter.era,
  image: e.frontmatter.image,
});

const byOrder = (a: MakingEntry, b: MakingEntry) =>
  a.frontmatter.order - b.frontmatter.order || a.frontmatter.title.localeCompare(b.frontmatter.title);

export function getMakingEntries(): MakingEntry[] {
  return [...getEntries(making)].sort(byOrder);
}

export function getMakingEntry(slug: string): MakingEntry | undefined {
  return getEntry(making, slug);
}

/**
 * Every node and edge. An edge to a slug that has no file stops the build.
 * Cached per request: a page asks for the graph through several helpers.
 */
export const getMakingGraph = cache(function getMakingGraph(): { nodes: MakingNode[]; edges: MakingEdge[] } {
  const entries = getMakingEntries();
  const known = new Set(entries.map((e) => e.slug));
  const edges: MakingEdge[] = [];
  for (const e of entries) {
    for (const l of e.frontmatter.lineage) {
      if (!known.has(l.to)) {
        throw new Error(`content/making/${e.fileSlug}.mdx: lineage "${l.rel} | ${l.to}" names an entry that does not exist`);
      }
      if (l.to === e.slug) throw new Error(`content/making/${e.fileSlug}.mdx: lineage points at itself`);
      edges.push({ from: e.slug, to: l.to, rel: l.rel });
    }
  }
  return { nodes: entries.map(toNode), edges };
});

/** One entry's neighbours, grouped by how they relate to it, both directions. */
export function getLineage(slug: string): LineageGroup[] {
  const { nodes, edges } = getMakingGraph();
  const bySlug = new Map(nodes.map((n) => [n.slug, n]));
  const groups: LineageGroup[] = [];
  const add = (label: string, slugs: string[]) => {
    const list = slugs.map((s) => bySlug.get(s)).filter((n): n is MakingNode => Boolean(n));
    if (list.length) groups.push({ label, nodes: list });
  };
  for (const rel of REL_ORDER) {
    add(RELS[rel].out, edges.filter((e) => e.from === slug && e.rel === rel).map((e) => e.to));
  }
  for (const rel of REL_ORDER) {
    add(RELS[rel].back, edges.filter((e) => e.to === slug && e.rel === rel).map((e) => e.from));
  }
  return groups;
}

/** The hub's rows: every node, by kind. */
export function getKindGroups(): { kind: Kind; label: string; nodes: MakingNode[] }[] {
  const { nodes } = getMakingGraph();
  const plural: Record<Kind, string> = {
    interface: "Interfaces",
    pattern: "Patterns",
    principle: "Principles",
    "dead-end": "Dead ends",
    source: "Sources",
  };
  return KINDS.map((kind) => ({ kind, label: plural[kind], nodes: nodes.filter((n) => n.kind === kind) })).filter(
    (g) => g.nodes.length,
  );
}

/** Every edge between an entry and its neighbours, and between those neighbours: what its map draws. */
export function getLineageEdges(slug: string): MakingEdge[] {
  const { edges } = getMakingGraph();
  const on = new Set<string>([slug]);
  for (const e of edges) {
    if (e.from === slug) on.add(e.to);
    if (e.to === slug) on.add(e.from);
  }
  return edges.filter((e) => on.has(e.from) && on.has(e.to));
}

/** The reading trail: every entry in hub order, so each page hands on to the next. */
export function getTrail(slug: string): { prev?: MakingNode; next?: MakingNode } {
  const trail = getKindGroups().flatMap((g) => g.nodes);
  const i = trail.findIndex((n) => n.slug === slug);
  if (i < 0) return {};
  return { prev: trail[i - 1], next: trail[i + 1] };
}

/** One node by slug, for links that preview what they point to. */
export function getMakingNode(slug: string): MakingNode | undefined {
  return getMakingGraph().nodes.find((n) => n.slug === slug);
}
