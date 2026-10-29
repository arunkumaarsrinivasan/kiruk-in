/**
 * The live eye, drawn from a worker (docs/EYE_WORKER_PLAN.md, P3): the same
 * EyeScene the page mounts, rendered by r3f into the page's canvas handed over
 * as an OffscreenCanvas, so its shader builds and frames never share the
 * thread that answers the visitor. There is no `window` or `document` here and
 * none is faked: the eye asks its host for everything through env.ts, and this
 * worker's host is `workerEnv`, fed by the page's messages (EyeStageWorker).
 */

import { createElement } from "react";
import { addAfterEffect, createRoot } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { EyeScene, StageBoundary, type EyeStageControl, type SceneProps } from "../EyeStage";
import { CAMERA_FOV } from "../anatomy";
import { budgetDpr } from "../tiers";
import { setEyeEnv, workerEnv, type WorkerView } from "../env";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";
import { gpuLog, traceGpu } from "./gpu-trace";
import type { EyeSnapshot, FromEyeWorker, ToEyeWorker, WorkerSceneProps } from "./protocol";

const post = (m: FromEyeWorker) => (self as unknown as Worker).postMessage(m);

/** What the page last told the worker; the host reads it live. */
const view: WorkerView = { width: 1, height: 1, dpr: 1, coarse: false, origin: self.location.origin };
const host = workerEnv(view);
setEyeEnv(host);

/** The drawing size, CSS px: the canvas's box on the page (the view is the window, for the pointer). */
const size = { width: 1, height: 1, top: 0, left: 0 };
let root: ReturnType<typeof createRoot<OffscreenCanvas>> | null = null;
/** Set once the renderer is configured: r3f would make a default renderer for a render before that. */
let configured = false;
/** The page's latest props; a change before the renderer is up waits for it. */
let latest: WorkerSceneProps | null = null;
let dpr = 1;
let failed = false;
const control: { current: EyeStageControl | null } = { current: null };

function fail(err: unknown) {
  if (failed) return;
  failed = true;
  post({ type: "fail", message: err instanceof Error ? err.message : String(err) });
}

self.addEventListener("error", (e) => fail((e as ErrorEvent).message));
self.addEventListener("unhandledrejection", (e) => fail((e as PromiseRejectionEvent).reason));

const snapshot = (c: EyeStageControl): EyeSnapshot => ({ iris: c.irisAt(), centre: c.eyeCentre(), pupilMm: c.pupilMm() });

function sceneProps(p: WorkerSceneProps): SceneProps {
  return {
    era: AVAILABLE_THEMES.find((t) => t.id === p.era) ?? AVAILABLE_THEMES[0],
    exiting: p.exiting,
    reduce: p.reduce,
    interactive: p.interactive,
    profile: false,
    dprCap: p.dprCap,
    media: p.media,
    calm: p.calm,
    covered: p.covered,
    frameBox: p.frameBox,
    tier: p.tier,
    control,
    // as EyeStage's Canvas owns the ratio, the root does here
    setDpr: (next) => {
      dpr = next;
      void root?.configure({ size: { ...size }, dpr });
    },
    onReady: (info) => post({ type: "ready", info, snapshot: control.current ? snapshot(control.current) : null }),
  };
}

function render(p: WorkerSceneProps) {
  latest = p;
  if (!configured || failed) return;
  root?.render(createElement(StageBoundary, { onFail: fail }, createElement(EyeScene, sceneProps(p))));
}

// the loader's getters read the last frame's (at most a frame old, as the
// iris moves between frames anyway); sent only when something moved
let last = "";
addAfterEffect(() => {
  const c = control.current;
  if (!c || host.hidden()) return;
  const s = snapshot(c);
  const key = `${s.iris.x},${s.iris.y},${s.iris.r},${s.centre.x},${s.centre.y},${s.centre.r},${s.pupilMm}`;
  if (key === last) return;
  last = key;
  post({ type: "frame", snapshot: s });
});

self.onmessage = async (e: MessageEvent<ToEyeWorker>) => {
  const m = e.data;
  if (m.type === "init") {
    // r3f's frame loop and the stage's clock both run on it; Safari's workers may not have it
    if (typeof self.requestAnimationFrame !== "function") return fail("no requestAnimationFrame in this worker");
    if (m.trace) traceGpu();
    Object.assign(view, m.view);
    Object.assign(size, m.size);
    if (m.hidden) host.emit({ type: "visibility", hidden: true });
    // a first guess, as EyeStage makes; the scene settles it once the tier is known
    dpr = budgetDpr(Math.min(2, m.props.dprCap));
    try {
      root = createRoot(m.canvas);
      await root.configure({
        gl: async (rendererProps) => {
          const renderer = new THREE.WebGPURenderer({
            ...(rendererProps as THREE.WebGPURendererParameters),
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
            forceWebGL: m.forceWebGL,
          });
          await renderer.init();
          const webgpu = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend === true;
          post({ type: "renderer", backend: webgpu ? "webgpu" : "webgl2" });
          return renderer as unknown as THREE.Renderer & { render: (s: THREE.Scene, c: THREE.Camera) => void };
        },
        size: { ...size },
        dpr,
        // no renderer tone mapping: the pipeline grades once, with the live eye's curve
        flat: true,
        camera: { fov: CAMERA_FOV, near: 1, far: 2000, position: [0, 0, 300] },
      });
      configured = true;
      render(latest ?? m.props);
    } catch (err) {
      fail(err);
    }
  } else if (m.type === "props") {
    render(m.props);
  } else if (m.type === "resize") {
    Object.assign(view, m.view);
    Object.assign(size, m.size);
    if (configured) void root?.configure({ size: { ...size }, dpr });
  } else if (m.type === "input") {
    host.emit(m.event);
  } else if (m.type === "command") {
    const c = control.current;
    const k = m.command;
    if (!c) return;
    if (k.name === "holdBlink") c.holdBlink(k.value);
    else if (k.name === "holdGaze") c.holdGaze(k.target);
    else c.travel(k.pos);
  } else if (m.type === "probe") {
    const c = control.current;
    const g = c?.gazeTrace().at(-1) as { yaw?: number } | undefined;
    const fonts = (self as unknown as { fonts?: Iterable<FontFace> }).fonts;
    post({
      type: "probe",
      probe: c
        ? {
            iris: c.irisAt(),
            yaw: g?.yaw ?? null,
            emotions: Object.fromEntries(Object.entries(c.browInfo().emotions).filter(([, v]) => v > 0.01)),
            clock: c.gazeLog().now,
            fonts: fonts ? Array.from(fonts, (f) => `${f.family}:${f.status}`) : [],
          }
        : null,
    });
  } else if (m.type === "gpulog") {
    post({ type: "gpulog", calls: gpuLog });
  }
};

post({ type: "boot" });
