/**
 * Timeline Era Design System - Single source of truth for the About page journey
 *
 * Data-driven configuration for age-based life phases. All timeline UI components
 * (JourneyStoryCard, CelestialLevelBackground, etc.) consume
 * this config for consistent colors, typography, and visual tokens.
 */

export type LineStyle = "dotted" | "dashed" | "solid";

export interface EraConfig {
  /** Max age (inclusive) for this era */
  ageMax: number;
  /** Display name (e.g. "Early Days", "College") */
  name: string;
  /** Phase ID for grouping/navigation (Kid, Child, School, College, Work) */
  phase: string;
  /** Era emoji for badges and headers */
  emoji: string;
  /** Primary accent color - borders, highlights, progress */
  color: string;
  /** Secondary color - badges, secondary accents */
  secondaryColor: string;
  /** Grid overlay opacity (0-1) */
  gridOpacity: number;
  /** Border/line style for wireframe aesthetic */
  lineStyle: LineStyle;
}

/**
 * Era definitions ordered by age (youngest first).
 * Each era covers ages (previousEra.ageMax, era.ageMax].
 */
export const ERA_CONFIG: EraConfig[] = [
  {
    ageMax: 6,
    name: "Early Days",
    phase: "Kid",
    emoji: "🌱",
    color: "#22c55e",
    secondaryColor: "#06b6d4",
    gridOpacity: 0.15,
    lineStyle: "dotted",
  },
  {
    ageMax: 12,
    name: "Discovery",
    phase: "Child",
    emoji: "🧩",
    color: "#3b82f6",
    secondaryColor: "#ec4899",
    gridOpacity: 0.12,
    lineStyle: "dashed",
  },
  {
    ageMax: 17,
    name: "School",
    phase: "School",
    emoji: "📚",
    color: "#f59e0b",
    secondaryColor: "#ef4444",
    gridOpacity: 0.1,
    lineStyle: "solid",
  },
  {
    ageMax: 22,
    name: "College",
    phase: "College",
    emoji: "🎓",
    color: "#8b5cf6",
    secondaryColor: "#14b8a6",
    gridOpacity: 0.08,
    lineStyle: "solid",
  },
  {
    ageMax: 999,
    name: "Pro",
    phase: "Work",
    emoji: "💼",
    color: "#a855f7",
    secondaryColor: "#06b6d4",
    gridOpacity: 0.06,
    lineStyle: "solid",
  },
];

/** Get era config for a given age */
export function getEraConfig(age: number): EraConfig {
  const era = ERA_CONFIG.find((e) => age <= e.ageMax);
  return era ?? ERA_CONFIG.at(-1)!;
}

/** Get phase label for grouping (Kid, Child, School, College, Work) */
export function getTimelinePhase(age: number): string {
  return getEraConfig(age).phase;
}

/** Get colors only - for component styling */
export function getEraColors(age: number) {
  const config = getEraConfig(age);
  return {
    accent: config.color,
    secondary: config.secondaryColor,
    gridOpacity: config.gridOpacity,
  };
}

/** Get era config by phase name (Kid, Child, School, College, Work) */
export function getEraConfigByPhase(phase: string): EraConfig | undefined {
  return ERA_CONFIG.find((e) => e.phase === phase);
}

/** Get colors by phase name - for component styling based on active timeline phase */
export function getEraColorsByPhase(phase: string) {
  const config = getEraConfigByPhase(phase);
  if (!config) {
    // Fallback to Work era if phase not found
    const fallback = ERA_CONFIG.find((e) => e.phase === "Work") || ERA_CONFIG.at(-1)!;
    return {
      accent: fallback.color,
      secondary: fallback.secondaryColor,
      gridOpacity: fallback.gridOpacity,
    };
  }
  return {
    accent: config.color,
    secondary: config.secondaryColor,
    gridOpacity: config.gridOpacity,
  };
}
