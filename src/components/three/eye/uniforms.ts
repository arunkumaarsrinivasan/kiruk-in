/**
 * The one uniform registry. Every material that needs the gaze, the blink or
 * the pupil reads the same uniform node, and one JS loop damps the values.
 * Graphs never change between eras; only these values and the baked textures
 * do, so sweeping through time never recompiles a shader.
 *
 * Per-frame globals sit in renderGroup so they upload once per render, not
 * once per object that reads them.
 */

import { Color, Vector2, Vector3 } from "three/webgpu";
import { renderGroup, uniform } from "three/tsl";
import type { ScreenState } from "./rig/screen";

function screenUniforms() {
  const f = (v: number) => uniform(v).setGroup(renderGroup);
  const c = (hex: string) => uniform(new Color(hex)).setGroup(renderGroup);
  return {
    time: f(0),
    bg: c("#050505"),
    ink: c("#ffffff"),
    panel: c("#2438e0"),
    accent: c("#b21e8f"),
    bar: c("#e11d74"),
    styleA: f(2),
    styleB: f(2),
    styleMix: f(1),
    scroll: f(0),
    scan: f(0),
    pixel: f(0),
    dither: f(0),
    posterize: f(0),
    glow: f(0),
    wobble: f(0),
    warp: f(0),
    tech: f(0),
    crt: f(0),
    /** The visitor's pointer on the screen: UV (y up), shape (look.ts CURSOR_KIND), presence. */
    cursorPos: uniform(new Vector2(0.5, 0.5)).setGroup(renderGroup),
    cursorKind: f(0),
    cursorAlpha: f(0),
    /**
     * The era's real page (screen-pages.ts): how much it shows over the
     * painted stand-in, the crossfade from slot A to B, and one viewport's
     * share of each page's height.
     */
    pageOn: f(0),
    pageMix: f(1),
    pageViewA: f(1),
    pageViewB: f(1),
  };
}

export type ScreenUniforms = ReturnType<typeof screenUniforms>;

export function createEyeUniforms() {
  return {
    time: uniform(0).setGroup(renderGroup),
    /** Where the eye looks, -1..1 on each axis. */
    gaze: uniform(new Vector2()).setGroup(renderGroup),
    /** 0 open, 1 shut. */
    blink: uniform(0).setGroup(renderGroup),
    /** Pupil radius as a share of the iris radius. */
    pupil: uniform(0.34).setGroup(renderGroup),
    /** A flash on the camera's axis lighting the fundus through the pupil, 0..1. */
    redReflex: uniform(0).setGroup(renderGroup),
    /** Intro fade; the stage is ready once this has arrived. */
    fade: uniform(0).setGroup(renderGroup),
    /** How bright the era's screen is, 0..1. */
    screenLum: uniform(0.5).setGroup(renderGroup),
    /** Eye units spanned by the viewport's height (era-eye-frame). */
    span: uniform(1).setGroup(renderGroup),
    /** The framing's vertical shift, in eye units. */
    offsetY: uniform(0).setGroup(renderGroup),
    /** Extra mip bias when the shot stands back, so a dither does not turn to snow. */
    mip: uniform(0).setGroup(renderGroup),
    /** Lab only: which buffer to show. See DEBUG_VIEWS. */
    debugView: uniform(0).setGroup(renderGroup),
    /**
     * The lid margins, as angles around the globe's centre (nodes/margins.ts):
     * the medial and lateral corners' azimuth, the upper and lower margins'
     * elevation at their apex, the lateral canthus's tilt, and what moves them
     * frame to frame: the squint, the gaze's pitch, and the apex following the
     * gaze's yaw. All radians.
     */
    lids: {
      phiM: uniform(-1.3).setGroup(renderGroup),
      phiL: uniform(1.06).setGroup(renderGroup),
      upper: uniform(0.34).setGroup(renderGroup),
      lower: uniform(0.43).setGroup(renderGroup),
      tilt: uniform(0).setGroup(renderGroup),
      squint: uniform(0).setGroup(renderGroup),
      pitch: uniform(0).setGroup(renderGroup),
      peak: uniform(0).setGroup(renderGroup),
      /** An epicanthic fold's reach over the inner corner, 0..1. */
      epicanthus: uniform(0).setGroup(renderGroup),
      /** Frontalis: how far it lifts the brow, mm (EyeStage: gaze, interest, a greeting flash). */
      brow: uniform(0).setGroup(renderGroup),
      /** Corrugator: how hard it draws the brow's head down and in, 0..1 (glare, concentration). */
      frown: uniform(0).setGroup(renderGroup),
    },
    /**
     * The person's skin and lid shape (EyeIdentity.skin / .lids): Monk tone as
     * a colour, undertone, translucency, pores, lines; the crease's height and
     * depth (mm), and how much skin hoods over it.
     */
    skin: {
      tone: uniform(new Color("#d7bd96")).setGroup(renderGroup),
      undertone: uniform(0.5).setGroup(renderGroup),
      translucency: uniform(0.5).setGroup(renderGroup),
      pores: uniform(0.5).setGroup(renderGroup),
      lines: uniform(0.3).setGroup(renderGroup),
      freckles: uniform(0).setGroup(renderGroup),
      creaseD: uniform(7.5).setGroup(renderGroup),
      creaseDepth: uniform(0.5).setGroup(renderGroup),
      hood: uniform(0).setGroup(renderGroup),
    },
    /**
     * The person's lashes (EyeIdentity.lashes), and what moves them per frame:
     * each row's lag behind its lid (radians of extra curl at the tip, from a
     * spring driven by the margin's speed) and how many mm one device pixel
     * spans at the eye, so a strand thinner than a pixel keeps its coverage.
     */
    lashes: {
      upper: uniform(1).setGroup(renderGroup),
      lower: uniform(1).setGroup(renderGroup),
      length: uniform(1).setGroup(renderGroup),
      curl: uniform(0.5).setGroup(renderGroup),
      clump: uniform(0.5).setGroup(renderGroup),
      mascara: uniform(0).setGroup(renderGroup),
      root: uniform(new Color("#17110d")).setGroup(renderGroup),
      tip: uniform(new Color("#2a1f17")).setGroup(renderGroup),
      lagUpper: uniform(0).setGroup(renderGroup),
      lagLower: uniform(0).setGroup(renderGroup),
      pxMm: uniform(0.04).setGroup(renderGroup),
    },
    /**
     * The tears (bake/tear.ts holds the film itself): the meniscus bead's
     * width along the margins, mm; how wet it looks, 1 at rest, more just
     * after a blink and with reflex tears; and reflex tearing, 0..1.
     */
    tear: {
      meniscus: uniform(0.24).setGroup(renderGroup),
      wet: uniform(1).setGroup(renderGroup),
      tearing: uniform(0).setGroup(renderGroup),
    },
    /**
     * The camera: where it focuses (distance from the lens along its axis,
     * mm), how far from that plane things go fully soft (mm), and the bokeh's
     * size in pixels at a 720-pixel-tall frame.
     */
    cam: {
      focus: uniform(200).setGroup(renderGroup),
      focal: uniform(9).setGroup(renderGroup),
      bokeh: uniform(5).setGroup(renderGroup),
    },
    /**
     * The era's lens (look.ts EraLens), damped toward each era's numbers;
     * `artefact` is an index into LENS_ARTEFACTS, `on` the kill switch,
     * `motion` how fast the reflection is crossing the frame (UV per second),
     * which the comet tail and the interlace answer, and `catchlight` the
     * flash's hard dot in the cornea.
     */
    lens: {
      on: uniform(1).setGroup(renderGroup),
      grain: uniform(0).setGroup(renderGroup),
      grainSize: uniform(1).setGroup(renderGroup),
      halation: uniform(0).setGroup(renderGroup),
      chroma: uniform(0).setGroup(renderGroup),
      vignette: uniform(0.3).setGroup(renderGroup),
      lift: uniform(0).setGroup(renderGroup),
      gamma: uniform(1).setGroup(renderGroup),
      gain: uniform(1).setGroup(renderGroup),
      sat: uniform(1).setGroup(renderGroup),
      wb: uniform(0).setGroup(renderGroup),
      split: uniform(0).setGroup(renderGroup),
      sharpen: uniform(0).setGroup(renderGroup),
      artefact: uniform(0).setGroup(renderGroup),
      amount: uniform(0).setGroup(renderGroup),
      bloom: uniform(1).setGroup(renderGroup),
      aperture: uniform(1).setGroup(renderGroup),
      isolate: uniform(0).setGroup(renderGroup),
      phosphor: uniform(0).setGroup(renderGroup),
      motion: uniform(new Vector2()).setGroup(renderGroup),
      catchlight: uniform(0).setGroup(renderGroup),
      /** A new value each frame, frozen under reduced motion, for the grain. */
      seed: uniform(0).setGroup(renderGroup),
    },
    /**
     * Ten ways of seeing (post/era-medium.ts), a dev experiment, as era
     * numbers (0 none): the era on screen, and the eras either side glimpsed
     * at the edges; how far each glimpse reaches in at the eye's line (a share
     * of the width: a sliver at rest, past the far edge as it takes over); how
     * long the current era has been up, s; and the pupil on screen (UV) with
     * its radius as a share of the height.
     */
    medium: {
      cur: uniform(0).setGroup(renderGroup),
      prev: uniform(0).setGroup(renderGroup),
      next: uniform(0).setGroup(renderGroup),
      reachL: uniform(0).setGroup(renderGroup),
      reachR: uniform(0).setGroup(renderGroup),
      age: uniform(0).setGroup(renderGroup),
      pupil: uniform(new Vector2(0.5, 0.5)).setGroup(renderGroup),
      pupilR: uniform(0.02).setGroup(renderGroup),
    },
    /** The globe's radius, mm (anatomical 12). The stand-in iris is measured against it. */
    ballRadius: uniform(12).setGroup(renderGroup),
    /** How strongly the wet surfaces mirror the era's screen. */
    reflect: uniform(0.7).setGroup(renderGroup),
    /**
     * The screen the eye is looking at (look.ts ScreenLight): `dir` is where
     * its light comes from; the mirror image is the rectangle at `center`,
     * facing the eye along `normal`, `size` mm, with its own right and up as
     * the person sees it.
     */
    light: {
      dir: uniform(new Vector3(-0.416, 0.476, 0.774)).setGroup(renderGroup),
      center: uniform(new Vector3(-84, 99, 300)).setGroup(renderGroup),
      normal: uniform(new Vector3(0, 0, -1)).setGroup(renderGroup),
      right: uniform(new Vector3(-1, 0, 0)).setGroup(renderGroup),
      up: uniform(new Vector3(0, 1, 0)).setGroup(renderGroup),
      size: uniform(new Vector2(1914, 1164)).setGroup(renderGroup),
    },
    /**
     * The era's second light (look.ts FillLight), if any: where its light
     * comes from, its colour × strength (0 when there is none), and the small
     * shape it makes in the cornea: centre, facing, axes and size (mm), and
     * how round (0 a bar, 1 a disc).
     */
    fill: {
      dir: uniform(new Vector3(0, 1, 0)).setGroup(renderGroup),
      color: uniform(new Color(0, 0, 0)).setGroup(renderGroup),
      center: uniform(new Vector3(0, 500, 400)).setGroup(renderGroup),
      normal: uniform(new Vector3(0, -0.8, -0.6)).setGroup(renderGroup),
      right: uniform(new Vector3(-1, 0, 0)).setGroup(renderGroup),
      up: uniform(new Vector3(0, 0.6, -0.8)).setGroup(renderGroup),
      size: uniform(new Vector2(100, 100)).setGroup(renderGroup),
      round: uniform(0).setGroup(renderGroup),
    },
    /** The person's white of the eye (EyeIdentity.sclera). */
    sclera: {
      tint: uniform(new Color("#ebe8df")).setGroup(renderGroup),
      vessels: uniform(0.4).setGroup(renderGroup),
      age: uniform(0.3).setGroup(renderGroup),
    },
    /** The iris: two baked people (A, B) and how far the crossfade is toward B. */
    iris: {
      weightB: uniform(0).setGroup(renderGroup),
      /** Each set's resting pupil, the one its features were laid out at. */
      restA: uniform(0.34).setGroup(renderGroup),
      restB: uniform(0.34).setGroup(renderGroup),
      /** Post-saccadic wobble: the membrane lags the turn, mm. */
      wobble: uniform(new Vector2()).setGroup(renderGroup),
      /** Relief depth, mm, for parallax under the cornea. */
      relief: uniform(0.22).setGroup(renderGroup),
    },
    /** The era's screen: what the screen pass draws, and what lights the room. */
    screen: screenUniforms(),
  };
}

export type EyeUniforms = ReturnType<typeof createEyeUniforms>;

/** Copies the screen driver's state into the uniform nodes. */
export function writeScreenUniforms(u: ScreenUniforms, s: ScreenState) {
  u.time.value = s.time;
  u.bg.value.copy(s.bg);
  u.ink.value.copy(s.ink);
  u.panel.value.copy(s.panel);
  u.accent.value.copy(s.accent);
  u.bar.value.copy(s.bar);
  u.styleA.value = s.styleA;
  u.styleB.value = s.styleB;
  u.styleMix.value = s.styleMix;
  u.scroll.value = s.scroll;
  u.scan.value = s.scan;
  u.pixel.value = s.pixel;
  u.dither.value = s.dither;
  u.posterize.value = s.posterize;
  u.glow.value = s.glow;
  u.wobble.value = s.wobble;
  u.warp.value = s.warp;
  u.tech.value = s.tech;
  u.crt.value = s.crt;
}

/** Indexes match the debugView uniform. Switching views never recompiles. */
export const DEBUG_VIEWS = ["final", "normal", "lit", "masks", "screen", "spec", "socket", "iris", "tear", "focus", "emissive"] as const;
export type DebugView = (typeof DEBUG_VIEWS)[number];
