/**
 * The iris as a map of me: one fibre per real thing, in the knowledge
 * graph's ids (src/lib/pupil/graph.ts), so an answer's sources light them.
 *
 *   roles · projects · story beats · skills · life, clockwise from 12 o'clock
 *
 * Built straight from the data files so the eye can draw before the engine
 * has loaded.
 */

import { BEATS } from "@/data/about-story";
import { books, games, travelLocations, treks } from "@/data/life-progress-data";
import { portfolioData } from "@/data/portfolio-data";
import { getProjectCoverLabel } from "@/data/project-media";
import type { RingEntity } from "./dot-scene";
import type { HalftoneOptions } from "./halftone-scene";

export const ROLES: RingEntity[] = [...portfolioData.experience]
  .sort((a, b) => a.startDate.localeCompare(b.startDate))
  .map((e) => ({ id: `role:${e.id}`, name: `${e.position}, ${e.company}` }));

export const PROJECTS: RingEntity[] = [...portfolioData.projects]
  .sort((a, b) => a.timeline.startDate.localeCompare(b.timeline.startDate))
  .map((p) => ({ id: `project:${p.id}`, name: getProjectCoverLabel(p.id, p.title) }));

export const STORY: RingEntity[] = [...BEATS].sort((a, b) => a.year - b.year).map((b) => ({ id: `beat:${b.id}`, name: b.title }));

export const SKILLS: RingEntity[] = portfolioData.skills.map((s) => ({ id: `skill:${s.id}`, name: s.name }));

export const LIFE: RingEntity[] = [
  ...travelLocations.map((t) => ({ id: `place:${t.id}`, name: t.name })),
  ...treks.map((t) => ({ id: `trek:${t.id}`, name: t.name })),
  ...games.map((g) => ({ id: `game:${g.id}`, name: g.title })),
  ...books.map((b) => ({ id: `book:${b.id}`, name: b.title })),
];

/** Every ring entity in one sequence: one iris fibre each, clockwise from 12 o'clock. */
export const EYE_ENTITIES: RingEntity[] = [...ROLES, ...PROJECTS, ...STORY, ...SKILLS, ...LIFE];

/** The pupil (2026-10-15, from the user's reference): bold halftone dots, black on the white of the eye. */
export const PUPIL: HalftoneOptions = { radius: 190, pitch: 25, entities: EYE_ENTITIES };
