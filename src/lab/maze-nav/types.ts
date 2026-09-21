/**
 * Maze-nav config + destination model.
 *
 * The five destinations mirror the live Navbar mobile menu (Home / Work /
 * About / Read / Contact). The config object is the *entire* state of a
 * variation — seed included — so a saved JSON reproduces the exact map.
 */

export type MazeMode = "quadrant" | "spaghetti" | "braid";

export type EraId = "default" | "1970" | "1995" | "2000" | "2026";

/** Door id → destination. id 1..5 are the door glyphs in the ASCII map. */
export interface Dest {
  id: number;
  label: string;
  href: string;
  icon: string;
}

export const DESTINATIONS: Dest[] = [
  { id: 1, label: "HOME", href: "/", icon: "home" },
  { id: 2, label: "WORK", href: "/work", icon: "grid" },
  { id: 3, label: "ABOUT", href: "/about", icon: "user" },
  { id: 4, label: "READ", href: "/notebook", icon: "book" },
  { id: 5, label: "CONTACT", href: "/contact", icon: "envelope" },
];

export interface MazeConfig {
  seed: string;
  mode: MazeMode;
  /** Odd only. Mobile-safe bounds enforced by the harness. */
  cols: number;
  rows: number;
  /** Render-time tile size clamp (px). The stage recomputes to fit. */
  tileSize: number;
  /** Floor inset in px — 0 = wide corridors, larger = narrow paths. */
  corridorInset: number;
  /** Inset bevel intensity on wall bricks (px). */
  wallBevel: number;
  /** Door glow radius (px). */
  doorGlow: number;
  /** Legend chip scale (× tileSize). */
  labelScale: number;
  /** ME token size as a fraction of tile. */
  playerScale: number;
  /** BFS walk step interval (ms). */
  pathStepMs: number;
  /** Chebyshev radius for the "Enter X?" proximity prompt. */
  proximityRadius: number;
  /** Loop fraction for Braid mode (no-op elsewhere, but always visible). */
  braidRate: number;
  /** 0 = spawn at center, 1 = random reachable floor. */
  spawnBias: number;
  /** Stage background opacity. */
  overlayOpacity: number;
  /** Show the on-screen D-pad for touch. */
  showDpad: boolean;
  /** Era tokens to preview on the stage. */
  era: EraId;
}

export const DEFAULT_CONFIG: MazeConfig = {
  seed: "kiruk-maze-01",
  mode: "quadrant",
  cols: 17,
  rows: 13,
  tileSize: 20,
  corridorInset: 0,
  wallBevel: 2,
  doorGlow: 10,
  labelScale: 1,
  playerScale: 0.72,
  pathStepMs: 70,
  proximityRadius: 1,
  braidRate: 0.18,
  spawnBias: 0,
  overlayOpacity: 0.96,
  showDpad: true,
  era: "default",
};

export const MODE_LABELS: Record<MazeMode, string> = {
  quadrant: "Quadrant",
  spaghetti: "Spaghetti",
  braid: "Braid",
};

export const ERA_LABELS: Record<EraId, string> = {
  default: "Default",
  "1970": "1970 · Terminal",
  "1995": "1995 · Geocities",
  "2000": "2000 · Glass",
  "2026": "2026 · AI",
};
