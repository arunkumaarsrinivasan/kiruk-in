/**
 * What the eye needs from the place it runs, in one place.
 *
 * The stage runs on the page's main thread today and, by docs/EYE_WORKER_PLAN.md,
 * from a worker too, where there is no `document` and no `window`: no <canvas>
 * or <img> to make, no window to measure. Everything the eye's own code asks
 * of its host goes through here, so the same code runs in both.
 *
 * The page's host is the default and does exactly what the eye did before
 * this module existed (same elements, same loader), so nothing on the page
 * changes. A worker installs its own with `setEyeEnv` before the stage mounts.
 *
 * (bake/vessels.ts already draws on an OffscreenCanvas wherever one exists,
 * and stays as it is.)
 */

import { Texture, TextureLoader } from "three/webgpu";

export type EyeCanvas = HTMLCanvasElement | OffscreenCanvas;

export interface EyeEnv {
  /** A 2D drawing surface this size, px. */
  canvas(width: number, height: number): EyeCanvas;
  /** Loads an image as a texture; the texture is handed to `onLoad` once it has its pixels. */
  loadTexture(url: string, onLoad: (texture: Texture) => void, onError: (err: unknown) => void): void;
  /** Resolves once text in this font can be drawn on this host's canvases (FontFaceSet.load). */
  loadFont(font: string): Promise<unknown>;
  /** The view the stage fills: CSS px, and device px per CSS px. */
  viewport(): { width: number; height: number; dpr: number };
  /** A finger, not a cursor. */
  coarse(): boolean;
  /** Whether the page is in the background (nothing should render). */
  hidden(): boolean;
  /** The visitor's pointer, focus and the page's visibility, as the stage hears them. Returns the unsubscribe. */
  listen(on: EyeListeners): () => void;
}

/** Where the pointer is: CSS px from the view's top left, and what it is (mouse, touch, pen). */
export interface EyePointer {
  clientX: number;
  clientY: number;
  pointerType: string;
}

/** What the stage hears. Each is optional; only those given are listened for. */
export interface EyeListeners {
  move?: (p: EyePointer) => void;
  down?: (p: EyePointer) => void;
  /** Lifted or cancelled. */
  up?: () => void;
  /** The pointer left an element; `left` when it left the page altogether (no element it went to). */
  out?: (p: { pointerType: string; left: boolean }) => void;
  /** The window lost focus. */
  blur?: () => void;
  visibility?: (hidden: boolean) => void;
}

/** One of those, as a message: how a page forwards them to a worker. */
export type EyeInputEvent =
  | ({ type: "move" | "down" } & EyePointer)
  | { type: "up" }
  | { type: "out"; pointerType: string; left: boolean }
  | { type: "blur" }
  | { type: "visibility"; hidden: boolean };

/** The page's main thread: the DOM, as the eye always used it. */
export const pageEnv: EyeEnv = {
  canvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  },
  loadTexture(url, onLoad, onError) {
    new TextureLoader().load(url, onLoad, undefined, onError);
  },
  loadFont(font) {
    return document.fonts?.load(font) ?? Promise.resolve([]);
  },
  viewport() {
    if (typeof window === "undefined") return { width: 1, height: 1, dpr: 1 };
    return { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio || 1 };
  },
  coarse() {
    return globalThis.matchMedia?.("(pointer: coarse)").matches ?? false;
  },
  hidden() {
    return typeof document !== "undefined" && document.hidden;
  },
  // the same listeners the stage always set: pointer and focus on the window
  // (passive), visibility on the document
  listen(on) {
    const offs: (() => void)[] = [];
    const add = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, passive = true) => {
      window.addEventListener(type, fn, passive ? { passive: true } : undefined);
      offs.push(() => window.removeEventListener(type, fn));
    };
    if (on.move) add("pointermove", on.move);
    if (on.down) add("pointerdown", on.down);
    if (on.up) {
      const up = on.up;
      add("pointerup", () => up());
      add("pointercancel", () => up());
    }
    if (on.out) {
      const out = on.out;
      add("pointerout", (e) => out({ pointerType: e.pointerType, left: !e.relatedTarget }));
    }
    if (on.blur) {
      const blur = on.blur;
      add("blur", () => blur(), false);
    }
    if (on.visibility) {
      const vis = on.visibility;
      const sync = () => vis(document.hidden);
      document.addEventListener("visibilitychange", sync);
      offs.push(() => document.removeEventListener("visibilitychange", sync));
    }
    return () => {
      for (const off of offs) off();
    };
  },
};

let env: EyeEnv = pageEnv;

/** The host the eye is running on. */
export function eyeEnv(): EyeEnv {
  return env;
}

/** A worker installs its host before the stage mounts. */
export function setEyeEnv(next: EyeEnv) {
  env = next;
}

/** What a worker knows of the page it draws for: the page tells it (resize, pointer). */
export interface WorkerView {
  width: number;
  height: number;
  dpr: number;
  coarse: boolean;
  /** Same-origin base for the eye's assets (the worker's own URL is under /_next). */
  origin: string;
  /** Font files by CSS family, for 2026's readout: the worker has none of the page's fonts. */
  fonts?: Record<string, string>;
}

/**
 * A worker's host: OffscreenCanvases, images decoded with createImageBitmap,
 * fonts added to the worker's own FontFaceSet, and the view as the page last
 * reported it (`view` is read live, so the caller updates it on resize). The
 * pointer, focus and visibility arrive as the page's messages, through `emit`.
 */
export function workerEnv(view: WorkerView): EyeEnv & { emit(e: EyeInputEvent): void } {
  const added = new Map<string, Promise<unknown>>();
  const fontSet = (globalThis as unknown as { fonts?: FontFaceSet }).fonts;
  /** The stage's listeners, fed by `emit` from the page's messages (forwardInput). */
  const listeners = new Set<EyeListeners>();
  let hidden = false;
  return {
    canvas: (width, height) => new OffscreenCanvas(width, height),
    loadTexture(url, onLoad, onError) {
      fetch(new URL(url, view.origin))
        .then((r) => {
          if (!r.ok) throw new Error(`${r.status} ${url}`);
          return r.blob();
        })
        // as an <img> is uploaded: three flips it (flipY) and nothing else touches the pixels
        .then((blob) => createImageBitmap(blob, { premultiplyAlpha: "none", colorSpaceConversion: "none" }))
        .then((bitmap) => {
          const texture = new Texture(bitmap);
          texture.needsUpdate = true;
          onLoad(texture);
        })
        .catch(onError);
    },
    loadFont(font) {
      if (!fontSet) return Promise.reject(new Error("no FontFaceSet in this worker"));
      // "80px Family, fallback": the first family is the one asked for
      const family = font.replace(/^[^a-zA-Z_'"]*\d+px\s+/, "").split(",")[0].trim().replace(/^['"]|['"]$/g, "");
      const url = view.fonts?.[family];
      if (!url) return Promise.reject(new Error(`no file for ${family}`));
      let ready = added.get(family);
      if (!ready) {
        const face = new FontFace(family, `url(${new URL(url, view.origin).href})`);
        ready = face.load().then((f) => fontSet.add(f));
        added.set(family, ready);
      }
      return ready.then(() => fontSet.load(font));
    },
    viewport: () => ({ width: view.width, height: view.height, dpr: view.dpr }),
    coarse: () => view.coarse,
    hidden: () => hidden,
    listen(on) {
      listeners.add(on);
      return () => listeners.delete(on);
    },
    emit(e) {
      if (e.type === "visibility") hidden = e.hidden;
      for (const on of listeners) {
        if (e.type === "move") on.move?.(e);
        else if (e.type === "down") on.down?.(e);
        else if (e.type === "up") on.up?.();
        else if (e.type === "out") on.out?.(e);
        else if (e.type === "blur") on.blur?.();
        else if (e.type === "visibility") on.visibility?.(e.hidden);
      }
    },
  };
}

/**
 * The page's side of a worker stage: forwards what the stage would hear on
 * the page (the same listeners, pageEnv.listen) as messages. Returns the unsubscribe.
 */
export function forwardInput(send: (e: EyeInputEvent) => void): () => void {
  return pageEnv.listen({
    move: (p) => send({ type: "move", clientX: p.clientX, clientY: p.clientY, pointerType: p.pointerType }),
    down: (p) => send({ type: "down", clientX: p.clientX, clientY: p.clientY, pointerType: p.pointerType }),
    up: () => send({ type: "up" }),
    out: (p) => send({ type: "out", ...p }),
    blur: () => send({ type: "blur" }),
    visibility: (hidden) => send({ type: "visibility", hidden }),
  });
}
