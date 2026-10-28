/**
 * P0 spike (docs/EYE_WORKER_PLAN.md): the live EyeScene, unchanged, rendered
 * by r3f into an OffscreenCanvas from a dedicated worker, so its shader builds
 * and frames never share the thread that answers the visitor's input.
 */

import "./shim-globals";
import { createElement } from "react";
import { createRoot } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { EyeScene } from "@/components/three/eye/EyeStage";
import { CAMERA_FOV } from "@/components/three/eye/anatomy";
import { budgetDpr } from "@/components/three/eye/tiers";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";
import { setHidden, view } from "./shim-globals";
import { setEyeEnv, workerEnv } from "@/components/three/eye/env";
import { gpuLog, traceGpu, type GpuCall } from "./gpu-trace";

traceGpu();

export type EyeWorkerIn =
  | { type: "init"; canvas: OffscreenCanvas; w: number; h: number; dpr: number; coarse: boolean; forceWebGL: boolean; era: string; covered: boolean; fonts: Record<string, string> }
  | { type: "resize"; w: number; h: number; dpr: number }
  | { type: "event"; name: string; clientX: number; clientY: number; pointerType: string; left: boolean }
  | { type: "hidden"; hidden: boolean }
  | { type: "gpulog" }
  | { type: "covered"; covered: boolean };

export type EyeWorkerOut =
  | { type: "ready"; backend: string; tier: number; at: number }
  | { type: "fail"; message: string }
  | { type: "gpulog"; calls: GpuCall[] };

const post = (m: EyeWorkerOut) => (self as unknown as Worker).postMessage(m);
/** Wall-clock ms, comparable with the page's performance.timeOrigin + now(). */
const wall = () => performance.timeOrigin + performance.now();

let root: ReturnType<typeof createRoot<OffscreenCanvas>> | null = null;
let dpr = 1;
let props: Parameters<typeof EyeScene>[0] | null = null;

const size = () => ({ width: view.width, height: view.height, top: 0, left: 0 });

setEyeEnv(workerEnv(view));

self.addEventListener("error", (e) => post({ type: "fail", message: String((e as ErrorEvent).message) }));
self.addEventListener("unhandledrejection", (e) => post({ type: "fail", message: String((e as PromiseRejectionEvent).reason) }));

self.onmessage = async (e: MessageEvent<EyeWorkerIn>) => {
  const m = e.data;
  if (m.type === "init") {
    Object.assign(view, { width: m.w, height: m.h, dpr: m.dpr, coarse: m.coarse, fonts: m.fonts });
    dpr = budgetDpr(Math.min(2, m.dpr));
    const era = AVAILABLE_THEMES.find((t) => t.id === m.era) ?? AVAILABLE_THEMES[0];
    try {
      root = createRoot(m.canvas);
      await root.configure({
        gl: async (props) => {
          const renderer = new THREE.WebGPURenderer({
            ...(props as THREE.WebGPURendererParameters),
            antialias: false,
            alpha: false,
            powerPreference: "high-performance",
            forceWebGL: m.forceWebGL,
          });
          await renderer.init();
          return renderer as unknown as THREE.Renderer & { render: (s: THREE.Scene, c: THREE.Camera) => void };
        },
        size: size(),
        dpr,
        flat: true,
        camera: { fov: CAMERA_FOV, near: 1, far: 2000, position: [0, 0, 300] },
      });
      props = {
          era,
          exiting: false,
          reduce: false,
          interactive: true,
          profile: false,
          dprCap: 2,
          media: true,
          calm: m.coarse,
          covered: m.covered,
          setDpr: (next: number) => {
            dpr = next;
            void root?.configure({ size: size(), dpr });
          },
          onReady: (info) => post({ type: "ready", backend: info.backend, tier: info.tier, at: wall() }),
      };
      root.render(createElement(EyeScene, props));
    } catch (err) {
      post({ type: "fail", message: err instanceof Error ? err.message : String(err) });
    }
  } else if (m.type === "resize") {
    Object.assign(view, { width: m.w, height: m.h, dpr: m.dpr });
    void root?.configure({ size: size(), dpr });
  } else if (m.type === "event") {
    // the stage listens on `window` (here, the worker's own scope)
    const ev = Object.assign(new Event(m.name), {
      clientX: m.clientX,
      clientY: m.clientY,
      pointerType: m.pointerType,
      relatedTarget: m.left ? null : {},
    });
    self.dispatchEvent(ev);
  } else if (m.type === "hidden") {
    setHidden(m.hidden);
  } else if (m.type === "covered") {
    if (root && props) root.render(createElement(EyeScene, (props = { ...props, covered: m.covered })));
  } else if (m.type === "gpulog") {
    post({ type: "gpulog", calls: gpuLog });
  }
};
