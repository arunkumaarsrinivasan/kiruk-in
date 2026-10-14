/**
 * Fuzzy search over everything the pupil knows: one document per
 * (entity, field) and one per curated question. Two jobs:
 *
 *   curated(q)  best curated answer for an opinion-style question
 *   lookup(q)   last resort when the parser found nothing; trusted only
 *               when the top hit is clearly ahead, else "did you mean"
 */

import MiniSearch from "minisearch";
import { CURATED, type Curated } from "@/data/pupil-curated";
import { getGraph, norm, type Entity, type FieldKey } from "./graph";

interface Doc {
  id: string;
  entity?: string;
  field?: FieldKey;
  curated?: string;
  name: string;
  question: string;
  facet: string;
  text: string;
}

const SERVE_DRAFTS = process.env.NODE_ENV !== "production";
export const servedCurated = (): Curated[] => CURATED.filter((c) => c.status === "approved" || SERVE_DRAFTS);

let index: MiniSearch<Doc> | null = null;
let curatedIndex: MiniSearch<Doc> | null = null;

const options = {
  fields: ["name", "question", "facet", "text"],
  storeFields: ["entity", "field", "curated"],
  processTerm: (t: string) => {
    const n = norm(t);
    return n.length > 1 ? n : null;
  },
  searchOptions: {
    boost: { name: 4, question: 3, facet: 2, text: 1 },
    prefix: (term: string) => term.length >= 4,
    fuzzy: (term: string) => (term.length >= 5 ? 0.2 : term.length === 4 ? 1 : false),
    combineWith: "OR" as const,
  },
};

function build() {
  const g = getGraph();
  const docs: Doc[] = [];
  for (const e of g.entities.values()) {
    const names = [e.name, ...e.aliases].join(" · ");
    docs.push({ id: `${e.id}#name`, entity: e.id, name: names, question: "", facet: e.kind, text: "" });
    for (const f of Object.values(e.fields)) {
      if (!f) continue;
      docs.push({ id: f.src, entity: e.id, field: f.key, name: names, question: "", facet: f.key, text: Array.isArray(f.value) ? f.value.join(" ") : f.value });
    }
  }
  const cur: Doc[] = servedCurated().map((c) => ({ id: `curated:${c.id}`, curated: c.id, name: "", question: c.questions.join(" · "), facet: "", text: c.answer }));
  index = new MiniSearch<Doc>(options);
  index.addAll([...docs, ...cur]);
  curatedIndex = new MiniSearch<Doc>({ ...options, searchOptions: { ...options.searchOptions, boost: { question: 4, text: 0.5, name: 0, facet: 0 } } });
  curatedIndex.addAll(cur);
}

/** The curated answer for this question, if one is clearly about it. */
/** Words that carry no meaning on their own; overlap on these isn't a match. */
const FILLER = new Set(
  "a an the and or of to in on at for with about is are was were be been do does did done you your yours i me my we our it its this that these those what how when where who whom which can could would should will tell give show have has had there some any really just more".split(" "),
);
export const contentWords = (s: string) => norm(s).split(" ").filter((w) => w.length > 1 && !FILLER.has(w));

const close = (a: string, b: string) => a === b || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a)));

/**
 * The curated answer for this question, if one is clearly about it.
 * score: share of meaning words the question and the best phrasing have in common.
 * shared: those words, so callers can tell a real match from a shared name.
 */
export function curated(q: string): { item: Curated; score: number; shared: string[] } | null {
  if (!curatedIndex) build();
  const hits = curatedIndex!.search(q);
  if (!hits.length) return null;
  const qWords = contentWords(q);
  if (!qWords.length) return null;
  let best: { item: Curated; score: number; shared: string[] } | null = null;
  // Look past the top hit: MiniSearch ranks by terms, we judge by meaning words.
  for (const h of hits.slice(0, 5)) {
    const item = servedCurated().find((c) => c.id === h.curated);
    if (!item) continue;
    for (const phr of item.questions) {
      const pw = contentWords(phr);
      if (!pw.length) continue;
      const shared = pw.filter((w) => qWords.some((x) => close(w, x)));
      const score = shared.length / Math.max(pw.length, qWords.length);
      if (!best || score > best.score) best = { item, score, shared };
    }
  }
  return best;
}

export interface Lookup {
  trusted: boolean;
  /** Best entities (deduped), strongest first. */
  entities: Entity[];
  field?: FieldKey;
  curated?: Curated;
}

/** Last resort: what in the graph is this probably about? */
export function lookup(q: string): Lookup {
  if (!index) build();
  const g = getGraph();
  const hits = index!.search(q);
  const seen = new Set<string>();
  const entities: Entity[] = [];
  for (const h of hits) {
    if (h.curated) continue;
    if (h.entity && !seen.has(h.entity)) {
      seen.add(h.entity);
      const e = g.entities.get(h.entity);
      if (e) entities.push(e);
    }
    if (entities.length >= 3) break;
  }
  const top = hits[0];
  const second = hits.find((h) => (h.entity ?? h.curated) !== (top?.entity ?? top?.curated));
  const qTerms = norm(q).split(" ").filter((w) => w.length > 2);
  const exact = top ? qTerms.some((w) => (top.terms as string[]).includes(w)) : false;
  const trusted = !!top && top.score >= 6 && (!second || top.score >= second.score * 1.3) && exact;
  if (top?.curated) {
    const c = servedCurated().find((x) => x.id === top.curated);
    return { trusted, entities, curated: c };
  }
  return { trusted, entities, field: top?.field as FieldKey | undefined };
}
