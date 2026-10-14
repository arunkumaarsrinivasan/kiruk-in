/**
 * Shared pieces for drawing the pupil as dots: the dot and state types,
 * keystroke ripples, and one batched canvas draw + hit test. The eye itself
 * (halftone grid, gaze, dilation) lives in halftone-scene.ts.
 *
 * Pure: no React, no DOM besides the canvas handed to draw().
 */

export interface RingEntity {
  id: string;
  name: string;
}

export type DotKind = "pupil" | "entity" | "filler";

export interface Dot {
  kind: DotKind;
  x: number;
  y: number;
  z: number;
  r: number;
  /** Base alpha 0..1. */
  a: number;
  ring: number;
  /** Angle on the ring, radians, for spin. */
  angle: number;
  /** Distance from the centre in the flat plane, for ripples. */
  d: number;
  entity?: RingEntity;
}

export type SceneMode = "resting" | "listening" | "thinking" | "presenting";

export interface SceneState {
  mode: SceneMode;
  /** Current and target tilt, radians. */
  tilt: { x: number; y: number; tx: number; ty: number };
  /** Ripple start times (ms). */
  ripples: number[];
  /** Entity ids that are lit. */
  lit: Set<string>;
  /** Per-ring spin angle, radians. */
  spin: number[];
  /** 1 = rings at rest, < 1 = drawn in (aperture). */
  aperture: number;
  /** Entity id under the pointer. */
  hover: string | null;
  /** When the lit dots started travelling into the pupil (ms), or 0. */
  travel: number;
}

const MAX_RIPPLES = 4;
export const MIN_RIPPLE_GAP = 120;
export const FOCAL = 600;
/** How long a lit dot takes to travel into the pupil. */
export const TRAVEL_MS = 520;

/** A keystroke: one ripple outward, never more than MAX_RIPPLES and never closer than MIN_RIPPLE_GAP. */
export function addRipple(s: SceneState, now: number) {
  const last = s.ripples[s.ripples.length - 1];
  if (last !== undefined && now - last < MIN_RIPPLE_GAP) return;
  s.ripples.push(now);
  if (s.ripples.length > MAX_RIPPLES) s.ripples.shift();
}

export interface Projected {
  dot: Dot;
  x: number;
  y: number;
  r: number;
  a: number;
  /** Draw a faint ring around it (a lit or hovered source). */
  halo?: boolean;
}

/** Draw in alpha buckets: one fill per bucket, no shadows. */
export function draw(ctx: CanvasRenderingContext2D, pts: Projected[], color: string, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const BUCKETS = 8;
  const groups: Projected[][] = Array.from({ length: BUCKETS }, () => []);
  for (const p of pts) groups[Math.min(BUCKETS - 1, Math.floor(p.a * BUCKETS))].push(p);
  ctx.fillStyle = color;
  groups.forEach((g, i) => {
    if (!g.length) return;
    ctx.globalAlpha = (i + 0.5) / BUCKETS;
    ctx.beginPath();
    for (const p of g) {
      ctx.moveTo(p.x + p.r, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    }
    ctx.fill();
  });
  // A faint halo around lit entities, as a second low-alpha arc.
  ctx.globalAlpha = 0.14;
  ctx.beginPath();
  for (const p of pts) {
    if (p.halo) {
      ctx.moveTo(p.x + p.r * 3, p.y);
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
    }
  }
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Nearest entity dot within `radius` px of (x, y), in canvas CSS px. */
export function hitTest(pts: Projected[], x: number, y: number, radius: number): Projected | null {
  let best: Projected | null = null;
  let bestD = radius;
  for (const p of pts) {
    if (p.dot.kind !== "entity") continue;
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}
