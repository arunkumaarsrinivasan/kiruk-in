/**
 * What the 1970 home holds: the research file the old teletype home printed,
 * record by record, read from the same sources (era-page-content, the about
 * story). Nothing is rewritten here; the tube only shows it differently.
 */

import { BEATS } from "@/data/about-story";
import { portfolioData } from "@/data/portfolio-data";
import {
  CARD_SORTING,
  EMPATHY_MAP,
  ERA_BRAND,
  HERO,
  IMPACT_METRICS,
  USABILITY_TEST,
  WHY_KIRUK,
  buildTimeline,
} from "@/data/era-page-content";

export type RecordId = "why" | "about" | "empathy" | "journey" | "impact" | "sort" | "test";

export interface HomeRecord {
  id: RecordId;
  /** Its number in the file: 001 … 007. */
  no: string;
  label: string;
  /** What it holds, in the file's own words. */
  sub: string;
  /** A few lines of it, for the dossier on the board. */
  preview: string[];
}

export const TIMELINE = buildTimeline();
const now = TIMELINE[TIMELINE.length - 1];

export const RECORDS: HomeRecord[] = [
  {
    id: "why",
    no: "001",
    label: "Why Kiruk",
    sub: "Hook · pain · bridge · close",
    preview: [WHY_KIRUK.hook, WHY_KIRUK.tagline],
  },
  {
    id: "about",
    no: "002",
    label: "About",
    sub: "The subject, in his own words",
    preview: [`${BEATS.length} moments, ${BEATS[0].year} to now.`, BEATS[BEATS.length - 2].skim],
  },
  {
    id: "empathy",
    no: "003",
    label: "Empathy map",
    sub: "Says · thinks · does · feels",
    preview: [`"${EMPATHY_MAP.says.quote}"`, EMPATHY_MAP.thinks.join(". ") + "."],
  },
  {
    id: "journey",
    no: "004",
    label: "Journey map",
    sub: `Career as user journey · ${TIMELINE[0].year} to now`,
    preview: [`${now.year} · ${now.position}, ${now.org}.`, now.detail],
  },
  {
    id: "impact",
    no: "005",
    label: "Impact",
    sub: "Quantified outcomes",
    preview: IMPACT_METRICS.slice(0, 3).map((m) => `${m.value} ${m.label}${m.context ? ` · ${m.context}` : ""}`),
  },
  {
    id: "sort",
    no: "006",
    label: "Card sort",
    sub: "Projects organized by taxonomy",
    preview: [
      `${portfolioData.projects.length} projects under ${CARD_SORTING.taxonomy.slice(1).join(", ")}.`,
      portfolioData.projects
        .slice(0, 4)
        .map((p) => p.title.split(" — ")[0])
        .join(" · "),
    ],
  },
  {
    id: "test",
    no: "007",
    label: "Usability test",
    sub: "Test the connection",
    preview: [`Task: ${USABILITY_TEST.task}. ${USABILITY_TEST.taskBody}`, USABILITY_TEST.successMetrics[0]],
  },
];

/** Where the home sends you: the pages, and the two panels about the eras. */
export interface HomeLink {
  id: "work" | "notebook" | "contact" | "progress" | "era" | "eras";
  label: string;
  /** A page to go to; without one, the link opens a panel over the home. */
  href?: string;
  key?: string;
}

export const LINKS: HomeLink[] = [
  { id: "work", label: "Work", href: "/work", key: "w" },
  { id: "notebook", label: "Notebook", href: "/notebook", key: "n" },
  { id: "contact", label: "Contact", href: "/contact", key: "c" },
  { id: "progress", label: "Progress", href: "/progress" },
  { id: "era", label: "This era" },
  { id: "eras", label: "Travel eras" },
];

export const SUBJECT = {
  name: HERO.name,
  /** The name as the tube sets it at double size: two lines. */
  nameLines: (() => {
    const words = HERO.name.split(/\s+/);
    return words.length > 1 ? [words.slice(0, -1).join(" "), words[words.length - 1]] : [HERO.name];
  })(),
  role: `${HERO.role} · Co-founder, ${HERO.org}`,
  place: HERO.location,
  preTitle: HERO.preTitle,
  framing: HERO.framing,
  night: ERA_BRAND.nightHandle,
} as const;

/**
 * Every project as a card for the sorter, with the two things it can be
 * sorted on: the kind of work it was, and where it was made.
 *
 * Kind follows the role he held: a project he led as a designer sorts under
 * Design, whatever it was built for; the rest sort by their medium.
 * Place follows the job each project was part of.
 */
export interface HomeCard {
  id: string;
  no: string;
  title: string;
  /** The title without its strapline. */
  short: string;
  role: string;
  kind: string;
  place: string;
  duration: string;
  description: string;
  technologies: string[];
}

const MEDIUM: Record<string, string> = { web: "Web", mobile: "Mobile", design: "Design", ai: "AI", other: "Other" };

function placeOf(id: string): string {
  const job = portfolioData.experience.find((e) => e.projects.includes(id));
  if (!job) return "Own";
  if (job.type === "freelance") return "Freelance";
  return job.company.split(/ [·(–-] ?| Inc| Pvt/)[0].trim();
}

export const CARDS: HomeCard[] = portfolioData.projects.map((p, i) => ({
  id: p.id,
  no: String(i + 1).padStart(2, "0"),
  title: p.title,
  short: p.title.split(" — ")[0],
  role: p.role,
  kind: /design/i.test(p.role) && !/engineer|frontend/i.test(p.role) ? "Design" : (MEDIUM[p.category] ?? "Other"),
  place: placeOf(p.id),
  duration: p.timeline.duration,
  description: p.description,
  technologies: p.technologies.slice(0, 5),
}));

const groupsOf = (key: "kind" | "place", first: string[]) => {
  const seen = [...new Set(CARDS.map((c) => c[key]))];
  return [...first.filter((g) => seen.includes(g)), ...seen.filter((g) => !first.includes(g))];
};

/** What the sorter can sort on, and the hoppers for each. */
export const SORTS: { id: "kind" | "place"; label: string; groups: string[] }[] = [
  { id: "kind", label: "Kind", groups: groupsOf("kind", ["Design", "Web", "Mobile", "AI"]) },
  { id: "place", label: "Place", groups: groupsOf("place", []) },
];

/** The board's cells: the seven records, then the way to the work. */
export const CELLS: string[] = [...RECORDS.map((r) => r.id), "work"];

export { BEATS, CARD_SORTING, EMPATHY_MAP, IMPACT_METRICS, USABILITY_TEST, WHY_KIRUK };
