/**
 * Parse → Surface. One builder per intent, each choosing nodes from the
 * catalog (surface.ts). Words about Arun come only from graph fields
 * (Txt with an entity src), curated answers, or the pupil's own voice.
 */

import { QUESTIONS, resolvePath } from "@/data/about-story";
import { read as readContact } from "@/data/contact-reader";
import { getGraph, KIND_LABEL, STOP_LINK, type Entity, type FieldKey, type Kind } from "./graph";
import type { Domain, Facet } from "./lexicon";
import type { Parse } from "./parse";
import { curated as findCurated, lookup, servedCurated } from "./search";
import type { Depth, Fact, Item, Node, Surface, Txt } from "./surface";
import { LABEL, voice } from "./voice";

export interface NotebookItem {
  title: string;
  href: string;
  excerpt?: string;
}

export interface ComposeContext {
  prev?: Surface | null;
  notebook?: NotebookItem[] | null;
}

/** Asks the pupil offers when it has nothing better. */
export const STARTERS = ["What do you do?", "Show me your work", "Which projects used Flutter?", "How do I reach you?"];

const DEPTHS: Depth[] = ["skim", "read", "deep"];
const deeper = (d: Depth): Depth | null => DEPTHS[DEPTHS.indexOf(d) + 1] ?? null;

// ── Txt helpers ──────────────────────────────────────────────────────

const nameTxt = (e: Entity): Txt => ({ text: e.name, src: `${e.id}#name` });

function fieldTxt(e: Entity, key: FieldKey, i?: number): Txt | undefined {
  const f = e.fields[key];
  if (!f) return undefined;
  if (i !== undefined) return Array.isArray(f.value) && f.value[i] !== undefined ? { text: f.value[i], src: `${f.src}[${i}]` } : undefined;
  return Array.isArray(f.value) ? { text: f.value.join(", "), src: `${f.src}[*]` } : { text: f.value, src: f.src };
}

function fieldItems(e: Entity, key: FieldKey): Item[] {
  const f = e.fields[key];
  if (!f) return [];
  const values = Array.isArray(f.value) ? f.value : [f.value];
  return values.map((_, i) => ({ title: Array.isArray(f.value) ? fieldTxt(e, key, i)! : fieldTxt(e, key)! }));
}

function fact(e: Entity, key: FieldKey): Fact | undefined {
  const v = fieldTxt(e, key);
  return v ? { label: LABEL[key] ?? key, value: v } : undefined;
}

const facts = (e: Entity, keys: FieldKey[]) => keys.map((k) => fact(e, k)).filter((f): f is Fact => !!f);

/** A name visitors can ask with: unique, not a stop word. */
function askName(e: Entity): string {
  const g = getGraph();
  const a = e.aliases.find((x) => !STOP_LINK.has(x) && (g.alias.get(x)?.length ?? 0) === 1 && !x.includes(","));
  return a ?? e.name.toLowerCase();
}

/** How to ask about this thing. A role is asked by its company ("what did you do at spera"). */
/** Can a visitor's question name this thing at all? ("frontend" can't: it's too common to link.) */
const askable = (e: Entity) => e.kind === "role" || e.aliases.some((x) => !STOP_LINK.has(x) && (getGraph().alias.get(x)?.length ?? 0) === 1);
const tellAsk = (e: Entity) => (e.kind === "role" ? `what did you do at ${e.aliases[0]}` : `tell me about ${askName(e)}`);
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The lead line for an entity in a list. */
function noteOf(e: Entity): Txt | undefined {
  const order: FieldKey[] = ["summary", "skim", "role", "region", "notes", "use", "genre", "value"];
  for (const k of order) {
    const t = fieldTxt(e, k);
    if (t) return t;
  }
  return undefined;
}

const rel = (e: Entity, kind: Kind) => e.rel.map((id) => getGraph().entities.get(id)).filter((x): x is Entity => !!x && x.kind === kind);

/** Ring kinds: these dots exist on the pupil and can light up. */
const RING_KINDS = new Set<Kind>(["role", "project", "beat", "skill", "place", "trek", "game", "book"]);
const lit = (es: Entity[]) => [...new Set(es.filter((e) => RING_KINDS.has(e.kind)).map((e) => e.id))];

let nodeSeq = 0;
const nid = (t: string) => `${t}-${++nodeSeq}`;

function surface(p: Parse, title: Txt, nodes: Node[], extra: Partial<Surface> & { looked?: [number, string] } = {}): Surface {
  const { looked, ...rest } = extra;
  const found = rest.sources?.length ?? 0;
  const parts = [p.heard.length ? `heard: ${p.heard.join(", ")}` : "", looked ? `looked at ${looked[0]} ${looked[1]}` : "", found ? `found ${found}` : ""];
  if (p.fixed.length) parts.unshift(`read ${p.fixed.map(([a, b]) => `"${a}" as "${b}"`).join(", ")}`);
  const g = getGraph();
  const from = (rest.sources ?? [])
    .map((id) => g.entities.get(id))
    .filter((e): e is Entity => !!e)
    .slice(0, 8)
    .filter(askable)
    .map((e) => ({ ref: e.id, label: nameTxt(e), ask: tellAsk(e) }));
  return {
    id: `${p.intent}:${(rest.sources ?? []).join(",")}:${rest.depth ?? "skim"}:${title.src}`,
    from,
    intent: p.intent,
    title,
    nodes,
    sources: [],
    trace: parts.filter(Boolean).join(" · "),
    heard: p.heard,
    fixed: p.fixed,
    depth: "skim",
    asked: p.text,
    ...rest,
  };
}

// ── describe one thing ───────────────────────────────────────────────

function describe(p: Parse, e: Entity, depth: Depth = "skim"): Surface {
  const g = getGraph();
  const nodes: Node[] = [];
  let sources: Entity[] = [e];
  const next: string[] = [];
  const name = askName(e);

  switch (e.kind) {
    case "project": {
      nodes.push({ id: nid("e"), type: "entity", ref: e.id, title: nameTxt(e), subtitle: fieldTxt(e, "summary"), facts: facts(e, ["when", "role", "status"]), href: e.href, links: e.links.filter((l) => l.href !== e.href) });
      if (depth !== "skim" && e.fields.long) nodes.push({ id: nid("t"), type: "text", text: fieldTxt(e, "long")!, variant: "body" });
      if (depth === "deep") {
        if (e.fields.features) nodes.push({ id: nid("l"), type: "list", label: "Features", items: fieldItems(e, "features") });
        if (e.fields.learnings) nodes.push({ id: nid("l"), type: "list", label: "What I learned", items: fieldItems(e, "learnings") });
      }
      if (e.fields.impact) nodes.push({ id: nid("f"), type: "facts", items: facts(e, ["impact"]) });
      const stack = e.fields.stack?.value;
      if (Array.isArray(stack)) {
        nodes.push({
          id: nid("c"),
          type: "chips",
          label: "Stack",
          items: stack.map((s, i) => {
            const t = g.entities.get(`tech:${s.toLowerCase().replace(/\s+/g, "-")}`);
            return { label: fieldTxt(e, "stack", i)!, ask: t && t.rel.filter((r) => r.startsWith("project:")).length > 1 ? `which projects used ${askName(t)}` : `which projects used ${s.toLowerCase()}` };
          }),
        });
      }
      const roles = rel(e, "role");
      sources = [e, ...roles];
      if (depth !== "deep") next.push(`tell me more about ${name}`);
      if (e.fields.challenges) next.push(`what was hard about ${name}`);
      if (e.fields.learnings && depth !== "deep") next.push(`what did you learn from ${name}`);
      break;
    }
    case "role": {
      nodes.push({ id: nid("e"), type: "entity", ref: e.id, title: nameTxt(e), subtitle: fieldTxt(e, "when"), facts: facts(e, ["where"]), links: e.links });
      nodes.push({ id: nid("t"), type: "text", text: fieldTxt(e, "summary")!, variant: "lead" });
      const projects = rel(e, "project");
      if (projects.length) nodes.push({ id: nid("l"), type: "list", label: "Work", items: projects.map((x) => ({ ref: x.id, title: nameTxt(x), note: fieldTxt(x, "summary"), href: x.href, ask: tellAsk(x) })) });
      if (depth !== "skim" && e.fields.wins) nodes.push({ id: nid("l"), type: "list", label: "What I'm proud of", items: fieldItems(e, "wins") });
      if (depth === "deep" && e.fields.did) nodes.push({ id: nid("l"), type: "list", label: "What I did", items: fieldItems(e, "did") });
      sources = [e, ...projects, ...rel(e, "beat")];
      if (depth !== "deep") next.push(`tell me more about ${name}`);
      next.push(`what tech did you use at ${name}`);
      break;
    }
    case "beat": {
      nodes.push({ id: nid("e"), type: "entity", ref: e.id, title: nameTxt(e), facts: facts(e, ["when", "where"]) });
      if (depth === "skim") nodes.push({ id: nid("t"), type: "text", text: fieldTxt(e, "skim")!, variant: "lead" });
      if (depth === "read") nodes.push({ id: nid("t"), type: "text", text: fieldTxt(e, "read")!, variant: "body" });
      if (depth === "deep") (e.fields.deep?.value as string[]).forEach((_, i) => nodes.push({ id: nid("t"), type: "text", text: fieldTxt(e, "deep", i)!, variant: "body" }));
      if (e.fields.lesson) nodes.push({ id: nid("t"), type: "text", text: fieldTxt(e, "lesson")!, variant: "quote" });
      sources = [e, ...rel(e, "role")];
      if (depth !== "deep") next.push(`tell me more about ${name}`);
      break;
    }
    case "education": {
      nodes.push({ id: nid("e"), type: "entity", ref: e.id, title: nameTxt(e), subtitle: fieldTxt(e, "summary"), facts: facts(e, ["when", "value"]) });
      if (e.fields.courses) nodes.push({ id: nid("c"), type: "list", label: "Courses", items: fieldItems(e, "courses") });
      sources = [e, ...rel(e, "beat")];
      break;
    }
    case "skill":
    case "tech": {
      const skill = e.kind === "skill" ? e : rel(e, "skill")[0];
      const tech = e.kind === "tech" ? e : rel(e, "tech")[0];
      const projects = tech ? rel(tech, "project") : [];
      nodes.push({ id: nid("e"), type: "entity", ref: e.id, title: nameTxt(e), subtitle: skill ? fieldTxt(skill, "summary") : undefined, facts: skill ? facts(skill, ["level", "category"]) : [] });
      if (projects.length) {
        nodes.push({ id: nid("t"), type: "text", text: voice("usedIn", String(projects.length), e.name), variant: "note" });
        nodes.push({ id: nid("l"), type: "list", items: projects.map((x) => ({ ref: x.id, title: nameTxt(x), note: fieldTxt(x, "summary"), href: x.href, ask: tellAsk(x) })) });
      }
      sources = [...(skill ? [skill] : []), ...projects];
      break;
    }
    case "trek":
    case "place": {
      nodes.push({ id: nid("e"), type: "entity", ref: e.id, title: nameTxt(e), subtitle: fieldTxt(e, "summary"), facts: facts(e, ["elevation", "distance", "difficulty", "when", "region"]) });
      sources = [e, ...e.rel.map((id) => g.entities.get(id)!).filter(Boolean)];
      break;
    }
    case "game":
    case "book":
    case "movie":
    case "music": {
      nodes.push({ id: nid("e"), type: "entity", ref: e.id, title: nameTxt(e), subtitle: fieldTxt(e, "notes") ?? fieldTxt(e, "summary"), facts: facts(e, ["author", "genre", "platform", "status"]) });
      break;
    }
    case "metric": {
      nodes.push({ id: nid("e"), type: "entity", ref: e.id, title: fieldTxt(e, "value")!, subtitle: fieldTxt(e, "summary") });
      const to = e.rel.map((id) => g.entities.get(id)!).filter(Boolean);
      if (to.length) nodes.push({ id: nid("l"), type: "list", items: to.map((x) => ({ ref: x.id, title: nameTxt(x), href: x.href, ask: tellAsk(x) })) });
      sources = to;
      break;
    }
    case "me":
      return about(p, depth);
    case "channel":
    case "intent":
      return contact(p);
  }
  if (next.length < 3) next.push("Show me your work");
  nodes.push({ id: nid("n"), type: "next", asks: next.slice(0, 3).map(capital) });
  return surface(p, nameTxt(e), nodes, { sources: lit(sources), depth, ref: `describe:${e.id}`, looked: [1, KIND_LABEL[e.kind][0]] });
}

// ── one facet of one thing ───────────────────────────────────────────

const PROJECT_LISTS: FieldKey[] = ["features", "challenges", "learnings", "impact", "stack"];

function facet(p: Parse, e: Entity, f: Facet): Surface {
  const g = getGraph();
  if (e.kind === "me") return aboutFacet(p, e, f);
  if (e.kind === "skill" || e.kind === "tech") return describe(p, e);
  const header: Node = { id: nid("e"), type: "entity", ref: e.id, title: nameTxt(e), subtitle: fieldTxt(e, "when") };
  const nodes: Node[] = [header];
  let sources: Entity[] = [e];
  const key: FieldKey | "links" = f === "learnings" && e.kind === "beat" ? "lesson" : f;

  if (key === "links") {
    if (e.links.length) nodes.push({ id: nid("k"), type: "links", items: e.links });
    else nodes.push({ id: nid("t"), type: "text", text: voice("nothing"), variant: "note" });
  } else if (e.fields[key]) {
    const v = e.fields[key]!.value;
    if (Array.isArray(v)) nodes.push({ id: nid("l"), type: "list", label: LABEL[key] ?? capital(key), items: fieldItems(e, key) });
    else if (v.length > 60) nodes.push({ id: nid("t"), type: "text", text: fieldTxt(e, key)!, variant: key === "lesson" ? "quote" : "lead" });
    else nodes.push({ id: nid("f"), type: "facts", items: facts(e, [key]) });
  } else if (e.kind === "role" && PROJECT_LISTS.includes(key)) {
    // A company has no "challenges" of its own; its projects do.
    const projects = rel(e, "project").filter((x) => x.fields[key]);
    for (const x of projects) {
      const v = x.fields[key]!.value;
      nodes.push({ id: nid("l"), type: "list", label: x.name, items: Array.isArray(v) ? fieldItems(x, key) : [{ title: fieldTxt(x, key)!, ref: x.id }] });
    }
    sources = [e, ...projects];
    if (!projects.length) nodes.push({ id: nid("t"), type: "text", text: voice("nothing"), variant: "note" });
  } else {
    // Nothing stored for that facet: say so, then show what there is.
    const d = describe(p, e);
    return { ...d, nodes: [{ id: nid("t"), type: "text", text: voice("nothing"), variant: "note" }, ...d.nodes] };
  }
  const name = askName(e);
  const asks = [tellAsk(e)];
  if (e.kind === "project" && key !== "challenges" && e.fields.challenges) asks.push(`what was hard about ${name}`);
  if (e.kind === "project" && key !== "stack") asks.push(`what tech did you use for ${name}`);
  if (e.kind === "role" && key !== "wins") asks.push(`achievements at ${name}`);
  nodes.push({ id: nid("n"), type: "next", asks: asks.slice(0, 3).map(capital) });
  void g;
  return surface(p, nameTxt(e), nodes, { sources: lit(sources), ref: `describe:${e.id}`, looked: [1, KIND_LABEL[e.kind][0]] });
}

// ── me ───────────────────────────────────────────────────────────────

function about(p: Parse, depth: Depth = "skim"): Surface {
  const g = getGraph();
  const me = g.entities.get("me:arun")!;
  if (depth !== "skim") return story(p, "all", depth === "read" ? "skim" : "read", "about");
  const roles = [...(g.byKind.get("role") ?? [])].reverse();
  const nodes: Node[] = [
    { id: nid("t"), type: "text", text: fieldTxt(me, "summary")!, variant: "lead" },
    { id: nid("f"), type: "facts", items: [{ label: "Now", value: fieldTxt(me, "role")! }, { label: "Where", value: fieldTxt(me, "where", 0)! }] },
    { id: nid("tl"), type: "timeline", label: "Where I've worked", items: roles.map((r) => ({ ref: r.id, when: fieldTxt(r, "when")!, title: nameTxt(r), ask: tellAsk(r) })) },
    { id: nid("n"), type: "next", asks: ["Tell me more", "What were you like as a kid?", "Show me your work"] },
  ];
  return surface(p, nameTxt(me), nodes, { sources: lit(roles), ref: "about", looked: [roles.length, "roles"] });
}

function aboutFacet(p: Parse, me: Entity, f: Facet): Surface {
  if (f === "where") {
    const items: Fact[] = [{ label: "Based in", value: fieldTxt(me, "where", 0)! }, { label: "Time", value: fieldTxt(me, "where", 1)! }, { label: "Works", value: fieldTxt(me, "where", 2)! }];
    return surface(p, nameTxt(me), [
      { id: nid("f"), type: "facts", items },
      { id: nid("l"), type: "list", label: "Open to", items: fieldItems(me, "wins") },
      { id: nid("n"), type: "next", asks: ["How do I reach you?", "Show me your work"] },
    ], { ref: "about" });
  }
  if (f === "wins") return surface(p, nameTxt(me), [{ id: nid("l"), type: "list", label: "Open to", items: fieldItems(me, "wins") }, { id: nid("n"), type: "next", asks: ["How do I reach you?"] }], { ref: "about" });
  return about(p);
}

// ── story ────────────────────────────────────────────────────────────

function story(p: Parse, what: string, depth: Depth = "skim", as: "story" | "about" = "story"): Surface {
  const g = getGraph();
  const beats = resolvePath({ what }).map((b) => g.entities.get(`beat:${b.id}`)!).filter(Boolean);
  const q = QUESTIONS.find((x) => `q:${x.id}` === what);
  const title = as === "about" ? nameTxt(g.entities.get("me:arun")!) : q ? voice("story", q.label) : voice("timeline", "");
  const nodes: Node[] = [];
  if (depth === "deep") {
    for (const b of beats) {
      nodes.push({ id: nid("e"), type: "entity", ref: b.id, title: nameTxt(b), facts: facts(b, ["when", "where"]) });
      (b.fields.deep?.value as string[]).forEach((_, i) => nodes.push({ id: nid("t"), type: "text", text: fieldTxt(b, "deep", i)!, variant: "body" }));
      nodes.push({ id: nid("t"), type: "text", text: fieldTxt(b, "lesson")!, variant: "quote" });
    }
  } else {
    nodes.push({
      id: nid("tl"),
      type: "timeline",
      items: beats.map((b) => ({ ref: b.id, when: fieldTxt(b, "when")!, title: nameTxt(b), note: fieldTxt(b, depth === "skim" ? "skim" : "read"), ask: tellAsk(b) })),
    });
  }
  nodes.push({ id: nid("n"), type: "next", asks: depth === "deep" ? ["Show me your work", "How do I reach you?"] : ["Tell me more", "Show me your work"] });
  return surface(p, title, nodes, { sources: lit(beats), depth, ref: `story:${what}:${as}`, looked: [beats.length, "stories"] });
}

// ── many things ──────────────────────────────────────────────────────

const DIFF_RANK: Record<string, number> = { easy: 1, moderate: 2, hard: 3, extreme: 4 };
const num = (s?: string) => Number((s ?? "").replace(/[^\d.]/g, "")) || 0;

function selectFrom(p: Parse): { kind: Kind; all: Entity[]; picked: Entity[] } {
  const g = getGraph();
  const f = p.filters;
  const kind: Kind = f.kind ?? (f.tech ? "project" : "project");
  const all = g.byKind.get(kind) ?? [];
  let picked = [...all];
  if (f.tech) picked = picked.filter((e) => e.rel.includes(f.tech!.id));
  if (f.category) picked = picked.filter((e) => e.fields.category?.value === f.category);
  if (f.year) picked = picked.filter((e) => (e.span ? e.span[0] <= f.year! && f.year! <= e.span[1] : e.year === f.year || e.order.startsWith(String(f.year))));
  if (f.difficulty) picked = picked.filter((e) => e.fields.difficulty?.value === f.difficulty);
  if (f.sort === "elevation") picked.sort((a, b) => num(b.fields.elevation?.value as string) - num(a.fields.elevation?.value as string));
  else if (f.sort === "distance") picked.sort((a, b) => num(b.fields.distance?.value as string) - num(a.fields.distance?.value as string));
  else if (f.sort === "hard") picked.sort((a, b) => (DIFF_RANK[b.fields.difficulty?.value as string] ?? 0) - (DIFF_RANK[a.fields.difficulty?.value as string] ?? 0));
  else if (kind === "project" || kind === "role" || f.sort === "recent") picked.sort((a, b) => b.order.localeCompare(a.order));
  return { kind, all, picked };
}

function itemOf(e: Entity): Item {
  const meta = fieldTxt(e, e.kind === "trek" ? "elevation" : "when");
  return { ref: e.id, title: nameTxt(e), note: noteOf(e), meta, href: e.href, ask: askable(e) ? tellAsk(e) : undefined };
}

function list(p: Parse): Surface {
  const { kind, all, picked } = selectFrom(p);
  const [one, many] = KIND_LABEL[kind];
  const title = p.filters.tech ? voice("usedIn", String(picked.length), p.filters.tech.name) : kind === "project" && !p.filters.category && !p.filters.year ? voice("work", String(picked.length)) : voice("count", String(picked.length), picked.length === 1 ? one : many);
  const nodes: Node[] = [];
  if (!picked.length) nodes.push({ id: nid("t"), type: "text", text: voice("none", many), variant: "note" });
  else nodes.push({ id: nid("l"), type: "list", items: picked.slice(0, 40).map(itemOf) });
  const refine: string[] = [];
  if (kind === "project") refine.push("show me your ai projects", "show me your mobile projects", "which projects used figma");
  if (kind === "trek") refine.push("highest treks", "longest treks", "hardest treks");
  if (kind === "role") refine.push("your career so far");
  nodes.push({ id: nid("n"), type: "next", asks: refine.slice(0, 3).map(capital) });
  return surface(p, title, nodes, { sources: lit(picked), looked: [all.length, many] });
}

function count(p: Parse): Surface {
  const s = list(p);
  const { kind, picked } = selectFrom(p);
  const [one, many] = KIND_LABEL[kind];
  const label = picked.length === 1 ? one : many;
  return { ...s, title: voice("count", String(picked.length), label), nodes: [{ id: nid("f"), type: "facts", items: [{ label: capital(many), value: voice("count", String(picked.length), label) }] }, ...s.nodes] };
}

// ── compare ──────────────────────────────────────────────────────────

const COMPARE_ROWS: FieldKey[] = ["when", "role", "summary", "stack", "impact", "status", "category", "where", "elevation", "distance", "difficulty", "region", "author", "genre", "platform"];

function compare(p: Parse, a: Entity, b: Entity): Surface {
  const rows = COMPARE_ROWS.filter((k) => a.fields[k] && b.fields[k]).map((k) => ({ label: LABEL[k] ?? capital(k), a: fieldTxt(a, k), b: fieldTxt(b, k) }));
  const nodes: Node[] = [
    { id: nid("cmp"), type: "compare", left: { ref: a.id, title: nameTxt(a) }, right: { ref: b.id, title: nameTxt(b) }, rows },
    { id: nid("n"), type: "next", asks: [capital(tellAsk(a)), capital(tellAsk(b))] },
  ];
  return surface(p, voice("compare", a.name, b.name), nodes, { sources: lit([a, b]), looked: [2, KIND_LABEL[a.kind][1]] });
}

// ── timeline ─────────────────────────────────────────────────────────

function timeline(p: Parse): Surface {
  const g = getGraph();
  const y = p.filters.year;
  const { before, after } = p.filters;
  const pivot = before || after ? p.entities[0] : undefined;
  const pool = [...(g.byKind.get("role") ?? []), ...(g.byKind.get("education") ?? []), ...(y || pivot ? (g.byKind.get("project") ?? []) : []), ...(g.byKind.get("beat") ?? []).filter((b) => b.year && b.year >= 2019)];
  const start = (e: Entity) => e.span?.[0] ?? e.year ?? 0;
  const end = (e: Entity) => e.span?.[1] ?? e.year ?? 0;
  const covers = (e: Entity) =>
    e !== pivot && (!y || (e.span ? e.span[0] <= y && y <= e.span[1] : e.year === y)) && (!before || start(e) < before) && (!after || end(e) >= after) && (!after || start(e) >= after - 1);
  const picked = pool.filter(covers).sort((a, b) => a.order.localeCompare(b.order));
  const nodes: Node[] = picked.length
    ? [{ id: nid("tl"), type: "timeline", items: picked.map((e) => ({ ref: e.id, when: fieldTxt(e, "when") ?? nameTxt(e), title: nameTxt(e), note: noteOf(e), href: e.href, ask: tellAsk(e) })) }]
    : [{ id: nid("t"), type: "text", text: voice("timelineEmpty", String(y)), variant: "note" }];
  nodes.push({ id: nid("n"), type: "next", asks: ["Show me your work", "How do I reach you?"] });
  const pivotName = pivot ? (pivot.kind === "role" ? (pivot.name.split(", ").pop() ?? pivot.name) : pivot.name) : "";
  const title = pivot ? voice(before ? "before" : "after", pivotName) : voice("timeline", y ? String(y) : "");
  return surface(p, title, nodes, { sources: lit(picked), looked: [pool.length, "moments"] });
}

// ── contact ──────────────────────────────────────────────────────────

function contact(p: Parse): Surface {
  const g = getGraph();
  const r = readContact(p.text);
  const named = p.entities.find((e) => e.kind === "channel");
  const intentId = r.score >= 2 ? r.intent : "hello";
  const intent = g.entities.get(`intent:${intentId}`)!;
  const channels = r.score >= 2 ? rel(intent, "channel") : (g.byKind.get("channel") ?? []);
  const ordered = named ? [named, ...channels.filter((c) => c !== named)] : channels;
  const items: Item[] = ordered.map((c) => ({ ref: c.id, title: nameTxt(c), note: fieldTxt(c, "handle"), href: c.links[0]?.href }));
  const lead = r.score >= 2 ? fieldTxt(intent, "why")! : fieldTxt(g.entities.get("channel:email")!, "use")!;
  const title = r.score >= 2 ? voice("contactTo", intent.name) : voice("reach");
  return surface(p, title, [
    { id: nid("t"), type: "text", text: lead, variant: "lead" },
    { id: nid("cp"), type: "compose", intent: intentId, channels: items },
  ], { sources: [], looked: [ordered.length, "channels"] });
}

// ── judging and abilities ────────────────────────────────────────────

/** "do you know figma": capability questions resolve shared names themselves, so any real name works. */
const abilityAsk = (s: Entity) => {
  const a = s.aliases.find((x) => !STOP_LINK.has(x));
  return a ? `do you know ${a}` : undefined;
};
const abilityChips = (skills: Entity[]) =>
  skills.flatMap((s) => {
    const ask = abilityAsk(s);
    return ask ? [{ label: nameTxt(s), ask }] : [];
  });

const topSkills = (n: number) => [...(getGraph().byKind.get("skill") ?? [])].sort((a, b) => a.order.localeCompare(b.order)).slice(0, n);

/** "Is he good?" Evidence, not a verdict: the numbers, the roles, the strongest skills. */
function evaluate(p: Parse): Surface {
  const g = getGraph();
  const metrics = g.byKind.get("metric") ?? [];
  const roles = [...(g.byKind.get("role") ?? [])].reverse();
  const skills = topSkills(6);
  const why = servedCurated().find((c) => c.id === "why-hire");
  const nodes: Node[] = [{ id: nid("t"), type: "text", text: voice("evidence"), variant: "note" }];
  if (why) nodes.push({ id: nid("t"), type: "text", text: { text: why.answer, src: `curated:${why.id}` }, variant: "quote" });
  nodes.push({ id: nid("l"), type: "list", label: "Numbers I stand behind", items: metrics.map((m) => ({ ref: m.id, title: fieldTxt(m, "value")!, note: fieldTxt(m, "summary") })) });
  nodes.push({ id: nid("tl"), type: "timeline", label: "Where I've done it", items: roles.map((r) => ({ ref: r.id, when: fieldTxt(r, "when")!, title: nameTxt(r), ask: tellAsk(r) })) });
  nodes.push({ id: nid("c"), type: "chips", label: "Strongest at", items: abilityChips(skills) });
  nodes.push({ id: nid("n"), type: "next", asks: ["Show me your work", "Can you lead a team?", "How do I reach you?"] });
  return surface(p, nameTxt(g.entities.get("me:arun")!), nodes, { sources: lit([...roles, ...skills, ...metrics.flatMap((m) => rel(m, "project"))]), looked: [metrics.length + roles.length + skills.length, "facts"] });
}

/** Skills and technologies a domain points at. */
function domainEntities(d: Domain): Entity[] {
  const g = getGraph();
  const out: Entity[] = [];
  if (d.category) out.push(...(g.byKind.get("skill") ?? []).filter((s) => s.fields.category?.value === d.category));
  if (d.match) out.push(...[...(g.byKind.get("skill") ?? []), ...(g.byKind.get("tech") ?? [])].filter((e) => d.match!.some((m) => e.id.includes(m))));
  if (d.ids) out.push(...d.ids.map((id) => g.entities.get(id)).filter((e): e is Entity => !!e));
  return [...new Set(out)];
}

/** "Can he code?" "Does he know React?" A grounded yes, or an honest "not written down". */
function capability(p: Parse): Surface {
  const g = getGraph();
  const asked = p.entities.filter((e) => e.kind === "skill" || e.kind === "tech");
  const evidence = asked.length ? asked : p.domain ? domainEntities(p.domain) : [];
  if (!evidence.length) {
    const word = p.unknown ?? p.domain?.label ?? "that";
    const skills = topSkills(8);
    return surface(p, voice("noRecord", word), [
      { id: nid("c"), type: "chips", label: "What I do work with", items: abilityChips(skills) },
      { id: nid("n"), type: "next", asks: ["Show me your work", "Is he good?"] },
    ], { sources: lit(skills), looked: [g.byKind.get("skill")?.length ?? 0, "skills"] });
  }
  const label = asked.length ? asked.map((e) => e.name).join(", ") : p.domain!.label;
  const skillsShown = [...new Set([...evidence.filter((e) => e.kind === "skill"), ...evidence.filter((e) => e.kind === "tech").flatMap((t) => rel(t, "skill"))])];
  const techs = evidence.filter((e) => e.kind === "skill" || e.kind === "tech").flatMap((e) => (e.kind === "tech" ? [e] : rel(e, "tech")));
  const projects = [...new Set(techs.flatMap((t) => rel(t, "project")))].sort((a, b) => b.order.localeCompare(a.order));
  const others = evidence.filter((e) => e.kind !== "skill" && e.kind !== "tech");
  const nodes: Node[] = [];
  if (skillsShown.length) {
    nodes.push({ id: nid("l"), type: "list", label: "Skill", items: skillsShown.slice(0, 8).map((s) => ({ ref: s.id, title: nameTxt(s), note: fieldTxt(s, "summary"), meta: fieldTxt(s, "level") })) });
  }
  if (others.length) nodes.push({ id: nid("l"), type: "list", label: "Where I've done it", items: others.map(itemOf) });
  if (projects.length) nodes.push({ id: nid("l"), type: "list", label: "In my work", items: projects.slice(0, 8).map(itemOf) });
  nodes.push({ id: nid("n"), type: "next", asks: ["Show me your work", "Is he good?", "How do I reach you?"] });
  return surface(p, voice("yes", label), nodes, { sources: lit([...skillsShown, ...others, ...projects]), looked: [evidence.length, "skills and roles"] });
}

// ── opinions, greetings, the rest ────────────────────────────────────

function opinion(p: Parse, min = 0.34, beyondNames = false): Surface | null {
  const hit = findCurated(p.text);
  if (!hit || hit.score < min) return null;
  if (beyondNames) {
    // One shared word ("work") is too thin to override what the question clearly asked.
    if (hit.shared.length < 2) return null;
    // "tell me about mudra" names a thing and asks nothing more: the data answers that.
    const named = new Set(p.entities.flatMap((e) => e.aliases.flatMap((a) => a.split(" "))));
    if (!hit.shared.some((w) => !named.has(w))) return null;
  }
  const c = hit.item;
  const g = getGraph();
  const refs = c.refs.map((id) => g.entities.get(id)).filter((e): e is Entity => !!e);
  const nodes: Node[] = [{ id: nid("t"), type: "text", text: { text: c.answer, src: `curated:${c.id}` }, variant: "quote" }];
  const chips = refs.filter((e) => e.kind !== "me").slice(0, 4);
  if (chips.length) nodes.push({ id: nid("c"), type: "chips", label: "From", items: chips.filter(askable).map((e) => ({ label: nameTxt(e), ask: tellAsk(e) })) });
  nodes.push({ id: nid("n"), type: "next", asks: ["Show me your work", "How do I reach you?"] });
  return surface(p, { text: c.questions[0], src: `curated-q:${c.id}` }, nodes, { sources: lit(refs), looked: [1, "curated answers"] });
}

function simple(p: Parse, line: Txt, asks: string[]): Surface {
  return surface(p, line, [{ id: nid("n"), type: "next", asks }]);
}

function writing(p: Parse, ctx: ComposeContext): Surface {
  const items: Item[] = (ctx.notebook ?? []).slice(0, 8).map((n) => ({ title: { text: n.title, src: `notebook:${n.href}#title` }, note: n.excerpt ? { text: n.excerpt, src: `notebook:${n.href}#excerpt` } : undefined, href: n.href }));
  const nodes: Node[] = [];
  if (items.length) nodes.push({ id: nid("l"), type: "list", items });
  nodes.push({ id: nid("k"), type: "links", items: [{ label: "Open the notebook", href: "/notebook" }] });
  return surface(p, voice("writing"), nodes);
}

function search(p: Parse): Surface {
  const fromCurated = opinion(p);
  if (fromCurated) return fromCurated;
  const hit = lookup(p.text);
  if (hit.trusted && hit.entities[0]) {
    const e = hit.entities[0];
    return hit.field && hit.field !== "summary" ? facet(p, e, hit.field) : describe(p, e);
  }
  const nodes: Node[] = [];
  if (hit.entities.length) nodes.push({ id: nid("c"), type: "chips", items: hit.entities.filter(askable).map((e) => ({ label: nameTxt(e), ask: tellAsk(e) })) });
  nodes.push({ id: nid("n"), type: "next", asks: STARTERS.slice(0, 3) });
  return surface(p, hit.entities.length ? voice("unknown") : voice("nothing"), nodes, { looked: [getGraph().entities.size, "things"] });
}

// ── deeper ───────────────────────────────────────────────────────────

function more(p: Parse, prev: Surface): Surface {
  const next = deeper(prev.depth);
  const g = getGraph();
  if (!prev.ref || !next) {
    return { ...prev, nodes: [...prev.nodes.filter((n) => n.type !== "next"), { id: nid("t"), type: "text", text: voice("deepest"), variant: "note" }, { id: nid("n"), type: "next", asks: ["Show me your work", "How do I reach you?"] }] };
  }
  const [kind, ...rest] = prev.ref.split(":");
  if (kind === "describe") {
    const e = g.entities.get(rest.join(":"));
    if (e) return describe(p, e, next);
  }
  if (kind === "story") return story(p, rest[0] + (rest[1] && rest[1] !== "story" && rest[1] !== "about" ? `:${rest[1]}` : ""), next, prev.ref.endsWith(":about") ? "about" : "story");
  if (kind === "about") return about(p, next);
  return prev;
}

// ── entry ────────────────────────────────────────────────────────────

/** Answer about one thing directly (a dot on the rings was clicked). */
export function composeEntity(id: string): Surface | null {
  const e = getGraph().entities.get(id);
  return e ? describe({ text: e.name, norm: e.name, intent: "describe", entities: [e], filters: {}, heard: [], fixed: [] }, e) : null;
}

/** A curated answer wins when the question is clearly one of its phrasings (decision table row 4). */
const CURATED_FIRST = 0.75;
const NEVER_CURATED = new Set(["more", "decline", "greeting", "browse", "compare", "count", "capability", "evaluate"]);

export function compose(p: Parse, ctx: ComposeContext = {}): Surface {
  const g = getGraph();
  if (!NEVER_CURATED.has(p.intent)) {
    const strong = opinion(p, CURATED_FIRST, true);
    if (strong) return strong;
  }
  switch (p.intent) {
    case "browse":
      return simple(p, voice("browse"), STARTERS);
    case "greeting":
      return simple(p, voice("greeting"), STARTERS.slice(0, 3));
    case "decline":
      return simple(p, voice("decline"), ["Show me your work", "How do I reach you?"]);
    case "more":
      return ctx.prev ? more(p, ctx.prev) : simple(p, voice("browse"), STARTERS);
    case "contact":
      return contact(p);
    case "opinion":
      return opinion(p) ?? simple(p, voice("noOpinion"), ["Show me your work", "How do I reach you?"]);
    case "compare":
      return compare(p, p.entities[0], p.entities[1]);
    case "count":
      return count(p);
    case "about":
      return about(p);
    case "story":
      return story(p, p.story ?? "all");
    case "timeline":
      return timeline(p);
    case "list":
      return list(p);
    case "writing":
      return writing(p, ctx);
    case "evaluate":
      return evaluate(p);
    case "capability":
      return capability(p);
    case "facet":
      return facet(p, p.entities[0], p.facet!);
    case "describe":
      return describe(p, p.entities[0] ?? g.entities.get("me:arun")!);
    case "search":
      return search(p);
  }
}
