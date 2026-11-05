/**
 * The vocabulary the work showcase shares with the rest of the site. The
 * cases themselves are MDX in content/work/ (frontmatter + <Chapter>s);
 * this file only names their steps, their scenes, and which desktop
 * projects open into which case.
 */

/** Idea → product. */
export type Step = "spark" | "sketch" | "look" | "decide" | "build" | "ship";

export const STEP_LABEL: Record<Step, string> = {
  spark: "Idea",
  sketch: "Sketch",
  look: "Research",
  decide: "Decision",
  build: "System",
  ship: "Product",
};

export type SceneId =
  | "spera-workspace"
  | "spera-spark"
  | "spera-mark"
  | "spera-graph"
  | "spera-deck"
  | "spera-gold"
  | "spera-loop"
  | "spera-ship"
  | "hp-trust"
  | "hp-mudra"
  | "hp-prints"
  | "hp-plc"
  | "sb-personas"
  | "sb-research"
  | "sb-portfolio"
  | "sb-system"
  | "sb-ship";

/**
 * Where each project sits on the work map: one sector per place the work
 * was done. The order is clockwise from twelve o'clock.
 */
export type SectorId = "spera" | "hp" | "sns" | "peoplegamez" | "independent";

export const SECTORS: { id: SectorId; label: string; weight: number }[] = [
  { id: "spera", label: "Spera", weight: 2 },
  { id: "hp", label: "HP", weight: 5 },
  { id: "sns", label: "SNS Square", weight: 2 },
  { id: "peoplegamez", label: "PeopleGamez", weight: 1.2 },
  { id: "independent", label: "Independent", weight: 3 },
];

const SECTOR_OF: Record<string, SectorId> = {
  "spera-platform": "spera",
  "hp-print-ai": "hp",
  "mudra-ai-stack": "hp",
  "get-my-prints": "hp",
  "hp-print-learn-center": "hp",
  "hp-onboarding-app": "hp",
  "square-bridge": "sns",
  "peoplegamez-hr": "peoplegamez",
  "foodies-buddies": "independent",
  desirable: "independent",
  "prags-website": "independent",
  "portfolio-v3": "independent",
};

export function sectorOf(projectId: string): SectorId | undefined {
  return SECTOR_OF[projectId];
}

/** Desktop project id → the case slug (and #anchor on /work) it belongs to. */
const CASE_OF: Record<string, string> = {
  "spera-platform": "spera",
  "hp-print-ai": "hp",
  "mudra-ai-stack": "hp",
  "get-my-prints": "hp",
  "hp-print-learn-center": "hp",
  "square-bridge": "square-bridge",
};

export function caseSlugForProject(projectId: string): string | undefined {
  return CASE_OF[projectId];
}
