import { getProjectCoverLabel, isProjectNda } from "@/data/project-media";
import { caseSlugForProject } from "@/data/work-cases";
import type { Project } from "../types";

/** The four cell colours on the tube. Each is a four-shade dot-matrix palette in control-room.css. */
export type Tint = "amber" | "cream" | "green" | "red";
export type Cls = Project["category"];

const TINT_OF: Record<string, Tint> = {
  ai: "amber",
  web: "cream",
  mobile: "green",
  design: "red",
  other: "cream",
};

export const CLS_LABEL: Record<string, string> = {
  ai: "AI",
  web: "Web",
  mobile: "Mobile",
  design: "Design",
  other: "Other",
};

const CLS_ORDER: Cls[] = ["ai", "web", "mobile", "design", "other"];

/** One project as the room shows it. Months count from year 0, so 2024-03 is 2024 * 12 + 2. */
export interface Unit {
  readonly id: string;
  readonly project: Project;
  /** Two-digit position on the wall, "01" first. */
  readonly no: string;
  readonly label: string;
  readonly cls: Cls;
  readonly tint: Tint;
  /** Still being worked on. */
  readonly live: boolean;
  readonly nda: boolean;
  readonly caseSlug?: string;
  readonly year: string;
  readonly period: string;
  readonly start: number;
  readonly end: number;
  /** Row on the work log, so no two bars overlap. */
  readonly lane: number;
  /** Left edge and width on the work log, 0–1. */
  readonly x: number;
  readonly w: number;
}

interface ClassTile {
  readonly cls: Cls;
  readonly tint: Tint;
  readonly count: number;
}

export interface Board {
  readonly units: Unit[];
  readonly classes: ClassTile[];
  readonly lanes: number;
  /** First January on the log and each one after it, as { year, x }. */
  readonly years: { year: number; x: number }[];
  readonly firstYear: number;
  readonly lastYear: number;
  /** Where today falls on the log, 0–1. */
  readonly nowX: number;
  readonly liveCount: number;
}

/** A bar shorter than this many months would not hold its number. */
const MIN_BAR_MONTHS = 5;

function months(iso: string): number {
  const [y, m] = iso.split("-").map(Number);
  return y * 12 + ((m || 1) - 1);
}

export function buildBoard(projects: readonly Project[], today: Date): Board {
  const now = today.getFullYear() * 12 + today.getMonth() + 1;

  const spans = projects.map((p) => {
    const start = months(p.timeline.startDate);
    const ongoing = !p.timeline.endDate && /ongoing/i.test(p.timeline.duration);
    let end = now;
    if (p.timeline.endDate) {
      end = months(p.timeline.endDate);
    } else if (!ongoing) {
      const m = /(\d+)\+?\s*(year|month)/i.exec(p.timeline.duration);
      if (m) end = start + Number(m[1]) * (m[2].toLowerCase() === "year" ? 12 : 1);
    }
    return { start, end: Math.max(start + 1, Math.min(end, now)), ongoing };
  });

  const firstYear = Math.floor(Math.min(now - 12, ...spans.map((s) => s.start)) / 12);
  const lastYear = Math.floor((now - 1) / 12);
  const t0 = firstYear * 12;
  const t1 = (lastYear + 1) * 12;
  const range = t1 - t0;

  // Pack the bars into lanes, earliest first, each in the first lane that is free.
  const order = spans.map((_, i) => i).sort((a, b) => spans[a].start - spans[b].start || a - b);
  const laneEnds: number[] = [];
  const laneOf: number[] = [];
  for (const i of order) {
    const s = spans[i];
    const shownEnd = Math.min(t1, Math.max(s.end, s.start + MIN_BAR_MONTHS));
    let lane = laneEnds.findIndex((end) => end <= s.start);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = shownEnd;
    laneOf[i] = lane;
  }

  const units: Unit[] = projects.map((p, i) => {
    const s = spans[i];
    const startYear = Math.floor(s.start / 12);
    const endYear = Math.floor((s.end - 1) / 12);
    const until = s.ongoing ? "now" : String(endYear);
    const shownEnd = Math.min(t1, Math.max(s.end, s.start + MIN_BAR_MONTHS));
    return {
      id: p.id,
      project: p,
      no: String(i + 1).padStart(2, "0"),
      label: getProjectCoverLabel(p.id, p.title),
      cls: p.category,
      tint: TINT_OF[p.category] ?? "cream",
      live: p.status === "in-progress",
      nda: isProjectNda(p.id),
      caseSlug: caseSlugForProject(p.id),
      year: String(startYear),
      period: until === String(startYear) ? String(startYear) : `${startYear}–${until}`,
      start: s.start,
      end: s.end,
      lane: laneOf[i],
      x: (s.start - t0) / range,
      w: (shownEnd - s.start) / range,
    };
  });

  const classes: ClassTile[] = CLS_ORDER.map((cls) => ({
    cls,
    tint: TINT_OF[cls] ?? "cream",
    count: units.filter((u) => u.cls === cls).length,
  })).filter((c) => c.count > 0);

  const years: { year: number; x: number }[] = [];
  for (let y = firstYear; y <= lastYear; y += 1) years.push({ year: y, x: (y * 12 - t0) / range });

  return {
    units,
    classes,
    lanes: Math.max(1, laneEnds.length),
    years,
    firstYear,
    lastYear,
    nowX: (now - t0) / range,
    liveCount: units.filter((u) => u.live).length,
  };
}
