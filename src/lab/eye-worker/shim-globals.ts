/**
 * The worker spike (docs/EYE_WORKER_PLAN.md): what EyeStage's scene still
 * reads from `window` and `document` itself — pointer listeners on `window`,
 * `document.hidden`, `window.setTimeout`, the window's size for the pointer —
 * until P2 moves them onto an input bus. Everything else the eye needs from
 * its host goes through eye/env.ts (`workerEnv`), so `document` here makes no
 * elements at all: a canvas asked of it would be a bug.
 *
 * Imported first by eye.worker.ts, so it runs before three or the eye's
 * modules evaluate.
 */

import type { WorkerView } from "@/components/three/eye/env";

/** What the page last told the worker; workerEnv reads the same object. */
export const view: WorkerView = { width: 1, height: 1, dpr: 1, coarse: false, origin: self.location.origin };

type Doc = EventTarget & { hidden: boolean; visibilityState: DocumentVisibilityState; createElement: (tag: string) => never };

const g = globalThis as unknown as Record<string, unknown>;

if (typeof g.window === "undefined") {
  g.window = g;
  for (const [key, read] of [
    ["innerWidth", () => view.width],
    ["innerHeight", () => view.height],
    ["devicePixelRatio", () => view.dpr],
  ] as const) {
    Object.defineProperty(g, key, { get: read, configurable: true });
  }
  const doc = new EventTarget() as Doc;
  doc.hidden = false;
  doc.visibilityState = "visible";
  doc.createElement = (tag: string) => {
    throw new Error(`eye worker: <${tag}> asked of document; route it through eye/env.ts`);
  };
  g.document = doc;
}

/** The page's visibility, from the main thread. */
export function setHidden(hidden: boolean) {
  const doc = g.document as Doc;
  doc.hidden = hidden;
  doc.visibilityState = hidden ? "hidden" : "visible";
  doc.dispatchEvent(new Event("visibilitychange"));
}
