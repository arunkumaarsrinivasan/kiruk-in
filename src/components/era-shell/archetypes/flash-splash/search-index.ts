/**
 * 2000 · The Search Box — a tiny, deterministic, in-memory search index over
 * the portfolio. No network: every "page" is built from era-page-content and
 * portfolio-data, and every URL is a real route on this site.
 */

import { portfolioData } from "@/data/portfolio-data";
import {
  HERO,
  WHY_KIRUK,
  PERSONA,
  EMPATHY_MAP,
  buildTimeline,
  IMPACT_METRICS,
  USABILITY_TEST,
} from "@/data/era-page-content";

export type CachedBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; label?: string; items: string[] }
  | { kind: "links"; items: { label: string; value: string; href: string }[] }
  | { kind: "story" };

export interface SearchDoc {
  id: string;
  title: string;
  url: string;
  snippet: string;
  tags: string[];
  body: string;
  /** Query used by "Similar pages". */
  similar: string;
  cached: CachedBlock[];
}

const { personal, projects, experience, skills } = portfolioData;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function bodyOf(doc: Omit<SearchDoc, "body">): string {
  const parts: string[] = [doc.snippet];
  for (const b of doc.cached) {
    if (b.kind === "p") parts.push(b.text);
    else if (b.kind === "list") parts.push(...b.items);
    else if (b.kind === "links") parts.push(...b.items.map((i) => `${i.label} ${i.value}`));
  }
  return parts.join(" ");
}

function build(): SearchDoc[] {
  const docs: Omit<SearchDoc, "body">[] = [];

  docs.push({
    id: "about",
    title: `${HERO.name} — About`,
    url: "/#about",
    snippet: PERSONA.background,
    tags: ["about", "arun", "kiruk", "bio", "story", "who", personal.title, HERO.org, HERO.location],
    similar: "about",
    cached: [
      { kind: "story" },
      { kind: "p", text: PERSONA.background },
      { kind: "p", text: PERSONA.quote },
    ],
  });

  docs.push({
    id: "persona",
    title: "Persona — goals and frustrations",
    url: "/#about",
    snippet: `${PERSONA.identity.role} at ${PERSONA.identity.org}, ${PERSONA.identity.location}. ${PERSONA.goals.join(". ")}.`,
    tags: ["persona", "goals", "frustrations", "research", "about"],
    similar: "about",
    cached: [
      { kind: "list", label: "Goals", items: [...PERSONA.goals] },
      { kind: "list", label: "Frustrations", items: [...PERSONA.frustrations] },
    ],
  });

  docs.push({
    id: "why",
    title: "Why a design engineer",
    url: "/#about",
    snippet: `${WHY_KIRUK.hook} ${WHY_KIRUK.pain}`,
    tags: ["why", "design engineer", "hire", "value"],
    similar: "about",
    cached: [
      { kind: "p", text: WHY_KIRUK.hook },
      { kind: "p", text: WHY_KIRUK.pain },
      { kind: "p", text: WHY_KIRUK.bridge },
      { kind: "p", text: WHY_KIRUK.tagline },
    ],
  });

  docs.push({
    id: "work",
    title: "Work — all projects",
    url: "/work",
    snippet: `Selected projects: ${projects
      .slice(0, 5)
      .map((p) => p.title)
      .join(", ")} and more.`,
    tags: ["work", "projects", "portfolio", "case studies"],
    similar: "work",
    cached: [{ kind: "list", label: "Projects", items: projects.map((p) => `${p.title} — ${p.description}`) }],
  });

  for (const p of projects) {
    docs.push({
      id: `project-${p.id}`,
      title: p.title,
      url: `/work/${p.id}`,
      snippet: p.description,
      tags: [p.category, ...p.tags, ...p.technologies, p.role],
      similar: p.category,
      cached: [
        { kind: "p", text: p.longDescription },
        { kind: "list", label: "Role", items: [`${p.role} · ${p.timeline.duration}`] },
        { kind: "list", label: "Built with", items: p.technologies },
        ...(p.features.length ? [{ kind: "list" as const, label: "Features", items: p.features }] : []),
      ],
    });
  }

  for (const e of experience) {
    const project = e.projects.find((id) => projects.some((p) => p.id === id));
    docs.push({
      id: `job-${e.id}`,
      title: `${e.position} — ${e.company}`,
      url: project ? `/work/${project}` : "/#about",
      snippet: e.description,
      tags: ["experience", "career", "job", e.company, e.type, ...e.technologies],
      similar: "experience",
      cached: [
        { kind: "p", text: e.description },
        { kind: "list", label: "Responsibilities", items: e.responsibilities },
        { kind: "list", label: "Achievements", items: e.achievements },
      ],
    });
  }

  const timeline = buildTimeline();
  docs.push({
    id: "journey",
    title: `Career journey, ${timeline[0].year}–${timeline[timeline.length - 1].year}`,
    url: "/#about",
    snippet: timeline.map((n) => `${n.year} ${n.phase}: ${n.position}`).join(" · "),
    tags: ["journey", "career", "timeline", "experience", "history"],
    similar: "experience",
    cached: [
      { kind: "list", items: timeline.map((n) => `${n.year} · ${n.phase} — ${n.position}, ${n.org}. ${n.detail}`) },
    ],
  });

  docs.push({
    id: "impact",
    title: "Impact — measured outcomes",
    url: "/work",
    snippet: IMPACT_METRICS.map((m) => `${m.value} ${m.label}`).join(" · "),
    tags: ["impact", "metrics", "results", "numbers", "outcomes"],
    similar: "impact",
    cached: [
      {
        kind: "list",
        items: IMPACT_METRICS.map((m) => `${m.value} ${m.label}${m.context ? ` (${m.context})` : ""}`),
      },
    ],
  });

  docs.push({
    id: "process",
    title: "How Arun works — empathy map",
    url: "/#about",
    snippet: `“${EMPATHY_MAP.says.quote}” ${EMPATHY_MAP.thinks.join(". ")}.`,
    tags: ["process", "empathy", "method", "how", "ux", "research"],
    similar: "about",
    cached: [
      { kind: "list", label: "Says", items: [EMPATHY_MAP.says.quote, ...EMPATHY_MAP.says.skills] },
      { kind: "list", label: "Thinks", items: [...EMPATHY_MAP.thinks] },
      { kind: "list", label: "Does", items: [...EMPATHY_MAP.does] },
      { kind: "list", label: "Feels", items: [...EMPATHY_MAP.feels] },
    ],
  });

  const skillGroups = Array.from(new Set(skills.map((s) => s.category)));
  docs.push({
    id: "skills",
    title: "Skills and tools",
    url: "/work",
    snippet: skills
      .slice(0, 10)
      .map((s) => s.name)
      .join(", "),
    tags: ["skills", "tools", "stack", ...skills.map((s) => s.name)],
    similar: "skills",
    cached: skillGroups.map((g) => ({
      kind: "list" as const,
      label: titleCase(g),
      items: skills.filter((s) => s.category === g).map((s) => `${s.name} — ${s.description}`),
    })),
  });

  docs.push({
    id: "contact",
    title: "Contact — start a conversation",
    url: "/contact",
    snippet: `${USABILITY_TEST.taskBody} ${USABILITY_TEST.successMetrics.join(" · ")}.`,
    tags: ["contact", "email", "hire", "collaborate", "linkedin", "github", "phone"],
    similar: "contact",
    cached: [
      { kind: "p", text: USABILITY_TEST.taskBody },
      { kind: "links", items: USABILITY_TEST.channels.map((c) => ({ label: c.label, value: c.value, href: c.href })) },
      { kind: "list", items: [...USABILITY_TEST.successMetrics] },
    ],
  });

  docs.push({
    id: "notebook",
    title: "Notebook — essays and notes",
    url: "/notebook",
    snippet: "The notebook: essays and notes.",
    tags: ["notebook", "blog", "read", "writing", "essays"],
    similar: "notebook",
    cached: [{ kind: "p", text: "The notebook: essays and notes." }],
  });

  return docs.map((d) => ({ ...d, body: bodyOf(d) }));
}

export const DOCS: SearchDoc[] = build();
export const ABOUT_DOC_ID = "about";

// ── Search ──────────────────────────────────────────────────────────────────

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "at", "by", "with", "me", "i"]);

export const words = (text: string) => text.toLowerCase().match(/[a-z0-9][a-z0-9.+#-]*[a-z0-9+#]|[a-z0-9]/g) ?? [];

export const queryTerms = (q: string) => words(q).filter((w) => !STOP.has(w));

interface Indexed {
  doc: SearchDoc;
  title: string[];
  tags: string[];
  body: string[];
}

const INDEX: Indexed[] = DOCS.map((doc) => ({
  doc,
  title: words(doc.title),
  tags: doc.tags.flatMap(words),
  body: words(doc.body),
}));

const VOCAB = Array.from(new Set(INDEX.flatMap((d) => [...d.title, ...d.tags, ...d.body]))).filter((w) => w.length >= 3);

const hits = (list: string[], term: string) => list.reduce((n, w) => n + (w.startsWith(term) ? 1 : 0), 0);

/** Curated order for an empty query: about first, then work, impact, contact. */
const OVERVIEW = ["about", "work", ...DOCS.filter((d) => d.id.startsWith("project-")).map((d) => d.id), "impact", "journey", "process", "skills", "contact"];
const OVERVIEW_DOCS = [
  ...OVERVIEW.map((id) => DOCS.find((d) => d.id === id)).filter((d): d is SearchDoc => !!d),
  ...DOCS.filter((d) => !OVERVIEW.includes(d.id)),
];

export function search(q: string): SearchDoc[] {
  const terms = queryTerms(q);
  if (terms.length === 0) return OVERVIEW_DOCS;
  const phrase = terms.join(" ");
  const scored: { doc: SearchDoc; score: number; order: number }[] = [];
  INDEX.forEach((d, order) => {
    let score = 0;
    let matched = 0;
    for (const t of terms) {
      const s = hits(d.title, t) * 10 + hits(d.tags, t) * 6 + Math.min(5, hits(d.body, t));
      if (s > 0) matched++;
      score += s;
    }
    if (score === 0) return;
    if (matched === terms.length) score *= 2;
    if (d.doc.title.toLowerCase().includes(phrase)) score += 25;
    scored.push({ doc: d.doc, score, order });
  });
  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.map((s) => s.doc);
}

function distance(a: string, b: string): number {
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

/** "Did you mean" — replaces unknown terms with the closest indexed word. */
export function suggest(q: string): string | null {
  const terms = words(q);
  let changed = false;
  const fixed = terms.map((t) => {
    if (t.length < 3 || STOP.has(t) || VOCAB.some((w) => w.startsWith(t))) return t;
    const limit = t.length >= 6 ? 2 : 1;
    let best: string | null = null;
    let bestD = limit + 1;
    for (const w of VOCAB) {
      if (Math.abs(w.length - t.length) > limit) continue;
      const d = distance(t, w);
      if (d < bestD) {
        bestD = d;
        best = w;
      }
    }
    if (!best) return t;
    changed = true;
    return best;
  });
  return changed ? fixed.join(" ") : null;
}

/** A body window around the first matching term, for result snippets. */
export function snippetFor(doc: SearchDoc, terms: string[]): string {
  if (terms.length === 0) return doc.snippet;
  const lower = (s: string) => s.toLowerCase();
  if (terms.some((t) => lower(doc.snippet).includes(t))) return doc.snippet;
  const body = doc.body;
  const at = terms.map((t) => lower(body).indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0];
  if (at === undefined) return doc.snippet;
  const start = Math.max(0, body.lastIndexOf(" ", Math.max(0, at - 60)));
  const end = Math.min(body.length, start + 190);
  return `${start > 0 ? "… " : ""}${body.slice(start, end).trim()}${end < body.length ? " …" : ""}`;
}

/** Approximate size of the indexed text, for the green URL line. */
export const sizeK = (doc: SearchDoc) => `${Math.max(1, Math.ceil(doc.body.length / 1024))}k`;
