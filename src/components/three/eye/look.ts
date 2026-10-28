/**
 * How each era lights and records its eye. Extends the live eye's EraVisual
 * (the screen in the cornea) with the light, the lens and the one behaviour
 * that era owns. P0 only fixes the shape; P9–P11 fill it in from
 * docs/EYE_TSL_PLAN.md §7.
 */

import { Color } from "three/webgpu";
import type { ThemeConfig } from "@/data/portfolio-data";
import { type EraVisual, getEraVisual } from "@/lib/era-visuals";
import type { BrowMood } from "./rig/brow";

/* ---- the era's palette, as the screen and the room use it -------------- */

function clampHex(h: string | undefined, fallback: string): string {
  if (!h) return fallback;
  if (h[0] !== "#") return h;
  let s = h.slice(1);
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return "#" + s.slice(0, 6);
}

/** Page ground, body text, primary panels, accent highlights, secondary chrome. */
export interface EraPalette {
  bg: string;
  ink: string;
  panel: string;
  accent: string;
  bar: string;
}

export function eraPalette(era: ThemeConfig): EraPalette {
  return {
    bg: clampHex(era.colors.background, "#050505"),
    ink: clampHex(era.colors.text, "#f5f5f5"),
    panel: clampHex(era.colors.primary, "#2438e0"),
    accent: clampHex(era.colors.accent || era.colors.secondary, "#b21e8f"),
    bar: clampHex(era.colors.secondary || era.colors.accent, "#e11d74"),
  };
}

export type PaletteColors = Record<keyof EraPalette, Color>;

/** Parsed once per era: five hex parses a frame was the live eye's garbage. */
export function paletteColors(pal: EraPalette): PaletteColors {
  return {
    bg: new Color(pal.bg),
    ink: new Color(pal.ink),
    panel: new Color(pal.panel),
    accent: new Color(pal.accent),
    bar: new Color(pal.bar),
  };
}

function lumOfHex(hex: string): number {
  const h = clampHex(hex, "#808080").slice(1);
  return (
    (0.299 * parseInt(h.slice(0, 2), 16) +
      0.587 * parseInt(h.slice(2, 4), 16) +
      0.114 * parseInt(h.slice(4, 6), 16)) /
    255
  );
}

/** How much light this era's screen throws — a white page blinds, a terminal does not. */
export function screenLuminance(pal: EraPalette): number {
  return Math.min(1, lumOfHex(pal.bg) * 0.7 + lumOfHex(pal.panel) * 0.2 + lumOfHex(pal.accent) * 0.2);
}

export type GazePattern = "idle" | "read" | "scatter" | "two-target" | "lock" | "scroll" | "contact";
export const GAZE_PATTERNS: GazePattern[] = ["idle", "read", "scatter", "two-target", "lock", "scroll", "contact"];

/**
 * How an era's person looks about (rig/gaze.ts), in gaze units: x ±1 is
 * ±24° of yaw, y ±1 is ±10° of pitch (further down is allowed, as on a phone).
 */
export interface GazeParams {
  /** Where the eye rests, and where scripts are centred. */
  rest: [number, number];
  /** How far free viewing roams from rest, each way. */
  spread: [number, number];
  /** Mean fixation, ms. */
  fixMs: number;
  /** Mean saccade, degrees, in free viewing. */
  ampMean: number;
  /** Microsaccades per second while fixating. */
  microRate: number;
  /** two-target: the two places, and the mean dwell at each, seconds. */
  a: [number, number];
  b: [number, number];
  dwellA: number;
  dwellB: number;
  /** read: lines on the page, line width and spacing (gaze units). */
  lines: number;
  width: number;
  lineStep: number;
  /** scroll: how fast the content carries the eye up, degrees per second. */
  scrollSpeed: number;
  /** How faithfully the eye follows the pointer (2026 follows best), and its pursuit gain. */
  follow: number;
  pursuitGain: number;
  /** How far the pointer may get ahead before a catch-up saccade, degrees. */
  catchUp: number;
  /** Mean seconds between blinks: reading and staring blink less, scanning more. */
  blinkEvery: number;
}
export type CorneaCursor = "block" | "arrow" | "hand" | "caret" | "thumb" | "none";

/** Index into the screen pass's cursor shapes (nodes/screen.ts). */
export const CURSOR_KIND: Record<CorneaCursor, number> = {
  none: 0,
  arrow: 1,
  block: 2,
  caret: 3,
  hand: 4,
  thumb: 5,
};

/**
 * The visitor's own pointer, as it shows on the screen the eye is looking at
 * and so in its cornea (docs/EYE_TSL_PLAN.md §7). A touch screen has no
 * cursor, only the thumb over the glass; 2026 has no screen at all.
 */
const ERA_CURSOR: Record<string, CorneaCursor> = {
  "1970": "block",
  "1981": "arrow",
  "1991": "arrow",
  "1995": "hand",
  "1997": "arrow",
  "2000": "caret",
  "2003": "hand",
  "2009": "thumb",
  "2013": "thumb",
  "2026": "none",
};

/**
 * The screen as the eye sees it: a lit rectangle in front of the face.
 *
 * `key` is the direction its light comes from, for shading. The mirror
 * image comes from the rectangle itself (`pos` its centre, `normal` facing
 * the eye, `size` its width and height, all mm, eye at the origin, +z toward
 * the camera). It is far bigger and closer than a real monitor on purpose: a
 * cornea is a 7.8 mm convex mirror, and only a screen that fills most of the
 * view leaves a page in it that can still be read. These numbers are the
 * live eye's, measured off its shader (SCREEN_C / SCREEN_H / SCREEN_D).
 */
/**
 * How an era's page shows in the cornea: its size there (× the screen's
 * stylised size; 1 as built) and, optionally, one region of it held still
 * (centre x, centre y, width; px of the page at its 768 px width) instead of
 * the whole page scrolling. Chosen per era by eye (docs/EYE_REALISM_PLAN.md,
 * "Reflection per era").
 */
export interface EraReflect {
  scale?: number;
  frame?: [number, number, number];
}

/**
 * Each era's key interface on its captured home page (public/eye/screens), as
 * a frame for `EraReflect.frame`: the part of the page that says which era
 * this is. Chosen 2026-10-28 by eye, per era (ERA_LIGHT `reflect`): 1970 and
 * 1995 show the whole page larger (~60 % of the iris), 1981 and 2013 stay as
 * built, the rest hold their key interface still.
 */
export const ERA_REFLECT_KEY: Record<string, [number, number, number]> = {
  // the KIRUK banner and the first prompt lines
  "1970": [290, 210, 540],
  // the Star's icons and the open window
  "1981": [400, 320, 600],
  // the title and the first blue links
  "1991": [290, 260, 560],
  // WELCOME TO KIRUK, the globe and the hit counter
  "1995": [384, 225, 600],
  // the nav frame beside the content frame
  "1997": [384, 240, 640],
  // the search box and its two buttons
  "2000": [384, 175, 440],
  // the profile card under the glossy header
  "2003": [384, 230, 640],
  // the iPhone, upright, as the phone in the room is
  "2009": [384, 255, 300],
  // the flat header and the first cards
  "2013": [384, 360, 420],
  // the halftone pupil and the composer
  "2026": [384, 216, 680],
};

export interface ScreenLight {
  device: "crt" | "crt-mono" | "lcd" | "phone" | "window" | "none";
  key: [number, number, number];
  pos: [number, number, number];
  normal: [number, number, number];
  size: [number, number];
  /** A second light in the room, if the era has one. */
  fill?: FillLight;
  /** How its page shows in the cornea (default: as built, the whole page scrolling). */
  reflect?: EraReflect;
  /**
   * The device as it was (R11, docs/EYE_REALISM_PLAN.md §8.4): its real size
   * and distance, mm. Not the stylised `size`, which is larger than life so the
   * page reads in the cornea. Sets how soft its shadows are: mm of soft edge
   * per mm between the lid and what it shades, `mm[1] / dist`.
   */
  real: { mm: [number, number]; dist: number };
}

/**
 * A second light in the era's room: office fluorescents overhead, a desk
 * lamp to the side. It lights the face from its own direction and shows in
 * the cornea as its own small reflection (a rectangle, or a disc when
 * `round` is 1), facing the eye from `pos` (mm).
 */
export interface FillLight {
  dir: [number, number, number];
  color: string;
  strength: number;
  pos: [number, number, number];
  size: [number, number];
  round: number;
  /**
   * How strongly it shows in the cornea as its own reflection, 0..1 (default
   * 1). Only the fills an era's card names reflect, kept under the page
   * (docs/EYE_REALISM_PLAN.md §7.6): the screen stays the brightest thing there.
   */
  catchlight?: number;
}

const LIVE_SCREEN: ScreenLight = {
  device: "lcd",
  key: [-0.42, 0.48, 0.77],
  pos: [-84, 99, 300],
  normal: [0, 0, -1],
  size: [1914, 1164],
  real: { mm: [531, 299], dist: 600 },
};

/**
 * Each era's screen as a light (docs/EYE_TSL_PLAN.md §7, "Light"). The
 * rectangles are larger than life on purpose, as the live eye's are, so the
 * page stays legible in the cornea.
 */
const ERA_LIGHT: Record<string, ScreenLight> = {
  // a P1 green-phosphor terminal, curved and 4:3, a little below the eyes; nothing else lit
  "1970": { device: "crt-mono", key: [0.04, -0.24, 0.97], pos: [-10, -70, 300], normal: [0, 0, -1], size: [1520, 1140], reflect: { scale: 1.155 }, real: { mm: [244, 183], dist: 600 } },
  // a paper-white CRT up and to the left, office fluorescents overhead
  "1981": {
    device: "crt",
    key: [-0.4, 0.45, 0.8],
    pos: [-84, 99, 300],
    normal: [0, 0, -1],
    size: [1700, 1280],
    fill: { dir: [0.05, 0.92, 0.38], color: "#e9f1ff", strength: 0.32, pos: [40, 560, 420], size: [1100, 70], round: 0.15 },
    real: { mm: [345, 259], dist: 550 },
  },
  // a greyscale workstation in a black bezel, a warm desk lamp low to the left
  "1991": {
    device: "crt",
    key: [-0.12, 0.28, 0.95],
    pos: [-20, 60, 300],
    normal: [0, 0, -1],
    size: [1560, 1170],
    fill: { dir: [-0.78, 0.12, 0.62], color: "#ffc985", strength: 0.38, pos: [-430, 40, 250], size: [150, 150], round: 1 },
    reflect: { frame: ERA_REFLECT_KEY["1991"] },
    real: { mm: [345, 259], dist: 600 },
  },
  // a beige 14" CRT at home at night, centred and a little low: the page's
  // navy and neon are the only light in the room
  "1995": { device: "crt", key: [0.05, -0.12, 0.99], pos: [0, -40, 300], normal: [0, 0, -1], size: [1480, 1110], reflect: { scale: 1.107 }, real: { mm: [284, 213], dist: 550 } },
  // an office Trinitron at 800×600, a little up and to the left, the cubicle's
  // fluorescent bar overhead (it lights the face; the card keeps it out of the cornea)
  "1997": {
    device: "crt",
    key: [-0.1, 0.2, 0.97],
    pos: [-30, 40, 300],
    normal: [0, 0, -1],
    size: [1600, 1200],
    fill: { dir: [0.1, 0.95, 0.3], color: "#e6efff", strength: 0.3, pos: [0, 600, 380], size: [1300, 60], round: 0.1, catchlight: 0 },
    reflect: { frame: ERA_REFLECT_KEY["1997"] },
    real: { mm: [345, 259], dist: 600 },
  },
  // a 14" TN laptop at night, below the eye line: she looks down into a cold
  // panel, lit from beneath; nothing else in the room
  "2000": { device: "lcd", key: [0, -0.4, 0.92], pos: [0, -140, 285], normal: [0, 0, -1], size: [1600, 1180], reflect: { frame: ERA_REFLECT_KEY["2000"] }, real: { mm: [284, 213], dist: 500 } },
  // the iSight on top of a 17" LCD at eye level, window daylight from the
  // right: the deck's first window catchlight
  "2003": {
    device: "lcd",
    key: [0, 0.04, 1],
    pos: [0, 10, 300],
    normal: [0, 0, -1],
    size: [1760, 1100],
    fill: { dir: [0.82, 0.22, 0.52], color: "#fff4e2", strength: 0.42, pos: [520, 120, 300], size: [420, 620], round: 0.08, catchlight: 0.35 },
    reflect: { frame: ERA_REFLECT_KEY["2003"] },
    real: { mm: [337, 270], dist: 500 },
  },
  // an iPhone 3GS held low at 32 cm in a lamp-lit room: the cornea holds an
  // upright phone and a round lamp
  "2009": {
    device: "phone",
    key: [0, -0.55, 0.84],
    pos: [0, -150, 250],
    normal: [0, 0, -1],
    size: [980, 1560],
    fill: { dir: [-0.25, 0.85, 0.46], color: "#ffd9a8", strength: 0.3, pos: [-220, 520, 300], size: [170, 170], round: 1 },
    reflect: { frame: ERA_REFLECT_KEY["2009"] },
    real: { mm: [49, 74], dist: 320 },
  },
  // a selfie: an iPhone 5s held a little high at arm's length, its bright
  // screen above the eyes and a white tabletop throwing light up from below
  "2013": {
    device: "phone",
    key: [0, 0.3, 0.95],
    pos: [0, 110, 290],
    normal: [0, 0, -1],
    size: [1000, 1640],
    fill: { dir: [0, -0.7, 0.7], color: "#ffffff", strength: 0.35, pos: [0, -500, 320], size: [1600, 500], round: 0.3 },
    real: { mm: [50, 89], dist: 500 },
  },
  // no screen: the interface is the eye, and it is daylight; a window to the
  // left, the page itself still in the cornea
  "2026": {
    device: "window",
    key: [0, 0.1, 0.99],
    pos: [0, 40, 320],
    normal: [0, 0, -1],
    size: [2200, 1400],
    fill: { dir: [-0.7, 0.35, 0.6], color: "#f5f3ee", strength: 0.35, pos: [-600, 200, 300], size: [500, 700], round: 0.05 },
    reflect: { frame: ERA_REFLECT_KEY["2026"] },
    real: { mm: [900, 1200], dist: 1500 },
  },
};

/**
 * How each era's picture leaves, arrives and lets you in (post/era-medium.ts,
 * post/medium-director.ts). A cut between eras is the person's blink: the
 * outgoing era departs as the lids close (`departMs`), the incoming one
 * arrives as they open (`arriveMs`), and its sign comes last. `enterMs` is
 * how long its way in plays when the iris is tapped, ending on `flood`.
 * `cssCursor` is the loader's cursor over the iris: the era's own way of
 * saying "this opens".
 */
export interface EraMedium {
  departMs: number;
  arriveMs: number;
  enterMs: number;
  flood: string;
  cssCursor: string;
}

/** The Xerox Star's arrow, 16×16: solid ink with a paper halo, hotspot at the tip. */
const STAR_ARROW =
  'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAACVBMVEUAAADx7+gUExJtmyHTAAAAAXRSTlMAQObYZgAAADtJREFUeNodyjERwDAMwEAtIVE0hmAQXmI0WcIgS4uypyw/6EQApJRMaWMvOfLKF9A7YdrKMSUe78uAH8OEC1JcYgpZAAAAAElFTkSuQmCC") 0 0, default';

const ERA_MEDIUM: Record<string, EraMedium> = {
  // the raster collapses to a line, then a dot; it warms up from dark
  "1970": { departMs: 200, arriveMs: 420, enterMs: 400, flood: "#000000", cssCursor: "default" },
  // one field clears the bitmap; two interlaced fields paint it
  "1981": { departMs: 130, arriveMs: 300, enterMs: 300, flood: "#f1efe8", cssCursor: STAR_ARROW },
  // four greys drop to two; the refresh sweeps a still into detail
  "1991": { departMs: 120, arriveMs: 440, enterMs: 360, flood: "#ffffff", cssCursor: "default" },
  // 216 colours drop to 27; the interlaced GIF's four passes fill down
  "1995": { departMs: 120, arriveMs: 360, enterMs: 380, flood: "#000033", cssCursor: "pointer" },
  "1997": { departMs: 130, arriveMs: 330, enterMs: 400, flood: "#6e1f2f", cssCursor: "default" },
  "2000": { departMs: 100, arriveMs: 600, enterMs: 300, flood: "#ffffff", cssCursor: "text" },
  "2003": { departMs: 120, arriveMs: 500, enterMs: 380, flood: "#6a98cb", cssCursor: "pointer" },
  "2009": { departMs: 120, arriveMs: 380, enterMs: 380, flood: "#2b1d12", cssCursor: "pointer" },
  "2013": { departMs: 130, arriveMs: 420, enterMs: 420, flood: "#efeff4", cssCursor: "default" },
  "2026": { departMs: 130, arriveMs: 640, enterMs: 400, flood: "#fafafa", cssCursor: "default" },
};

export function getEraMedium(eraId: string): EraMedium {
  return ERA_MEDIUM[eraId] ?? { departMs: 120, arriveMs: 360, enterMs: 380, flood: "#000000", cssCursor: "default" };
}

/** The era's one capture artefact (post/era-lens.ts draws each). */
export type LensArtefact = "none" | "film" | "comet" | "webcam" | "interlace" | "ccd" | "flash" | "flare";
export const LENS_ARTEFACTS: LensArtefact[] = ["none", "film", "comet", "webcam", "interlace", "ccd", "flash", "flare"];

/**
 * How the era recorded faces (post/era-lens.ts). Amounts are 0..1 unless
 * noted; a clean photograph is grain 0, halation 0, chroma 0, lift 0,
 * gamma 1, gain 1, sat 1, wb 0, split 0, sharpen 0, artefact "none".
 */
export interface EraLens {
  grain: number;
  /** Grain size in device pixels. */
  grainSize: number;
  /** Red glow around the brightest things (film's red layer, a tube's bloom). */
  halation: number;
  /** Lateral colour fringing toward the frame's edge. */
  chroma: number;
  vignette: number;
  lift: number;
  gamma: number;
  gain: number;
  sat: number;
  /** White balance: −1 cool … +1 warm. */
  wb: number;
  /** Warm highlights against cool shadows (a slide film's split). */
  split: number;
  /** −1 soft … +1 over-sharpened, with the halos. */
  sharpen: number;
  artefact: LensArtefact;
  /** How strongly the artefact shows. */
  amount: number;
  /** Depth of field, × the macro default (0 is everything sharp). */
  aperture: number;
  /** Bloom on what emits (the reflection), × default. */
  bloom: number;
  /**
   * Keep the colour of what emits (the reflection) while `sat` takes the rest:
   * at 1 the reflected page is the only colour in the frame (1970).
   */
  isolate: number;
  /** The monochrome leans green, as a phosphor screen does (1970). 0 is neutral grey. */
  phosphor: number;
}

export interface EraLook extends EraVisual {
  light: ScreenLight;
  restGaze: [number, number];
  gazePattern: GazePattern;
  gaze: GazeParams;
  /** The least the lids squint here, whatever the glare (1981's signature). */
  squintRest: number;
  /** The page scrolls only as the eye finishes reading it (1991's signature). */
  stepScroll: boolean;
  lens: EraLens;
  cursor: CorneaCursor;
  /** The expression the era's task brings, held under the visitor's (ERA_BROW). */
  browMood: BrowMood;
  signature: string;
}

export const CLEAN_LENS: EraLens = {
  // every photograph has some grain, the dark room behind the face included
  grain: 0.04,
  grainSize: 1.4,
  halation: 0,
  chroma: 0,
  vignette: 0.3,
  lift: 0,
  gamma: 1,
  gain: 1,
  sat: 1,
  wb: 0,
  split: 0,
  sharpen: 0,
  artefact: "none",
  amount: 0,
  aperture: 1,
  bloom: 1,
  isolate: 0,
  phosphor: 0,
};

/**
 * Each era's camera (docs/EYE_TSL_PLAN.md §7, "Lens"): one strong cue each,
 * the rest kept quiet. A first pass; P11 tunes them era by era.
 */
const ERA_LENS: Record<string, Partial<EraLens>> = {
  // 16 mm film: heavy grain, red halation round the phosphor, a little gate
  // weave; black and white but for the green rows in the cornea
  "1970": {
    grain: 0.075,
    grainSize: 1.9,
    halation: 0.65,
    // (0.4, lift 0.03, gain 1.12, 2026-10-29: lit from below by a dim green
    // page, the face sank into the dark and its detail didn't render)
    vignette: 0.4,
    gain: 1.12,
    sat: 0.04,
    isolate: 1,
    phosphor: 1,
    lift: 0.03,
    artefact: "film",
    amount: 1,
    bloom: 1.4,
  },
  // a broadcast tube camera: soft, a little bloom, highlights smearing into a
  // comet tail on moves (no grain: the medium's dither is the grain)
  "1981": { grain: 0, halation: 0.22, sharpen: -0.5, wb: -0.1, artefact: "comet", amount: 1, bloom: 1.35 },
  // 35 mm slide film, editorial: clean and fine, a warm and cool split, a touch of contrast
  "1991": { grain: 0, grainSize: 1.2, split: 0.6, sat: 1.1, gamma: 0.96, wb: 0.08 },
  // a little smeared colour; the medium's web-safe cells are the low-res
  // picture (a webcam's blocks and exposure pumping under them only beat)
  "1995": { grain: 0, chroma: 0.35, sat: 1 },
  // a CCD camcorder: interlace combing on fast moves, sharpening halos, a
  // little cool; opened up, since its 16-bit bands crushed it to near black
  "1997": { grain: 0, wb: -0.12, gain: 1.15, gamma: 0.92, sharpen: 0.35, artefact: "interlace", amount: 0.6 },
  // a cold laptop panel at night: a little lateral colour, cool white (the
  // CCD's smear and shadow blocks went with the box that used to crop them:
  // full frame, they read as ghosts)
  "2000": { grain: 0.03, chroma: 0.35, wb: -0.3 },
  // the iSight seeing you live in colour: a little punch and crispness, no
  // flash (the window and the page are the light; ERA_POV_PLAN.md 2003)
  // (clearer, 2026-10-29: the lift hazed it and the macro depth of field
  // softened the lids; "the overall view is unclear")
  "2003": { grain: 0.03, vignette: 0.15, lift: 0, sat: 1.1, sharpen: 0.3, aperture: 0.6 },
  // an early 3 MP phone: soft, warm, noisy shadows, lens flare
  // (the flare's ghosts at half: full frame, at full strength they read as rings on the brow)
  "2009": { grain: 0.07, grainSize: 1.4, wb: 0.45, sharpen: -0.35, artefact: "flare", amount: 0.45 },
  // the filter era: lifted blacks, a warm fade, a vignette
  // bright and clean (the medium's frosted glass does the softening)
  "2013": { grain: 0.02, lift: 0.03, wb: 0.1, sat: 0.95, vignette: 0, gain: 1 },
  // computational: clean, a little too sharp, monochrome
  "2026": { grain: 0, sharpen: 0.4, sat: 0, aperture: 0.8 },
};

export const GAZE_DEFAULTS: GazeParams = {
  rest: [0, 0],
  spread: [0.45, 0.4],
  fixMs: 700,
  ampMean: 4,
  microRate: 0.45,
  a: [0, 0],
  b: [0, 0],
  dwellA: 1,
  dwellB: 1,
  lines: 6,
  width: 0.7,
  lineStep: 0.12,
  scrollSpeed: 2.5,
  follow: 1,
  pursuitGain: 0.85,
  catchUp: 1.6,
  blinkEvery: 3.6,
};

/** Each era's way of looking (docs/EYE_TSL_PLAN.md §7, "Gaze"). */
const ERA_GAZE: Record<string, { pattern: GazePattern; gaze: Partial<GazeParams> }> = {
  // slightly down at the terminal, reading along the lines
  "1970": { pattern: "read", gaze: { rest: [0, -0.12], lines: 5, width: 0.65, lineStep: 0.12, fixMs: 750, blinkEvery: 5.5 } },
  // straight ahead, short hops between icons
  "1981": { pattern: "scatter", gaze: { spread: [0.35, 0.3], fixMs: 900, ampMean: 3.5, blinkEvery: 3.6 } },
  // reading the first web page, line by line
  "1991": { pattern: "read", gaze: { rest: [0, 0.15], lines: 7, width: 0.8, lineStep: 0.11, fixMs: 750, blinkEvery: 6 } },
  // scattered: many short fixations, jumping between whatever blinks
  "1995": { pattern: "scatter", gaze: { spread: [0.7, 0.55], fixMs: 800, ampMean: 7, blinkEvery: 3 } },
  // the nav frame and the content frame, in turn
  "1997": {
    pattern: "two-target",
    gaze: { a: [-0.62, 0.15], b: [0.22, 0], dwellA: 1.4, dwellB: 3.5, fixMs: 900, follow: 0.7, blinkEvery: 3.6 },
  },
  // locked on the search box, looking down into the laptop: drift and
  // microsaccades only, barely following the pointer
  "2000": { pattern: "lock", gaze: { rest: [0, -0.4], microRate: 0.5, follow: 0.25, blinkEvery: 6.5 } },
  // free viewing, a little down: watching the video just under the lens
  "2003": { pattern: "idle", gaze: { rest: [0, -0.28], fixMs: 1100, follow: 0.6 } },
  // down at the phone, riding the scroll and jumping back (−1.5 hid the iris)
  "2009": { pattern: "scroll", gaze: { rest: [0, -0.7], fixMs: 950, scrollSpeed: 1.6, follow: 0.4, blinkEvery: 4.5 } },
  // a selfie: up into the front camera's lens, then down a little to the
  // screen to see how it looks, and back
  "2013": {
    pattern: "two-target",
    gaze: { rest: [0, 0.3], a: [0, 0.45], b: [0.04, 0.25], dwellA: 1.2, dwellB: 4, fixMs: 750, blinkEvery: 4 },
  },
  // eye contact: straight into the camera, following the pointer best of all
  "2026": { pattern: "contact", gaze: { microRate: 0.45, pursuitGain: 0.97, catchUp: 1, blinkEvery: 4.2 } },
};

/**
 * Each era's mood (docs/EYE_BROW_EMOTION_PLAN.md §7): the expression its task
 * brings to the same face, as its gaze does, held under whatever the visitor
 * makes it feel (rig/brow.ts). Subtle by rule: a mood moves the brow by a few
 * tenths of a millimetre, never the person. An era without one rests neutral.
 * Batches 1 and 2 (2026-10-28): 1970, 1981, 1991; 1995, 1997, 2000, signed
 * off. Batch 3: 2003, 2009, 2013. Then 2026.
 */
const ERA_BROW: Record<string, BrowMood> = {
  // the night operator: steady concentration on green text in a dark room
  "1970": { hold: { focus: 0.35 } },
  // the first mouse: a quiet curiosity at pointing at a picture of a thing
  // (the outer brow up a little), over the era's squint at a bright bitmap
  "1981": { hold: { curious: 0.3 } },
  // the first web page: wonder lifting the brow while reading a white page,
  // through the squint its glare brings
  "1991": { hold: { interest: 0.3, focus: 0.15 } },
  // Batch 2 (2026-10-28).
  // everything blinks: an alert lift, and the brow flicks a little as the
  // eyes jump to something blinking, at most every ~7 s
  "1995": { hold: { interest: 0.3 }, flick: { every: 7, peak: 0.25 } },
  // the dot-com office, weighing up portals frame by frame: an appraising
  // look, the lids a hair lower, the outer brow up, the head level
  "1997": { hold: { skeptical: 0.2, focus: 0.1 } },
  // the locked stare at the search box: the eyes held a touch wide under a
  // lowered brow (a stare, not 1970's narrowing), over its white page's squint
  "2000": { hold: { focus: 0.25, intense: 0.2 } },
  // Batch 3 (2026-10-28).
  // a video call: warmth with attention, the tail softening into the start
  // of a smile in the eyes; a face on a call, listening
  "2003": { hold: { warm: 0.2, interest: 0.15 } },
  // absorbed in the feed, the phone held low: no held expression (the
  // posture is its own), but now and then the brow lifts a little as a new
  // post catches the eye (on the feed's jump back), gentler than 1995's
  "2009": { flick: { every: 10, peak: 0.2 } },
  // the selfie: up at the lens the brows lift with a hint of a smile, the
  // pose; back at the screen they relax
  "2013": { atLens: { interest: 0.5, warm: 0.15 } },
  // Eye contact (2026-10-28), over the gaze-led brow. Looking straight at the
  // visitor the brow is up a little, attentive and open, and it relaxes as
  // the eye follows the cursor away. Meeting their eyes again it flashes, as a
  // person's does on catching someone's eye, now and then (a resting cursor
  // brings the eye back to the visitor after 2.2 s: a flash every pause would
  // be a tic). It mirrors the visitor best of all: what they make the face
  // feel comes 1.2 × as strong.
  "2026": { atContact: { interest: 0.3 }, meet: { every: 12, peak: 0.3 }, mirror: 1.2 },
};

/**
 * The loader's eye looks straight at the visitor whatever the era (the user,
 * 2026-10-29: "that eye should look at me … like a person in front of him
 * will look into it"). Every era rests in eye contact, centred, and follows
 * the pointer as its own data says; the eras' reading, scanning and phone
 * gazes above are kept as data but not played at rest. (1970's reading drifted
 * the eye ~2.2 mm down the frame once the downward range widened.)
 */
const EYE_CONTACT_AT_REST = true;

export function getEraLook(eraId: string): EraLook {
  const g0 = ERA_GAZE[eraId] ?? { pattern: "idle" as GazePattern, gaze: {} };
  const g = EYE_CONTACT_AT_REST && g0.pattern !== "contact"
    ? {
        pattern: "contact" as GazePattern,
        gaze: {
          microRate: 0.45,
          catchUp: 1,
          ...(g0.gaze.follow !== undefined ? { follow: g0.gaze.follow } : {}),
          ...(g0.gaze.blinkEvery !== undefined ? { blinkEvery: g0.gaze.blinkEvery } : {}),
          rest: [0, 0] as [number, number],
        },
      }
    : g0;
  const gaze: GazeParams = { ...GAZE_DEFAULTS, ...g.gaze };
  return {
    ...getEraVisual(eraId),
    light: ERA_LIGHT[eraId] ?? LIVE_SCREEN,
    // (a hint of a squint, so the almond stays open)
    squintRest: eraId === "1981" ? 0.35 : 0,
    stepScroll: eraId === "1991",
    restGaze: gaze.rest,
    gazePattern: g.pattern,
    gaze,
    lens: { ...CLEAN_LENS, ...ERA_LENS[eraId] },
    cursor: ERA_CURSOR[eraId] ?? "arrow",
    browMood: ERA_BROW[eraId] ?? {},
    signature: "",
  };
}
