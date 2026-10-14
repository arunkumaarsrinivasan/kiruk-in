/**
 * The pupil's knowledge graph: every real thing on the site as one entity.
 *
 * Built from the site's own data files and nothing else. Every field keeps
 * its source key (`src`), so any line the pupil says can be traced back:
 * pluck(graph, src) === text is checked by the eval for every answer.
 *
 * IDs are namespaced `kind:id` because the same slug can name two things
 * (the beat `square-bridge` and the project `square-bridge`).
 *
 * Deliberately left out: personal-knowledge-base.ts (stale, third person),
 * the phone number, the birth date beyond its year, and the profile-only
 * GitHub link on Spera.
 */

import { BEATS, QUESTIONS } from "@/data/about-story";
import { CHANNELS, FACTS, INTENTS } from "@/data/contact";
import { books, games, movies, musicVibes, travelLocations, treks } from "@/data/life-progress-data";
import { portfolioData } from "@/data/portfolio-data";
import { getProjectCoverLabel, isProjectNda } from "@/data/project-media";

export type Kind =
  | "me"
  | "role"
  | "project"
  | "beat"
  | "skill"
  | "tech"
  | "education"
  | "metric"
  | "channel"
  | "intent"
  | "place"
  | "trek"
  | "game"
  | "book"
  | "movie"
  | "music";

export type FieldKey =
  | "summary"
  | "long"
  | "features"
  | "challenges"
  | "learnings"
  | "stack"
  | "when"
  | "role"
  | "impact"
  | "status"
  | "category"
  | "where"
  | "did"
  | "wins"
  | "skim"
  | "read"
  | "deep"
  | "lesson"
  | "skills"
  | "use"
  | "handle"
  | "why"
  | "value"
  | "level"
  | "courses"
  | "author"
  | "genre"
  | "notes"
  | "rating"
  | "platform"
  | "elevation"
  | "distance"
  | "difficulty"
  | "region";

export interface Field {
  key: FieldKey;
  value: string | string[];
  /** `${entityId}#${key}` — what pluck() resolves. */
  src: string;
}

export interface Link {
  label: string;
  href: string;
}

export interface Entity {
  id: string;
  kind: Kind;
  name: string;
  /** Lower-case names it can be called by, strongest first. */
  aliases: string[];
  /** Weaker names (tags): only used when nothing stronger matched. */
  hints: string[];
  /** Sort key for rings and timelines (YYYY-MM or YYYY). */
  order: string;
  year?: number;
  /** Years it covers, inclusive (roles, projects, education). */
  span?: [number, number];
  fields: Partial<Record<FieldKey, Field>>;
  rel: string[];
  links: Link[];
  /** Where this lives on the site, if it has its own page. */
  href?: string;
  nda?: boolean;
}

export interface Graph {
  entities: Map<string, Entity>;
  byKind: Map<Kind, Entity[]>;
  /** alias → entity ids (strong names). */
  alias: Map<string, string[]>;
  /** hint → entity ids (tags). */
  hint: Map<string, string[]>;
}

/** Words that never name a thing on their own: too common across the data. */
export const STOP_LINK = new Set([
  "design",
  "ai",
  "web",
  "mobile",
  "app",
  "apps",
  "platform",
  "portfolio",
  "kiruk",
  "intern",
  "frontend",
  "product",
  "ux",
  "ui",
  "research",
  "the",
  "and",
]);

/** Names visitors use that the data doesn't spell out. */
const CURATED_ALIASES: Record<string, string[]> = {
  "project:spera-platform": ["spera bot", "spera.bot", "spera platform", "backtesting platform", "crypto platform"],
  "project:hp-print-ai": ["print ai", "printing ai", "hp ai"],
  "project:mudra-ai-stack": ["mudra", "mudra stack", "digital service stack"],
  "project:get-my-prints": ["get my prints", "getmyprints", "doorstep printing", "doorstep prints"],
  "project:hp-print-learn-center": ["print learn center", "learn center", "plc", "worksheets", "whatsapp worksheets"],
  "project:hp-onboarding-app": ["hp onboarding", "onboarding app"],
  "project:square-bridge": ["square bridge", "squarebridge", "portfolio builder", "recruitment platform"],
  "project:peoplegamez-hr": ["peoplegamez", "people gamez", "gamified hr", "hr games"],
  "project:foodies-buddies": ["foodies buddies", "foodies", "foodie app", "food dating app", "dating app"],
  "project:desirable": ["desirable", "furniture marketplace", "furniture app"],
  "project:prags-website": ["prags", "musician website", "scroll to play"],
  "project:portfolio-v3": ["this site", "this portfolio", "this website", "kiruk.in", "kiruk in", "your website", "your site"],
  "role:spera-design-lead": ["spera", "your startup", "co-founder", "cofounder"],
  "role:hp-ux-designer": ["hp", "hp inc", "hewlett packard", "innovation for india", "hp innovation"],
  "role:sns-square-product-designer": ["sns", "sns square", "snsihub"],
  "role:peoplegamez-intern": ["peoplegamez internship", "interaction design intern"],
  "role:freelance-general": ["freelance", "freelancing", "freelancer", "clients", "client work"],
  "education:engineering": ["sona", "sona college", "college", "university", "degree", "engineering degree", "cgpa", "gpa", "where did you study", "where you studied", "your education", "education", "studies"],
  "beat:biryani-qa": ["biryani", "erp", "uncle's erp"],
  "beat:off-hours": ["off hours", "hobbies", "free time", "weekends"],
  "beat:salem": ["salem", "hometown", "joint family"],
  "place:loc-2": ["bengaluru", "bangalore", "blr"],
};

/** Technology spellings that mean the same thing. */
const TECH_VARIANTS: Record<string, string[]> = {
  "next.js": ["nextjs", "next js"],
  "node.js": ["nodejs", "node js", "node"],
  "react": ["reactjs", "react js"],
  "typescript": ["ts"],
  "javascript": ["js"],
  "three.js": ["threejs", "three js"],
  "react native": ["rn"],
  "mongodb": ["mongo"],
  "spring boot": ["springboot", "spring"],
  "flutter": ["dart"],
};

/** Links between kinds the data doesn't state outright. */
const ROLE_BEAT: Record<string, string> = {
  "role:hp-ux-designer": "beat:hp",
  "role:spera-design-lead": "beat:spera",
  "role:sns-square-product-designer": "beat:square-bridge",
  "role:peoplegamez-intern": "beat:peoplegamez",
  "role:freelance-general": "beat:systems-teaching",
  "education:engineering": "beat:sona",
};
const METRIC_TO: Record<string, string> = {
  "metric:engagement": "project:square-bridge",
  "metric:design-system": "project:mudra-ai-stack",
  "metric:products": "role:hp-ux-designer",
  "metric:accuracy": "project:square-bridge",
};

export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, " ")
    .replace(/[^a-z0-9.'+# ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** The data's "now" (Spera, 2026). */
export const NOW_YEAR = 2026;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2023-02-01" → "Feb 2023". */
export function monthYear(d?: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

function make(kind: Kind, raw: string, name: string, order: string): Entity {
  return { id: `${kind}:${raw}`, kind, name, aliases: [], hints: [], order, fields: {}, rel: [], links: [] };
}

function set(e: Entity, key: FieldKey, value: string | string[] | undefined | null) {
  if (value === undefined || value === null) return;
  if (Array.isArray(value) ? value.length === 0 : value.trim() === "") return;
  e.fields[key] = { key, value, src: `${e.id}#${key}` };
}

const shortTitle = (t: string) => t.split("—")[0].split(" - ")[0].trim();

export function buildGraph(): Graph {
  const list: Entity[] = [];
  const add = (e: Entity) => {
    list.push(e);
    return e;
  };

  // ── me ──
  const me = add(make("me", "arun", FACTS.name, "0000"));
  // Not "you": nearly every question says it. "About you" is a cue in the parser instead.
  me.aliases.push("arun", "arun kumaar", "arun kumaar sreenivasan", "arun kumaar srinivasan");
  set(me, "summary", portfolioData.personal.bio);
  set(me, "role", FACTS.now);
  set(me, "where", [FACTS.place, FACTS.timezone, FACTS.mode]);
  set(me, "wins", [...FACTS.openTo]);
  me.links.push({ label: "Spera", href: FACTS.nowHref });

  // ── roles ──
  for (const x of portfolioData.experience) {
    const e = add(make("role", x.id, `${x.position}, ${x.company}`, x.startDate.slice(0, 7)));
    e.year = Number(x.startDate.slice(0, 4));
    e.span = [e.year, x.current || !x.endDate ? NOW_YEAR : Number(x.endDate.slice(0, 4))];
    e.aliases.push(norm(x.company), norm(x.position));
    set(e, "summary", x.description);
    set(e, "role", x.position);
    set(e, "when", `${monthYear(x.startDate)} – ${x.current ? "now" : monthYear(x.endDate)}`);
    set(e, "where", `${x.location} · ${x.type}`);
    set(e, "did", x.responsibilities);
    set(e, "wins", x.achievements);
    set(e, "stack", x.technologies);
    if (x.companyWebsite) e.links.push({ label: x.company, href: x.companyWebsite });
    // PRAGS (2026) sits outside the freelance years (to 2023); don't link it there.
    e.rel.push(...x.projects.filter((p) => !(x.id === "freelance-general" && p === "prags-website")).map((p) => `project:${p}`));
  }

  // ── projects ──
  for (const p of portfolioData.projects) {
    const label = getProjectCoverLabel(p.id, p.title);
    const e = add(make("project", p.id, label, p.timeline.startDate.slice(0, 7)));
    e.year = Number(p.timeline.startDate.slice(0, 4));
    e.span = [e.year, p.timeline.endDate ? Number(p.timeline.endDate.slice(0, 4)) : p.status === "in-progress" ? NOW_YEAR : e.year];
    e.href = `/work/${p.id}`;
    e.nda = isProjectNda(p.id);
    e.aliases.push(norm(label), norm(shortTitle(p.title)));
    e.hints.push(...p.tags.map((t) => norm(t.replace(/-/g, " "))));
    set(e, "summary", p.description);
    set(e, "long", p.longDescription);
    set(e, "features", p.features);
    set(e, "challenges", p.challenges);
    set(e, "learnings", p.learnings);
    set(e, "stack", p.technologies);
    set(e, "role", p.role);
    set(e, "status", p.status);
    set(e, "category", p.category);
    set(e, "impact", p.metrics?.impact);
    const end = p.timeline.endDate ? monthYear(p.timeline.endDate) : p.status === "in-progress" ? "now" : "";
    set(e, "when", `${monthYear(p.timeline.startDate)}${end ? ` – ${end}` : ""} · ${p.timeline.duration}`);
    e.links.push({ label: "Open the case", href: e.href });
    if (p.links.live) e.links.push({ label: "Live site", href: p.links.live });
    if (p.links.behance) e.links.push({ label: "Behance", href: p.links.behance });
  }

  // ── story beats ──
  for (const b of BEATS) {
    const e = add(make("beat", b.id, b.title, String(b.year)));
    e.year = b.year;
    e.aliases.push(norm(b.title));
    set(e, "skim", b.skim);
    set(e, "read", b.read);
    set(e, "deep", b.deep);
    set(e, "lesson", b.stuck);
    set(e, "when", b.period);
    set(e, "where", b.place);
    set(e, "skills", b.skills);
  }

  // ── education ──
  for (const ed of portfolioData.education) {
    const e = add(make("education", ed.id, ed.institution, ed.startDate.slice(0, 7)));
    e.year = Number(ed.startDate.slice(0, 4));
    e.span = [e.year, Number(ed.endDate.slice(0, 4))];
    e.aliases.push(norm(ed.institution));
    set(e, "summary", `${ed.degree}, ${ed.field}`);
    set(e, "when", `${monthYear(ed.startDate)} – ${monthYear(ed.endDate)}`);
    set(e, "value", ed.gpa);
    set(e, "courses", ed.relevantCourses);
  }

  // ── skills and technologies ──
  const techs = new Map<string, Entity>();
  const tech = (name: string) => {
    const key = norm(name);
    let e = techs.get(key);
    if (!e) {
      e = add(make("tech", key.replace(/\s+/g, "-"), name, "9999"));
      e.aliases.push(key, ...(TECH_VARIANTS[key] ?? []));
      techs.set(key, e);
    }
    return e;
  };
  for (const s of portfolioData.skills) {
    const e = add(make("skill", s.id, s.name, String(100 - s.level).padStart(3, "0")));
    e.aliases.push(norm(s.name));
    set(e, "summary", s.description);
    set(e, "category", s.category);
    set(e, "level", `${s.yearsOfExperience} ${s.yearsOfExperience === 1 ? "year" : "years"}`);
  }
  for (const owner of list.filter((x) => x.kind === "project" || x.kind === "role")) {
    const stack = owner.fields.stack?.value;
    if (!Array.isArray(stack)) continue;
    for (const t of stack) {
      const te = tech(t);
      te.rel.push(owner.id);
      owner.rel.push(te.id);
    }
  }
  // A skill and a technology with the same name are the same thing to a visitor.
  for (const s of list.filter((x) => x.kind === "skill")) {
    const te = techs.get(norm(s.name));
    if (te) {
      s.rel.push(te.id);
      te.rel.push(s.id);
    }
  }

  // ── impact metrics ──
  for (const m of portfolioData.impactMetrics) {
    const e = add(make("metric", m.id, `${m.value} ${m.label}`, "9999"));
    set(e, "value", `${m.value} ${m.label}`);
    set(e, "summary", m.context);
    const to = METRIC_TO[e.id];
    if (to) e.rel.push(to);
  }

  // ── contact ──
  for (const c of CHANNELS) {
    const e = add(make("channel", c.id, c.label, "9999"));
    e.aliases.push(norm(c.label), c.slug);
    set(e, "use", c.use);
    set(e, "handle", c.handle);
    e.links.push({ label: c.label, href: c.href });
  }
  for (const i of INTENTS) {
    const e = add(make("intent", i.id, i.label, "9999"));
    set(e, "why", i.why);
    e.rel.push(...i.channels.map((c) => `channel:${c}`));
  }

  // ── life ──
  for (const t of travelLocations) {
    const e = add(make("place", t.id, t.name, t.visitDate ?? "9999"));
    e.aliases.push(norm(t.name));
    set(e, "summary", t.description);
    set(e, "region", [t.region, t.country].filter(Boolean).join(", "));
    set(e, "when", t.visitDate ? monthYear(t.visitDate) : undefined);
    set(e, "category", t.type);
  }
  for (const t of treks) {
    const e = add(make("trek", t.id, t.name, t.date));
    e.year = Number(t.date.slice(0, 4));
    e.aliases.push(norm(t.name));
    set(e, "summary", t.description);
    set(e, "region", `${t.location}, ${t.region}`);
    set(e, "when", monthYear(t.date));
    set(e, "elevation", `${t.elevation.toLocaleString("en-US")} m`);
    set(e, "distance", `${t.distance} km`);
    set(e, "difficulty", t.difficulty);
    // A trek also listed as a place is one dot, not two.
    const twin = list.find((x) => x.kind === "place" && norm(x.name) === norm(t.name));
    if (twin) {
      e.rel.push(twin.id);
      twin.rel.push(e.id);
    }
  }
  for (const g of games) {
    const e = add(make("game", g.id, g.title, "9999"));
    e.aliases.push(norm(g.title));
    set(e, "notes", g.notes);
    set(e, "genre", g.genre);
    set(e, "platform", g.platform);
    set(e, "status", g.status);
  }
  for (const b of books) {
    const e = add(make("book", b.id, b.title, b.startDate ?? "9999"));
    e.aliases.push(norm(b.title));
    set(e, "notes", b.notes);
    set(e, "author", b.author);
    set(e, "genre", b.genre);
    set(e, "status", b.status);
  }
  for (const m of movies) {
    const e = add(make("movie", m.id, m.title, String(m.year)));
    e.aliases.push(norm(m.title));
    set(e, "notes", m.notes);
    set(e, "genre", m.genre);
  }
  for (const m of musicVibes) {
    const e = add(make("music", m.id, m.name, "9999"));
    e.aliases.push(norm(m.name));
    set(e, "summary", m.description);
  }

  // ── hand-made relations ──
  const byId = new Map(list.map((e) => [e.id, e]));
  for (const [a, b] of Object.entries(ROLE_BEAT)) {
    byId.get(a)?.rel.push(b);
    byId.get(b)?.rel.push(a);
  }
  for (const role of list.filter((x) => x.kind === "role")) {
    for (const pid of role.rel.filter((r) => r.startsWith("project:"))) byId.get(pid)?.rel.push(role.id);
  }
  for (const q of QUESTIONS) for (const bid of q.beats) byId.get(`beat:${bid}`)?.hints.push(norm(q.label));
  for (const [id, names] of Object.entries(CURATED_ALIASES)) byId.get(id)?.aliases.push(...names.map(norm));

  // ── indexes ──
  const alias = new Map<string, string[]>();
  const hint = new Map<string, string[]>();
  const put = (m: Map<string, string[]>, k: string, id: string) => {
    if (!k || STOP_LINK.has(k)) return;
    const cur = m.get(k);
    if (!cur) m.set(k, [id]);
    else if (!cur.includes(id)) cur.push(id);
  };
  for (const e of list) {
    // "the design of everyday things" is also asked as "design of everyday things".
    e.aliases = [...new Set(e.aliases.filter(Boolean).flatMap((a) => (a.startsWith("the ") ? [a, a.slice(4)] : [a])))];
    e.rel = [...new Set(e.rel)];
    for (const a of e.aliases) put(alias, a, e.id);
    for (const h of e.hints) put(hint, h, e.id);
  }

  const byKind = new Map<Kind, Entity[]>();
  for (const e of list) {
    const arr = byKind.get(e.kind) ?? [];
    arr.push(e);
    byKind.set(e.kind, arr);
  }
  for (const arr of byKind.values()) arr.sort((a, b) => a.order.localeCompare(b.order));

  return { entities: byId, byKind, alias, hint };
}

let cached: Graph | null = null;
export function getGraph(): Graph {
  cached ??= buildGraph();
  return cached;
}

/**
 * Resolve a `src` back to its text; null if it doesn't exist.
 *   id#name      the entity's name
 *   id#key       a string field
 *   id#key[i]    one item of a list field
 *   id#key[*]    a list field joined with ", "
 */
export function pluck(g: Graph, src: string): string | null {
  const m = src.match(/^([^#]+)#([a-z]+)(?:\[(\d+|\*)\])?$/);
  if (!m) return null;
  const e = g.entities.get(m[1]);
  if (!e) return null;
  if (m[2] === "name") return e.name;
  const f = e.fields[m[2] as FieldKey];
  if (!f) return null;
  if (m[3] === "*") return Array.isArray(f.value) ? f.value.join(", ") : null;
  if (m[3] !== undefined) return Array.isArray(f.value) ? (f.value[Number(m[3])] ?? null) : null;
  return Array.isArray(f.value) ? null : f.value;
}

export const KIND_LABEL: Record<Kind, [string, string]> = {
  me: ["me", "me"],
  role: ["role", "roles"],
  project: ["project", "projects"],
  beat: ["story", "stories"],
  skill: ["skill", "skills"],
  tech: ["technology", "technologies"],
  education: ["degree", "education"],
  metric: ["number", "numbers"],
  channel: ["channel", "channels"],
  intent: ["reason", "reasons"],
  place: ["place", "places"],
  trek: ["trek", "treks"],
  game: ["game", "games"],
  book: ["book", "books"],
  movie: ["movie", "movies"],
  music: ["playlist", "music"],
};
