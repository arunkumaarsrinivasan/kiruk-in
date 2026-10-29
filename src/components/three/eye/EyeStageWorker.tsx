"use client";

/**
 * The live eye drawn from a worker (docs/EYE_WORKER_PLAN.md, P3): EyeStage's
 * props, the loader's six controls, and the same pixels, but its shader builds
 * and frames run on their own thread, so a tap or key during the opening never
 * waits on them.
 *
 * The page keeps the canvas's box, hands the canvas to worker/eye.worker.ts,
 * and forwards what the stage would hear (input.ts). The loader's getters read
 * the worker's last frame. Nothing here loads three: if the worker can't run
 * the eye (no OffscreenCanvas, the worker fails to load, no renderer in time,
 * an error), this mounts today's EyeStage instead, with the same props.
 */

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { EyeLoaderControl, EyeStageControl, EyeStageProps } from "./EyeStage";
import { forwardInput } from "./input";
// importing the family puts its @font-face on this page (next/font), for fontFiles to find
import { MONO_FAMILY_2026 } from "@/components/era-shell/archetypes/prompt-ui/fonts";
import type { EyeCommand, EyeProbe, EyeSnapshot, FromEyeWorker, ToEyeWorker, WorkerSceneProps } from "./worker/protocol";
import type { GpuCall } from "./worker/gpu-trace";

const EyeStage = dynamic(() => import("./EyeStage"), { ssr: false });

/** From the worker's code running to its renderer being up; past this, the page draws the eye. */
const RENDERER_MS = 8000;

/** Lab: reach into the worker's stage. */
export interface EyeWorkerLab {
  probe(): Promise<EyeProbe | null>;
  gpuLog(): Promise<GpuCall[]>;
}

export interface EyeStageWorkerProps extends Omit<EyeStageProps, "control" | "capture" | "profile"> {
  control?: React.MutableRefObject<EyeLoaderControl | null>;
  /** Which thread draws the eye: the worker, or the page (and why) once it has fallen back. */
  onHost?: (host: "worker" | "page", reason?: string) => void;
  /** Lab: time GPU pipeline creation in the worker (worker/gpu-trace.ts). */
  trace?: boolean;
  /** Lab: the worker's renderer timeout, ms (0 forces the fallback). */
  rendererMs?: number;
  lab?: React.MutableRefObject<EyeWorkerLab | null>;
}

/** Whether this browser can hand a canvas to a worker at all. */
function canTransfer() {
  return typeof OffscreenCanvas !== "undefined" && typeof HTMLCanvasElement !== "undefined" && "transferControlToOffscreen" in HTMLCanvasElement.prototype;
}

/** Whether a @font-face's unicode-range (empty: everything) covers this code point. */
function covers(range: string, cp: number) {
  if (!range.trim()) return true;
  return range.split(",").some((part) => {
    const [a, b] = part.trim().replace(/^u\+/i, "").split("-");
    const lo = parseInt(a.replace(/\?/g, "0"), 16);
    const hi = parseInt((b ?? a).replace(/\?/g, "f"), 16);
    return cp >= lo && cp <= hi;
  });
}

/** The families the eye draws on its canvases: 2026's readout, in Geist Mono. */
const EYE_FONTS = [MONO_FAMILY_2026.split(",")[0].trim().replace(/^['"]|['"]$/g, "")];

/**
 * Font files by family, read from the page's @font-face rules, for 2026's
 * readout (the worker has none of the page's fonts). next/font splits a family
 * into subsets; the readout draws digits, so this takes the face that has "0".
 */
function fontFiles(families: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const family = rule.style.getPropertyValue("font-family").trim().replace(/^['"]|['"]$/g, "");
      const url = /url\(["']?([^"')]+)["']?\)/.exec(rule.style.getPropertyValue("src"))?.[1];
      if (families.includes(family) && url && !out[family] && covers(rule.style.getPropertyValue("unicode-range"), 0x30)) out[family] = url;
    }
  }
  return out;
}

const NO_SPOT = { x: 0, y: 0, r: 0 };

export default function EyeStageWorker(props: EyeStageWorkerProps) {
  const { era, exiting = false, reduce = false, interactive = true, forceWebGL = false, dprCap = 2, onReady, onFail, control, frameBox, media, calm, covered, tier, className, style } = props;
  const { onHost, trace = false, rendererMs = RENDERER_MS, lab } = props;
  const [host, setHost] = useState<"worker" | "page">(() => (canTransfer() ? "worker" : "page"));
  const box = useRef<HTMLDivElement | null>(null);
  const send = useRef<((m: ToEyeWorker) => void) | null>(null);
  /** Why the page draws the eye, once it does. */
  const why = useRef("no OffscreenCanvas");

  const sceneProps: WorkerSceneProps = { era: era.id, exiting, reduce, interactive, dprCap, media, calm, covered, frameBox, tier };
  const latest = useRef(sceneProps);
  latest.current = sceneProps;
  const handlers = useRef({ onReady, onFail, onHost });
  handlers.current = { onReady, onFail, onHost };

  useEffect(() => {
    if (host === "page") handlers.current.onHost?.("page", why.current);
  }, [host]);

  useEffect(() => {
    if (host !== "worker") return;
    const el = box.current;
    if (!el) return;
    // a fresh canvas per worker: a canvas hands over its control only once
    const canvas = document.createElement("canvas");
    canvas.className = className ?? "";
    Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", touchAction: "none", ...style });
    el.appendChild(canvas);

    let worker: Worker;
    try {
      worker = new Worker(new URL("./worker/eye.worker.ts", import.meta.url), { type: "module" });
    } catch (err) {
      canvas.remove();
      why.current = String(err);
      setHost("page");
      return;
    }
    const post = (m: ToEyeWorker, transfer: Transferable[] = []) => worker.postMessage(m, transfer);
    let snap: EyeSnapshot | null = null;
    let done = false;
    let timer = 0;
    const waits: { probe: ((p: EyeProbe | null) => void)[]; gpu: ((c: GpuCall[]) => void)[] } = { probe: [], gpu: [] };

    const command = (c: EyeCommand) => post({ type: "command", command: c });
    const proxy: EyeLoaderControl = {
      irisAt: () => ({ ...(snap?.iris ?? NO_SPOT) }),
      eyeCentre: () => ({ ...(snap?.centre ?? NO_SPOT) }),
      pupilMm: () => snap?.pupilMm ?? 0,
      holdBlink: (value) => command({ name: "holdBlink", value }),
      holdGaze: (target) => command({ name: "holdGaze", target }),
      travel: (pos) => command({ name: "travel", pos }),
    };

    const stop = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      stopInput();
      window.removeEventListener("resize", resize);
      observer.disconnect();
      worker.terminate();
      canvas.remove();
      send.current = null;
      if (control?.current === proxy) control.current = null;
      if (lab) lab.current = null;
    };
    // the worker can't draw the eye here: the page does, with the same props
    const fallBack = (reason: string) => {
      if (done) return;
      stop();
      console.warn(`[eye] drawing on the page: ${reason}`);
      why.current = reason;
      setHost("page");
    };

    worker.onerror = (e) => fallBack(e.message || "the worker failed to load");
    worker.onmessageerror = () => fallBack("a message could not be read");
    worker.onmessage = (e: MessageEvent<FromEyeWorker>) => {
      const m = e.data;
      if (m.type === "boot") {
        timer = window.setTimeout(() => fallBack(`no renderer in ${rendererMs} ms`), rendererMs);
      } else if (m.type === "renderer") {
        window.clearTimeout(timer);
        handlers.current.onHost?.("worker");
      } else if (m.type === "frame") {
        snap = m.snapshot;
      } else if (m.type === "ready") {
        snap = m.snapshot ?? snap;
        if (control) control.current = proxy;
        handlers.current.onReady?.(m.info);
      } else if (m.type === "fail") {
        fallBack(m.message);
      } else if (m.type === "probe") {
        waits.probe.splice(0).forEach((r) => r(m.probe));
      } else if (m.type === "gpulog") {
        waits.gpu.splice(0).forEach((r) => r(m.calls.map((c) => ({ ...c, at: c.at - performance.timeOrigin }))));
      }
    };

    const measure = () => {
      const r = canvas.getBoundingClientRect();
      return {
        view: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio || 1 },
        size: { width: Math.max(1, r.width), height: Math.max(1, r.height) },
      };
    };
    const resize = () => post({ type: "resize", ...measure() });
    const observer = new ResizeObserver(resize);

    const offscreen = canvas.transferControlToOffscreen();
    const { view, size } = measure();
    post(
      {
        type: "init",
        canvas: offscreen,
        view: { ...view, coarse: matchMedia("(pointer: coarse)").matches, origin: window.location.origin, fonts: fontFiles(EYE_FONTS) },
        size,
        hidden: document.hidden,
        forceWebGL,
        trace,
        props: latest.current,
      },
      [offscreen],
    );
    // what the stage would hear on the page, as messages (input.ts)
    const stopInput = forwardInput((event) => post({ type: "input", event }));
    window.addEventListener("resize", resize);
    observer.observe(canvas);
    send.current = (m) => post(m);
    if (lab) {
      lab.current = {
        probe: () =>
          new Promise((resolve) => {
            waits.probe.push(resolve);
            post({ type: "probe" });
          }),
        gpuLog: () =>
          new Promise((resolve) => {
            waits.gpu.push(resolve);
            post({ type: "gpulog" });
          }),
      };
    }
    return stop;
    // the canvas, worker and renderer live as long as these; props change by message (below)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host, forceWebGL, trace]);

  // EyeStage's props, sent as they change (the worker waits for its renderer before drawing them)
  const key = JSON.stringify(sceneProps);
  useEffect(() => {
    send.current?.({ type: "props", props: latest.current });
  }, [key]);

  if (host === "page") {
    return (
      <EyeStage
        era={era}
        exiting={exiting}
        reduce={reduce}
        interactive={interactive}
        forceWebGL={forceWebGL}
        dprCap={dprCap}
        onReady={onReady}
        onFail={onFail}
        // the page's stage fills it with the whole control; the loader uses six of it
        control={control as React.MutableRefObject<EyeStageControl | null> | undefined}
        frameBox={frameBox}
        media={media}
        calm={calm}
        covered={covered}
        tier={tier}
        className={className}
        style={style}
      />
    );
  }
  return <div ref={box} style={{ position: "absolute", inset: 0 }} />;
}
