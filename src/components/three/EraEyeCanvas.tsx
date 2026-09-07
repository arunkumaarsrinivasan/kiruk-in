"use client";

/**
 * EraEyeCanvas — the era eye as a full-viewport WebGL surface.
 *
 * One fragment shader draws the eye; this file drives it. The gaze moves in
 * saccades rather than gliding (eyes dart, hold, dart again), blinks run a
 * shaped close/hold/open curve with the occasional double-blink, and the
 * reflected screen scrolls its own content. Every era uniform is damped, so
 * scrubbing the timeline morphs one era's screen into the next.
 *
 * Cost discipline, because this is a full-screen procedural shader that a
 * visitor may leave open:
 *  · everything derived from the era (palette, THREE.Colors, luminance, the
 *    painted page) is memoised per era, never rebuilt per frame;
 *  · the era's interface renders into its own target at 24fps, not 60 — it is
 *    a blurred reflection, and it regenerates a mipmap chain every time;
 *  · the drawing buffer is held to a pixel budget and backs off further if
 *    frames run long;
 *  · nothing renders at all while the tab is in the background.
 */

import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer as PostComposer,
  EffectPass,
  KernelSize,
  NoiseEffect,
  RenderPass,
  VignetteEffect,
} from "postprocessing";
import * as THREE from "three";
import type { ThemeConfig } from "@/data/portfolio-data";
import {
  ERA_EYE_FRAG,
  ERA_EYE_VERT,
  ERA_UI_FRAG,
} from "@/components/three/era-eye-shader";
import { type EraVisual, getEraVisual } from "@/lib/era-visuals";
import {
  createEraScreenTexture,
  type EraScreenTexture,
} from "@/components/three/era-screen-texture";
import { eyeFrame } from "@/lib/era-eye-frame";

/**
 * How long the gaze keeps following a pointer that has stopped arriving. A
 * finger leaves the glass between swipes, and an eye frozen mid-stare is worse
 * than one that goes back to looking around the room.
 */
const POINTER_HOLD = 2.2;

/** The span the era's page is authored to be legible at — a desktop's. */
const REF_SPAN = 1.09;

/**
 * Resolution the era's interface is drawn at before the eye samples it. It is
 * only ever seen defocused, mirrored and shrunk into a cornea, so this is a
 * long way below what the eye pass itself runs at.
 */
const UI_W = 768;
const UI_H = 432;
/** Frames per second for that pass. A reflection does not need 60. */
const UI_FPS = 24;
/** Pupil scale at which the exit transition has swallowed the page. */
const EXIT_DILATE = 13;

/** Fragments the eye pass may shade per frame before quality gives way. */
const PIXEL_BUDGET = 2_400_000;
const DPR_MIN = 0.7;
const DPR_MAX = 1.5;

/** Blink shape, in seconds: snap shut, hold, open slower. */
const BLINK_CLOSE = 0.07;
const BLINK_HOLD = 0.04;
const BLINK_OPEN = 0.19;
const BLINK_TOTAL = BLINK_CLOSE + BLINK_HOLD + BLINK_OPEN;

function blinkCurve(t: number): number {
  let v: number;
  if (t < BLINK_CLOSE) v = t / BLINK_CLOSE;
  else if (t < BLINK_CLOSE + BLINK_HOLD) v = 1;
  else if (t < BLINK_TOTAL) v = 1 - (t - BLINK_CLOSE - BLINK_HOLD) / BLINK_OPEN;
  else return 0;
  v = Math.min(1, Math.max(0, v));
  return v * v * (3 - 2 * v);
}

function clampHex(h: string | undefined, fallback: string): string {
  if (!h) return fallback;
  if (h[0] !== "#") return h;
  let s = h.slice(1);
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return "#" + s.slice(0, 6);
}

function eraPalette(era: ThemeConfig) {
  return {
    bg: clampHex(era.colors.background, "#050505"),
    primary: clampHex(era.colors.primary, "#2438e0"),
    secondary: clampHex(era.colors.secondary || era.colors.accent, "#e11d74"),
    accent: clampHex(era.colors.accent || era.colors.secondary, "#b21e8f"),
    text: clampHex(era.colors.text, "#f5f5f5"),
  };
}

type EraPalette = ReturnType<typeof eraPalette>;

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
function screenLuminance(pal: EraPalette): number {
  return Math.min(
    1,
    lumOfHex(pal.bg) * 0.7 + lumOfHex(pal.primary) * 0.2 + lumOfHex(pal.accent) * 0.2,
  );
}

function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

/** Device pixel ratio that keeps the eye pass inside its fragment budget. */
function budgetDpr(): number {
  if (typeof window === "undefined") return 1;
  const css = Math.max(window.innerWidth * window.innerHeight, 1);
  const fit = Math.sqrt(PIXEL_BUDGET / css);
  const device = window.devicePixelRatio || 1;
  return Math.max(DPR_MIN, Math.min(DPR_MAX, device, fit));
}

interface EyeSceneProps {
  era: ThemeConfig;
  /** Eye height as a fraction of viewport height. */
  eyeHeight: number;
  exiting: boolean;
  reduce: boolean;
  interactive: boolean;
}

function EraEyeScene({
  era,
  eyeHeight,
  exiting,
  reduce,
  interactive,
}: EyeSceneProps) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const setDpr = useThree((s) => s.setDpr);

  // The post chain is built directly on `postprocessing` rather than the R3F
  // wrapper: the wrapper JSON-stringifies its props to memoise effect args, so
  // handing it a ref (needed to animate effect params per frame) throws on the
  // circular structure.
  const fx = useMemo(() => {
    const bloom = new BloomEffect({
      intensity: 0.25,
      luminanceThreshold: 0.24,
      luminanceSmoothing: 0.5,
      mipmapBlur: true,
      kernelSize: KernelSize.MEDIUM,
    });
    // the glow is wide and soft; it never needed full resolution
    bloom.resolution.scale = 0.4;
    const chroma = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0, 0),
      radialModulation: false,
      modulationOffset: 0,
    });
    const noise = new NoiseEffect({ premultiply: true });
    noise.blendMode.opacity.value = 0;
    const vignette = new VignetteEffect({ offset: 0.2, darkness: 0.55 });
    return { bloom, chroma, noise, vignette };
  }, []);

  const composer = useMemo(() => {
    const c = new PostComposer(gl, { frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new EffectPass(camera, fx.bloom, fx.chroma, fx.noise, fx.vignette));
    return c;
  }, [gl, scene, camera, fx]);

  useEffect(
    () => () => {
      composer.dispose();
      fx.bloom.dispose();
      fx.chroma.dispose();
      fx.noise.dispose();
      fx.vignette.dispose();
    },
    [composer, fx],
  );

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size.width, size.height, dpr]);

  /** The portfolio page, painted by canvas 2D and repainted on era change. */
  const code = useMemo<EraScreenTexture>(() => createEraScreenTexture(), []);
  useEffect(() => () => code.dispose(), [code]);

  /* ---- everything the era decides, resolved once per era ---------------- */

  const visual = useMemo<EraVisual>(() => getEraVisual(era.id), [era.id]);
  const pal = useMemo(() => eraPalette(era), [era]);
  const lum = useMemo(() => screenLuminance(pal), [pal]);
  /**
   * How much this era's page is already glare. Bloom is authored per era for
   * its own gloss — 2003 wants a lot of it — but a white page reflected in a
   * wet cornea supplies most of that glow by itself, and the authored amount
   * on top of it filled the iris with light and nothing else.
   */
  const glare = useMemo(
    () => Math.min(1, Math.max(0, (lum - 0.3) / 0.62)),
    [lum],
  );
  /**
   * Parsed colours. Building these per frame meant five hex parses and five
   * allocations every 16ms — the garbage that made a long visit crawl.
   */
  const eraCol = useMemo(
    () => ({
      bg: new THREE.Color(pal.bg),
      ink: new THREE.Color(pal.text),
      panel: new THREE.Color(pal.primary),
      accent: new THREE.Color(pal.accent),
      bar: new THREE.Color(pal.secondary),
    }),
    [pal],
  );

  useEffect(() => {
    code.update(era.id, {
      bg: pal.bg,
      ink: pal.text,
      panel: pal.primary,
      accent: pal.accent,
      bar: pal.secondary,
    });
  }, [code, era.id, pal]);

  /** Uniforms shared by both passes — the same objects, read twice a frame. */
  const shared = useMemo(
    () => ({
      uTime: { value: 0 },
      uUiBg: { value: new THREE.Color("#050505") },
      uUiInk: { value: new THREE.Color("#ffffff") },
      uUiPanel: { value: new THREE.Color("#2438e0") },
      uUiAccent: { value: new THREE.Color("#b21e8f") },
      uUiBar: { value: new THREE.Color("#e11d74") },
      uStyleA: { value: 2 },
      uStyleB: { value: 2 },
      uStyleMix: { value: 1 },
      uScroll: { value: 0 },
      uUiScan: { value: 0 },
      uUiPixel: { value: 0 },
      uUiDither: { value: 0 },
      uUiPosterize: { value: 0 },
      uUiGlow: { value: 0 },
      uUiWobble: { value: 0 },
      uUiWarp: { value: 0 },
      uUiTech: { value: 0 },
      uUiPx: { value: new THREE.Vector2(1 / UI_W, 1 / UI_H) },
      uCodeTex: { value: code.texture },
    }),
    [code],
  );

  /** Pass one: the era's interface, drawn into a texture with mipmaps. */
  const ui = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(UI_W, UI_H, {
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: true,
      depthBuffer: false,
      stencilBuffer: false,
    });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: ERA_EYE_VERT,
      fragmentShader: ERA_UI_FRAG,
      uniforms: shared,
      depthTest: false,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(geometry, material));
    return { target, scene, camera, material, geometry };
  }, [shared]);

  useEffect(
    () => () => {
      ui.target.dispose();
      ui.material.dispose();
      ui.geometry.dispose();
    },
    [ui],
  );

  const uniforms = useMemo(
    () => ({
      uScreenTex: { value: ui.target.texture },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uSpan: { value: 1 },
      uOffsetY: { value: 0.03 },
      uMip: { value: 0 },
      uUnit: { value: 0.001 },
      uGaze: { value: new THREE.Vector2(0, 0) },
      uBlink: { value: 0 },
      uDilate: { value: 1 },
      uFade: { value: 0 },

      uIris: { value: new THREE.Color("#2438e0") },

      // the same colour objects the interface pass uses
      uUiBg: shared.uUiBg,
      uUiInk: shared.uUiInk,
      uUiPanel: shared.uUiPanel,
      uUiAccent: shared.uUiAccent,

      uReflect: { value: 0.7 },
      uPupil: { value: 0.34 },
      uScreenLum: { value: 0.5 },
      uCrt: { value: 0 },
    }),
    [ui, shared],
  );

  /** Damped post-processing state — effects are driven imperatively. */
  const post = useRef({ bloom: 0.35, chroma: 0, noise: 0.02, vignette: 0.3 });

  const styleInit = useRef(false);
  /** Brief constriction when the era — and the light — changes. */
  const pupilPulse = useRef(0);
  /** The era the pupil last responded to, and how bright that one was. */
  const lastEra = useRef(era.id);
  const lastLum = useRef(lum);
  const gaze = useRef({ x: 0, y: 0 });
  /** Where the eye has decided to look; it jumps here, it does not glide. */
  const fixation = useRef({ x: 0, y: 0, hold: 0.4 });
  const blink = useRef({ t: 99, next: 2.5 });
  const scroll = useRef(0);
  const bufSize = useRef(new THREE.Vector2());
  /** Window-level pointer — the canvas itself is pointer-events: none. */
  const pointer = useRef({ x: 0, y: 0, seen: -1e3 });
  /** Seconds owed to the interface pass, and the frame-time watchdog. */
  const uiDue = useRef(1);
  const health = useRef({ ema: 1 / 60, cool: 2, floor: DPR_MIN });
  const hidden = useRef(false);

  /**
   * The light reflex. A step change in the light is what a pupil is for: it
   * snaps down when the new era's screen is brighter and drifts open when it
   * is darker, and it does it on the era changing rather than on the layout
   * changing, because two adjacent years can share a layout.
   */
  useEffect(() => {
    if (lastEra.current === era.id) return;
    lastEra.current = era.id;
    const brighter = lum - lastLum.current;
    lastLum.current = lum;
    pupilPulse.current =
      0.028 + Math.max(0, brighter) * 0.20 - Math.max(0, -brighter) * 0.07;
  }, [era.id, lum]);

  useEffect(() => {
    const sync = () => {
      hidden.current = document.hidden;
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // A finger counts as much as a cursor: dragging across a phone should be
  // met by an eye that turns to follow it. What a finger does not do is stay
  // on the glass, so the last position is only trusted for a couple of seconds
  // (see POINTER_HOLD) before the gaze goes back to looking around the room.
  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      pointer.current.y = (e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
      pointer.current.seen = performance.now() / 1000;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
    };
  }, [interactive, reduce]);

  useFrame((_state, delta) => {
    // Nothing on screen is worth a frame while the tab is in the background.
    if (hidden.current) return;

    const dt = Math.min(delta, 0.05);
    const u = uniforms;

    if (!reduce) u.uTime.value += dt;
    shared.uTime.value = u.uTime.value;

    gl.getDrawingBufferSize(bufSize.current);
    u.uRes.value.copy(bufSize.current);

    // Framing — how far back the shot stands and where the eye sits in it —
    // is shared with the dial and the picker's hit-testing, so all three agree
    // about where the iris is on a phone.
    const frame = eyeFrame(size.width, size.height, eyeHeight);
    u.uSpan.value = frame.span;
    u.uOffsetY.value = frame.offsetY;
    u.uUnit.value = frame.span / Math.max(bufSize.current.y, 1);
    // The further back the shot stands, the fewer pixels a texel of the era's
    // page gets, so it is sampled out of a coarser mip. Without this a phone
    // turns a dithered terminal into a snowstorm of white specks.
    u.uMip.value = Math.max(0, Math.log2(frame.span / REF_SPAN)) * 1.15;

    // --- gaze --------------------------------------------------------------
    let tx = 0;
    let ty = 0;
    const fresh =
      interactive &&
      performance.now() / 1000 - pointer.current.seen < POINTER_HOLD;
    if (fresh && !reduce) {
      tx = THREE.MathUtils.clamp(pointer.current.x, -1, 1);
      ty = THREE.MathUtils.clamp(-pointer.current.y, -1, 1);
    } else if (!reduce) {
      // Idle drift, so the eye still feels alive between touches.
      tx = Math.sin(u.uTime.value * 0.42) * 0.5;
      ty = Math.sin(u.uTime.value * 0.31 + 1.1) * 0.28;
    }
    // A real eye holds a fixation, then jumps. Only re-target once the target
    // has drifted far enough and the hold has expired.
    const fix = fixation.current;
    fix.hold -= dt;
    const drifted = Math.hypot(tx - fix.x, ty - fix.y);
    if (reduce) {
      fix.x = tx;
      fix.y = ty;
    } else if (fix.hold <= 0 && drifted > 0.07) {
      fix.x = tx;
      fix.y = ty;
      fix.hold = 0.1 + Math.random() * 0.26;
    }
    // the jump itself is fast; ocular microtremor keeps it from ever settling
    gaze.current.x = damp(gaze.current.x, fix.x, reduce ? 60 : 24, dt);
    gaze.current.y = damp(gaze.current.y, fix.y, reduce ? 60 : 24, dt);
    const tremor = reduce ? 0 : 0.006;
    u.uGaze.value.set(
      gaze.current.x + Math.sin(u.uTime.value * 7.3) * tremor,
      gaze.current.y + Math.sin(u.uTime.value * 5.1 + 2.0) * tremor * 0.7,
    );

    // --- blink -------------------------------------------------------------
    if (!reduce && !exiting) {
      blink.current.next -= dt;
      if (blink.current.next <= 0) {
        blink.current.t = 0;
        // roughly one blink in five comes as a quick double
        blink.current.next =
          Math.random() < 0.18 ? BLINK_TOTAL + 0.11 : 2.4 + Math.random() * 4.6;
      }
      blink.current.t += dt;
    }
    u.uBlink.value = reduce ? 0 : blinkCurve(blink.current.t);

    // --- the reflected screen scrolls its own content ----------------------
    if (!reduce) scroll.current = (scroll.current + visual.scroll * dt) % 1;
    shared.uScroll.value = scroll.current;

    // --- intro / exit ------------------------------------------------------
    u.uFade.value = damp(u.uFade.value, 1, reduce ? 30 : 5, dt);
    u.uDilate.value = damp(
      u.uDilate.value,
      exiting ? EXIT_DILATE : 1,
      exiting ? 5 : 4,
      dt,
    );

    // --- palette -----------------------------------------------------------
    const k = reduce ? 1 : 1 - Math.exp(-5 * dt);
    u.uIris.value.lerp(eraCol.panel, k);
    // The reflected screen is the era's own palette: page ground, body text,
    // primary panels, accent highlights, secondary chrome.
    shared.uUiBg.value.lerp(eraCol.bg, k);
    shared.uUiInk.value.lerp(eraCol.ink, k);
    shared.uUiPanel.value.lerp(eraCol.panel, k);
    shared.uUiAccent.value.lerp(eraCol.accent, k);
    shared.uUiBar.value.lerp(eraCol.bar, k);

    // --- era params ---------------------------------------------------------
    const L = 4.5;

    // --- pupil: a muscle, not a number --------------------------------------
    u.uScreenLum.value = damp(u.uScreenLum.value, lum, 3, dt);
    // the reflex releases slowly — a pupil re-opens over seconds, not frames
    pupilPulse.current = damp(pupilPulse.current, 0, 1.5, dt);
    const hippus = reduce
      ? 0
      : Math.sin(u.uTime.value * 1.7) * 0.016 +
        Math.sin(u.uTime.value * 0.63 + 1.3) * 0.010;
    const pupilTarget =
      visual.pupil * (1 - 0.3 * lum) + hippus - pupilPulse.current;
    // the light reflex is fast to constrict, slow to open again
    const opening = pupilTarget > u.uPupil.value;
    u.uPupil.value = damp(u.uPupil.value, pupilTarget, opening ? 1.6 : 9, dt);
    u.uReflect.value = damp(u.uReflect.value, visual.reflect, L, dt);
    u.uCrt.value = damp(u.uCrt.value, visual.crt, L, dt);
    // Layouts cannot be interpolated, so a change crossfades A into B.
    if (!styleInit.current) {
      styleInit.current = true;
      shared.uStyleA.value = visual.style;
      shared.uStyleB.value = visual.style;
      shared.uStyleMix.value = 1;
    }
    if (visual.style !== shared.uStyleB.value) {
      shared.uStyleA.value = shared.uStyleB.value;
      shared.uStyleB.value = visual.style;
      shared.uStyleMix.value = 0;
    }
    shared.uStyleMix.value = Math.min(
      1,
      shared.uStyleMix.value + dt * (reduce ? 8 : 2.6),
    );
    shared.uUiScan.value = damp(shared.uUiScan.value, visual.scan, L, dt);
    shared.uUiPixel.value = damp(shared.uUiPixel.value, visual.pixel, L, dt);
    shared.uUiDither.value = damp(shared.uUiDither.value, visual.dither, L, dt);
    shared.uUiPosterize.value = damp(
      shared.uUiPosterize.value,
      visual.posterize,
      L,
      dt,
    );
    shared.uUiGlow.value = damp(shared.uUiGlow.value, visual.glow, L, dt);
    shared.uUiWobble.value = damp(
      shared.uUiWobble.value,
      reduce ? 0 : visual.wobble,
      L,
      dt,
    );
    shared.uUiWarp.value = damp(
      shared.uUiWarp.value,
      reduce ? 0 : visual.warp,
      L,
      dt,
    );
    // Panel technology crossfades with everything else, so a scrub through the
    // ring walks from a cathode-ray tube to an OLED without a cut.
    shared.uUiTech.value = damp(shared.uUiTech.value, visual.tech, L, dt);

    // --- post-processing ----------------------------------------------------
    const p = post.current;
    p.bloom = damp(p.bloom, visual.bloom * (1 - 0.5 * glare), L, dt);
    p.chroma = damp(p.chroma, visual.chroma, L, dt);
    p.noise = damp(p.noise, reduce ? 0 : visual.noise, L, dt);
    p.vignette = damp(p.vignette, visual.vignette, L, dt);

    fx.bloom.intensity = p.bloom;
    fx.chroma.offset.set(p.chroma, p.chroma * 0.6);
    fx.noise.blendMode.opacity.value = p.noise;
    // the era only modulates it; the room is dark in every year
    fx.vignette.darkness = 0.34 + p.vignette * 0.7;

    // --- pass one: the era's interface, at its own frame rate ---------------
    // It is a defocused reflection and it rebuilds a mipmap chain on every
    // render, so it runs at UI_FPS. A style crossfade forces it to keep up.
    uiDue.current += dt;
    if (uiDue.current >= 1 / UI_FPS || shared.uStyleMix.value < 1) {
      uiDue.current = 0;
      gl.setRenderTarget(ui.target);
      gl.render(ui.scene, ui.camera);
      gl.setRenderTarget(null);
    }

    // --- pass two: the eye, through the post chain --------------------------
    composer.render(dt);

    // --- and a watchdog on the cost of all that -----------------------------
    // Integrated GPUs cannot hold this shader at full resolution; rather than
    // dropping frames for the whole visit, give up pixels once and stay smooth.
    const h = health.current;
    h.ema += (dt - h.ema) * 0.05;
    h.cool -= dt;
    if (h.cool <= 0 && h.ema > 1 / 34 && dpr > h.floor) {
      h.cool = 3;
      h.ema = 1 / 60;
      setDpr(Math.max(h.floor, dpr * 0.78));
    }
  }, 1);

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={ERA_EYE_VERT}
        fragmentShader={ERA_EYE_FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export interface EraEyeCanvasProps {
  era: ThemeConfig;
  /** Eye height as a fraction of viewport height (width usually caps it). */
  eyeHeight?: number;
  exiting?: boolean;
  reduce?: boolean;
  /** Cursor-tracked gaze (off for coarse pointers). */
  interactive?: boolean;
  className?: string;
}

export default function EraEyeCanvas({
  era,
  eyeHeight = 1,
  exiting = false,
  reduce = false,
  interactive = true,
  className,
}: EraEyeCanvasProps) {
  const dpr = useMemo(budgetDpr, []);

  return (
    <Canvas
      className={className}
      dpr={dpr}
      flat
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
    >
      <EraEyeScene
        era={era}
        eyeHeight={eyeHeight}
        exiting={exiting}
        reduce={reduce}
        interactive={interactive}
      />
    </Canvas>
  );
}
