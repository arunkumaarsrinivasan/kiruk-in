/**
 * The pupil's brain, one call: ask(text) → Surface.
 *
 * Also the checks the eval runs (scripts/pupil-eval.mjs):
 *   selfCheck   every Txt resolves to its src; nothing on the deny list;
 *               every chip and next-ask leads somewhere
 *   countDistinct  how many different grounded answers exist
 */

import { QUESTIONS, PHASES, THREADS } from "@/data/about-story";
import { CURATED } from "@/data/pupil-curated";
import { compose, composeEntity, type ComposeContext } from "./compose";
import { getGraph, pluck, type Entity, type Kind } from "./graph";
import { parse, type Intent, type Parse } from "./parse";
import { servedCurated } from "./search";
import { textsOf, type Surface, type Txt } from "./surface";
import { renderVoice } from "./voice";

export type { Surface } from "./surface";
export type { NotebookItem } from "./compose";
export { STARTERS } from "./compose";

/** The main thing an answer was about, for "it" in the next question. */
const subjectOf = (s?: Surface | null) => (s?.ref?.startsWith("describe:") ? s.ref.slice(9) : s?.sources[0]);

export function ask(text: string, ctx: ComposeContext = {}): Surface {
  const p = parse(text, { exists: !!ctx.prev, entity: subjectOf(ctx.prev) });
  const first = compose(p, ctx);
  if (!p.rest?.length) return first;
  // Asked two things at once: answer each, in sections, in one surface.
  let merged = first;
  for (const q of p.rest) {
    const s = compose(parse(q, { exists: true, entity: subjectOf(first), inherit: true }), { ...ctx, prev: merged });
    // Same thing again? Skip its header card; the section title says enough.
    const shown = new Set(merged.nodes.flatMap((n) => (n.type === "entity" ? [n.ref] : [])));
    const body = s.nodes.filter((n) => n.type !== "next" && !(n.type === "entity" && shown.has(n.ref)));
    const next = [...merged.nodes, ...s.nodes].filter((n) => n.type === "next").slice(-1);
    merged = {
      ...merged,
      nodes: [...merged.nodes.filter((n) => n.type !== "next"), { id: `sec-${s.id}`, type: "section", title: s.title }, ...body, ...next],
      sources: [...new Set([...merged.sources, ...s.sources])],
      from: [...merged.from, ...s.from.filter((f) => !merged.from.some((m) => m.ref === f.ref))].slice(0, 10),
      trace: `${merged.trace} · then ${s.trace}`,
      id: `${merged.id}+${s.id}`,
    };
  }
  return merged;
}

export function askEntity(id: string): Surface | null {
  return composeEntity(id);
}

// ── grounding ────────────────────────────────────────────────────────

export function verify(t: Txt): boolean {
  if (t.src.startsWith("voice:")) return renderVoice(t.src) === t.text;
  if (t.src.startsWith("curated:")) return CURATED.find((c) => `curated:${c.id}` === t.src)?.answer === t.text;
  if (t.src.startsWith("curated-q:")) return CURATED.find((c) => `curated-q:${c.id}` === t.src)?.questions[0] === t.text;
  if (t.src.startsWith("notebook:")) return true;
  return pluck(getGraph(), t.src) === t.text;
}

/** Things the pupil must never say (MASTER-CAREER: Spera numbers, Hold metrics, Praveen's lane). */
const DENY: [RegExp, string][] = [
  [/\b(I'm|I am|I was)\b[^.]*\bCEO\b/i, "claims CEO"],
  [/\bI (came up with|had) the idea\b/i, "claims the idea"],
  [/\b\d[\d,]*\+?\s+(users|traders|strategies|waitlist)\b/i, "Spera usage number"],
  [/\b(25|30)% (conversion|faster)\b/i, "Hold metric"],
  [/\b50\+ (automated )?alerts\b/i, "Hold metric"],
  [/\+91|\b\d{5}\s?\d{5}\b/, "phone number"],
];

export interface SelfCheck {
  texts: number;
  violations: string[];
  denied: string[];
  chips: number;
  chipMisses: string[];
}

const DEAD_ENDS = new Set(["voice:unknown", "voice:nothing", "voice:browse"]);

export function selfCheck(questions: string[]): SelfCheck {
  const out: SelfCheck = { texts: 0, violations: [], denied: [], chips: 0, chipMisses: [] };
  const seenAsks = new Set<string>();
  const check = (s: Surface, q: string) => {
    for (const t of textsOf(s)) {
      out.texts++;
      if (!verify(t)) out.violations.push(`${JSON.stringify(q)}: ${t.src} → ${JSON.stringify(t.text.slice(0, 60))}`);
      for (const [re, why] of DENY) if (re.test(t.text)) out.denied.push(`${JSON.stringify(q)}: ${why}: ${JSON.stringify(t.text.slice(0, 80))}`);
    }
  };
  const asksOf = (s: Surface) => s.nodes.flatMap((n) => (n.type === "next" ? n.asks : n.type === "chips" ? n.items.map((i) => i.ask) : n.type === "list" || n.type === "timeline" ? n.items.map((i) => i.ask).filter((a): a is string => !!a) : []));

  for (const q of questions) {
    const s = ask(q);
    check(s, q);
    for (const a of asksOf(s)) {
      const key = a.toLowerCase();
      if (seenAsks.has(key)) continue;
      seenAsks.add(key);
      out.chips++;
      const r = ask(a, { prev: s });
      check(r, a);
      if (DEAD_ENDS.has(r.title.src)) out.chipMisses.push(`${JSON.stringify(a)} (from ${JSON.stringify(q)}) → ${r.title.src}`);
    }
  }
  return out;
}

// ── how many distinct grounded answers ───────────────────────────────

function base(intent: Intent, extra: Partial<Parse> = {}): Parse {
  return { text: "", norm: "", intent, entities: [], filters: {}, heard: [], fixed: [], ...extra };
}

/** Distinct answers = distinct sets of grounded sources across canonical asks. */
export function countDistinct(): number {
  const g = getGraph();
  const seen = new Set<string>();
  const add = (s: Surface) => {
    const key = textsOf(s)
      .map((t) => t.src)
      .filter((src) => !src.startsWith("voice:"))
      .sort()
      .join("|");
    if (key) seen.add(key);
  };
  const all = [...g.entities.values()];

  for (const e of all) {
    const d = compose(base("describe", { entities: [e] }));
    add(d);
    let prev = d;
    for (let i = 0; i < 2; i++) {
      prev = compose(base("more"), { prev });
      add(prev);
    }
    for (const key of Object.keys(e.fields)) add(compose(base("facet", { entities: [e], facet: key as never })));
    if (e.links.length) add(compose(base("facet", { entities: [e], facet: "links" })));
  }

  const kinds = [...g.byKind.keys()] as Kind[];
  for (const kind of kinds) add(compose(base("list", { filters: { kind } })));
  for (const t of g.byKind.get("tech") ?? []) add(compose(base("list", { filters: { kind: "project", tech: t } })));
  for (const c of ["ai", "web", "mobile", "design"]) add(compose(base("list", { filters: { kind: "project", category: c } })));
  for (let y = 2019; y <= 2026; y++) {
    add(compose(base("list", { filters: { kind: "project", year: y } })));
    add(compose(base("timeline", { filters: { year: y } })));
  }
  for (const s of ["elevation", "distance", "hard"] as const) add(compose(base("list", { filters: { kind: "trek", sort: s } })));

  const pairs = (es: Entity[]) => es.flatMap((a, i) => es.slice(i + 1).map((b) => [a, b] as const));
  for (const kind of ["project", "role", "trek", "book", "game"] as Kind[]) {
    for (const [a, b] of pairs(g.byKind.get(kind) ?? [])) add(compose(base("compare", { entities: [a, b] })));
  }

  const storyKeys = ["all", ...PHASES.map((x) => `phase:${x.id}`), ...THREADS.map((x) => `thread:${x.id}`), ...QUESTIONS.map((x) => `q:${x.id}`)];
  for (const what of storyKeys) {
    let s = compose(base("story", { story: what }));
    add(s);
    for (let i = 0; i < 2; i++) {
      s = compose(base("more"), { prev: s });
      add(s);
    }
  }
  for (const c of servedCurated()) add(ask(c.questions[0]));
  return seen.size;
}
