/**
 * What the eye is actually looking at: this portfolio, as that year would have
 * built it.
 *
 * The reflection used to show C source, which said nothing about the work. This
 * says the same facts every era shell says — the name, the role, the projects,
 * the numbers — dressed in the idiom of its decade: a shell session in 1970, a
 * Star document in 1981, tags in 1991, marquee junk in 1995, a pocket device in 2026.
 * Facts come from portfolio-data; only the voice changes per era.
 */

import { portfolioData } from "@/data/portfolio-data";

export type PageBlock =
  | { t: "title"; text: string }
  | { t: "sub"; text: string }
  | { t: "nav"; items: string[] }
  | { t: "rule" }
  | { t: "body"; text: string }
  | { t: "item"; text: string }
  | { t: "card"; title: string; meta: string }
  | { t: "stat"; value: string; label: string }
  | { t: "gap" };

export interface EraPage {
  /** Shown in the era's window chrome. */
  file: string;
  /** Rough type personality of the year. */
  face: "mono" | "serif" | "sans" | "grotesk";
  blocks: PageBlock[];
}

const P = portfolioData.personal;
const NAV = ["WORK", "ABOUT", "WRITING", "CONTACT"];

/** Short project titles — the long marketing subtitle never fits a reflection. */
const WORK = portfolioData.projects.slice(0, 6).map((p) => ({
  title: p.title.split(/\s+[—–-]\s+/)[0],
  meta: `${p.role.split(/\s*[,&]\s*/)[0]} · ${p.timeline.duration}`,
  tech: p.technologies.slice(0, 3).join(" · "),
}));

const STATS = portfolioData.impactMetrics.slice(0, 4).map((m) => ({
  value: m.value,
  label: m.label,
}));

const ROLE = `${P.title} · ${portfolioData.experience[0]?.company ?? "Spera.bot"}`;

/* ------------------------------------------------------------------ voices */

/** 1970 — a shell session. The portfolio is a file you cat. */
function terminal(): EraPage {
  return {
    file: "/usr/kiruk/portfolio",
    face: "mono",
    blocks: [
      { t: "body", text: "$ finger kiruk" },
      { t: "body", text: `Name:  ${P.fullName.toUpperCase()}` },
      { t: "body", text: `Role:  ${P.title.toUpperCase()}` },
      { t: "body", text: `Home:  ${P.location.split(",")[0].toUpperCase()}` },
      { t: "body", text: "$ cat work.txt" },
      ...WORK.slice(0, 4).map(
        (w) => ({ t: "item", text: `${w.title} -- ${w.meta}` }) as PageBlock,
      ),
      { t: "body", text: "$ cat impact.txt" },
      ...STATS.map(
        (s) => ({ t: "item", text: `${s.value.padEnd(6)}${s.label}` }) as PageBlock,
      ),
      { t: "body", text: `$ mail ${P.email}` },
      { t: "body", text: "$ _" },
    ],
  };
}

/** 1981 — a Star document: printed page, the universal command keys. */
function star(): EraPage {
  return {
    file: "Star>Documents>Portfolio",
    face: "serif",
    blocks: [
      { t: "nav", items: ["OPEN", "PROPS", "COPY", "MOVE"] },
      { t: "title", text: P.fullName },
      { t: "sub", text: ROLE },
      { t: "rule" },
      { t: "body", text: P.tagline },
      { t: "gap" },
      ...WORK.slice(0, 3).map(
        (w) => ({ t: "card", title: w.title, meta: w.meta }) as PageBlock,
      ),
      { t: "rule" },
      { t: "body", text: `Document 1 of 1 — ${P.location.split(",")[0]}` },
    ],
  };
}

/** 1991 — the first web: headings, paragraphs, a list of links. */
function hypertext(): EraPage {
  return {
    file: "kiruk.in/index.html",
    face: "serif",
    blocks: [
      { t: "title", text: P.fullName },
      { t: "rule" },
      { t: "body", text: `${P.title}. ${P.tagline}.` },
      { t: "gap" },
      { t: "sub", text: "Selected work" },
      ...WORK.slice(0, 5).map(
        (w) => ({ t: "item", text: w.title }) as PageBlock,
      ),
      { t: "gap" },
      { t: "sub", text: "Elsewhere" },
      { t: "item", text: P.email },
      { t: "item", text: "linkedin.com/in/arunkumaarsreenivasan" },
    ],
  };
}

/** 1995 — GeoCities: shouting, dividers, counters. */
function geocities(): EraPage {
  return {
    file: "~kiruk/index.htm",
    face: "sans",
    blocks: [
      { t: "title", text: `~ ${P.name}'S HOME PAGE ~` },
      { t: "rule" },
      { t: "body", text: `*** ${P.title.toUpperCase()} ***` },
      { t: "body", text: P.tagline.toUpperCase() },
      { t: "gap" },
      { t: "sub", text: "[NEW!] MY PROJECTS [NEW!]" },
      ...WORK.slice(0, 4).map(
        (w) => ({ t: "item", text: `>> ${w.title}` }) as PageBlock,
      ),
      { t: "rule" },
      { t: "body", text: "You are visitor 000147" },
      { t: "body", text: "SIGN MY GUESTBOOK!!" },
    ],
  };
}

/** 1997 — corporate frames: a rail of sections, a table of work. */
function frames(): EraPage {
  return {
    file: "kiruk.in/main.html",
    face: "sans",
    blocks: [
      { t: "nav", items: NAV },
      { t: "title", text: P.fullName },
      { t: "sub", text: ROLE },
      { t: "rule" },
      ...WORK.slice(0, 4).map(
        (w) => ({ t: "card", title: w.title, meta: w.tech }) as PageBlock,
      ),
      { t: "rule" },
      { t: "body", text: `© 1997 ${P.name} · ${P.email}` },
    ],
  };
}

/** 2000 — a search engine: one box, ten blue links. */
function search(): EraPage {
  return {
    file: "kiruk.in/search?q=design+engineer",
    face: "serif",
    blocks: [
      { t: "title", text: "Kiruk" },
      { t: "nav", items: ["[ design engineer ]", "Search"] },
      { t: "rule" },
      ...WORK.slice(0, 4).map(
        (w) => ({ t: "card", title: w.title, meta: `kiruk.in/work · ${w.meta}` }) as PageBlock,
      ),
      { t: "body", text: "Kiiiiiruk  1 2 3  Next" },
    ],
  };
}

/** 2003 — cards, gel panels, a summary box. */
function cards(file: string): EraPage {
  return {
    file,
    face: "sans",
    blocks: [
      { t: "nav", items: NAV },
      { t: "title", text: P.name },
      { t: "sub", text: ROLE },
      { t: "rule" },
      ...WORK.slice(0, 4).map(
        (w) => ({ t: "card", title: w.title, meta: w.tech }) as PageBlock,
      ),
      { t: "gap" },
      ...STATS.slice(0, 2).map(
        (s) => ({ t: "stat", value: s.value, label: s.label }) as PageBlock,
      ),
    ],
  };
}

/** 2009–2013 — the phone: a stack of tappable rows. */
function handheld(file: string): EraPage {
  return {
    file,
    face: "grotesk",
    blocks: [
      { t: "title", text: P.name },
      { t: "sub", text: P.title },
      { t: "rule" },
      ...WORK.slice(0, 5).map(
        (w) => ({ t: "item", text: w.title }) as PageBlock,
      ),
      { t: "rule" },
      { t: "item", text: "About" },
      { t: "item", text: "Contact" },
    ],
  };
}

/** 2026 — the pupil: one dot, one answer at a time. */
function device(): EraPage {
  return {
    file: "kiruk · ready",
    face: "mono",
    blocks: [
      { t: "sub", text: "type to ask" },
      { t: "title", text: P.name },
      { t: "body", text: ROLE },
      { t: "gap" },
      ...STATS.slice(0, 2).map(
        (s) => ({ t: "stat", value: s.value, label: s.label }) as PageBlock,
      ),
    ],
  };
}

const PAGES: Record<string, () => EraPage> = {
  "1970": terminal,
  "1981": star,
  "1991": hypertext,
  "1995": geocities,
  "1997": frames,
  "2000": search,
  "2003": () => cards("kiruk.in — work"),
  "2009": () => handheld("kiruk.in"),
  "2013": () => handheld("kiruk.in"),
  "2026": device,
};

export function getEraPage(eraId: string): EraPage {
  return (PAGES[eraId] ?? PAGES["2000"])();
}
