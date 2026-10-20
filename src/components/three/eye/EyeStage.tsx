"use client";

/**
 * EyeStage — the TSL eye, on WebGPURenderer.
 *
 * The successor to EraEyeCanvas, built layer by layer in /lab/eye
 * (docs/EYE_TSL_PLAN.md). Same contract as the live eye: an era, the framing,
 * exiting, reduce, interactive, and an onReady once the first faded-in frame
 * is up, so the loader can crossfade it over its poster.
 *
 * The renderer picks WebGPU or WebGL2 once, at init. Everything compiles
 * behind the poster (compileAsync) before the first frame is drawn, and the
 * node graphs are never rebuilt after that: eras, gaze and blinks only write
 * uniforms.
 *
 * Cost discipline, carried over from the live eye:
 *  · nothing renders while the tab is in the background;
 *  · an idle stage drops to every third frame until a pointer arrives;
 *  · the drawing buffer is held to a pixel budget and backs off if frames run long.
 */

import React, { Component, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import type { ThemeConfig } from "@/data/portfolio-data";
import { eyeFrame } from "@/lib/era-eye-frame";
import { getEraVisual } from "@/lib/era-visuals";
import {
  ANATOMY,
  BELL_PITCH,
  CAMERA_FOV,
  CORNEA_CAP,
  CORNEA_CENTER_Z,
  FRAME_PLANE_Z,
  GAZE_PITCH,
  GAZE_YAW,
  MM_PER_UNIT,
} from "./anatomy";
import { DPR_MIN, TIERS, budgetDpr, pickTier, readTierSignals, type EyeTier } from "./tiers";
import { createEyeUniforms, writeScreenUniforms, type EyeUniforms } from "./uniforms";
import { ScreenPages } from "./screen-pages";
import { BlinkRig, damp } from "./rig/motion";
import { GazeRig, type GazeSample } from "./rig/gaze";
import { ScreenDriver, type ScreenState } from "./rig/screen";
import { PupilRig, restingPupil } from "./rig/pupil";
import { eraPalette, paletteColors, screenLuminance } from "./look";
import { roomMesh } from "./nodes/room";
import { scleraMaterial } from "./nodes/sclera";
import { corneaMaterial } from "./nodes/cornea";
import { caruncleGeometry, caruncleMaterial, lidGeometry, lidMaterial, socketMaterial } from "./nodes/lid-mesh";
import { bakeBrow } from "./bake/brow";
import { createSkinFaceBake } from "./bake/skin-face";
import { createLashes } from "./nodes/lashes";
import { meniscusGeometry, meniscusMaterial } from "./nodes/meniscus";
import { createTearFilm } from "./bake/tear";
import { fissureAngles } from "./nodes/margins";
import { createSkinBake } from "./bake/skin";
import { createVesselBake } from "./bake/vessels";
import { createIrisBake } from "./bake/iris";
import { DEFAULT_IDENTITY, LID_SHAPES, MONK_TONES, getEyeIdentity } from "./identity";
import { CURSOR_KIND, LENS_ARTEFACTS, getEraLook, type EraLens, type GazePattern } from "./look";
import { UI_FPS, createScreenPass } from "./nodes/screen";
import { createEyePipeline } from "./post/pipeline";
import { ERA_MEDIA, mediumOf } from "./post/era-medium";
import { createEraScreenTexture, type EraScreenTexture } from "@/components/three/era-screen-texture";

/** How long the gaze keeps following a pointer that has stopped arriving. */
const POINTER_HOLD = 2.2;
/** The stage counts as up once its intro fade has arrived this far. */
const READY_AT = 0.97;
/** The span the era's page is authored to be legible at — a desktop's. */
const REF_SPAN = 1.09;

export const EYE_LAYERS = ["room", "eyeball", "cornea", "lids", "lashes", "tears", "socket"] as const;
export type EyeLayer = (typeof EYE_LAYERS)[number];

export interface EyeStageInfo {
  backend: "webgpu" | "webgl2";
  tier: EyeTier;
}

export interface EyeStageStats {
  fps: number;
  /** CPU time spent issuing the frame, ms. */
  cpuMs: number;
  /** GPU time for the frame, ms, when the backend can measure it. */
  gpuMs: number | null;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  dpr: number;
}

/** What the lab can reach into. The live loader never passes one. */
export interface EyeStageControl {
  uniforms: EyeUniforms;
  info: EyeStageInfo;
  stats: EyeStageStats;
  setLayerVisible(layer: EyeLayer, visible: boolean): void;
  isLayerVisible(layer: EyeLayer): boolean;
  blink(): void;
  /** Hold the gaze here instead of following the pointer; null releases it. */
  holdGaze(target: { x: number; y: number } | null): void;
  /** Hold the pupil at this share of the iris; null releases it. */
  holdPupil(value: number | null): void;
  /** The screen pass's live state, so the lab's GLSL reference runs off the same clock. */
  screenState: ScreenState;
  /** Pupil diameter now, mm. */
  pupilMm(): number;
  /** The last few seconds of pupil diameter, mm, at ~30 Hz (oldest first). */
  pupilTrace(): number[];
  /** Add light on top of the screen, in log₁₀ millilamberts (0 takes it away). */
  lightStep(logL: number): void;
  /** A flash on the camera's axis: red-eye, then the reflex. */
  flash(): void;
  /** Hold the red reflex at this strength (a real one lasts ~50 ms); null releases it. */
  holdRedReflex(value: number | null): void;
  /** Leave out the hippus, so the reflex's timing can be read cleanly. */
  stillPupil(still: boolean): void;
  /** Hold the lids part-way through a blink (0 open, 1 shut); null releases them. */
  holdBlink(value: number | null): void;
  /** Hold the squint (0 none, 1 full); null lets the screen's glare drive it. */
  holdSquint(value: number | null): void;
  /** Stop the eye blinking on its own (a stare), so the tear film breaks up. */
  stare(on: boolean): void;
  /** Reflex tears, as a fast sweep brings on. */
  reflexTears(): void;
  /** Seconds since the last blink, and how teary the eye is (0..1). */
  tearInfo(): { sinceBlink: number; tearing: number };
  /** Look the way another era does (null: this era's own way). */
  setGazePattern(pattern: GazePattern | null): void;
  /** Ten ways of seeing: show this medium (an era number, 1..10; 0 none) whatever the era, or null for the era's own. */
  setMedium(id: number | null): void;
  /** The last ~6 s of gaze, degrees, ~120 Hz, with what the eye was doing. */
  gazeTrace(): GazeSample[];
  /** The way of looking in force, and the mean seconds between blinks. */
  gazeInfo(): { pattern: GazePattern; blinkEvery: number };
  /** The era's lens on or off (off: a clean photograph). */
  lensOn(on: boolean): void;
  /** The screen shows the eras' real home pages (off: the painted stand-in, as the GLSL eye has). */
  pagesOn(on: boolean): void;
  /** Which era's page each screen slot holds, and how far the fades are. */
  pagesInfo(): { eraA: string | null; eraB: string | null; mix: number; on: number };
  /** Hold the focus at this depth (mm toward the camera from the globe's centre); null racks to the pointer. */
  holdFocus(z: number | null): void;
  /** Where the camera is focused now, mm from the globe's centre toward it. */
  focusZ(): number;
  /** The last 200 saccades (rig/gaze.ts `log`), and the rig's clock. */
  gazeLog(): { now: number; saccades: { t: number; amp: number; d: number; micro: boolean }[] };
  /** Where the iris is on screen now, CSS px from the canvas's top-left, and its radius. */
  irisAt(): { x: number; y: number; r: number };
  /** Where the eye sits in the shot (its centre at rest, whatever the gaze), CSS px, and the iris's radius. */
  eyeCentre(): { x: number; y: number; r: number };
}

const FILL_TMP = new THREE.Color();
const UP_TMP = new THREE.Vector3(0, 1, 0);

/** Where the camera focuses, mm toward it from the globe's centre: the iris plane, the lashes. */
const FOCUS_IRIS = 11.6;
const FOCUS_LASHES = 15.5;

/** The lens's numbers that crossfade between eras (the artefact switches). */
const LENS_NUMBERS = [
  "grain",
  "grainSize",
  "halation",
  "chroma",
  "vignette",
  "lift",
  "gamma",
  "gain",
  "sat",
  "wb",
  "split",
  "sharpen",
  "aperture",
  "bloom",
  "isolate",
  "phosphor",
] as const satisfies readonly (keyof EraLens)[];

/** An era that looks each way, so the lab can borrow its numbers. */
const PATTERN_ERA: Record<GazePattern, string> = {
  idle: "2003",
  read: "1991",
  scatter: "1995",
  "two-target": "1997",
  lock: "2000",
  scroll: "2009",
  contact: "2026",
};

/**
 * What a wide screen frames, mm round the globe's centre: the whole brow
 * with a little forehead above it, the lower lid's bulge and lashes below,
 * and the corners with some face to each side. The shot fits this box
 * whatever the window's shape, so the brow never leaves the frame.
 */
const FRAME_BOX: FrameBox = { halfW: 16, top: 12, bottom: -10 };

/** A wide screen's shot, mm round the globe's centre (`FRAME_BOX`); the loader passes its own to make room for its chrome. */
export interface FrameBox {
  halfW: number;
  top: number;
  bottom: number;
}

/** The era screens' size as the eye sees them (look.ts), × this. */
const SCREEN_SCALE = 0.62;

/**
 * The shared framing (era-eye-frame), reframed on a wide screen to hold
 * FRAME_BOX: as tall as the box, or as wide, whichever the window needs, and
 * centred on it (so the eye sits below the middle and the brow is in the
 * shot). A portrait screen already crops to the eyeball and is left as it
 * is; in between, the two blend. Everything measured in the frame (span,
 * offset, the iris's centre and size on screen) moves together.
 */
function tslFrame(w: number, h: number, eyeHeight: number, box: FrameBox = FRAME_BOX) {
  const f = eyeFrame(w, h, eyeHeight);
  const aspect = w / Math.max(h, 1);
  const wide = Math.min(1, Math.max(0, (aspect - 1.05) / 0.3));
  const B = box;
  const boxMm = Math.max(B.top - B.bottom, (B.halfW * 2) / aspect);
  const span = f.span + (boxMm / MM_PER_UNIT - f.span) * wide;
  const zoom = f.span / span;
  // the frame's middle on the box's middle: the camera looks that far above the eye
  const offsetY = (f.offsetY / zoom) * (1 - wide) - (((B.top + B.bottom) / 2) * wide) / MM_PER_UNIT;
  return { ...f, span, offsetY, cy: (0.5 - offsetY / span) * h, irisPx: f.irisPx * zoom, zoom };
}

/** Frames the macro shot from the same numbers the dial and the tap target use, pushed in (tslFrame). */
function frameCamera(camera: THREE.PerspectiveCamera, w: number, h: number, eyeHeight: number, box?: FrameBox) {
  const f = tslFrame(w, h, eyeHeight, box);
  const heightMm = f.span * MM_PER_UNIT;
  const dist = heightMm / 2 / Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV) / 2);
  camera.fov = CAMERA_FOV;
  camera.aspect = w / Math.max(h, 1);
  camera.near = Math.max(1, dist - ANATOMY.eyeballRadius * 4);
  camera.far = dist + ANATOMY.eyeballRadius * 20;
  // the eye sits above centre on a phone, so the camera sits below it
  camera.position.set(0, -f.offsetY * MM_PER_UNIT, FRAME_PLANE_Z + dist);
  camera.rotation.set(0, 0, 0);
  camera.updateProjectionMatrix();
}

interface SceneProps {
  era: ThemeConfig;
  eyeHeight: number;
  exiting: boolean;
  reduce: boolean;
  interactive: boolean;
  profile: boolean;
  dprCap: number;
  /**
   * R3F 9.8 re-applies the Canvas `dpr` prop on every render of the Canvas,
   * so a ratio set from inside the scene is undone the next time the parent
   * renders. The ratio lives with the Canvas's owner instead.
   */
  setDpr: (dpr: number) => void;
  onReady?: (info: EyeStageInfo) => void;
  control?: React.MutableRefObject<EyeStageControl | null>;
  capture?: React.MutableRefObject<(() => Promise<string>) | null>;
  frameBox?: FrameBox;
  media?: boolean;
}

function EyeScene({
  era,
  eyeHeight,
  exiting,
  reduce,
  interactive,
  profile,
  dprCap,
  setDpr,
  onReady,
  control,
  capture,
  frameBox,
  media = false,
}: SceneProps) {
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer;
  const scene = useThree((s) => s.scene) as unknown as THREE.Scene;
  const camera = useThree((s) => s.camera) as unknown as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const U = useMemo(createEyeUniforms, []);

  const info = useMemo<EyeStageInfo>(() => {
    const webgpu = (gl.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend === true;
    return { backend: webgpu ? "webgpu" : "webgl2", tier: pickTier(readTierSignals(webgpu)) };
  }, [gl]);

  // The pixel ratio the tier allows, once the tier is known.
  useEffect(() => {
    const tierCap = info.tier > 0 ? TIERS[info.tier as 1 | 2 | 3].dprCap : 1;
    setDpr(budgetDpr(Math.min(tierCap, dprCap)));
  }, [info.tier, dprCap, setDpr]);

  /* ---- the era's screen: the light and the reflection ------------------ */

  /** The portfolio page, painted by canvas 2D and repainted on era change: the stand-in. */
  const code = useMemo<EraScreenTexture>(() => createEraScreenTexture(), []);
  useEffect(() => () => code.dispose(), [code]);
  /** The eras' real home pages, loaded as each era comes up. */
  const pages = useMemo(() => new ScreenPages(), []);
  useEffect(() => () => pages.dispose(), [pages]);
  const screen = useMemo(() => createScreenPass(U.screen, code.texture, pages), [U, code, pages]);
  useEffect(() => () => screen.dispose(), [screen]);
  const driver = useMemo(() => new ScreenDriver(), []);

  /* ---- the layers ------------------------------------------------------ */

  /** The white of the eye, baked once per person. */
  const vessels = useMemo(() => createVesselBake(), []);

  /** The iris, baked per person at the tier's resolution, in two sets for crossfades. */
  const irisBake = useMemo(
    () => createIrisBake(info.tier > 0 ? TIERS[info.tier as 1 | 2 | 3].irisBake : 512),
    [info.tier],
  );
  useEffect(() => () => irisBake.dispose(), [irisBake]);
  useEffect(() => () => vessels.dispose(), [vessels]);

  /** The tear film over the cornea: simulated on T2/T3, laid down once on T1. */
  const tierSpec = info.tier > 0 ? TIERS[info.tier as 1 | 2 | 3] : TIERS[1];
  /** Whether the post pass has an emissive target to bloom (WebGPU; see post/pipeline.ts). */
  const emissiveTarget = info.backend === "webgpu";
  const tear = useMemo(() => createTearFilm(tierSpec.tearFilm), [tierSpec.tearFilm]);
  useEffect(() => () => tear.dispose(), [tear]);

  /**
   * The gaze rig: the globe turns inside this group, yaw then pitch (Fick),
   * so a diagonal look never twists the eye about its own axis.
   */
  const eyeball = useMemo(() => {
    const group = new THREE.Group();
    group.name = "eyeball";
    group.rotation.order = "YXZ";
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(1, 128, 96),
      scleraMaterial(U, screen.target, vessels.target),
    );
    ball.name = "globe";
    ball.scale.setScalar(ANATOMY.eyeballRadius);
    group.add(ball);

    // the cornea: a cap of its own sphere, seated on the globe at the limbus
    const capGeometry = new THREE.SphereGeometry(ANATOMY.corneaRadius, 96, 24, 0, Math.PI * 2, 0, CORNEA_CAP);
    capGeometry.rotateX(Math.PI / 2); // the cap's pole onto the visual axis
    const cornea = new THREE.Mesh(
      capGeometry,
      corneaMaterial(U, screen.target, irisBake, tear.target, tierSpec.purkinje === "all", emissiveTarget),
    );
    cornea.name = "cornea";
    cornea.position.z = CORNEA_CENTER_Z;
    cornea.renderOrder = 5;
    group.add(cornea);
    return { group, ball, cornea };
    // the tier is settled before the stage compiles; tierSpec follows tear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [U, screen, vessels, irisBake, tear]);

  /** The skin's pores and lines, baked once onto the lid mesh's own coordinates. */
  const skinBake = useMemo(() => createSkinBake(), []);
  useEffect(() => () => skinBake.dispose(), [skinBake]);

  /**
   * The lids and the skin around them: one ring mesh shaped in the vertex
   * stage on the margin curves. Its bounds are meaningless before that, so it
   * is never culled. It is opaque and drawn first: most of the globe and the
   * cornea sit under it, and the depth test then skips their shaders there.
   */
  /** The brow and the skin's fine hair, drawn once at the tier's budget. */
  const hairBake = useMemo(() => bakeBrow(tierSpec.browHairs, tierSpec.browRes), [tierSpec]);
  useEffect(() => () => hairBake.dispose(), [hairBake]);

  /** The skin's face-space detail (pores, grain, mottle), baked once. */
  const skinFace = useMemo(() => createSkinFaceBake(DEFAULT_IDENTITY.lids.tilt), []);
  useEffect(() => () => skinFace.dispose(), [skinFace]);

  const lids = useMemo(() => {
    const mesh = new THREE.Mesh(lidGeometry(), lidMaterial(U, screen.target, skinBake.target, hairBake, skinFace));
    mesh.name = "lids";
    mesh.frustumCulled = false;
    mesh.renderOrder = -1;
    return mesh;
  }, [U, screen, skinBake, hairBake, skinFace]);

  /**
   * The lashes: one instanced draw, as many strands as the tier allows. The
   * strands are the same for every era; the person decides how many show.
   */
  const lashes = useMemo(() => {
    const t = info.tier > 0 ? TIERS[info.tier as 1 | 2 | 3] : TIERS[1];
    return createLashes(U, screen.target, t.lashesUpper, t.lashesLower, emissiveTarget);
  }, [U, screen, info.tier, emissiveTarget]);

  /** The tear meniscus: a bead along both margins, after the cornea and before the lashes. */
  const meniscus = useMemo(() => {
    const mesh = new THREE.Mesh(meniscusGeometry(), meniscusMaterial(U, screen.target, emissiveTarget));
    mesh.name = "meniscus";
    mesh.frustumCulled = false;
    mesh.renderOrder = 15;
    return mesh;
  }, [U, screen, emissiveTarget]);

  /**
   * The socket behind the globe: what shows in the corners of the aperture.
   * The caruncle rides on it (shaped in its vertex stage, so never culled).
   */
  const socket = useMemo(() => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(14, 64, 40), socketMaterial(U, screen.target));
    mesh.name = "socket";
    const caruncle = new THREE.Mesh(caruncleGeometry(), caruncleMaterial(U, screen.target));
    caruncle.name = "caruncle";
    caruncle.frustumCulled = false;
    // (it blends at its edges: drawn over the globe, before the cornea)
    caruncle.renderOrder = 4;
    mesh.add(caruncle);
    return mesh;
  }, [U, screen]);
  const room = useMemo(() => roomMesh(U, screen.target), [U, screen]);

  const layers = useRef<Record<EyeLayer, boolean>>({
    room: true,
    eyeball: true,
    cornea: true,
    lids: true,
    lashes: true,
    tears: true,
    socket: true,
  });

  useEffect(() => {
    scene.add(eyeball.group);
    scene.add(lids);
    scene.add(lashes);
    scene.add(meniscus);
    scene.add(socket);
    scene.add(room);
    return () => {
      scene.remove(eyeball.group);
      scene.remove(lids);
      scene.remove(lashes);
      scene.remove(meniscus);
      meniscus.geometry.dispose();
      (meniscus.material as THREE.Material).dispose();
      lashes.geometry.dispose();
      (lashes.material as THREE.Material).dispose();
      scene.remove(socket);
      for (const m of [socket, ...(socket.children as THREE.Mesh[])]) {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      }
      eyeball.ball.geometry.dispose();
      (eyeball.ball.material as THREE.Material).dispose();
      eyeball.cornea.geometry.dispose();
      (eyeball.cornea.material as THREE.Material).dispose();
      lids.geometry.dispose();
      (lids.material as THREE.Material).dispose();
      scene.remove(room);
      room.geometry.dispose();
      room.material.dispose();
    };
  }, [scene, eyeball, lids, lashes, meniscus, socket, room]);

  const pipeline = useMemo(
    () => createEyePipeline(gl, scene, camera, U, screen.target, tierSpec, emissiveTarget, media),
    [gl, scene, camera, U, screen, tierSpec, emissiveTarget, media],
  );
  useEffect(() => () => pipeline.dispose(), [pipeline]);

  /* ---- compile behind the poster -------------------------------------- */

  const compiled = useRef(false);
  useEffect(() => {
    let live = true;
    frameCamera(camera, size.width, size.height, eyeHeight, frameBox);
    Promise.all([
      gl.compileAsync(scene, camera),
      gl.compileAsync(screen.quad, screen.quad.camera),
      gl.compileAsync(vessels.quad, vessels.quad.camera),
      ...tear.quads.map((q) => gl.compileAsync(q, q.camera)),
      ...irisBake.quads.map((q) => gl.compileAsync(q, q.camera)),
    ])
      .catch(() => undefined)
      .then(() => {
        if (live) compiled.current = true;
      });
    return () => {
      live = false;
    };
    // compile once per stage; resizes only reframe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera, eyeball, lids, lashes, meniscus, socket, screen, vessels, irisBake, skinBake, tear]);

  /* ---- what the era decides, resolved once per era -------------------- */

  const visual = useMemo(() => getEraVisual(era.id), [era.id]);
  const identity = useMemo(() => getEyeIdentity(era.id), [era.id]);
  const look = useMemo(() => getEraLook(era.id), [era.id]);
  /** Lab: another era's way of looking. */
  const patternOverride = useRef<GazePattern | null>(null);
  const [patternRev, setPatternRev] = useState(0);

  // The era's way of looking, and how often its person blinks.
  useEffect(() => {
    const pattern = patternOverride.current ?? look.gazePattern;
    const params = patternOverride.current ? getEraLook(PATTERN_ERA[pattern]).gaze : look.gaze;
    gazeRig.setPlan(pattern, params.rest, params);
    blinkRig.every = params.blinkEvery;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [look, patternRev]);

  // The person: their skin and lid shape, and a new seed re-bakes their vessels.
  useEffect(() => {
    const shape = LID_SHAPES[identity.lids.type];
    U.skin.tone.value.set(MONK_TONES[identity.skin.monk]);
    U.skin.undertone.value = identity.skin.undertone;
    U.skin.translucency.value = identity.skin.translucency;
    U.skin.pores.value = identity.skin.pores;
    U.skin.lines.value = identity.skin.lines;
    U.skin.freckles.value = identity.skin.freckles;
    U.skin.creaseD.value = shape.creaseD;
    U.skin.creaseDepth.value = shape.creaseDepth;
    U.skin.hood.value = shape.hood;
    U.lids.epicanthus.value = shape.epicanthus;
    const LS = U.lashes;
    LS.upper.value = identity.lashes.upper;
    LS.lower.value = identity.lashes.lower;
    LS.length.value = identity.lashes.length;
    LS.curl.value = identity.lashes.curl;
    LS.clump.value = identity.lashes.clump;
    LS.mascara.value = identity.lashes.mascara;
    LS.root.value.set(identity.lashes.root);
    LS.tip.value.set(identity.lashes.tip);
    // arriving somewhere new, an eye often blinks
    if (irisState.current.baked > 0 && !reduce && Math.random() < 0.6) blinkRig.trigger();
    // four or more eras in a second is a sweep fast enough to bring tears
    {
      const tr = tears.current;
      const t = performance.now() / 1000;
      tr.eras = tr.eras.filter((x) => t - x < 1).concat(t);
      if (tr.eras.length >= 4 && !reduce) tr.tearing = Math.min(1, tr.tearing + 0.25);
    }
    vessels.setSeed(identity.seed);
    // The iris is baked into whichever set is not on screen, then crossfaded
    // in. A fast sweep coalesces to the era it lands on: a bake is a few
    // milliseconds of MaterialX noise, not something to do per tick.
    const rest = restingPupil(lum, identity.pupil.rest / 0.34);
    const bake = () => {
      const first = irisState.current.baked === 0;
      const set: 0 | 1 = first ? 0 : irisState.current.active === 0 ? 1 : 0;
      irisBake.request(set, identity, rest);
      (set === 0 ? U.iris.restA : U.iris.restB).value = rest;
    };
    if (irisState.current.baked === 0) bake();
    else {
      const id = window.setTimeout(bake, 120);
      return () => window.clearTimeout(id);
    }
    U.sclera.tint.value.set(identity.sclera.tint);
    U.sclera.vessels.value = identity.sclera.vessels;
    U.sclera.age.value = identity.sclera.age;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, vessels, irisBake, U]);

  // The screen they are looking at, as a light and a mirror: where it is, how
  // big, and which way its own right and up run as the person sees it.
  useEffect(() => {
    const L = U.light;
    L.dir.value.set(...look.light.key).normalize();
    L.center.value.set(...look.light.pos);
    L.normal.value.set(...look.light.normal).normalize();
    // the screen's own right and up, as the person facing it sees them
    const looking = L.normal.value.clone().negate();
    L.right.value.crossVectors(looking, new THREE.Vector3(0, 1, 0)).normalize();
    L.up.value.crossVectors(L.right.value, looking).normalize();
    // (the screens are drawn larger than life so the page reads in the cornea;
    // at their full size it filled the whole iris and read as a lens, not an
    // eye, so they are scaled down to leave the iris round the reflection)
    L.size.value.set(look.light.size[0] * SCREEN_SCALE, look.light.size[1] * SCREEN_SCALE);
    U.screen.cursorKind.value = CURSOR_KIND[look.cursor];
  }, [look, U]);
  const pal = useMemo(() => eraPalette(era), [era]);
  const palCols = useMemo(() => paletteColors(pal), [pal]);
  const lum = useMemo(() => screenLuminance(pal), [pal]);

  // The first era paints at once so the screen is never empty; a fast sweep
  // coalesces to the year it lands on rather than rasterising every one.
  const painted = useRef<string | null>(null);
  useEffect(() => {
    const paint = () => {
      painted.current = era.id;
      code.update(era.id, pal);
    };
    if (painted.current === null) {
      paint();
      return;
    }
    const id = window.setTimeout(paint, 64);
    return () => window.clearTimeout(id);
  }, [code, era.id, pal]);

  /* ---- input ------------------------------------------------------------ */

  const gazeRig = useMemo(() => new GazeRig(), []);
  const blinkRig = useMemo(() => new BlinkRig(), []);
  const pointer = useRef({ x: 0, y: 0, seen: -1e3 });
  /** How much the pointer resting on the eye interests it, 0..1, eased: the brow lifts with it. */
  const browInterest = useRef(0);
  /** Where the iris was drawn last frame, CSS px, for the loader's tap target. */
  const irisOnScreen = useRef({ x: 0, y: 0, r: 1 });
  /** Where the eye sits in the shot, CSS px (the frame's centre), for the loader's chrome. */
  const eyeOnScreen = useRef({ x: 0, y: 0, r: 1 });
  /** The brow's lift before any flash, eased; and when the last greeting flash began (s, performance clock). */
  const browBase = useRef(0);
  const browFlash = useRef(-1e3);
  const pupilRig = useMemo(() => new PupilRig(), []);
  const trace = useRef<{ samples: number[]; due: number }>({ samples: [], due: 0 });
  /** Ten ways of seeing: the era on screen, its glimpsed neighbours and a crossing under way; and the lab's choice of medium (null: the era's own). */
  const mediumState = useRef({ cur: 0, target: 0, prev: 0, next: 0, dir: 0, t: 0, from: 0, reachL: 0, reachR: 0, age: 0 });
  const mediumHold = useRef<number | null>(null);
  const hold = useRef<{
    gaze: { x: number; y: number } | null;
    pupil: number | null;
    extraLogL: number;
    red: number | null;
    still: boolean;
    blink: number | null;
    squint: number | null;
    stare: boolean;
    lensOn: boolean;
    pagesOn: boolean;
    focus: number | null;
  }>({
    gaze: null,
    pupil: null,
    extraLogL: 0,
    red: null,
    still: false,
    blink: null,
    squint: null,
    stare: false,
    lensOn: true,
    pagesOn: true,
    focus: null,
  });
  /**
   * The camera: where it is focused (mm toward it from the globe's centre),
   * where the reflection was last frame (for its speed across the frame),
   * and the lens's grain seed.
   */
  const camState = useRef({ focusZ: FOCUS_IRIS, irisX: NaN, irisY: NaN, seed: 0, grainDue: 0 });
  /**
   * The tears: when the lid last shut and reopened (the film creeps up after
   * it), each blink's seed for the film, reflex tearing, and when eras changed
   * (four or more in a second is a sweep fast enough to bring tears).
   */
  const tears = useRef({ sinceBlink: 0, shut: false, opened: -1e3, seed: 0, tearing: 0, eras: [] as number[] });
  const lashLag = useRef({ up: NaN, lo: NaN, xU: 0, vU: 0, xL: 0, vL: 0 });
  const hidden = useRef(false);
  const readySent = useRef(false);
  /** Seconds owed to the screen pass; starts due, so the first frame has a screen. */
  const uiDue = useRef(1);
  /** Which iris set is on screen, how many bakes have landed, the crossfade's goal. */
  const irisState = useRef({ active: 0 as 0 | 1, baked: 0, goal: 0 });
  /** The membrane's lag after a turn: offset and velocity (mm), last turn rate. */
  const wobble = useRef({ x: 0, y: 0, vx: 0, vy: 0, yaw: 0, pitch: 0, wYaw: 0, wPitch: 0 });
  const health = useRef({ ema: 1 / 60, cool: 2, skip: 0, owed: 0, moved: 0 });
  /** A poster capture waiting for the next drawn frame (lab only). */
  const pendingCapture = useRef<((png: string) => void) | null>(null);
  useEffect(() => {
    if (!capture) return;
    capture.current = () =>
      new Promise<string>((resolve) => {
        pendingCapture.current = resolve;
      });
    return () => {
      capture.current = null;
    };
  }, [capture]);
  /** How many pages the reading eye has turned, to scroll the page in step. */
  const pagesTurned = useRef(0);
  const meter = useRef({ frames: 0, since: 0, cpu: 0 });
  const stats = useRef<EyeStageStats>({
    fps: 0,
    cpuMs: 0,
    gpuMs: null,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    dpr,
  });

  useEffect(() => {
    const sync = () => {
      hidden.current = document.hidden;
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      pointer.current.y = (e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
      const t = performance.now() / 1000;
      if (t - pointer.current.seen > 2.5 && t - browFlash.current > 4) browFlash.current = t + 0.08;
      pointer.current.seen = t;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
    };
  }, [interactive, reduce]);

  useEffect(() => {
    if (!control) return;
    control.current = {
      uniforms: U,
      info,
      stats: stats.current,
      setLayerVisible(layer, visible) {
        layers.current[layer] = visible;
        if (layer === "eyeball") eyeball.ball.visible = visible;
        if (layer === "cornea") eyeball.cornea.visible = visible;
        if (layer === "lids") lids.visible = visible;
        if (layer === "lashes") lashes.visible = visible;
        if (layer === "tears") meniscus.visible = visible;
        if (layer === "socket") socket.visible = visible;
        if (layer === "room") room.visible = visible;
      },
      isLayerVisible: (layer) => layers.current[layer],
      blink: () => blinkRig.trigger(),
      holdGaze(target) {
        hold.current.gaze = target;
      },
      holdPupil(value) {
        hold.current.pupil = value;
      },
      screenState: driver.state,
      pupilMm: () => pupilRig.d,
      pupilTrace: () => trace.current.samples.slice(),
      lightStep(logL) {
        hold.current.extraLogL = logL;
      },
      flash: () => pupilRig.flash(),
      holdRedReflex(value) {
        hold.current.red = value;
      },
      stillPupil(still) {
        hold.current.still = still;
      },
      holdBlink(value) {
        hold.current.blink = value;
      },
      holdSquint(value) {
        hold.current.squint = value;
      },
      stare(on) {
        hold.current.stare = on;
      },
      reflexTears() {
        tears.current.tearing = 1;
      },
      tearInfo: () => ({ sinceBlink: tears.current.sinceBlink, tearing: tears.current.tearing }),
      setMedium(id) {
        mediumHold.current = id;
      },
      setGazePattern(pattern) {
        if (patternOverride.current === pattern) return;
        patternOverride.current = pattern;
        setPatternRev((r) => r + 1);
      },
      gazeTrace: () => gazeRig.trace.slice(),
      lensOn(on) {
        hold.current.lensOn = on;
      },
      pagesOn(on) {
        hold.current.pagesOn = on;
      },
      pagesInfo: () => pages.info(),
      holdFocus(z) {
        hold.current.focus = z;
      },
      focusZ: () => camState.current.focusZ,
      gazeLog: () => ({ now: gazeRig.trace.at(-1)?.t ?? 0, saccades: gazeRig.log.slice() }),
      irisAt: () => ({ ...irisOnScreen.current }),
      eyeCentre: () => ({ ...eyeOnScreen.current }),
      gazeInfo: () => ({ pattern: patternOverride.current ?? look.gazePattern, blinkEvery: blinkRig.every }),
    };
    return () => {
      control.current = null;
    };
  }, [control, U, info, eyeball, lids, lashes, meniscus, socket, room, scene, blinkRig, gazeRig, driver, pupilRig, look, pages]);

  /* ---- the frame -------------------------------------------------------- */

  useFrame((_state, delta) => {
    if (hidden.current || !compiled.current) return;

    const now = performance.now() / 1000;
    const pointerIdle = now - pointer.current.seen > 2.8;
    // The lab measures every frame; the loader may rest, but only while the
    // eye is holding still: never through a saccade, its wobble or a blink.
    // Skipped time is carried, so the eye's clock never slows.
    const h0 = health.current;
    if (gazeRig.busy || blinkRig.active) h0.moved = now;
    if (pointerIdle && !exiting && !profile && !pendingCapture.current && readySent.current && now - h0.moved > 0.25) {
      h0.skip = (h0.skip + 1) % 3;
      if (h0.skip !== 0) {
        h0.owed += delta;
        return;
      }
    }
    const dt = Math.min(delta + h0.owed, 0.1);
    h0.owed = 0;
    if (!reduce) U.time.value += dt;

    // Framing is shared with the dial and the picker's hit-testing, so all
    // three agree about where the iris is on a phone.
    frameCamera(camera, size.width, size.height, eyeHeight, frameBox);
    const frame = tslFrame(size.width, size.height, eyeHeight, frameBox);
    U.span.value = frame.span;
    U.offsetY.value = frame.offsetY;
    // The further back the shot stands, the fewer pixels a texel of the era's
    // page gets, so it is sampled out of a coarser mip: a dithered terminal
    // otherwise turns to a snowstorm of specks on a phone.
    U.mip.value = Math.max(0, Math.log2(frame.span / REF_SPAN)) * 1.15;

    // gaze: a held target (lab), else the pointer, else the room
    const fresh = interactive && !reduce && now - pointer.current.seen < POINTER_HOLD;
    const target =
      hold.current.gaze ??
      (fresh
        ? {
            x: THREE.MathUtils.clamp(pointer.current.x, -1, 1),
            y: THREE.MathUtils.clamp(-pointer.current.y, -1, 1),
          }
        : null);
    const g = gazeRig.update(dt, target, reduce);
    U.gaze.value.set(g.x, g.y);
    U.blink.value = hold.current.blink ?? blinkRig.update(dt, reduce, exiting || hold.current.stare);
    // up is a negative pitch about x; under a closing lid the eye rolls up
    eyeball.group.rotation.set(-g.y * GAZE_PITCH - U.blink.value * BELL_PITCH, g.x * GAZE_YAW, 0);

    // ---- post-saccadic wobble: the iris lags the turn, then rings down ------
    {
      const w = wobble.current;
      const yaw = eyeball.group.rotation.y;
      const pitch = eyeball.group.rotation.x;
      const wYaw = (yaw - w.yaw) / Math.max(dt, 1e-3);
      const wPitch = (pitch - w.pitch) / Math.max(dt, 1e-3);
      const aYaw = (wYaw - w.wYaw) / Math.max(dt, 1e-3);
      const aPitch = (wPitch - w.wPitch) / Math.max(dt, 1e-3);
      w.yaw = yaw;
      w.pitch = pitch;
      w.wYaw = wYaw;
      w.wPitch = wPitch;
      if (reduce) {
        w.x = w.y = w.vx = w.vy = 0;
      } else {
        const omega = 2 * Math.PI * 9; // slower than life, or a 60 Hz frame cannot show it
        const zeta = 0.32;
        const gain = 0.6;
        const ax = -omega * omega * w.x - 2 * zeta * omega * w.vx - aYaw * gain;
        const ay = -omega * omega * w.y - 2 * zeta * omega * w.vy + aPitch * gain;
        w.vx += ax * dt;
        w.vy += ay * dt;
        w.x = THREE.MathUtils.clamp(w.x + w.vx * dt, -0.25, 0.25);
        w.y = THREE.MathUtils.clamp(w.y + w.vy * dt, -0.25, 0.25);
      }
      U.iris.wobble.value.set(w.x, w.y);
    }

    // ---- the lids: the person's aperture, coupled to the gaze, squinting at a
    // bright page ------------------------------------------------------------
    const fa = fissureAngles(identity.lids.aperture);
    const LU = U.lids;
    LU.phiM.value = fa.phiM;
    LU.phiL.value = fa.phiL;
    LU.upper.value = fa.upper;
    LU.lower.value = fa.lower;
    LU.tilt.value = THREE.MathUtils.degToRad(identity.lids.tilt);
    // the upper lid follows the eye's pitch (not Bell's roll under a blink)
    LU.pitch.value = g.y * GAZE_PITCH;
    // the apex sits a little toward the nose, and drifts after the cornea
    LU.peak.value = -0.04 + 0.25 * g.x * GAZE_YAW;
    const glare = THREE.MathUtils.smoothstep(U.screenLum.value, 0.55, 0.95);
    // (a white page narrows the eye a little, not to sleepiness: the lid already covers the iris's top)
    const squintGoal = Math.max(glare * 0.6, look.squintRest);
    LU.squint.value = hold.current.squint ?? damp(LU.squint.value, reduce ? look.squintRest : squintGoal, 1.5, dt);
    // The brow, by its muscles (lid-mesh.ts browDisplace). Frontalis lifts it
    // as the eye looks up and with interest (the pointer resting on the eye),
    // a little behind the eye; a greeting flash (a quick lift, held a moment)
    // when a visitor's pointer arrives after a while away, or when the eye
    // first opens on them. Corrugator frowns into glare, and into a page being
    // read. Orbicularis (squint, blink) is read from the lids directly.
    {
      const lift = 0.6 * THREE.MathUtils.clamp(g.y, -0.6, 1) + 0.3 * browInterest.current;
      browBase.current = damp(browBase.current, lift, 6, dt);
      const t = now - browFlash.current;
      const flash = t < 0 ? 0 : t < 0.14 ? t / 0.14 : t < 0.36 ? 1 : Math.max(0, 1 - (t - 0.36) / 0.45);
      LU.brow.value = reduce ? 0 : browBase.current + 1.5 * flash * flash * (3 - 2 * flash);
      const reading = (patternOverride.current ?? look.gazePattern) === "read";
      LU.frown.value = reduce ? 0 : damp(LU.frown.value, 0.55 * glare + (reading ? 0.22 : 0), 2, dt);
    }

    // ---- the era's second light: its colour crossfades, its shape is the era's
    {
      const F = U.fill;
      const fill = look.light.fill;
      const goal = fill ? FILL_TMP.set(fill.color).multiplyScalar(fill.strength) : FILL_TMP.setRGB(0, 0, 0);
      F.color.value.lerp(goal, reduce ? 1 : 1 - Math.exp(-3 * dt));
      if (fill) {
        F.dir.value.set(...fill.dir).normalize();
        F.center.value.set(...fill.pos);
        // it faces the eye; its long side lies across
        F.normal.value.copy(F.center.value).negate().normalize();
        F.right.value.crossVectors(F.normal.value, UP_TMP).normalize();
        F.up.value.crossVectors(F.right.value, F.normal.value).normalize();
        F.size.value.set(...fill.size);
        F.round.value = fill.round;
      }
    }

    // ---- the lashes lag a moving lid, then settle -------------------------
    // The margins' apex (margins.ts marginsAt at s = 0), followed frame to
    // frame: a spring pulls each row's extra curl toward its lid's speed, so
    // the tips trail a blink and overshoot a little when the lid stops.
    {
      const sq = LU.squint.value;
      const b = U.blink.value;
      const loOpen = -fa.lower * (1 - 0.2 * sq) + 0.35 * LU.pitch.value;
      const upOpen = Math.max(fa.upper * (1 - 0.25 * sq) + (LU.pitch.value < 0 ? 0.7 : 0.85) * LU.pitch.value, loOpen + 0.004);
      const lo = loOpen + b * 0.12 * fa.lower;
      const up = Math.max(upOpen + (lo + 0.012 - upOpen) * b, lo + 0.004);
      const l = lashLag.current;
      if (reduce || Number.isNaN(l.up)) {
        l.xU = l.vU = l.xL = l.vL = 0;
      } else {
        const vUp = (up - l.up) / Math.max(dt, 1e-3);
        const vLo = (lo - l.lo) / Math.max(dt, 1e-3);
        // the upper row trails upward while its lid falls, the lower downward while its lid rises
        const tU = THREE.MathUtils.clamp(-vUp * 0.03, -0.6, 0.6);
        const tL = THREE.MathUtils.clamp(vLo * 0.03, -0.6, 0.6);
        const omega = 2 * Math.PI * 7;
        const zeta = 0.35;
        const h = Math.min(dt, 0.1) / 4;
        for (let i = 0; i < 4; i++) {
          l.vU += (-omega * omega * (l.xU - tU) - 2 * zeta * omega * l.vU) * h;
          l.xU += l.vU * h;
          l.vL += (-omega * omega * (l.xL - tL) - 2 * zeta * omega * l.vL) * h;
          l.xL += l.vL * h;
        }
      }
      l.up = up;
      l.lo = lo;
      U.lashes.lagUpper.value = l.xU;
      U.lashes.lagLower.value = l.xL;
      // one device pixel at the eye, mm: strands thinner than this keep their coverage
      const fov = THREE.MathUtils.degToRad(camera.fov);
      U.lashes.pxMm.value = (2 * Math.max(camera.position.z - 12, 1) * Math.tan(fov / 2)) / Math.max(size.height * dpr, 1);
    }

    // a big jump of the eyes often brings a blink with it, the bigger the likelier
    if (gazeRig.lastSaccade > 0) {
      const p = THREE.MathUtils.smoothstep(gazeRig.lastSaccade, 12, 35) * 0.7;
      if (!reduce && !exiting && Math.random() < p) blinkRig.trigger();
      gazeRig.lastSaccade = 0;
    }
    U.fade.value = damp(U.fade.value, 1, reduce ? 30 : 5, dt);

    U.screenLum.value = damp(U.screenLum.value, lum, 3, dt);

    // ---- the era's screen, at its own frame rate --------------------------
    // It is a defocused reflection that rebuilds a mip chain every time it
    // draws, so it runs at UI_FPS; a layout crossfade makes it keep up.
    // the reading eye turns a page: the page scrolls up by what it has read
    if (look.stepScroll && gazeRig.pagesTurned !== pagesTurned.current) {
      driver.kick(0.16);
      pagesTurned.current = gazeRig.pagesTurned;
    }
    // the page in the reflection scrolls at half the era's rate: calmer to watch
    driver.update(dt, visual, palCols, reduce, look.stepScroll, 0.5);
    writeScreenUniforms(U.screen, driver.state);
    const pageFading = pages.update(era.id, hold.current.pagesOn, dt, reduce);
    U.screen.pageOn.value = pages.on;
    U.screen.pageMix.value = pages.mix;
    U.screen.pageViewA.value = pages.viewA;
    U.screen.pageViewB.value = pages.viewB;
    // the visitor's pointer, on the screen the eye is looking at
    if (fresh) {
      U.screen.cursorPos.value.set((pointer.current.x + 1) / 2, 1 - (pointer.current.y + 1) / 2);
    }
    U.screen.cursorAlpha.value = damp(U.screen.cursorAlpha.value, fresh ? 1 : 0, 8, dt);
    // ---- the tears ----------------------------------------------------------
    // Shut, the lid lays the film down fresh; opening, it drags the film up
    // for a second; then it thins, and after a long stare it breaks up. Reduced
    // motion keeps it fresh: no blinks come to clear it.
    {
      const tr = tears.current;
      const shut = U.blink.value > 0.85;
      if (shut) {
        if (!tr.shut) tr.seed = (tr.seed + 1) % 97;
        tr.shut = true;
        tr.sinceBlink = 0;
      } else {
        if (tr.shut && U.blink.value < 0.5) {
          tr.shut = false;
          tr.opened = now;
        }
        tr.sinceBlink += dt;
      }
      tr.tearing = Math.max(0, tr.tearing - dt * 0.15);
      const sinceOpen = now - tr.opened;
      tear.inputs.fresh.value = shut || reduce ? 1 : 0;
      tear.inputs.creep.value = reduce ? 0 : 0.6 * Math.exp(-sinceOpen / 0.5);
      tear.inputs.seed.value = tr.seed;
      tear.step(gl, dt, !reduce);
      // the bead swells and brightens just after a blink, and with reflex tears
      const fresh = Math.exp(-Math.max(sinceOpen, 0) / 1.5);
      U.tear.tearing.value = tr.tearing;
      U.tear.meniscus.value = 0.22 * (1 + tr.tearing * 1.2) * (1 + 0.25 * fresh);
      U.tear.wet.value = 1 + 0.6 * fresh + 1.5 * tr.tearing;
    }

    vessels.render(gl);
    skinBake.render(gl);
    skinFace.render(gl);
    // a fresh iris lands in the back set; crossfade to it
    const landed = irisBake.render(gl);
    if (landed >= 0) {
      const st = irisState.current;
      st.baked += 1;
      st.active = landed as 0 | 1;
      st.goal = landed;
      if (st.baked === 1) U.iris.weightB.value = landed;
    }
    U.iris.weightB.value = damp(U.iris.weightB.value, irisState.current.goal, reduce ? 60 : 4.5, dt);
    uiDue.current += dt;
    if (uiDue.current >= 1 / UI_FPS || driver.crossfading || pageFading) {
      uiDue.current = 0;
      screen.render(gl);
    }

    // ---- the pupil: a reflex to the screen's light, near focus and interest ---
    // Where the iris is on screen right now: the frame's centre, moved by the
    // globe's turn (its front sits ~10.4 mm from the centre of rotation).
    const pxPerMm = frame.irisPx / ANATOMY.irisRadius;
    const irisX = frame.cx + Math.sin(eyeball.group.rotation.y) * 10.4 * pxPerMm;
    const irisY = frame.cy + Math.sin(eyeball.group.rotation.x) * 10.4 * pxPerMm;
    irisOnScreen.current = { x: irisX, y: irisY, r: frame.irisPx };
    // ---- ten ways of seeing: the era's medium, and, to travel, the next era
    // sweeping in from its side behind a front drawn in that era's texture
    if (media) {
      const ms = mediumState.current;
      const want = mediumHold.current ?? mediumOf(era.id);
      const sideOf = (c: number) => ({ prev: c > 1 ? c - 1 : 0, next: c > 0 && c < ERA_MEDIA.length ? c + 1 : 0 });
      const settle = (c: number) => {
        ms.cur = c;
        ({ prev: ms.prev, next: ms.next } = sideOf(c));
        ms.dir = 0;
        ms.age = 0;
        ms.reachL = 0;
        ms.reachR = 0;
      };
      if (want !== ms.target) {
        // a crossing still under way lands first
        if (ms.dir !== 0) settle(ms.target);
        ms.target = want;
        if (ms.cur === 0 || want === 0 || reduce) settle(want);
        else if (want !== ms.cur) {
          ms.dir = want > ms.cur ? 1 : -1;
          // the era you are going to comes in from its side, however far it is
          if (ms.dir > 0) ms.next = want;
          else ms.prev = want;
          ms.t = 0;
          ms.from = ms.dir > 0 ? ms.reachR : ms.reachL;
        }
      }
      // at rest nothing shows at the edges: only the era on screen
      if (ms.dir !== 0) {
        ms.t = Math.min(1, ms.t + dt / 0.95);
        const e = ms.t < 0.5 ? 4 * ms.t ** 3 : 1 - (-2 * ms.t + 2) ** 3 / 2;
        const reach = ms.from + (1.2 - ms.from) * e;
        if (ms.dir > 0) ms.reachR = reach;
        else ms.reachL = reach;
        if (ms.t >= 1) settle(ms.target);
      } else {
        ms.reachL = 0;
        ms.reachR = 0;
      }
      ms.age += dt;
      const M = U.medium;
      M.cur.value = ms.cur;
      M.prev.value = ms.prev;
      M.next.value = ms.next;
      M.reachL.value = ms.reachL;
      M.reachR.value = ms.reachR;
      M.age.value = ms.age;
      M.pupil.value.set(irisX / Math.max(size.width, 1), irisY / Math.max(size.height, 1));
      M.pupilR.value = (frame.irisPx * U.pupil.value) / Math.max(size.height, 1);
    }
    eyeOnScreen.current = { x: frame.cx, y: frame.cy, r: frame.irisPx };
    const px = ((pointer.current.x + 1) / 2) * size.width;
    const py = ((pointer.current.y + 1) / 2) * size.height;
    const toIris = Math.hypot(px - irisX, py - irisY) / Math.max(frame.irisPx, 1);
    browInterest.current = damp(browInterest.current, fresh && toIris < 1 ? 1 : 0, 1.5, dt);
    const nearT = THREE.MathUtils.clamp((toIris - 0.6) / 2.4, 0, 1);
    U.pupil.value = pupilRig.update(dt, {
      lum: U.screenLum.value,
      near: fresh ? 1 - nearT * nearT * (3 - 2 * nearT) : 0,
      hover: fresh && toIris < 1,
      exiting,
      reduce,
      hold: hold.current.pupil,
      extraLogL: hold.current.extraLogL,
      still: hold.current.still,
      personScale: identity.pupil.rest / 0.34,
    });
    U.redReflex.value = hold.current.red ?? pupilRig.red;
    const tr = trace.current;
    tr.due -= dt;
    if (tr.due <= 0) {
      tr.due = 1 / 30;
      tr.samples.push(pupilRig.d);
      if (tr.samples.length > 180) tr.samples.shift();
    }

    // ---- the camera: focus racks to what the pointer is over ----------------
    {
      const cs = camState.current;
      const dxMm = (px - frame.cx) / pxPerMm;
      const dyMm = (py - frame.cy) / pxPerMm;
      let target = FOCUS_IRIS;
      if (fresh && !reduce) {
        const aperture = Math.abs(dxMm) < 13 && dyMm > -5 && dyMm < 5.5;
        const lashBand = Math.abs(dxMm) < 14 && ((dyMm < -4 && dyMm > -10) || (dyMm > 5.5 && dyMm < 8.5));
        if (toIris < 1.1 || aperture) target = FOCUS_IRIS;
        else if (lashBand) target = FOCUS_LASHES;
        else target = Math.max(-8, 11 - 0.02 * dxMm * dxMm - 0.008 * dyMm * dyMm);
      }
      target = hold.current.focus ?? target;
      cs.focusZ = reduce || hold.current.focus !== null ? target : damp(cs.focusZ, target, 3, dt);
      U.cam.focus.value = camera.position.z - cs.focusZ;
      // (no focus breathing: a frame that scales as focus racks reads as the face zooming)

      // ---- the era's lens, crossfading; an artefact fades out before the next fades in
      const LS = U.lens;
      const goal = look.lens;
      const k = reduce ? 60 : 3;
      for (const key of LENS_NUMBERS) LS[key].value = damp(LS[key].value, goal[key], k, dt);
      const want = LENS_ARTEFACTS.indexOf(goal.artefact);
      if (LS.artefact.value !== want) {
        LS.amount.value = damp(LS.amount.value, 0, reduce ? 60 : 6, dt);
        if (LS.amount.value < 0.04) LS.artefact.value = want;
      } else {
        LS.amount.value = damp(LS.amount.value, goal.amount, k, dt);
      }
      LS.on.value = damp(LS.on.value, hold.current.lensOn ? 1 : 0, reduce ? 60 : 6, dt);
      LS.catchlight.value = LS.artefact.value === LENS_ARTEFACTS.indexOf("flash") ? LS.amount.value * LS.on.value : 0;
      // grain changes at a film's rate, not every frame: a 60 Hz shimmer tires the eye
      cs.grainDue -= dt;
      if (!reduce && cs.grainDue <= 0) {
        cs.grainDue = 1 / 12;
        cs.seed = (cs.seed + 1) % 997;
      }
      LS.seed.value = cs.seed;
      pipeline.bloomStrength.value = 0.25 * LS.bloom.value;
      U.cam.bokeh.value = 2.8 * LS.aperture.value;
      // how fast the reflection is crossing the frame, UV per second (top-down)
      if (!Number.isNaN(cs.irisX) && dt > 0) {
        const vx = (irisX - cs.irisX) / dt / Math.max(size.width, 1);
        const vy = (irisY - cs.irisY) / dt / Math.max(size.height, 1);
        LS.motion.value.set(damp(LS.motion.value.x, vx, 30, dt), damp(LS.motion.value.y, vy, 30, dt));
      }
      cs.irisX = irisX;
      cs.irisY = irisY;
    }

    const t0 = performance.now();
    pipeline.render();
    if (pendingCapture.current) {
      pendingCapture.current(gl.domElement.toDataURL("image/png"));
      pendingCapture.current = null;
    }
    const cpu = performance.now() - t0;

    if (!readySent.current && U.fade.value > READY_AT) {
      readySent.current = true;
      browFlash.current = performance.now() / 1000 + 1.2;
      onReady?.(info);
    }

    // ---- the meter, read by the lab -------------------------------------
    const m = meter.current;
    m.frames += 1;
    m.cpu += cpu;
    if (m.since === 0) m.since = now;
    if (now - m.since >= 0.5) {
      const s = stats.current;
      s.fps = m.frames / (now - m.since);
      s.cpuMs = m.cpu / m.frames;
      s.drawCalls = gl.info.render.drawCalls;
      s.triangles = gl.info.render.triangles;
      s.geometries = gl.info.memory.geometries;
      s.textures = gl.info.memory.textures;
      s.dpr = dpr;
      m.frames = 0;
      m.cpu = 0;
      m.since = now;
      if (profile) {
        gl.resolveTimestampsAsync(THREE.TimestampQuery.RENDER)
          .then((ms) => {
            s.gpuMs = typeof ms === "number" ? ms : null;
          })
          .catch(() => {
            s.gpuMs = null;
          });
      }
    }

    // ---- watchdog: give up pixels once rather than drop frames all visit --
    const h = health.current;
    h.ema += (dt - h.ema) * 0.05;
    h.cool -= dt;
    if (!profile && h.cool <= 0 && h.ema > 1 / 45 && dpr > DPR_MIN) {
      h.cool = 1.5;
      h.ema = 1 / 60;
      setDpr(Math.max(DPR_MIN, dpr * 0.85));
    }
  }, 1);

  return null;
}

/** Anything that fails on the way up — no WebGPU and no WebGL2, a compile
 *  error — leaves the poster where it is instead of a broken canvas. */
class StageBoundary extends Component<
  { onFail?: (error: unknown) => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onFail?.(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export interface EyeStageProps {
  era: ThemeConfig;
  /** Eye height as a fraction of viewport height (width usually caps it). */
  eyeHeight?: number;
  exiting?: boolean;
  reduce?: boolean;
  interactive?: boolean;
  /** Test the WebGL2 backend on a machine that has WebGPU. */
  forceWebGL?: boolean;
  /** Lab: measure GPU time and render every frame. */
  profile?: boolean;
  /** Lab: hold the pixel ratio under this, below whatever the tier allows. */
  dprCap?: number;
  onReady?: (info: EyeStageInfo) => void;
  onFail?: (error: unknown) => void;
  control?: React.MutableRefObject<EyeStageControl | null>;
  /** The shot on a wide screen (FrameBox); the loader makes room for its chrome with it. */
  frameBox?: FrameBox;
  /** Ten ways of seeing (post/era-medium.ts): the frame through each era's own screen and image technology. The loader always asks for it. */
  media?: boolean;
  /** Lab: resolves with the next drawn frame as a PNG data URL (poster capture). */
  capture?: React.MutableRefObject<(() => Promise<string>) | null>;
  className?: string;
  style?: React.CSSProperties;
}

export default function EyeStage({
  era,
  eyeHeight = 1,
  exiting = false,
  reduce = false,
  interactive = true,
  forceWebGL = false,
  profile = false,
  dprCap = 2,
  onReady,
  onFail,
  control,
  capture,
  frameBox,
  media,
  className,
  style,
}: EyeStageProps) {
  // a first guess; the scene settles it once the tier is known
  const [dpr, setDpr] = useState(() => budgetDpr(Math.min(2, dprCap)));

  return (
    <StageBoundary onFail={onFail}>
      <Canvas
        className={className}
        dpr={dpr}
        // no renderer tone mapping: the pipeline grades once, with the live eye's curve
        flat
        camera={{ fov: CAMERA_FOV, near: 1, far: 2000, position: [0, 0, 300] }}
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer({
            ...(props as THREE.WebGPURendererParameters),
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
            forceWebGL,
            trackTimestamp: profile,
          });
          await renderer.init();
          return renderer as unknown as THREE.Renderer & { render: (s: THREE.Scene, c: THREE.Camera) => void };
        }}
        style={{ position: "absolute", inset: 0, touchAction: "none", ...style }}
      >
        <EyeScene
          era={era}
          eyeHeight={eyeHeight}
          exiting={exiting}
          reduce={reduce}
          interactive={interactive}
          profile={profile}
          dprCap={dprCap}
          setDpr={setDpr}
          onReady={onReady}
          control={control}
          capture={capture}
          frameBox={frameBox}
          media={media}
        />
      </Canvas>
    </StageBoundary>
  );
}
