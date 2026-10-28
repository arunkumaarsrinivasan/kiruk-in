"use client";

/**
 * P0 spike (docs/EYE_WORKER_PLAN.md): the same live eye, era 1970 with the
 * media on, drawn either on the main thread (?host=main, today's EyeStage) or
 * from a worker (?host=worker), so the two can be measured against each other.
 * `?gl=1` forces WebGL2. `window.__eyeSpike` reports when the eye is up.
 */

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";
import type { EyeWorkerIn, EyeWorkerOut } from "./eye.worker";
import { gpuLog, traceGpu, type GpuCall } from "./gpu-trace";

const EyeStage = dynamic(() => import("@/components/three/eye/EyeStage"), { ssr: false });

type Spike = { host: string; ready?: number; backend?: string; tier?: number; fail?: string; gpu?: GpuCall[] };

function report(s: Partial<Spike>) {
  const w = window as unknown as { __eyeSpike?: Spike };
  w.__eyeSpike = { ...(w.__eyeSpike ?? { host: "?" }), ...s };
}

/** Font files by family, read from the page's @font-face rules: the worker draws 2026's readout with the same face. */
function fontFiles(): Record<string, string> {
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
      if (family && url && !out[family]) out[family] = url;
    }
  }
  return out;
}

function WorkerHost({ era, forceWebGL, covered }: { era: string; forceWebGL: boolean; covered: boolean }) {
  const box = useRef<HTMLDivElement | null>(null);
  const coveredSend = useRef<(c: boolean) => void>(() => {});
  useEffect(() => coveredSend.current(covered), [covered]);
  useEffect(() => {
    const host = box.current;
    if (!host) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;touch-action:none";
    host.appendChild(canvas);
    const worker = new Worker(new URL("./eye.worker.ts", import.meta.url), { type: "module" });
    const send = (m: EyeWorkerIn, t?: Transferable[]) => worker.postMessage(m, t ?? []);
    worker.onmessage = (e: MessageEvent<EyeWorkerOut>) => {
      const m = e.data;
      if (m.type === "ready") report({ ready: m.at - performance.timeOrigin, backend: m.backend, tier: m.tier });
      else if (m.type === "gpulog") report({ gpu: m.calls.map((c) => ({ ...c, at: c.at - performance.timeOrigin })) });
      else report({ fail: m.message });
    };
    (window as unknown as { __eyeGpuLog?: () => void }).__eyeGpuLog = () => send({ type: "gpulog" });
    coveredSend.current = (c) => send({ type: "covered", covered: c });
    const off = canvas.transferControlToOffscreen();
    send(
      {
        type: "init",
        canvas: off,
        w: window.innerWidth,
        h: window.innerHeight,
        dpr: window.devicePixelRatio || 1,
        coarse: matchMedia("(pointer: coarse)").matches,
        forceWebGL,
        era,
        covered,
        fonts: fontFiles(),
      },
      [off],
    );
    const onPointer = (e: PointerEvent) =>
      send({ type: "event", name: e.type, clientX: e.clientX, clientY: e.clientY, pointerType: e.pointerType, left: !e.relatedTarget });
    const onBlur = () => send({ type: "event", name: "blur", clientX: 0, clientY: 0, pointerType: "mouse", left: true });
    const onResize = () => send({ type: "resize", w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1 });
    const onVis = () => send({ type: "hidden", hidden: document.hidden });
    const kinds = ["pointermove", "pointerdown", "pointerup", "pointercancel", "pointerout"] as const;
    for (const k of kinds) window.addEventListener(k, onPointer, { passive: true });
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      for (const k of kinds) window.removeEventListener(k, onPointer);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      worker.terminate();
      canvas.remove();
    };
    // (covered is sent as it changes, above; the worker starts with the first value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [era, forceWebGL]);
  return <div ref={box} className="absolute inset-0" />;
}

export default function EyeWorkerLab() {
  const [setup, setSetup] = useState<{ host: "main" | "worker"; gl: boolean; covered: boolean } | null>(null);
  /** As in the loader: the stage warms covered (drawing at 10 Hz) and is uncovered once it is up. */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => {
      if ((window as unknown as { __eyeSpike?: Spike }).__eyeSpike?.ready) setReady(true);
    }, 100);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const host = q.get("host") === "main" ? "main" : "worker";
    report({ host });
    if (host === "main") {
      traceGpu();
      (window as unknown as { __eyeGpuLog?: () => void }).__eyeGpuLog = () =>
        report({ gpu: gpuLog.map((c) => ({ ...c, at: c.at - performance.timeOrigin })) });
    }
    setSetup({ host, gl: q.get("gl") === "1", covered: q.get("covered") !== "0" });
  }, []);
  const era = AVAILABLE_THEMES[0];
  return (
    <div className="fixed inset-0" style={{ background: "#040507" }}>
      {setup?.host === "main" && (
        <EyeStage
          era={era}
          media
          covered={setup.covered && !ready}
          forceWebGL={setup.gl}
          calm={typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches}
          onReady={(info) => report({ ready: performance.now(), backend: info.backend, tier: info.tier })}
          onFail={(err) => report({ fail: err instanceof Error ? err.message : String(err) })}
        />
      )}
      {setup?.host === "worker" && <WorkerHost era={era.id} forceWebGL={setup.gl} covered={setup.covered && !ready} />}
    </div>
  );
}
