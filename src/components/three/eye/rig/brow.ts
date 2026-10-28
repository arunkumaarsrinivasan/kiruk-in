/**
 * The brow and the lids, as a face that answers what the visitor does
 * (docs/EYE_BROW_EMOTION_PLAN.md). No three.js in it.
 *
 * Five layers, run once a frame:
 *
 *   senses    the pointer's speed, jerk, distance to the iris and approach,
 *             its dwell there, time away, press and drag, the scrub's rate,
 *             the cut, the enter; the gaze and glare; the era's mood
 *   memory    what it did a moment ago: a startle repeated fades
 *             (habituation) and then turns wary; presses that never go in
 *             turn to annoyance; a cursor that comes back after a press is
 *             braced for (learned anticipation); slipping on and off the
 *             iris without pressing is met with scepticism; a long stillness
 *             is boredom
 *   emotions  tonic ones held by a condition and eased in and out; phasic
 *             ones played as an impulse (onset, apex, offset)
 *   muscles   each emotion is a recipe of seven action units (FACS):
 *               brow  AU1 inner raiser, AU2 outer raiser, AU4 lowerer (the
 *                     head down and in), AU6 orbicularis (the tail down,
 *                     the cheek and lower lid up)
 *               lids  AU5 upper-lid raiser, AU7 lid tightener, AU43 droop
 *             A face moves as a motor program, not muscle by muscle: an
 *             impulse fires its muscles in its own order (a wince closes the
 *             lids before the brow lands; the smiling eyes of delight come
 *             a beat after the lift). Each muscle rises fast and falls slowly.
 *             Looking up recruits the frontalis, as in life: physiology, not
 *             feeling.
 *   bones     the brow muscles are shapes over five nodes on the brow's
 *             curve (brow-shape.ts): masses on springs to that shape, bent
 *             as one piece and held apart by four bones that keep their
 *             length. The tail's looser tissue is slower, so a new shape
 *             travels head to tail.
 *
 * Out: per node its move (dx, dy mm), its bones' turn (rad) and a bulge
 * toward the camera (mm), with the curve's tangents, for nodes/brow-net.ts;
 * the lids' share (`lids`) for the lid uniforms; and what the eye does with
 * it (blinks held through a stare, a blink once a startle lets go, arousal
 * for the pupil).
 */

import { BROW_NODES, BROW_NODE_U, browAt } from "../brow-shape";

/** Everything the face can feel. */
export const BROW_EMOTIONS = [
  "greet",
  "interest",
  "curious",
  "warm",
  "surprise",
  "delight",
  "confused",
  "focus",
  "strain",
  "flinch",
  "relief",
  "wistful",
  "annoyed",
  "wary",
  "skeptical",
  "bored",
  "intense",
] as const;
export type BrowEmotion = (typeof BROW_EMOTIONS)[number];

/** Held by a condition, eased in and out. The rest are played as impulses. */
const TONIC = [
  "interest",
  "curious",
  "warm",
  "confused",
  "focus",
  "strain",
  "annoyed",
  "skeptical",
  "bored",
  "intense",
] as const satisfies readonly BrowEmotion[];
type Tonic = (typeof TONIC)[number];
type Phasic = Exclude<BrowEmotion, Tonic>;
/**
 * An era's mood (look.ts ERA_BROW): the tonic feelings its task holds, under
 * what the visitor brings, and optionally its idle life: a small flick of the
 * brow as the eyes jump to something, at most every `every` s (never on a
 * phone, where the loader stays calm).
 */
export interface BrowMood {
  hold?: Partial<Record<Tonic, number>>;
  /** Held only while the eyes are up at the lens (2013's selfie pose), heard once the gaze has landed there. */
  atLens?: Partial<Record<Tonic, number>>;
  flick?: { every: number; peak: number };
  /** Held only while the eyes meet the visitor's (2026's eye contact): the gaze, as the brow hears it, inside the cone of direct gaze. */
  atContact?: Partial<Record<Tonic, number>>;
  /** Meeting the visitor's eyes again after looking away flashes the brow (the eyebrow flash), at most every `every` s. */
  meet?: { every: number; peak: number };
  /** How strongly the face answers what the visitor does (× the feelings it brings; not the screen's glare, not boredom). */
  mirror?: number;
}
const isTonic = (e: BrowEmotion): e is Tonic => (TONIC as readonly string[]).includes(e);

/** The muscles, in this order everywhere. */
const AU = ["AU1", "AU2", "AU4", "AU6", "AU5", "AU7", "AU43"] as const;
const NA = AU.length;

/**
 * How much each emotion pulls on AU1, AU2, AU4, AU6 | AU5, AU7, AU43 at full
 * strength. Read off the user's reference sheet (2026-10-28): surprise lifts
 * the lid off the iris; anger pulls the inner brow down while the outer stays
 * up (a V) with the lids tight; fear raises the inner brow while knitting it,
 * eyes wide; sly and bored lower the lids, the brow flat or lifting to hold
 * them; fury crushes the brow down onto slits; the intense stare is wide eyes
 * under a lowered brow.
 */
const RECIPE: Record<BrowEmotion, readonly number[]> = {
  greet: [0.9, 1, 0, 0, 0.35, 0, 0],
  interest: [0.3, 0.35, 0, 0, 0.15, 0, 0],
  // the quizzical arch: the outer brow up, the head knit a little ("hm?")
  curious: [0.05, 0.75, 0.25, 0, 0, 0.15, 0],
  // smiling eyes: the tail softens down, the lids soften
  warm: [0.1, 0.05, 0, 0.7, 0, 0, 0.15],
  surprise: [1.2, 1.25, 0, 0, 1, 0, 0],
  delight: [1.1, 1.2, 0, 0.6, 0.25, 0, 0],
  // puzzled: inner up while the head knits, the oblique brow
  confused: [0.8, 0.15, 0.7, 0, 0, 0.2, 0],
  focus: [0, 0, 0.5, 0.1, 0, 0.45, 0],
  strain: [0.5, 0, 0.85, 0, 0.1, 0.3, 0],
  // the eye is touched: a wince, the lids nearly shut
  flinch: [0, 0, 1.1, 0.9, 0, 1, 0],
  relief: [0.25, 0.2, 0, 0, 0, 0, 0.2],
  wistful: [0.7, 0, 0.4, 0, 0, 0, 0.25],
  // anger's V: the head down and in, the outer brow left up, the lids tight on a glare
  annoyed: [0, 0.3, 1, 0, 0.15, 0.35, 0],
  // fear: inner up and drawn together, eyes wide
  wary: [1, 0.6, 0.6, 0, 0.8, 0, 0],
  // "really?": lids lowered, the outer brow up, the head flat
  skeptical: [0, 0.35, 0.25, 0, 0, 0.25, 0.45],
  // heavy lids, the frontalis lifting a little to hold them (gently: the eye
  // must never read as sleepy at rest; this only comes after a long stillness.
  // At 0.55 the upper lid fell ~1.4 mm, which read as sleepy; now ~0.7 mm)
  bored: [0.2, 0.12, 0, 0, 0, 0, 0.3],
  // wide eyes under a lowered brow: staring back
  intense: [0, 0, 0.8, 0, 0.7, 0, 0],
};

/** An impulse's onset, apex (held) and offset, s. The greeting flash's onset is ~100 ms (Grammer et al. 1988). */
const ENVELOPE: Record<Phasic, { on: number; apex: number; off: number }> = {
  greet: { on: 0.1, apex: 0.2, off: 0.4 },
  surprise: { on: 0.08, apex: 0.15, off: 0.45 },
  delight: { on: 0.12, apex: 0.6, off: 0.6 },
  flinch: { on: 0.06, apex: 0.1, off: 0.28 },
  relief: { on: 0.15, apex: 0.1, off: 0.6 },
  wistful: { on: 0.3, apex: 0.6, off: 1.2 },
  wary: { on: 0.1, apex: 0.5, off: 0.7 },
};

/** The motor program: each muscle's lag behind the impulse, s (AU1, AU2, AU4, AU6, AU5, AU7, AU43). */
const SYNERGY: Partial<Record<Phasic, readonly number[]>> = {
  // the lids snap wide, the brows a beat behind
  surprise: [0.03, 0.05, 0, 0, 0, 0, 0],
  greet: [0, 0.02, 0, 0, 0.05, 0, 0],
  // the smile reaches the eyes after the lift (Duchenne)
  delight: [0, 0.02, 0, 0.18, 0.03, 0, 0],
  // the blink reflex first, then the brow comes down
  flinch: [0, 0, 0.05, 0.02, 0, 0, 0],
  wary: [0.05, 0.08, 0.1, 0, 0, 0, 0],
};
const MAX_LAG = 0.2;

/** How fast each tonic emotion comes and goes, λ (1/s). */
const TONIC_RATE: Record<Tonic, { up: number; down: number }> = {
  interest: { up: 2.5, down: 1.2 },
  curious: { up: 1.6, down: 1.4 },
  warm: { up: 0.7, down: 1 },
  // (confusion lingers)
  confused: { up: 2, down: 0.7 },
  focus: { up: 1.5, down: 1 },
  strain: { up: 3, down: 1.5 },
  annoyed: { up: 2.2, down: 0.6 },
  skeptical: { up: 2, down: 1 },
  // (lids grow heavy slowly, and lift at once when something happens)
  bored: { up: 0.25, down: 3 },
  intense: { up: 3, down: 2 },
};

/**
 * The brow muscles' shapes over the nodes (head, inner, arch, outer, tail),
 * mm at activation 1. Spontaneous expressions use ~15–30 % of the most a brow
 * can move (10 mm up, 7 mm in a frown: Guihard et al. 2022).
 */
const AU_SHAPE = [
  // AU1, the inner raiser (frontalis, medial part)
  { dy: [1.5, 1.35, 0.75, 0.25, 0], dx: [0.1, 0.05, 0, 0, 0], bulge: [0, 0, 0, 0, 0] },
  // AU2, the outer raiser (frontalis, lateral part): the arch rises most, so a raised brow curves more
  { dy: [0.1, 0.4, 1.2, 1.4, 0.6], dx: [0, 0, 0, 0.1, 0.25], bulge: [0, 0, 0, 0, 0] },
  // AU4, the lowerer (corrugator, depressor supercilii, procerus): down and toward the nose, bunching
  { dy: [-1.1, -0.85, -0.4, -0.12, 0], dx: [-0.9, -0.55, -0.2, -0.05, 0], bulge: [0.35, 0.2, 0.05, 0, 0] },
  // AU6, the orbicularis's orbital part: the tail down and in
  { dy: [0, -0.05, -0.2, -0.45, -0.7], dx: [0, 0, 0, -0.1, -0.2], bulge: [0, 0, 0, 0, 0] },
] as const;

/** Each muscle's rise and fall, λ (1/s). A rise of λ 25 is τ 40 ms, about the electromechanical delay. */
const AU_RATE = [
  { up: 25, down: 5 },
  { up: 25, down: 5 },
  { up: 18, down: 4 },
  { up: 22, down: 4 },
  { up: 22, down: 6 },
  { up: 24, down: 5 },
  // (a lid droops slowly, and lifts quickly)
  { up: 3, down: 6 },
] as const;

/**
 * How the lid muscles move the lid uniforms: AU5 lifts the upper margin up
 * to 0.1 rad (~1.3 mm at its apex, just baring the iris's top it normally
 * covers by 1.6 mm; at 0.17 the lid jumped, over-acted, the user 2026-10-29;
 * only the margin and tarsus move, the skin past the crease stays: margins.ts
 * feelU), AU43 lowers it 0.19 rad, and AU7 and
 * AU6 narrow both lids through the squint (margins.ts). The squint alone
 * closes ~25 %, so a wince also brings the upper lid down (AU7) and the lower
 * lid up (AU7 tightening it, AU6's cheek pushing it), toward the reference's
 * slits; the lower lid keeps at least 0.45 of its rest opening.
 */
export const LID_FROM_AU = { raise: 0.1, droop: 0.19, tight: 0.9, cheek: 0.35, tightUpper: 0.08, lowerTight: 0.3, lowerCheek: 0.2, lowerMin: 0.45 } as const;

/**
 * Where the eye looks, the brow goes: the main thing it does (the user,
 * 2026-10-28: "based on how our eye is moving, we need to make the eyebrow
 * movement"; the feelings ride on top).
 *
 * A shape for each of eight directions round the gaze, mm per node (head,
 * inner, arch, outer, tail) at a full turn, blended by the gaze's angle and
 * scaled by how far it has turned (gazeReach); the centre is the brow at rest. Gaze x is
 * + toward the temple (screen right for this eye), y + up.
 *
 *   up       the frontalis lifts the whole brow, the arch most, to clear the
 *            view (and the lid rises with the pitch, margins.ts)
 *   up-nose  the inner brow leads (medial frontalis)
 *   up-temple  the outer brow leads (lateral frontalis)
 *   nose     converging: the head knits a little, down and in
 *   temple   the tail lifts a little toward where the eye looks
 *   down     the brow settles, the tail most, as the lid comes down
 *   down-nose  settles and knits
 *   down-temple  the tail falls most
 */
const GAZE_POSES: { dy: readonly number[]; dx: readonly number[] }[] = [
  // temple (0°) (stronger since 2026-10-28: a look sideways barely showed)
  { dy: [-0.15, 0.02, 0.28, 0.6, 0.85], dx: [0, 0, 0.03, 0.08, 0.14] },
  // up-temple (45°)
  // (the up poses ×1.3, 2026-10-29: the user wanted the brow to rise clearly with the eye)
  { dy: [0.4, 0.8, 1.3, 1.55, 1.25], dx: [0, 0, 0.03, 0.1, 0.18] },
  // up (90°)
  // (a little more, 2026-10-29: the frontalis lifts the brow as the eye goes
  // up, keeping the hood between it and the lashes; at 1.15 the lashes met it)
  { dy: [1.35, 1.7, 2.1, 1.7, 0.9], dx: [0, 0, 0, 0.04, 0.08] },
  // up-nose (135°)
  { dy: [1.5, 1.35, 1.05, 0.6, 0.2], dx: [0.08, 0.04, 0, 0, 0] },
  // nose (180°)
  { dy: [-0.45, -0.28, -0.08, 0.03, 0.08], dx: [-0.6, -0.4, -0.15, -0.04, 0] },
  // down-nose (225°)
  { dy: [-0.5, -0.38, -0.3, -0.32, -0.4], dx: [-0.35, -0.22, -0.08, 0, 0] },
  // down (270°)
  { dy: [-0.3, -0.28, -0.3, -0.42, -0.6], dx: [0, 0, 0, -0.02, -0.05] },
  // down-temple (315°)
  { dy: [-0.15, -0.2, -0.32, -0.55, -0.8], dx: [0, 0, 0, -0.05, -0.12] },
];

/** How far a node travels, mm: linear to the knee, then easing toward the most. */
const TRAVEL = { upKnee: 2, up: 3, downKnee: 1.3, down: 2 } as const;
function knee(v: number, upKnee: number, up: number, downKnee: number, down: number) {
  const soft = (x: number, k: number, m: number) => (x <= k ? x : k + (x - k) / (1 + (x - k) / (m - k)));
  return v >= 0 ? soft(v, upKnee, up) : -soft(-v, downKnee, down);
}

/**
 * How much of a direction's shape a turn of the eye calls up (0..1 of the
 * full turn). Past a small dead zone (fixation's drift and microsaccades
 * leave the brow alone) it comes quickly and eases toward the edge: a third
 * of the way out already gives ~half the shape. *Why:* straight in
 * proportion, an ordinary look (the cursor a few hundred px from the eye)
 * moved the brow a few px, so it seemed to answer only at the screen's edges
 * (the user, 2026-10-28: "only when we move to extreme it's reacting").
 */
const GAZE_DEAD = 0.04;
const GAZE_K = 2.6;
/** How fast the brow catches up with the gaze it hears, λ (1/s). */
const GAZE_FOLLOW = 8;
export function gazeReach(r: number) {
  const x = Math.max(0, Math.min(1, r) - GAZE_DEAD) / (1 - GAZE_DEAD);
  return (1 - Math.exp(-GAZE_K * x)) / (1 - Math.exp(-GAZE_K));
}

/** The brow's shape for a gaze (gx + temple, gy + up, −1..1), mm per node, written into dy and dx. */
export function gazePose(gx: number, gy: number, dy: number[], dx: number[]) {
  const r = gazeReach(Math.hypot(gx, gy));
  const a = ((Math.atan2(gy, gx) / (Math.PI / 4)) % 8 + 8) % 8;
  const i = Math.floor(a);
  const f = a - i;
  const p = GAZE_POSES[i % 8];
  const q = GAZE_POSES[(i + 1) % 8];
  for (let n = 0; n < BROW_NODES; n++) {
    dy[n] = r * (p.dy[n] + (q.dy[n] - p.dy[n]) * f);
    dx[n] = r * (p.dx[n] + (q.dx[n] - p.dx[n]) * f);
  }
}
/** Squint and blink drop the tail by these shares (orbicularis; straight onto the nodes, outside the springs). */
const ORBI = [0.1, 0.2, 0.4, 0.7, 1];

/** Each node's spring, Hz (the tail's looser tissue is slower), its damping, and the chain's bending stiffness (× ω²). */
const NODE_HZ = [3.4, 3.2, 3, 2.8, 2.5];
const ZETA = 0.68;
const BEND = 0.2;
/** With AU1 on, the frontalis wins the head and inner node's height from AU4 (FACS AU1+4: inner up while drawn together). */
const AU1_OVER_AU4 = 0.6;
/** How hard the bones keep their length per step, and how much more the head is anchored (the nasal attachment). */
const BONE_STIFF = 0.25;
const HEAD_ANCHOR = 0.3;

/** A startle repeated within this many seconds is met at this share each time (habituation), and the third turns wary. */
const HABIT_WINDOW = 10;
const HABIT = 0.6;

/** A hand slower than this (iris radii per second) has stopped: hovering on the iris, or hesitating by it. */
const HOVER_SPEED = 0.3;

/** The face's whole range, a single knob (docs/EYE_BROW_EMOTION_PLAN.md §11). Calm (phones) takes 0.75 of it. */
export const BROW_GAIN = 1;

/**
 * What a quiet rig hears (the lab's clean poses): nobody, nothing on screen,
 * no saccades (so no idle flicks). The gaze stays, since the lab holds it
 * where it wants it, and 2013's selfie pose lives on it.
 */
const QUIET = {
  interactive: false,
  present: false,
  out: false,
  down: false,
  onIris: false,
  dragged: false,
  travel: null,
  cut: false,
  exiting: false,
  saccading: false,
  glare: 0,
  squint: 0,
} satisfies Partial<BrowInput>;

export interface BrowInput {
  dt: number;
  /** The performance clock, s (the pointer's timestamps are on it). */
  now: number;
  reduce: boolean;
  calm: boolean;
  /** A visitor can reach the eye (the loader, the lab); a poster can't, and never grows bored. */
  interactive: boolean;
  /** A mouse rests in the window (not left it), or a finger is down. */
  present: boolean;
  mouse: boolean;
  /** When the pointer last moved, s, performance clock. */
  moveAt: number;
  /** The pointer has left the window. */
  out: boolean;
  /** The pointer and the iris on screen, CSS px. */
  px: number;
  py: number;
  iris: { x: number; y: number; r: number };
  down: boolean;
  /** The press began on the iris. */
  onIris: boolean;
  dragged: boolean;
  /** The scrub's unrounded era position, or null when nothing scrubs. */
  travel: number | null;
  /** The cut between eras is under way. */
  cut: boolean;
  /** Which era is on screen (any number that changes when it does). */
  era: number;
  /** Going in (the loader's enter). */
  exiting: boolean;
  /** The eye's gaze, −1..1, and whether it's mid-saccade. */
  gaze: { x: number; y: number };
  saccading: boolean;
  glare: number;
  /** The era's mood (look.ts ERA_BROW): held under whatever the visitor makes the face feel. */
  mood?: BrowMood;
  /** The squint the screen's glare brings on (before any feeling's), and the blink. */
  squint: number;
  blink: number;
}

export interface BrowInfo {
  /** AU1, AU2, AU4, AU6, AU5, AU7, AU43 activations. */
  au: number[];
  emotions: Record<BrowEmotion, number>;
  /** Each node's move, mm (dx, dy), turn (rad) and bulge (mm). */
  nodes: { dx: number; dy: number; rot: number; bulge: number }[];
  /** Each node where it is now, face mm (x, y; z the skin's rough height), for the lab's overlay. */
  points: [number, number, number][];
  lids: { raise: number; tight: number; lower: number };
  /** The era's mood the rig was given last frame. */
  mood: BrowMood | undefined;
  senses: { speed: number; dist: number; approach: number; dwell: number; reversals: number; scrubRate: number; idle: number; expect: number };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Eases toward the target, faster on the way up than down. */
const ease = (v: number, target: number, up: number, down: number, dt: number) =>
  v + (target - v) * (1 - Math.exp(-(target > v ? up : down) * dt));
/** Linear to 1, then it saturates toward 2, so stacked feelings never tear the brow off the face. */
const sat = (x: number) => (x <= 1 ? Math.max(0, x) : 1 + (x - 1) / x);
const envelope = (t: number, e: { on: number; apex: number; off: number }) => {
  if (t < 0) return 0;
  if (t < e.on) return smooth(0, 1, t / e.on);
  if (t < e.on + e.apex) return 1;
  return 1 - smooth(0, 1, (t - e.on - e.apex) / e.off);
};
/**
 * Eye contact: a gaze within ~4° of the visitor's eyes is felt as looking at
 * them, and by ~8° it is not (the cone of direct gaze, Gamer & Hecht 2007).
 * The gaze is −1..1 over 24° of yaw and 10° of pitch (rig/gaze.ts), so on a
 * desktop that is the pointer on or near the iris, or none at all.
 */
const contactOf = (gx: number, gy: number) => 1 - smooth(4, 8, Math.hypot(gx * 24, gy * 10));

/** The skin's height toward the camera at a brow point (x, y), face mm, roughly: lid-mesh.ts faceShell's ridge. For points drawn on the brow (the lab's overlay, 2026's landmarks). */
export function browSkinZ(x: number, y: number) {
  const kx = x < 0 ? 0.014 : 0.028;
  return 11 - kx * x * x - 0.004 * y * y + 1.6 * Math.exp(-(((y - 10.5) / 3.3) ** 2));
}

/** Where each node rests, face mm: on the curve, halfway through the brow's depth. */
const REST = BROW_NODE_U.map((u) => {
  const b = browAt(u);
  return { x: b.x, y: b.lower + b.depth / 2 };
});
const BONE_LEN = REST.slice(1).map((p, i) => Math.hypot(p.x - REST[i].x, p.y - REST[i].y));
const BONE_ANGLE = REST.slice(1).map((p, i) => Math.atan2(p.y - REST[i].y, p.x - REST[i].x));

interface Impulse {
  e: Phasic;
  t0: number;
  peak: number;
}

export class BrowRig {
  /** Per node (dx, dy, rot, bulge), then per node the curve's tangent d/du of the same: 40 floats. */
  readonly out = new Float32Array(BROW_NODES * 8);
  /** The arch's mean lift (inner and arch nodes), mm: the brow's fat pad flattens with it. */
  lift = 0;
  /** AU1, AU2, AU4, AU6, AU5, AU7, AU43. */
  readonly au = new Array<number>(NA).fill(0);
  /** The lids' share of the feeling: the upper margin's lift (rad, − droops), extra squint (0..1), and the lower margin's opening (× its rest). */
  readonly lids = { raise: 0, tight: 0, lower: 1 };
  /** Hold natural blinks: the eyes stay open through a startle, a glare, a stare. */
  holdBlinks = false;
  /** A blink is due now: the eye resets once a startle lets go. Read once a frame. */
  blinkNow = false;
  /** How aroused the face is, 0..1: the pupil opens with it (rig/pupil.ts). */
  arousal = 0;

  private tonic = Object.fromEntries(TONIC.map((e) => [e, 0])) as Record<Tonic, number>;
  private impulses: Impulse[] = [];
  private last: Partial<Record<BrowEmotion, number>> = {};
  /** When each impulse fired recently (habituation and escalation). */
  private fired: Partial<Record<BrowEmotion, number[]>> = {};
  /** The lab's held emotions, by strength. */
  private held: Partial<Record<BrowEmotion, number>> = {};
  /** Tonic feelings swelled for a while (the lab's tonic buttons, annoyance at presses, scepticism): strength and until when. */
  private swell: Partial<Record<Tonic, { peak: number; until: number }>> = {};
  /** What the face felt and sensed last frame (the lab reads it). */
  private emo: Partial<Record<BrowEmotion, number>> = {};
  private sensed: BrowInfo["senses"] = { speed: 0, dist: 99, approach: 0, dwell: 0, reversals: 0, scrubRate: 0, idle: 0, expect: 0 };

  // senses
  private born = NaN;
  private wasInteractive = false;
  private moveAt = -1e3;
  private moveX = NaN;
  private moveY = NaN;
  /** The pointer left the window since it last moved. */
  private away = false;
  private lastPx = NaN;
  private lastPy = NaN;
  private vx = 0;
  private vy = 0;
  private speed = 0;
  private headX = 0;
  private headY = 0;
  private revs: number[] = [];
  private dist = 99;
  private approach = 0;
  private dwell = 0;
  private still = 0;
  private hesitate = 0;
  private lastHover = -1e3;
  private wasOnIris = false;
  private leftIris = -1e3;
  private entries: number[] = [];
  private presses: number[] = [];
  private wasDown = false;
  private pressAt = 0;
  private pressOnIris = false;
  private flinched = false;
  private reliefDue = -1;
  private wasExiting = false;
  private eraNow = NaN;
  private eraArrived = false;
  /** The era's idle flick: whether a saccade was under way last frame, when the next may come, and last frame's strongest impulse. */
  private wasSaccading = false;
  private lastMood: BrowMood | undefined;
  private nextFlick = NaN;
  private lastStrongest = 0;
  /** Eye contact (2026): how long the eye has looked away from the visitor, and at them again; when it may next flash. */
  private awayFor = 0;
  private metFor = 0;
  private nextMeet = 0;
  /** The era's mirror: how strongly the face answers the visitor this frame. */
  private mirror = 1;
  private wasOut = false;
  private lastTravel: number | null = null;
  private scrubRate = 0;
  private strainHigh = false;
  private confusedFor = 0;
  /** Learned: a press is expected near the iris after one, fading over ~12 s. */
  private expect = 0;
  private startled = false;
  // the gaze, as the brow hears it once a saccade has landed
  private gx = 0;
  private gy = 0;
  private waitUntil = 0;
  /** The gaze's shape over the nodes this frame, mm (gazePose). */
  private gazeDy = new Array<number>(BROW_NODES).fill(0);
  private gazeDx = new Array<number>(BROW_NODES).fill(0);
  // the chain
  private ox = new Float64Array(BROW_NODES);
  private oy = new Float64Array(BROW_NODES);
  private vxN = new Float64Array(BROW_NODES);
  private vyN = new Float64Array(BROW_NODES);
  private tx = new Float64Array(BROW_NODES);
  private ty = new Float64Array(BROW_NODES);
  private bulge = new Float64Array(BROW_NODES);
  private rot = new Float64Array(BROW_NODES);
  private turn = new Float64Array(BROW_NODES - 1);
  private clock = 0;

  /** Plays an emotion's impulse now (or at `at`, performance clock), or, for a tonic one, a swell held ~1.2 s. The lab's buttons; the stage's first greeting. */
  express(e: BrowEmotion, peak = 1, at?: number) {
    const t0 = at ?? this.clock;
    if (isTonic(e)) {
      this.swell[e] = { peak, until: t0 + 1.2 };
      return;
    }
    this.impulses.push({ e, t0, peak });
    this.last[e] = t0;
  }

  /** Holds an emotion at this strength (the lab); null lets it go. */
  hold(e: BrowEmotion, strength: number | null) {
    if (strength === null) delete this.held[e];
    else this.held[e] = strength;
  }

  /** How many times `e` fired in the last `window` s. */
  private recent(e: BrowEmotion, window: number) {
    const list = this.fired[e] ?? [];
    while (list.length && this.clock - list[0] > window) list.shift();
    return list.length;
  }

  /** Plays an impulse unless it played within `cooldown` s; `habit` meets a repeat at 0.6 of the last. */
  private fire(e: Phasic, peak: number, cooldown: number, habit = false) {
    const last = this.last[e] ?? -1e3;
    if (this.clock - last < cooldown) return;
    const scaled = (habit ? peak * Math.pow(HABIT, this.recent(e, HABIT_WINDOW)) : peak) * this.mirror;
    this.last[e] = this.clock;
    (this.fired[e] ??= []).push(this.clock);
    this.impulses.push({ e, t0: this.clock, peak: scaled });
  }

  /** Lab: feel only what the buttons play, nothing the pointer or the screen does (clean poses). The era's mood stays. */
  quiet = false;
  /** Lab: the eras' moods on (look.ts ERA_BROW), or off for a before and after. */
  moods = true;

  update(input: BrowInput): Float32Array {
    const I: BrowInput = this.quiet ? { ...input, ...QUIET, moveAt: this.moveAt } : input;
    const dt = Math.min(Math.max(I.dt, 0), 0.1);
    this.clock = I.now;
    this.blinkNow = false;
    if (I.reduce) {
      this.reset();
      return this.out;
    }
    const now = I.now;
    // (idle time counts from when a visitor could first reach the eye, not from behind the opening)
    if (!Number.isFinite(this.born) || (I.interactive && !this.wasInteractive)) this.born = now;
    this.wasInteractive = I.interactive;
    const R = Math.max(I.iris.r, 1);
    // (2026 mirrors the visitor best: what they make the face feel, a little stronger)
    this.mirror = this.moods ? (I.mood?.mirror ?? 1) : 1;

    // ---- senses ----------------------------------------------------------
    // A move after a gap. Back (first sight, back into the window, or after
    // 12 s) is a greeting; a pause of 4–12 s with the pointer still in the
    // window is only a small "oh" (a hand resting on a mouse isn't away).
    // Only a move that goes somewhere: a press where the pointer already
    // rests reports a move too, and must stay a press.
    if (I.out) this.away = true;
    if (I.moveAt > this.moveAt) {
      const gap = I.moveAt - this.moveAt;
      const first = !Number.isFinite(this.moveX);
      const went = first || Math.hypot(I.px - this.moveX, I.py - this.moveY) > 0.08 * R;
      if (went && !I.down) {
        if (first || this.away || gap >= 12) this.fire("greet", 1, 4);
        else if (gap >= 4 && !I.calm && !I.cut) this.fire("greet", 0.35, 6);
        this.away = false;
      }
      this.moveAt = I.moveAt;
      this.moveX = I.px;
      this.moveY = I.py;
    }
    const tracking = I.present && Number.isFinite(this.lastPx) && dt > 0;
    if (tracking) {
      const ivx = (I.px - this.lastPx) / dt / R;
      const ivy = (I.py - this.lastPy) / dt / R;
      const k = 1 - Math.exp(-20 * dt);
      this.vx += (ivx - this.vx) * k;
      this.vy += (ivy - this.vy) * k;
    } else {
      this.vx *= Math.exp(-10 * dt);
      this.vy *= Math.exp(-10 * dt);
    }
    this.lastPx = I.present ? I.px : NaN;
    this.lastPy = I.present ? I.py : NaN;
    this.speed = Math.hypot(this.vx, this.vy);
    // a reversal: the heading turns past ~120° at speed (a scribble)
    if (this.speed > 2) {
      const ux = this.vx / this.speed;
      const uy = this.vy / this.speed;
      if (ux * this.headX + uy * this.headY < -0.5) {
        this.revs.push(now);
        this.headX = ux;
        this.headY = uy;
      } else {
        const k = 1 - Math.exp(-6 * dt);
        this.headX += (ux - this.headX) * k;
        this.headY += (uy - this.headY) * k;
        const n = Math.hypot(this.headX, this.headY) || 1;
        this.headX /= n;
        this.headY /= n;
      }
    }
    while (this.revs.length && now - this.revs[0] > 1.2) this.revs.shift();
    const reversals = this.revs.length / 1.2;

    const dist = I.present ? Math.hypot(I.px - I.iris.x, I.py - I.iris.y) / R : 99;
    if (tracking && this.dist < 50 && dist < 50) {
      const rate = (this.dist - dist) / dt;
      this.approach += (rate - this.approach) * (1 - Math.exp(-10 * dt));
    } else this.approach = 0;
    this.dist = dist;
    const onIris = I.present && I.mouse && dist < 1;
    // Hovering and hesitating are a hand that has (nearly) stopped, under
    // HOVER_SPEED: a cursor still on its way across or past the eye is the
    // gaze's to answer. *Why:* at 0.6 R/s an ordinary slow sweep through the
    // middle of the screen read as hesitation, and the curious arch (1.2–1.5
    // mm, whichever way the eye looked) hid the brow following the eye there.
    const hovering = this.speed < HOVER_SPEED;
    this.dwell = onIris ? (hovering ? this.dwell + dt : Math.max(0, this.dwell - 2 * dt)) : 0;
    if (onIris) this.lastHover = now;
    this.still = onIris && this.speed < 0.5 ? this.still + dt : Math.max(0, this.still - 2 * dt);
    // (the iris is a quarter of a desktop screen high, so "near" is tight: within half a radius of its edge)
    this.hesitate = I.present && I.mouse && dist >= 1 && dist < 1.5 && hovering ? this.hesitate + dt : 0;
    // slipping onto the iris, again and again, without pressing (slowly: a
    // scribble or a dart crossing it is not a hesitation)
    // (an entry counts only after ≥ 0.4 s off it: a cursor riding along the
    // iris's edge flickers on and off as the iris turns, and three flickers
    // read as scepticism mid-sweep)
    if (onIris && !this.wasOnIris && this.speed < 3 && reversals < 1 && now - this.leftIris >= 0.4) this.entries.push(now);
    if (!onIris && this.wasOnIris) this.leftIris = now;
    this.wasOnIris = onIris;
    while (this.entries.length && now - this.entries[0] > 8) this.entries.shift();
    if (this.entries.length >= 3 && !I.down) {
      this.swell.skeptical = { peak: this.mirror, until: now + 2.5 };
      this.entries = [];
    }

    // darting at the eye: a startle (not a scribble that happens to cross
    // it). It fades when repeated, and a third, or one soon after a wince,
    // is met with wariness instead. A dart is aimed: its course runs within
    // 0.6 R of the eye's middle, and it is already near (2 R). *Why:* with
    // the iris ~216 px across its radius on a 1440 px screen, "closing fast
    // within 3.5 R" was nearly any brisk move toward the middle of the screen,
    // so ordinary moves startled the brow (+2 mm) and the third turned wary.
    const relX = I.present ? (I.px - I.iris.x) / R : 0;
    const relY = I.present ? (I.py - I.iris.y) / R : 0;
    const v2 = this.vx * this.vx + this.vy * this.vy;
    const tc = v2 > 1e-6 ? Math.max(0, -(relX * this.vx + relY * this.vy) / v2) : 0;
    const miss = Math.hypot(relX + this.vx * tc, relY + this.vy * tc);
    if (this.approach > 7 && dist < 2 && dist > 0.8 && miss < 0.6 && reversals < 1) {
      const darts = this.recent("surprise", HABIT_WINDOW) + this.recent("wary", HABIT_WINDOW);
      if (darts >= 2 || now - (this.last.flinch ?? -1e3) < 8) this.fire("wary", 0.9, 3);
      else this.fire("surprise", 0.7, 3, true);
    }

    // the press: on the iris it's a touch on the eye (a finger's after 100 ms, so a swipe never winces)
    if (I.down && !this.wasDown) {
      this.pressAt = now;
      this.pressOnIris = I.onIris;
      this.flinched = false;
    }
    const pressing = I.down && this.pressOnIris && !I.dragged;
    if (pressing && !this.flinched && (I.mouse || now - this.pressAt > 0.1)) {
      this.flinched = true;
      this.presses.push(now);
      while (this.presses.length && now - this.presses[0] > 6) this.presses.shift();
      // the third poke that never goes in is annoying; the wince itself habituates
      if (this.presses.length >= 3) this.swell.annoyed = { peak: this.mirror, until: now + 2 };
      this.fire("flinch", 1, 0.5, true);
      this.expect = 1;
    }
    // let go: going in brings delight; anything else, after a wince, relief
    if (!I.down && this.wasDown && this.flinched) this.reliefDue = now + 0.15;
    if (I.exiting && !this.wasExiting) {
      this.fire("delight", 1, 1);
      this.reliefDue = -1;
      this.presses = [];
    }
    if (this.reliefDue > 0 && now >= this.reliefDue) {
      this.reliefDue = -1;
      if (!I.exiting) this.fire("relief", 1, 0.8);
    }
    this.wasDown = I.down;
    this.wasExiting = I.exiting;
    // learned: after a poke the eye half-expects another as the cursor comes back
    this.expect *= Math.exp(-dt / 12);

    // A new era has arrived, as the lids open on it. Only an era that really
    // changed: the cut director also runs for a sign's press, and its flicker
    // of "busy" greeted the visitor a second after every poke.
    if (!Number.isFinite(this.eraNow)) this.eraNow = I.era;
    else if (I.era !== this.eraNow) {
      this.eraNow = I.era;
      this.eraArrived = true;
    }
    if (this.eraArrived && !I.cut) {
      this.eraArrived = false;
      this.fire("greet", 0.4, 0.8);
    }

    // the scrub: slow is concentration, fast is strain, stopping is relief
    if (I.travel !== null && this.lastTravel !== null && dt > 0) {
      const rate = Math.abs(I.travel - this.lastTravel) / dt;
      this.scrubRate += (rate - this.scrubRate) * (1 - Math.exp(-4 * dt));
    } else this.scrubRate *= Math.exp(-3 * dt);
    this.lastTravel = I.travel;

    // leaving the window after paying attention: a faint "oh, leaving?"
    if (I.out && !this.wasOut && (this.tonic.interest > 0.3 || now - this.lastHover < 5)) this.fire("wistful", 0.8, 6);
    this.wasOut = I.out;

    // ---- emotions ----------------------------------------------------------
    const idle = now - Math.max(I.moveAt, this.born);
    const recent = idle < 8;
    const prox = 1 - smooth(1, 4, dist);
    const warmCmd = smooth(2.5, 3.5, this.still) * (idle < 20 ? 1 : 0);
    const curiousCmd =
      Math.max(onIris ? smooth(0.5, 1.2, this.dwell) * (1 - smooth(3, 4, this.dwell)) : 0, smooth(0.8, 1.4, this.hesitate) * 0.8) *
      (1 - this.tonic.warm);
    const scrubbing = I.travel !== null;
    // a scribble that goes on turns puzzlement into annoyance
    this.confusedFor = this.tonic.confused > 0.6 ? this.confusedFor + dt : Math.max(0, this.confusedFor - 2 * dt);
    const annoyedCmd = smooth(2.5, 4, this.confusedFor);
    // braced for a poke: the cursor coming back toward the iris after one
    const brace = this.expect * smooth(0.2, 1.5, this.approach) * (1 - smooth(1.5, 3, dist)) * (I.down ? 0 : 1);
    const holdFor = pressing ? now - this.pressAt : 0;
    // (the era's mirror scales what the visitor brings; the screen's glare and boredom are the face's own)
    const m = this.mirror;
    const focusBy = (scrubbing && this.scrubRate < 1.2 ? 0.35 : 0) + (pressing ? 0.6 * (1 - smooth(0.5, 0.9, holdFor)) : 0) + brace;
    const cmd: Record<Tonic, number> = {
      interest: I.present && (recent || onIris) ? m * (0.25 + 0.45 * prox) : 0,
      curious: m * curiousCmd,
      warm: onIris ? m * warmCmd : 0,
      confused: I.calm || !I.mouse ? 0 : m * smooth(1.5, 4, reversals) * smooth(1, 2.5, this.speed + 0.5 * reversals) * (1 - 0.7 * annoyedCmd),
      // (reading's concentration is the era's mood now: look.ts ERA_BROW)
      focus: Math.min(1, 0.6 * I.glare + focusBy) + (m - 1) * Math.min(1, focusBy),
      strain: m * smooth(1.2, 3, this.scrubRate),
      annoyed: m * annoyedCmd,
      skeptical: 0,
      // nobody has moved for a long while: the lids grow heavy (not a poster, not mid-cut)
      bored: I.interactive && !I.cut && !I.exiting && !I.down ? smooth(30, 40, idle) : 0,
      // a press held on the iris: it stares back
      intense: m * smooth(0.5, 0.9, holdFor),
    };
    // the era's mood sits under it all; behind a cut's shut lids it settles
    // fast, so a new era opens already wearing its own
    this.lastMood = I.mood;
    const mood = this.moods ? (I.mood?.hold ?? {}) : {};
    const atLens = this.moods ? (I.mood?.atLens ?? {}) : {};
    const atContact = this.moods ? (I.mood?.atContact ?? {}) : {};
    // (the gaze as the brow hears it, once a saccade has landed: up at the
    // lens, or meeting the visitor's eyes)
    const lensW = smooth(0.28, 0.42, this.gy);
    const contactW = contactOf(this.gx, this.gy);
    const rush = I.cut ? 4 : 1;
    // The era's idle life: a small flick of the brow as the eyes jump to
    // something (a saccade starting), at most every `every` s, never while a
    // feeling plays, never on a phone. Not a greeting: the visitor's own
    // greeting is not held back by it.
    const flick = this.moods && !I.calm ? I.mood?.flick : undefined;
    const sacStart = I.saccading && !this.wasSaccading;
    this.wasSaccading = I.saccading;
    if (flick) {
      if (!Number.isFinite(this.nextFlick)) this.nextFlick = now + flick.every * 0.6;
      if (sacStart && now >= this.nextFlick && this.lastStrongest < 0.1 && !I.down && !I.cut && !I.exiting) {
        this.impulses.push({ e: "greet", t0: now, peak: flick.peak });
        this.nextFlick = now + flick.every * (0.85 + 0.3 * Math.random());
      }
    } else this.nextFlick = NaN;
    // Eye contact (2026): meeting the visitor's eyes again, once the eye has
    // looked away for a second or more, flashes the brow as a person's does on
    // catching someone's eye (Eibl-Eibesfeldt's eyebrow flash). It comes once
    // the eye has landed on them (a quarter of a second in contact: a sweep
    // across the iris is not a meeting), at most every `every` s, never while
    // a feeling plays, never on a phone, never on a poster. On the eye's own
    // gaze, not the pointer's.
    const met = contactOf(I.gaze.x, I.gaze.y);
    if (met < 0.2) {
      this.awayFor += dt;
      this.metFor = 0;
    } else if (met > 0.8) this.metFor += dt;
    const meet = this.moods && !I.calm ? I.mood?.meet : undefined;
    if (this.metFor >= 0.25) {
      if (meet && this.awayFor >= 1 && now >= this.nextMeet && this.lastStrongest < 0.1 && I.interactive && !I.down && !I.cut && !I.exiting) {
        this.impulses.push({ e: "greet", t0: now, peak: meet.peak });
        this.nextMeet = now + meet.every;
      }
      this.awayFor = 0;
    }
    for (const e of TONIC) {
      const s = this.swell[e];
      if (s && now >= s.until) delete this.swell[e];
      const goal = Math.max(
        cmd[e],
        mood[e] ?? 0,
        (atLens[e] ?? 0) * lensW,
        (atContact[e] ?? 0) * contactW,
        this.held[e] ?? 0,
        s && now < s.until ? s.peak : 0,
      );
      this.tonic[e] = ease(this.tonic[e], goal, TONIC_RATE[e].up * rush, TONIC_RATE[e].down * rush, dt);
    }
    // a fast scrub ending is a relief
    if (this.tonic.strain > 0.4) this.strainHigh = true;
    else if (this.strainHigh && this.tonic.strain < 0.15) {
      this.strainHigh = false;
      this.fire("relief", 1, 0.8);
    }

    // impulses, muscle by muscle (each lags by its place in the motor program)
    const phasic: Partial<Record<BrowEmotion, number>> = {};
    const phasicAU = new Array<number>(NA).fill(0);
    let strongest = 0;
    let startle = 0;
    this.impulses = this.impulses.filter((p) => {
      const env = ENVELOPE[p.e];
      const t = now - p.t0;
      if (t > env.on + env.apex + env.off + MAX_LAG) return false;
      const lag = SYNERGY[p.e];
      const v = p.peak * envelope(t, env);
      phasic[p.e] = Math.max(phasic[p.e] ?? 0, v);
      strongest = Math.max(strongest, v);
      if (p.e === "surprise" || p.e === "wary") startle = Math.max(startle, v);
      for (let a = 0; a < NA; a++) phasicAU[a] += p.peak * envelope(t - (lag?.[a] ?? 0), env) * RECIPE[p.e][a];
      return true;
    });
    for (const e of BROW_EMOTIONS) {
      const h = this.held[e];
      if (isTonic(e) || h === undefined) continue;
      phasic[e] = Math.max(phasic[e] ?? 0, h);
      strongest = Math.max(strongest, h);
      for (let a = 0; a < NA; a++) phasicAU[a] += h * RECIPE[e][a];
    }
    const tonicShare = 1 - 0.5 * smooth(0.3, 0.6, strongest);
    this.lastStrongest = strongest;
    // the eyes stay open through a startle or a stare, and blink once a startle lets go
    if (startle > 0.4) this.startled = true;
    else if (this.startled && startle < 0.1) {
      this.startled = false;
      this.blinkNow = true;
    }
    this.holdBlinks = startle > 0.2 || this.tonic.intense > 0.4 || this.tonic.annoyed > 0.5;
    this.arousal = clamp01(Math.max(startle, phasic.delight ?? 0, 0.6 * this.tonic.intense, 0.5 * this.tonic.annoyed, 0.4 * this.tonic.interest));

    // ---- muscles -------------------------------------------------------------
    const want = phasicAU.slice();
    for (const e of TONIC) for (let a = 0; a < NA; a++) want[a] += this.tonic[e] * tonicShare * RECIPE[e][a];
    // The eye leads, the brow follows: it hears the gaze once a saccade has
    // landed (~120 ms), then eases after it, and its nodes' springs carry the
    // rest. Pursuit (no saccade) is followed continuously, a beat behind.
    // (λ 8, τ 125 ms: at 5.5 a pursuit's brow trailed far enough behind to read as not following)
    if (I.saccading) this.waitUntil = now + 0.12;
    if (now >= this.waitUntil) {
      this.gx = ease(this.gx, I.gaze.x, GAZE_FOLLOW, GAZE_FOLLOW, dt);
      this.gy = ease(this.gy, I.gaze.y, GAZE_FOLLOW, GAZE_FOLLOW, dt);
    }
    const gain = BROW_GAIN * (I.calm ? 0.75 : 1);
    for (let a = 0; a < NA; a++) this.au[a] = ease(this.au[a], sat(want[a]) * gain, AU_RATE[a].up, AU_RATE[a].down, dt);
    // the lids' share: AU5 lifts against AU43's droop; AU7 and AU6 narrow
    const L = LID_FROM_AU;
    this.lids.raise = L.raise * Math.min(this.au[4], 1.2) - L.droop * Math.min(this.au[6], 1) - L.tightUpper * Math.min(this.au[5], 1);
    this.lids.tight = clamp01(L.tight * this.au[5] + L.cheek * this.au[3]);
    this.lids.lower = Math.max(L.lowerMin, 1 - L.lowerTight * Math.min(this.au[5], 1) - L.lowerCheek * Math.min(this.au[3], 1));

    // ---- the bone chain ------------------------------------------------------
    // the gaze's shape first (where the eye looks, the brow goes), the
    // muscles' feelings on top
    gazePose(this.gx, this.gy, this.gazeDy, this.gazeDx);
    for (let i = 0; i < BROW_NODES; i++) {
      let dx = 0;
      let dy = 0;
      let bz = 0;
      for (let a = 0; a < 4; a++) {
        dx += this.au[a] * AU_SHAPE[a].dx[i];
        const over = a === 2 && i < 2 ? 1 - AU1_OVER_AU4 * Math.min(this.au[0], 1) : 1;
        dy += this.au[a] * AU_SHAPE[a].dy[i] * over;
        bz += this.au[a] * AU_SHAPE[a].bulge[i];
      }
      dy += gain * this.gazeDy[i];
      dx += gain * this.gazeDx[i];
      this.tx[i] = dx;
      // (a soft knee: gaze and a strong feeling stacked saturate rather than
      // pile up, so the hood is never stretched or squeezed past the fold test)
      this.ty[i] = knee(dy, TRAVEL.upKnee, TRAVEL.up, TRAVEL.downKnee, TRAVEL.down);
      this.bulge[i] = bz;
    }
    const steps = Math.max(1, Math.ceil(dt * 240));
    const h = dt / steps;
    for (let s = 0; s < steps; s++) this.step(h);

    // ---- out -------------------------------------------------------------------
    const orbi = 0.58 * I.squint + 0.18 * I.blink;
    // each node turns by the mean of its bones' turns
    for (let j = 0; j < BROW_NODES - 1; j++) {
      const ang = Math.atan2(REST[j + 1].y + this.oy[j + 1] - REST[j].y - this.oy[j], REST[j + 1].x + this.ox[j + 1] - REST[j].x - this.ox[j]);
      this.turn[j] = ang - BONE_ANGLE[j];
    }
    for (let i = 0; i < BROW_NODES; i++) this.rot[i] = (this.turn[Math.max(0, i - 1)] + this.turn[Math.min(BROW_NODES - 2, i)]) / 2;
    const o = this.out;
    for (let i = 0; i < BROW_NODES; i++) {
      o[i * 4] = this.ox[i];
      o[i * 4 + 1] = knee(this.oy[i] - orbi * ORBI[i], TRAVEL.upKnee, TRAVEL.up, TRAVEL.downKnee, TRAVEL.down);
      o[i * 4 + 2] = this.rot[i];
      o[i * 4 + 3] = this.bulge[i];
    }
    // tangents (non-uniform Catmull–Rom; one-sided at the ends)
    for (let i = 0; i < BROW_NODES; i++) {
      const a = Math.max(0, i - 1);
      const b = Math.min(BROW_NODES - 1, i + 1);
      const du = BROW_NODE_U[b] - BROW_NODE_U[a];
      for (let c = 0; c < 4; c++) o[(BROW_NODES + i) * 4 + c] = (o[b * 4 + c] - o[a * 4 + c]) / du;
    }
    this.lift = (o[1 * 4 + 1] + o[2 * 4 + 1]) / 2;
    this.emo = { ...this.tonic, ...phasic } as Record<BrowEmotion, number>;
    this.sensed = {
      speed: this.speed,
      dist: this.dist,
      approach: this.approach,
      dwell: this.dwell,
      reversals,
      scrubRate: this.scrubRate,
      idle,
      expect: this.expect,
    };
    return o;
  }

  /** Whether the brow is on the move (any node faster than 0.05 mm/s, or an impulse playing): the stage draws every frame then. */
  get moving() {
    if (this.impulses.length) return true;
    for (let i = 0; i < BROW_NODES; i++) if (Math.hypot(this.vxN[i], this.vyN[i]) > 0.05) return true;
    return false;
  }

  /** One step of the chain: springs to the muscles' shape, bending, then the bones' lengths. */
  private step(h: number) {
    const n = BROW_NODES;
    for (let i = 0; i < n; i++) {
      const w = 2 * Math.PI * NODE_HZ[i];
      const lapX = i === 0 ? (this.ox[1] - this.ox[0]) * 0.5 : i === n - 1 ? (this.ox[n - 2] - this.ox[n - 1]) * 0.5 : (this.ox[i - 1] + this.ox[i + 1]) / 2 - this.ox[i];
      const lapY = i === 0 ? (this.oy[1] - this.oy[0]) * 0.5 : i === n - 1 ? (this.oy[n - 2] - this.oy[n - 1]) * 0.5 : (this.oy[i - 1] + this.oy[i + 1]) / 2 - this.oy[i];
      const ax = w * w * (this.tx[i] - this.ox[i] + BEND * lapX) - 2 * ZETA * w * this.vxN[i];
      const ay = w * w * (this.ty[i] - this.oy[i] + BEND * lapY) - 2 * ZETA * w * this.vyN[i];
      this.vxN[i] += ax * h;
      this.vyN[i] += ay * h;
      this.ox[i] += this.vxN[i] * h;
      this.oy[i] += this.vyN[i] * h;
    }
    for (let j = 0; j < n - 1; j++) {
      const dx = REST[j + 1].x + this.ox[j + 1] - REST[j].x - this.ox[j];
      const dy = REST[j + 1].y + this.oy[j + 1] - REST[j].y - this.oy[j];
      const len = Math.hypot(dx, dy) || 1;
      const c = ((len - BONE_LEN[j]) / len) * BONE_STIFF;
      const wa = j === 0 ? HEAD_ANCHOR : 1;
      const wb = 1;
      const sa = wa / (wa + wb);
      const sb = wb / (wa + wb);
      this.ox[j] += dx * c * sa;
      this.oy[j] += dy * c * sa;
      this.ox[j + 1] -= dx * c * sb;
      this.oy[j + 1] -= dy * c * sb;
    }
    for (let i = 0; i < n; i++) {
      // (a guard: nothing a feeling does takes a node more than 4 mm)
      if (!Number.isFinite(this.ox[i]) || !Number.isFinite(this.oy[i])) {
        this.ox[i] = this.oy[i] = this.vxN[i] = this.vyN[i] = 0;
      }
      this.ox[i] = Math.max(-4, Math.min(4, this.ox[i]));
      this.oy[i] = Math.max(-4, Math.min(4, this.oy[i]));
    }
  }

  /** Back to rest at once (reduced motion). */
  reset() {
    this.out.fill(0);
    this.ox.fill(0);
    this.oy.fill(0);
    this.vxN.fill(0);
    this.vyN.fill(0);
    this.rot.fill(0);
    this.bulge.fill(0);
    this.au.fill(0);
    for (const e of TONIC) this.tonic[e] = 0;
    this.impulses = [];
    this.lift = 0;
    this.lids.raise = 0;
    this.lids.tight = 0;
    this.lids.lower = 1;
    this.holdBlinks = false;
    this.blinkNow = false;
    this.arousal = 0;
    this.nextFlick = NaN;
    this.awayFor = 0;
    this.metFor = 0;
  }

  info(): BrowInfo {
    const emotions = {} as Record<BrowEmotion, number>;
    for (const e of BROW_EMOTIONS) emotions[e] = this.emo[e] ?? 0;
    const o = this.out;
    const nodes = REST.map((_, i) => ({ dx: o[i * 4], dy: o[i * 4 + 1], rot: o[i * 4 + 2], bulge: o[i * 4 + 3] }));
    const points = REST.map((p, i): [number, number, number] => {
      const x = p.x + nodes[i].dx;
      const y = p.y + nodes[i].dy;
      return [x, y, browSkinZ(x, y) + nodes[i].bulge];
    });
    return { au: [...this.au], emotions, nodes, points, lids: { ...this.lids }, mood: this.lastMood, senses: { ...this.sensed } };
  }
}
