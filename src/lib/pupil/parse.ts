/**
 * Question → Parse. Five passes, in order:
 *
 *   1. normalise and tokenise
 *   2. fix spelling: an unknown word one or two letters off a known name
 *   3. link entities: longest alias first (up to 4 words), then tag hints
 *   4. read cues on the words left over: facet, kind noun, filters, intent cues
 *   5. decide the intent with a fixed table (first row that holds wins)
 *
 * No regular-expression soup: every cue is a row in lexicon.ts.
 */

import { read as readContact } from "@/data/contact-reader";
import { getGraph, norm, type Entity, type Graph, type Kind } from "./graph";
import {
  ABOUT_ME_CUES,
  BROWSE_CUES,
  CATEGORY_WORDS,
  COMMON,
  COMPARE_CUES,
  CONTACT_CUES,
  COUNT_CUES,
  DECLINE_CUES,
  FACET_CUES,
  GREETING_WORDS,
  KIND_NOUNS,
  MORE_CUES,
  OPINION_CUES,
  SORT_CUES,
  STORY_CUES,
  TIMELINE_CUES,
  TREK_DIFFICULTY,
  WRITING_CUES,
  BACK_REFERENCES,
  BEFORE_AFTER,
  CAPABILITY_DOMAINS,
  CAPABILITY_FORMS,
  DIRECT_CONTACT,
  EVALUATE_CUES,
  IMPACT_CUES,
  SUPERLATIVES,
  type Domain,
  type Facet,
} from "./lexicon";

export type Intent =
  | "browse"
  | "more"
  | "decline"
  | "greeting"
  | "contact"
  | "opinion"
  | "compare"
  | "count"
  | "story"
  | "about"
  | "timeline"
  | "list"
  | "facet"
  | "describe"
  | "writing"
  | "evaluate"
  | "capability"
  | "search";

export interface Filters {
  kind?: Kind;
  tech?: Entity;
  category?: string;
  year?: number;
  /** Only things that started before / ended after this year. */
  before?: number;
  after?: number;
  difficulty?: string;
  sort?: "elevation" | "distance" | "hard" | "recent";
}

export interface Parse {
  text: string;
  norm: string;
  intent: Intent;
  /** Linked things, strongest first. */
  entities: Entity[];
  facet?: Facet;
  filters: Filters;
  /** about-story WHAT_OPTIONS key for story questions. */
  story?: string;
  /** Words it went by, for the "heard" line. */
  heard: string[];
  /** Words corrected on the way: [typed, read as]. */
  fixed: [string, string][];
  /** A named ability ("leading a team") for capability questions. */
  domain?: Domain;
  /** A word asked about that the site doesn't know ("rust"). */
  unknown?: string;
  /** Further questions asked in the same breath. */
  rest?: string[];
}

// ── matching helpers ─────────────────────────────────────────────────

const words = (s: string) => s.split(" ").filter(Boolean);

/** Find a cue phrase among the free (unclaimed) words. Returns the phrase or null. */
function findCue(tokens: string[], free: boolean[], cues: string[]): string | null {
  const sorted = [...cues].sort((a, b) => words(b).length - words(a).length || b.length - a.length);
  for (const cue of sorted) {
    const cw = words(cue);
    for (let i = 0; i + cw.length <= tokens.length; i++) {
      let ok = true;
      for (let j = 0; j < cw.length; j++) {
        if (!free[i + j] || tokens[i + j] !== cw[j]) {
          ok = false;
          break;
        }
      }
      if (ok) return cue;
    }
  }
  return null;
}

function findPair<T>(tokens: string[], free: boolean[], table: [string, T][]): [string, T] | null {
  const cue = findCue(
    tokens,
    free,
    table.map(([c]) => c),
  );
  return cue ? (table.find(([c]) => c === cue) ?? null) : null;
}

function distance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

// ── vocab for spelling fixes ─────────────────────────────────────────

let vocab: { names: string[]; known: Set<string> } | null = null;
function getVocab(g: Graph) {
  if (vocab) return vocab;
  const names = new Set<string>();
  for (const a of g.alias.keys()) for (const w of words(a)) if (w.length >= 4) names.add(w);
  const known = new Set<string>([...COMMON, ...names]);
  const cueLists = [
    FACET_CUES.map(([c]) => c),
    KIND_NOUNS.map(([c]) => c),
    STORY_CUES.map(([c]) => c),
    COUNT_CUES,
    COMPARE_CUES,
    TIMELINE_CUES,
    MORE_CUES,
    BROWSE_CUES,
    GREETING_WORDS,
    ABOUT_ME_CUES,
    CONTACT_CUES,
    OPINION_CUES,
    DECLINE_CUES,
    TREK_DIFFICULTY,
    EVALUATE_CUES,
    CAPABILITY_FORMS,
    CAPABILITY_DOMAINS.map(([c]) => c),
    SUPERLATIVES.map(([c]) => c),
    IMPACT_CUES,
    BACK_REFERENCES,
    DIRECT_CONTACT,
    ["he", "him", "his", "she", "her", "arun"],
  ];
  for (const list of cueLists) for (const c of list) for (const w of words(c)) known.add(w);
  vocab = { names: [...names], known };
  return vocab;
}

function fixSpelling(tokens: string[], g: Graph): [string[], [string, string][]] {
  const { names, known } = getVocab(g);
  const fixed: [string, string][] = [];
  const out = tokens.map((t) => {
    if (t.length < 4 || known.has(t) || /\d/.test(t)) return t;
    const limit = t.length >= 5 ? 2 : 1;
    let best: string | null = null;
    let bestD = limit + 1;
    for (const n of names) {
      // Typos drop or swap letters; a much shorter word is a different word ("player" is not "play").
      if (n.length < t.length - 1) continue;
      const d = distance(t, n);
      if (d < bestD || (d === bestD && best && Math.abs(n.length - t.length) < Math.abs(best.length - t.length))) {
        bestD = d;
        best = n;
      }
    }
    if (best && bestD <= limit) {
      fixed.push([t, best]);
      return best;
    }
    return t;
  });
  return [out, fixed];
}

// ── entity linking ───────────────────────────────────────────────────

interface Link {
  ids: string[];
  phrase: string;
  at: number;
  strong: boolean;
}

function link(tokens: string[], g: Graph): { links: Link[]; free: boolean[] } {
  const free = tokens.map(() => true);
  const links: Link[] = [];
  const pass = (map: Map<string, string[]>, strong: boolean) => {
    for (let n = Math.min(8, tokens.length); n >= 1; n--) {
      for (let i = 0; i + n <= tokens.length; i++) {
        if (free.slice(i, i + n).some((f) => !f)) continue;
        const phrase = tokens.slice(i, i + n).join(" ");
        const variants = [phrase, phrase.replace(/'s$/, ""), phrase.replace(/s$/, ""), `${phrase}s`];
        const hit = variants.map((v) => map.get(v)).find(Boolean);
        if (!hit) continue;
        if (n === 1 && COMMON.has(phrase) && !strong) continue;
        links.push({ ids: hit, phrase, at: i, strong });
        for (let j = i; j < i + n; j++) free[j] = false;
      }
    }
  };
  pass(g.alias, true);
  if (!links.length) pass(g.hint, false);
  links.sort((a, b) => a.at - b.at);
  return { links, free };
}

/** Facets that only a project (vs a role) carries; and the reverse. */
const PROJECT_FACETS = new Set<Facet>(["features", "challenges", "learnings", "stack", "impact", "long", "links", "status"]);
const ROLE_FACETS = new Set<Facet>(["when", "did", "wins", "where", "role"]);
const KIND_ORDER: Kind[] = ["me", "role", "project", "beat", "trek", "education", "tech", "skill", "book", "game", "movie", "music", "channel", "place", "metric", "intent"];

/** Pick one entity from an ambiguous alias, using what else the question says. */
function resolve(ids: string[], g: Graph, ctx: { facet?: Facet; listing: boolean; kinds: Kind[]; ability?: boolean }): Entity {
  const es = ids.map((id) => g.entities.get(id)!).filter(Boolean);
  if (es.length === 1) return es[0];
  const has = (k: Kind) => es.find((e) => e.kind === k);
  // Same kind as another thing in the question (compare "hp vs spera").
  for (const k of ctx.kinds) {
    const m = has(k);
    if (m) return m;
  }
  // "do you know X" asks about the skill; "have you used X" asks about the work it went into.
  if (ctx.ability && !ctx.listing && has("skill")) return has("skill")!;
  if (ctx.listing && has("tech")) return has("tech")!;
  if (ctx.facet === "level" && has("skill")) return has("skill")!;
  if (ctx.facet && PROJECT_FACETS.has(ctx.facet) && has("project")) return has("project")!;
  if (ctx.facet && ROLE_FACETS.has(ctx.facet) && has("role")) return has("role")!;
  // A company that is also its product: the product has more to show.
  if (!ctx.facet && has("project") && has("role")) return has("project")!;
  if (has("trek") && has("place")) return has("trek")!;
  return [...es].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind))[0];
}

// ── perspective and splitting ───────────────────────────────────────

/**
 * Visitors talk about Arun ("is he good", "his projects"); the pupil
 * answers as him. Rewrite third person to second person before parsing.
 */
const PERSON: [RegExp, string | ((...m: string[]) => string)][] = [
  [/\bwho(?:'s| is) (?:he|arun|kiruk)\b/g, "who are you"],
  [/\btell me (?:more )?about (?:him|arun)\b/g, "tell me about yourself"],
  [/\b(is|was|does|did|has|can|could|would|will|should) (?:he|arun)\b/g, (_m, v) => ({ is: "are you", was: "were you", does: "do you", has: "have you" })[v] ?? `${v} you`],
  [/\b(?:he|arun) (is|was|has|does)\b/g, (_m, v) => ({ is: "you are", was: "you were", has: "you have", does: "you do" })[v] ?? `you ${v}`],
  [/\bhe's\b/g, "you're"],
  [/\b(?:arun's|kiruk's)\b/g, "your"],
  [/\bhimself\b/g, "yourself"],
  [/\bhis\b/g, "your"],
  [/\b(?:him|he)\b/g, "you"],
  [/\b(?:this guy|the guy|the designer|the candidate)\b/g, "you"],
  [/\barun\b(?! kumaar)/g, "you"],
];

export function person(s: string): string {
  let out = s;
  for (const [re, to] of PERSON) out = out.replace(re, to as never);
  return out;
}

/** "What did he do at HP and what tech did he use?" → two asks. */
export function splitAsks(text: string): string[] {
  const byMark = text
    .split("?")
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
  if (byMark.length > 1) return byMark.slice(0, 3);
  const parts = text.split(/\s+(?:and|also|plus)\s+(?=(?:what|how|when|where|who|which|why|can|could|do|does|did|is|are|has|have|tell)\b)/i).map((s) => s.trim());
  return parts.filter(Boolean).slice(0, 3);
}

// ── the parse ────────────────────────────────────────────────────────

export interface PrevContext {
  exists: boolean;
  /** The main thing the previous answer was about, for "it" and "there". */
  entity?: string;
  /** The second half of a two-part ask: it's about the same thing even without "it". */
  inherit?: boolean;
}

export function parse(text: string, prev: boolean | PrevContext = false): Parse {
  const g = getGraph();
  const ctx: PrevContext = typeof prev === "boolean" ? { exists: prev } : prev;

  // Two questions in one: parse the first, keep the rest for the composer.
  const parts = splitAsks(text);
  if (parts.length > 1) {
    const first = parse(parts[0], ctx);
    return { ...first, text, rest: parts.slice(1) };
  }

  const n = person(norm(text.replace(/\?/g, " ")));
  const raw = words(n);
  const [tokens, fixed] = fixSpelling(raw, g);
  const joined = tokens.join(" ");
  const { links, free } = link(tokens, g);
  const heard: string[] = [];
  const has = (cues: string[]) => findCue(tokens, free, cues);

  // A name can itself be the question ("cgpa"): read it as the facet too.
  const facetPair = findPair(tokens, free, FACET_CUES) ?? FACET_CUES.find(([c]) => links.some((l) => l.phrase === c)) ?? null;
  const kindPair = findPair(tokens, free, KIND_NOUNS);
  const sortPair = findPair(tokens, free, SORT_CUES);
  const facet = facetPair?.[1];
  const year = tokens.map(Number).find((y) => y >= 1990 && y <= 2035);
  const capForm = has(CAPABILITY_FORMS);
  const listing = !!kindPair || !!has(COUNT_CUES) || /\b(used|use|with|using)\b/.test(joined);

  // Resolve ambiguous names in order, letting earlier picks steer later ones.
  const kinds: Kind[] = [];
  let entities: Entity[] = [];
  for (const l of links) {
    const e = resolve(l.ids, g, { facet, listing, kinds: [...kinds], ability: !!capForm });
    if (!entities.includes(e)) {
      entities.push(e);
      kinds.push(e.kind);
      heard.push(l.phrase);
    }
  }

  // "What tech did it use?" — "it" is whatever was just on screen.
  const backRef = !entities.some((e) => e.kind !== "tech" && e.kind !== "skill") && ctx.entity ? (has(BACK_REFERENCES) ?? (ctx.inherit ? "and" : null)) : null;
  if (backRef) {
    const e = g.entities.get(ctx.entity!);
    if (e) {
      entities = [e, ...entities];
      heard.push(backRef === "and" ? `still ${e.name}` : `${backRef} = ${e.name}`);
    }
  }

  const techs = entities.filter((e) => e.kind === "tech" || e.kind === "skill");
  const targets = entities.filter((e) => e.kind !== "tech" && e.kind !== "skill");

  const filters: Filters = {};
  if (kindPair) filters.kind = kindPair[1];
  if (year) filters.year = year;
  if (sortPair) filters.sort = sortPair[1];
  const diff = TREK_DIFFICULTY.find((d) => tokens.includes(d));
  if (diff && (filters.kind === "trek" || targets.some((t) => t.kind === "trek"))) filters.difficulty = diff;
  if (filters.kind === "project" || (!filters.kind && /\bapps?\b/.test(joined))) {
    const cat = CATEGORY_WORDS.find(([w]) => tokens.includes(w));
    if (cat) filters.category = cat[1];
  }
  if (techs.length && (filters.kind === "project" || listing)) {
    const t = techs.find((x) => x.kind === "tech") ?? techs[0];
    filters.tech = t.kind === "tech" ? t : (g.entities.get(t.rel.find((r) => r.startsWith("tech:")) ?? "") ?? t);
  }

  const base = { text, norm: joined, entities, facet, filters, heard, fixed };
  const done = (intent: Intent, extra: Partial<Parse> = {}): Parse => {
    const cueHeard = extra.heard ?? heard;
    return { ...base, intent, ...extra, heard: [...new Set(cueHeard)].slice(0, 4) };
  };
  const cue = (list: string[]) => {
    const c = has(list);
    if (c) heard.push(c);
    return c;
  };
  const me = g.entities.get("me:arun")!;

  // 1. nothing asked
  if (!tokens.length) return done("browse");
  // 2. deeper on what's on screen
  if (ctx.exists && MORE_CUES.includes(joined)) return done("more");
  // 3. private or out of scope
  if (cue(DECLINE_CUES)) return done("decline");
  // 4. hello and nothing else
  const greet = findCue(tokens, free, GREETING_WORDS);
  if (greet && tokens.every((t) => GREETING_WORDS.some((gw) => words(gw).includes(t)))) return done("greeting", { heard: [greet] });
  // 5. what can I ask
  if (cue(BROWSE_CUES) && !entities.length) return done("browse");
  // 6. reaching out, said outright ("mentor me", "how do I reach you")
  const said = readContact(text);
  const channel = entities.find((e) => e.kind === "channel");
  const direct = cue(DIRECT_CONTACT);
  if (direct || channel) return done("contact", { heard: [...heard, ...said.heard] });

  // 7. abilities: "can you code", "do you know react", "are you good at design"
  const domainPair = findPair(tokens, free, CAPABILITY_DOMAINS);
  const evalCue = has(EVALUATE_CUES);
  const goodAtList = !!has(["good at"]) && !domainPair && !techs.length;
  const unknownWord = tokens.find((t, i) => free[i] && t.length >= 3 && !COMMON.has(t) && !getVocab(g).known.has(t) && !/^\d+$/.test(t));
  if (!goodAtList && ((evalCue && (domainPair || techs.length)) || (capForm && (domainPair || techs.length || (unknownWord && !targets.length))))) {
    heard.push(...[capForm, evalCue, domainPair?.[0]].filter((x): x is string => !!x));
    return done("capability", { domain: domainPair?.[1], unknown: domainPair || techs.length ? undefined : unknownWord, entities: [...techs, ...targets] });
  }
  // 8. judging: "is he good", "worth hiring", "senior"
  if (evalCue && !goodAtList && !targets.filter((t) => t.kind !== "me").length) {
    heard.push(evalCue);
    return done("evaluate", { entities: [me] });
  }
  // 9. opinions: curated answers only
  if (cue(OPINION_CUES)) return done("opinion");
  // 10. reaching out, the rest ("I'm hiring")
  if (cue(CONTACT_CUES)) return done("contact", { heard: [...heard, ...said.heard] });
  // 11. two things side by side
  if (targets.length >= 2 && (cue(COMPARE_CUES) || targets[0].kind === targets[1].kind) && targets[0].kind === targets[1].kind) {
    return done("compare", { entities: targets.slice(0, 2) });
  }
  // 12. how many
  if (cue(COUNT_CUES) && (filters.kind || filters.tech)) return done("count");
  // 13. firsts and lasts: "first job", "latest project", "where do you work"
  const sup = findPair(tokens, free, SUPERLATIVES.map(([p, k, w]) => [p, [k, w] as const]));
  if (sup) {
    const [kind, which] = sup[1];
    const pool = [...(g.byKind.get(kind) ?? [])].sort((a, b) => a.order.localeCompare(b.order));
    const pick = which === "first" ? pool[0] : which === "last" ? pool[pool.length - 1] : pool[pool.length - 2];
    if (pick) {
      heard.push(sup[0]);
      return done("describe", { entities: [pick] });
    }
  }
  // 14. the impact numbers
  if (cue(IMPACT_CUES) && !targets.length) return done("list", { filters: { kind: "metric" } });
  // 15. before / after something
  const ba = findPair(tokens, free, BEFORE_AFTER);
  const pivot = targets.find((t) => t.span);
  if (ba && pivot) {
    heard.push(ba[0]);
    return done("timeline", { filters: { ...filters, [ba[1]]: ba[1] === "before" ? pivot.span![0] : pivot.span![1] }, entities: [pivot] });
  }
  // 16. about me
  if (cue(ABOUT_ME_CUES) && !targets.filter((t) => t.kind !== "me").length) return done("about", { entities: [me] });
  // 17. story questions
  const story = findPair(tokens, free, STORY_CUES);
  if (story && !targets.filter((t) => t.kind !== "beat").length && !kindPair) {
    heard.push(story[0]);
    return done("story", { story: story[1] });
  }
  // 18. career timeline (or "what did you do in 2024")
  if (cue(TIMELINE_CUES) || (year && !filters.kind && !targets.length)) return done("timeline");
  // 19. reaching out, read between the lines ("I'm a student, stuck on my portfolio")
  if (said.score >= 2 && said.intent !== "hello" && !facet && !kindPair && !targets.length) return done("contact", { heard: [...heard, ...said.heard] });
  // 20. lists and filters
  if ((filters.kind || filters.tech || filters.category) && !targets.length) {
    if (kindPair) heard.push(kindPair[0]);
    return done("list", { filters: { ...filters, kind: filters.kind ?? "project" } });
  }
  // 21. writing
  if (cue(WRITING_CUES) && !targets.length) return done("writing");
  // 22. one fact about one thing (or about me, when nothing else is named)
  if (facet) {
    heard.push(facetPair![0]);
    const subject = targets[0] ?? techs[0] ?? me;
    if (targets[0] || techs[0] || ["where", "role", "wins", "summary"].includes(facet)) return done("facet", { entities: [subject, ...entities.filter((e) => e !== subject)] });
  }
  // 23. one thing
  if (targets.length || techs.length) return done("describe", { entities: [...targets, ...techs] });
  // 24. a kind noun on its own ("treks")
  if (kindPair) return done("list");
  // 25. hello inside a longer sentence
  if (greet) return done("greeting", { heard: [greet] });
  // 26. let the search index try
  return done("search");
}
