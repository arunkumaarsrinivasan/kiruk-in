/**
 * LIFE_MOMENTS — a minimal, curated subset of the full /about "Time Travel"
 * life events, used by the compact LifeWalk box on each era's landing. The full
 * experience (every moment) lives in the About module.
 */

export interface LifeMoment {
  year: number;
  icon: string;
  title: string;
  sub: string;
}

export const LIFE_MOMENTS: LifeMoment[] = [
  { year: 2001, icon: "👶", title: "Born into a creative clan", sub: "Salem · joint family of ~30" },
  { year: 2018, icon: "💼", title: "First freelance paycheck", sub: "posters & illustration gigs" },
  { year: 2019, icon: "💻", title: "Engineering begins", sub: "Sona College · code + design" },
  { year: 2022, icon: "🎮", title: "Interaction Design Intern", sub: "PeopleGamez · gamified loops" },
  { year: 2023, icon: "🖨️", title: "HP Inc — SSE 1", sub: "HP Print AI · Bengaluru" },
  { year: 2024, icon: "🧩", title: "SNS Square — Design Lead", sub: "research → living design kit" },
  { year: 2025, icon: "🌈", title: "Now — Kirukism in motion", sub: "HP by day · @kirukism by night" },
];
