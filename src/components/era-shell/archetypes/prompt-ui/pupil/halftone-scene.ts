/**
 * The pupil as a halftone: a square grid of black dots on the white of the
 * eye, biggest in the middle and shrinking to specks at the edge (the
 * reference the user drew from). The navbar's black lids frame it, so the
 * whole screen reads as one eye.
 *
 * The dots sit on concentric rings (so the pupil's outline is a true circle)
 * and stay fixed like a print screen; the pupil is a size field moving
 * across it. When the eye looks toward the cursor the field slides that way
 * and flattens along the look (a disc turned on a sphere), so the dots
 * themselves carry the depth. It narrows while thinking, and keystrokes
 * ripple out through it.
 *
 * The outer band of small dots is a map of me: 128 of them are real things
 * (roles, projects, story, skills, life). Hover names them; an answer's
 * sources grow and travel into the middle.
 *
 * Pure: shares Dot/Projected/draw/hitTest with dot-scene.ts.
 */

import { TRAVEL_MS, type Dot, type Projected, type RingEntity, type SceneState } from "./dot-scene";

export interface HalftoneOptions {
  /** Pupil radius at rest, CSS px. */
  radius: number;
  /** Grid spacing, CSS px. */
  pitch: number;
  /** One outer-band dot per entity, clockwise from 12 o'clock. */
  entities: RingEntity[];
}

type GridDot = Dot & { gx: number; gy: number };

/** How far past the pupil the grid runs, as a share of the radius (the specks). */
const REACH = 1.28;
/** Largest dot: a little under half the pitch, like the reference. */
const FILL = 0.47;
/** How far the pupil may look toward the cursor, as a share of the radius. */
export const GAZE = 0.2;
/** Pupil size by state: wider when listening, narrow when thinking. */
const DILATE: Record<SceneState["mode"], number> = { resting: 1, listening: 1, thinking: 0.84, presenting: 0.96 };

export interface HalftoneState extends SceneState {
  /** Current pupil radius. */
  r: number;
  /** Where the pupil is looking, -1..1 each (springs to tilt.tx/ty). */
  gx: number;
  gy: number;
}

export function buildHalftone(o: HalftoneOptions): GridDot[] {
  const dots: GridDot[] = [];
  // Concentric rings, one pitch apart, each with as many dots as fit at that
  // pitch: the outline is a true circle (a square grid reads as an octagon).
  const rings = Math.floor((o.radius * REACH) / o.pitch);
  dots.push({ kind: "filler", x: 0, y: 0, z: 0, r: 0, a: 1, ring: 0, angle: 0, d: 0, gx: 0, gy: 0 });
  for (let k = 1; k <= rings; k++) {
    const rad = k * o.pitch;
    const count = Math.round((2 * Math.PI * rad) / o.pitch);
    // stagger alternate rings by half a step so dots nest like a print screen
    const phase = (k % 2) * (Math.PI / count) - Math.PI / 2;
    for (let i = 0; i < count; i++) {
      const ang = phase + (i / count) * Math.PI * 2;
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      dots.push({ kind: "filler", x, y, z: 0, r: 0, a: 1, ring: k, angle: ang, d: rad, gx: x, gy: y });
    }
  }
  // the outer band (where dots are small): one per entity, spread by angle
  const band = dots.filter((p) => p.d > o.radius * 0.7 && p.d < o.radius * 1.25);
  const byAngle = (p: GridDot) => (p.angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  band.sort((a, b) => byAngle(a) - byAngle(b));
  const step = band.length / Math.max(1, o.entities.length);
  o.entities.forEach((entity, i) => {
    const p = band[Math.floor(i * step)];
    if (p && !p.entity) {
      p.kind = "entity";
      p.entity = entity;
    }
  });
  return dots;
}

export function createHalftoneState(o: HalftoneOptions): HalftoneState {
  return { mode: "resting", tilt: { x: 0, y: 0, tx: 0, ty: 0 }, ripples: [], lit: new Set(), spin: [0], aperture: 1, hover: null, travel: 0, r: o.radius, gx: 0, gy: 0 };
}

export function stepHalftone(s: HalftoneState, o: HalftoneOptions, dt: number) {
  const k = 1 - Math.exp(-dt / 160);
  s.gx += (s.tilt.ty - s.gx) * k;
  s.gy += (-s.tilt.tx - s.gy) * k;
  const target = o.radius * DILATE[s.mode];
  s.r += (target - s.r) * (1 - Math.exp(-dt / (s.mode === "thinking" ? 90 : 240)));
  const now = performance.now();
  s.ripples = s.ripples.filter((t0) => now - t0 < 800);
}

/**
 * Dot size for a distance from the pupil's centre, as a share of the radius
 * (u). Like the reference: full-size through the middle, then an eased fall
 * to specks just past the rim.
 */
function size(u: number) {
  if (u <= 0.22) return 1;
  const t = Math.min(1, (u - 0.22) / (REACH - 0.22));
  return 0.5 * (1 + Math.cos(Math.PI * t));
}

export function projectHalftone(dots: GridDot[], s: HalftoneState, o: HalftoneOptions, now: number, cx: number, cy: number, still = false): Projected[] {
  const out: Projected[] = [];
  const hippus = still || s.mode !== "resting" ? 1 : 1 + 0.03 * Math.sin(now / 1100);
  const R = s.r * hippus;
  // where the pupil sits, and how it flattens along the look
  const ox = s.gx * GAZE * o.radius;
  const oy = s.gy * GAZE * o.radius;
  const look = Math.hypot(s.gx, s.gy);
  const dirX = look ? s.gx / look : 1;
  const dirY = look ? s.gy / look : 0;
  const squash = 1 + look * 0.32; // > 1: distances along the look count more, so the disc narrows that way
  const maxR = (o.pitch / 2) * FILL * 2;

  for (const d of dots) {
    const vx = d.gx - ox;
    const vy = d.gy - oy;
    const along = vx * dirX + vy * dirY;
    const across = -vx * dirY + vy * dirX;
    const dist = Math.hypot(along * squash, across);
    let r = maxR * size(dist / R);
    let a = 1;
    let halo = false;
    if (!still) {
      for (const t0 of s.ripples) {
        const front = ((now - t0) / 800) * R * REACH;
        const off = Math.abs(dist - front);
        if (off < o.pitch * 1.2) r = Math.max(r, maxR * 0.55 * (1 - off / (o.pitch * 1.2)) + r);
      }
    }
    if (d.entity) {
      if (s.lit.has(d.entity.id)) {
        // a source: as big as the dots in the middle; size alone says it (no grey halo)
        r = Math.max(r, maxR * 0.5);
      } else if (s.hover === d.entity.id) {
        r = Math.max(r, maxR * 0.6);
        halo = true;
      } else {
        // a whisper bigger than its neighbours, so the map is findable
        r = Math.max(r, maxR * 0.14);
      }
    } else if (s.lit.size && dist / R > 0.6) {
      a = 0.55;
    }
    if (r < 0.35) continue;
    out.push({ dot: d, x: cx + d.gx, y: cy + d.gy, r: Math.min(r, maxR), a, halo });
  }

  // composing: each lit dot sends a copy into the middle
  if (!still && s.travel) {
    const k = (now - s.travel) / TRAVEL_MS;
    if (k >= 0 && k < 1) {
      const e = k * k * (3 - 2 * k);
      for (const p of out.slice()) {
        if (p.dot.entity && s.lit.has(p.dot.entity.id)) {
          out.push({ dot: { ...p.dot, kind: "filler", entity: undefined }, x: p.x + (cx + ox - p.x) * e, y: p.y + (cy + oy - p.y) * e, r: p.r * (1 - 0.4 * e), a: 1 - 0.6 * e });
        }
      }
    }
  }
  return out;
}

/** The canvas size the pupil needs, CSS px. */
export function halftoneSize(o: HalftoneOptions, margin = 16) {
  const s = Math.ceil((o.radius * REACH + o.pitch + margin) * 2);
  return { width: s, height: s };
}
