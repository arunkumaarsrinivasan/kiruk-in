/**
 * Shared landing-page content for every era archetype.
 *
 * The narrative is meta: Arun-the-designer presents *himself* as the user
 * being researched. Every section is a UX research artifact applied to him —
 * persona, empathy map, journey map, impact metrics, card sorting, usability
 * test. The portfolio IS the proof of the process it describes.
 *
 * Each archetype (terminal/spatial/…) only changes the visual language; the
 * artifact structure and copy live here so the story stays coherent across
 * eras.
 */

import { portfolioData } from "@/data/portfolio-data";

// ── 00 · HERO + WHY KIRUK ──────────────────────────────────────────────────

export const HERO = {
  preTitle: "PORTFOLIO · USABILITY STUDY OF ONE",
  name: portfolioData.personal.fullName,
  role: portfolioData.personal.title,
  org: "HP Print AI",
  location: portfolioData.personal.location,
  // One-line framing for the meta-narrative
  framing:
    "This portfolio is a UX research file. The user under study is me. Each section below is the artifact a researcher would produce — applied to my own way of working.",
} as const;

export const WHY_KIRUK = {
  hook: portfolioData.whyUXDesignEngineer.hook,
  pain: portfolioData.whyUXDesignEngineer.painPoint,
  bridge: portfolioData.whyUXDesignEngineer.solution,
  tagline: portfolioData.whyUXDesignEngineer.tagline,
} as const;

// ── 01 · PERSONA ───────────────────────────────────────────────────────────

export const PERSONA = {
  identity: {
    name: portfolioData.personal.fullName,
    role: portfolioData.personal.title,
    org: "HP Print AI",
    location: portfolioData.personal.location,
  },
  goals: [
    "Ship user-centered products fast",
    "Bridge the design-engineering gap",
    "Build scalable design systems",
  ],
  frustrations: [
    "Siloed design and dev teams",
    "Slow design-to-prod handoffs",
    "Lost context in translation",
  ],
  quote: portfolioData.personal.tagline,
  background: portfolioData.personal.bio,
} as const;

// ── 02 · EMPATHY MAP ───────────────────────────────────────────────────────

export const EMPATHY_MAP = {
  says: {
    quote: "I can bridge design and development.",
    skills: portfolioData.skills
      .filter((s) => s.category === "design")
      .slice(0, 4)
      .map((s) => s.name),
  },
  thinks: [
    "Design IS engineering",
    "Ship fast, iterate faster",
    "User problems → solutions",
  ],
  does: [
    ...portfolioData.skills
      .filter((s) =>
        ["nextjs", "figma", "blender", "splunk", "react"].includes(s.id),
      )
      .map((s) => s.name),
    "MongoDB",
    "Spring Boot",
    "Flutter",
  ],
  feels: [
    "Passionate about craft & detail",
    "Excited by gamified experiences",
    "Curious about AI integration",
  ],
} as const;

// ── 03 · JOURNEY MAP ───────────────────────────────────────────────────────

export interface TimelineNode {
  year: string;
  phase: string;
  position: string;
  org: string;
  detail: string;
  live?: boolean;
}

export function buildTimeline(): TimelineNode[] {
  const cur =
    portfolioData.experience.find((e) => e.current) ??
    portfolioData.experience[0];
  return [
    {
      year: "2018",
      phase: "Discovery",
      position: "First freelance gigs",
      org: "Salem · remote clients",
      detail: "Poster & illustration work. Pricing, feedback loops, shipping.",
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
      position: "R&D Intern → SDE 1",
      org: "HP Inc · Bengaluru",
      detail: "Observability, services, prompts, design-system seeds.",
    },
    {
      year: "2025",
      phase: "Now",
      position: cur.position,
      org: `${cur.company} · ${cur.location}`,
      detail:
        "HP Print AI by day, @kirukism by night. Process journals span both.",
      live: true,
    },
  ];
}

// ── 04 · IMPACT METRICS ────────────────────────────────────────────────────

export const IMPACT_METRICS = portfolioData.impactMetrics;

// ── 05 · CARD SORTING (PROJECTS) ───────────────────────────────────────────

export const CARD_SORTING = {
  taxonomy: ["All", "Web", "Mobile", "Design", "AI"] as const,
  projects: portfolioData.projects.slice(0, 4).map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    description: p.description,
    technologies: p.technologies.slice(0, 4),
    duration: p.timeline.duration,
    role: p.role,
  })),
};

// ── 06 · USABILITY TEST (CONTACT) ──────────────────────────────────────────

export const USABILITY_TEST = {
  task: "Initiate collaboration",
  taskBody: "Use any channel below to start a conversation.",
  successMetrics: [
    `Response time < 24 hours`,
    `Status: ${portfolioData.contact.availability.toUpperCase()}`,
    `Timezone: ${portfolioData.contact.timezone}`,
  ],
  channels: [
    {
      label: "Email",
      role: "Primary channel",
      value: portfolioData.contact.email,
      href: `mailto:${portfolioData.contact.email}`,
    },
    {
      label: "LinkedIn",
      role: "Professional network",
      value: portfolioData.personal.linkedin.replace(/^https?:\/\//, ""),
      href: portfolioData.personal.linkedin,
    },
    {
      label: "GitHub",
      role: "Code archive",
      value: portfolioData.personal.github.replace(/^https?:\/\//, ""),
      href: portfolioData.personal.github,
    },
    {
      label: "Phone",
      role: "Call only if urgent",
      value: "+91 94865 82579",
      href: "tel:+919486582579",
    },
  ],
} as const;
