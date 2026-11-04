/**
 * Era Page Content — single source of truth for <EraPageArchetype> home variants.
 *
 * Every era shell home page (terminal, pinboard, block-editor, …) imports copy
 * and structured facts from here. Visual components only handle presentation;
 * they must not hardcode portfolio narrative, contact info, or project facts.
 *
 * Facts (name, email, projects, experience, metrics) come from portfolio-data.
 * UX-research narrative (persona goals, journey phase labels, empathy copy) lives
 * in ERA_NARRATIVE below — edit that block when fine-tuning the design-engineer
 * story; sync portfolio-data when work / projects / roles change.
 *
 * @see src/components/era-shell/EraPageArchetype.tsx
 * @see src/components/era-shell/registry.tsx
 */

import { portfolioData } from "./portfolio-data";
import type { ImpactMetric, Project } from "./portfolio-data";

// ── Narrative config (edit here for copy fine-tunes) ───────────────────────

/** Product / team label shown across era UIs (distinct from legal employer). */
/** Subject identity labels used in social / tracker era UIs. */
export const ERA_SUBJECT = {
  handle: "kiruk",
  fullName: portfolioData.personal.fullName,
  shortName:
    portfolioData.personal.fullName.split(/\s+/).slice(0, 2).join(" ") ||
    portfolioData.personal.fullName,
} as const;

export const ERA_BRAND = {
  employerDisplay: "Spera.bot",
  nightHandle: "@kirukism",
  studyFraming:
    "This portfolio is a UX research file. The user under study is me. Each section below is the artifact a researcher would produce — applied to my own way of working.",
  heroPreTitle: "PORTFOLIO · USABILITY STUDY OF ONE",
} as const;

/** Persona + empathy narrative — not duplicated in portfolio-data yet. */
export const ERA_NARRATIVE = {
  persona: {
    goals: [
      "Build design tools and experimental websites",
      "Own design, frontend, and interaction end-to-end",
      "Leverage UX craft so complex products feel human",
    ],
    frustrations: [
      "Siloed design and dev teams",
      "Products that ship without soul",
      "Lost context between research and code",
    ],
  },
  empathy: {
    saysQuote: "I build whatever feels right — and make it work for people.",
    thinks: [
      "Design IS the experience",
      "Experimental can still ship",
      "UX is leverage, not decoration",
    ],
    feels: [
      "Passionate about craft & detail",
      "Excited by gamified and playful interfaces",
      "Curious about AI, fintech, and new mediums",
    ],
    /** Skill names appended to portfolio “does” list in empathy map. */
    extraDoesSkills: ["Three.js", "WebGPU", "Howler.js", "GSAP", "Prompt Engineering"],
  },
  /** Career journey map nodes (years/phases); “Now” merges current experience. */
  careerJourney: [
    {
      year: "2018",
      phase: "Discovery",
      position: "First freelance gigs",
      org: "Salem · remote clients",
      detail:
        "Poster & illustration work. Pricing, feedback loops, shipping.",
    },
    {
      year: "2019",
      phase: "Growth",
      position: "Engineering + campus design lead",
      org: "Sona College of Technology",
      detail: "CS by day, sketch critiques & medical app UX by night.",
    },
    {
      year: "2022",
      phase: "Intersection",
      position: "Interaction Design Intern",
      org: "PeopleGamez · remote",
      detail: "FigJam + Notion pairing. Gamified loops. Feedback jams.",
    },
    {
      year: "2023",
      phase: "Mastery",
      position: "UX Design Engineer",
      org: "HP Inc · Innovation for India",
      detail: "HP Print AI, Mudra Stack, Get my Prints, PLC, onboarding.",
    },
  ] as const,
  currentJourney: {
    year: "2026",
    phase: "Now",
    detailSuffix: (nightHandle: string) =>
      `${ERA_BRAND.employerDisplay} by day — design, frontend, interaction. ${nightHandle} by night.`,
  },
  cardSort: {
    /** Max project cards on era home pages. */
    projectLimit: 6,
    taxonomy: ["All", "Web", "Mobile", "Design", "AI"] as const,
  },
} as const;

// ── Types ────────────────────────────────────────────────────────────────────

export interface EraTimelineNode {
  year: string;
  phase: string;
  position: string;
  org: string;
  detail: string;
  live?: boolean;
}

export interface EraProjectCard {
  id: string;
  title: string;
  category: Project["category"];
  description: string;
  technologies: string[];
  duration: string;
  role: string;
}

export interface EraContactChannel {
  label: string;
  role: string;
  value: string;
  href: string;
}

export interface EraPageContent {
  hero: typeof HERO;
  whyKiruk: typeof WHY_KIRUK;
  persona: typeof PERSONA;
  empathyMap: typeof EMPATHY_MAP;
  timeline: EraTimelineNode[];
  impactMetrics: ImpactMetric[];
  cardSorting: typeof CARD_SORTING;
  usabilityTest: typeof USABILITY_TEST;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentExperience() {
  return (
    portfolioData.experience.find((e) => e.current) ?? portfolioData.experience[0]
  );
}

function formatTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+${digits}` : "#";
}

function stripUrlScheme(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

/** Contact channels for usability-test sections — always from portfolio facts. */
export function buildUsabilityChannels(): EraContactChannel[] {
  const { personal, contact } = portfolioData;
  const channels: EraContactChannel[] = [
    {
      label: "Email",
      role: "Primary channel",
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    {
      label: "LinkedIn",
      role: "Professional network",
      value: stripUrlScheme(personal.linkedin),
      href: personal.linkedin,
    },
    {
      label: "GitHub",
      role: "Code archive",
      value: stripUrlScheme(personal.github),
      href: personal.github,
    },
  ];

  const phone = contact.phone ?? personal.phone;
  if (phone) {
    channels.push({
      label: "Phone",
      role: "Call only if urgent",
      value: phone,
      href: formatTelHref(phone),
    });
  }

  return channels;
}

export function buildTimeline(): EraTimelineNode[] {
  const cur = getCurrentExperience();
  const nodes: EraTimelineNode[] = ERA_NARRATIVE.careerJourney.map((n) => ({
    ...n,
  }));

  nodes.push({
    year: ERA_NARRATIVE.currentJourney.year,
    phase: ERA_NARRATIVE.currentJourney.phase,
    position: cur.position,
    org: `${ERA_BRAND.employerDisplay} · ${cur.location}`,
    detail: ERA_NARRATIVE.currentJourney.detailSuffix(ERA_BRAND.nightHandle),
    live: true,
  });

  return nodes;
}

function buildEmpathyDoes(): readonly string[] {
  const fromPortfolio = portfolioData.skills
    .filter((s) =>
      ["nextjs", "figma", "blender", "splunk", "react"].includes(s.id),
    )
    .map((s) => s.name);
  return [...fromPortfolio, ...ERA_NARRATIVE.empathy.extraDoesSkills];
}

function buildProjectCards(): EraProjectCard[] {
  const { projectLimit } = ERA_NARRATIVE.cardSort;
  return portfolioData.projects.slice(0, projectLimit).map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    description: p.description,
    technologies: p.technologies.slice(0, 4),
    duration: p.timeline.duration,
    role: p.role,
  }));
}

// ── Sections (derived + narrative) ───────────────────────────────────────────

export const HERO = {
  preTitle: ERA_BRAND.heroPreTitle,
  name: portfolioData.personal.fullName,
  role: portfolioData.personal.title,
  org: ERA_BRAND.employerDisplay,
  location: portfolioData.personal.location,
  framing: ERA_BRAND.studyFraming,
} as const;

export const WHY_KIRUK = {
  hook: portfolioData.whyUXDesignEngineer.hook,
  pain: portfolioData.whyUXDesignEngineer.painPoint,
  bridge: portfolioData.whyUXDesignEngineer.solution,
  tagline: portfolioData.whyUXDesignEngineer.tagline,
} as const;

export const PERSONA = {
  identity: {
    name: portfolioData.personal.fullName,
    role: portfolioData.personal.title,
    org: ERA_BRAND.employerDisplay,
    location: portfolioData.personal.location,
  },
  goals: ERA_NARRATIVE.persona.goals,
  frustrations: ERA_NARRATIVE.persona.frustrations,
  quote: portfolioData.personal.tagline,
  background: portfolioData.personal.bio,
} as const;

export const EMPATHY_MAP = {
  says: {
    quote: ERA_NARRATIVE.empathy.saysQuote,
    skills: portfolioData.skills
      .filter((s) => s.category === "design")
      .slice(0, 4)
      .map((s) => s.name),
  },
  thinks: ERA_NARRATIVE.empathy.thinks,
  does: buildEmpathyDoes(),
  feels: ERA_NARRATIVE.empathy.feels,
} as const;

export const IMPACT_METRICS = portfolioData.impactMetrics;

export const CARD_SORTING = {
  taxonomy: ERA_NARRATIVE.cardSort.taxonomy,
  projects: buildProjectCards(),
} as const;

export const USABILITY_TEST = {
  task: "Initiate collaboration",
  taskBody: "Use any channel below to start a conversation.",
  successMetrics: [
    `Response time < ${portfolioData.contact.responseTime}`,
    `Status: ${portfolioData.contact.availability.toUpperCase()}`,
    `Timezone: ${portfolioData.contact.timezone}`,
  ],
  channels: buildUsabilityChannels(),
} as const;

/** Snapshot of all era home content — useful for debugging and future CMS. */
export function getEraPageContent(): EraPageContent {
  return {
    hero: HERO,
    whyKiruk: WHY_KIRUK,
    persona: PERSONA,
    empathyMap: EMPATHY_MAP,
    timeline: buildTimeline(),
    impactMetrics: IMPACT_METRICS,
    cardSorting: CARD_SORTING,
    usabilityTest: USABILITY_TEST,
  };
}

// Legacy alias used in a few journey-map call sites
export type TimelineNode = EraTimelineNode;
