"use client";

/**
 * The worker eye's A/B harness (docs/EYE_WORKER_PLAN.md): the same live eye
 * with the media on, drawn on the main thread (?host=main, today's EyeStage)
 * or from a worker (?host=worker, EyeStageWorker, the loader's host), so the
 * two can be measured against each other.
 *
 * `?era=<id>` picks the era (default 1970), `?gl=1` forces WebGL2, `?covered=0`
 * warms uncovered, `?fail=1` makes the worker host fall back to the page.
 * `window.__eyeSpike` reports which thread draws and when the eye is up;
 * `__eyeProbe()` and `__eyeGpuLog()` read the worker's stage; `__eyeCtl.current`
 * is the loader's six controls (EyeLoaderControl) on either host.
 */

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";
import { gpuLog, traceGpu, type GpuCall } from "@/components/three/eye/worker/gpu-trace";
import type { EyeWorkerLab as WorkerLab } from "@/components/three/eye/EyeStageWorker";
import type { EyeLoaderControl, EyeStageControl, EyeStageInfo } from "@/components/three/eye/EyeStage";

const EyeStage = dynamic(() => import("@/components/three/eye/EyeStage"), { ssr: false });
const EyeStageWorker = dynamic(() => import("@/components/three/eye/EyeStageWorker"), { ssr: false });

type Spike = { host: string; drawn?: string; why?: string; ready?: number; backend?: string; tier?: number; fail?: string; gpu?: GpuCall[] };

function report(s: Partial<Spike>) {
  const w = window as unknown as { __eyeSpike?: Spike };
  w.__eyeSpike = { ...(w.__eyeSpike ?? { host: "?" }), ...s };
}

type Setup = { host: "main" | "worker"; era: string; gl: boolean; covered: boolean; fail: boolean };

export default function EyeWorkerLab() {
  const [setup, setSetup] = useState<Setup | null>(null);
  /** As in the loader: the stage warms covered (drawing at 10 Hz) and is uncovered once it is up. */
  const [ready, setReady] = useState(false);
  const lab = useRef<WorkerLab | null>(null);
  const control = useRef<EyeLoaderControl | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const host = q.get("host") === "main" ? "main" : "worker";
    report({ host });
    (window as unknown as { __eyeCtl?: typeof control }).__eyeCtl = control;
    const w = window as unknown as { __eyeGpuLog?: () => void; __eyeProbe?: () => Promise<unknown> };
    if (host === "main") {
      traceGpu();
      w.__eyeGpuLog = () => report({ gpu: gpuLog.map((c) => ({ ...c, at: c.at - performance.timeOrigin })) });
    } else {
      w.__eyeGpuLog = () => void lab.current?.gpuLog().then((gpu) => report({ gpu }));
      w.__eyeProbe = () => lab.current?.probe() ?? Promise.resolve(null);
    }
    setSetup({ host, era: q.get("era") ?? AVAILABLE_THEMES[0].id, gl: q.get("gl") === "1", covered: q.get("covered") !== "0", fail: q.get("fail") === "1" });
  }, []);

  const onReady = (info: EyeStageInfo) => {
    report({ ready: performance.now(), backend: info.backend, tier: info.tier });
    setReady(true);
  };
  const onFail = (err: unknown) => report({ fail: err instanceof Error ? err.message : String(err) });

  if (!setup) return null;
  const era = AVAILABLE_THEMES.find((t) => t.id === setup.era) ?? AVAILABLE_THEMES[0];
  const common = {
    era,
    media: true,
    covered: setup.covered && !ready,
    forceWebGL: setup.gl,
    calm: matchMedia("(pointer: coarse)").matches,
    onReady,
    onFail,
  };
  return (
    <div className="fixed inset-0" style={{ background: "#040507" }}>
      {setup.host === "main" ? (
        <EyeStage {...common} control={control as React.MutableRefObject<EyeStageControl | null>} />
      ) : (
        <EyeStageWorker
          {...common}
          lab={lab}
          control={control}
          trace
          rendererMs={setup.fail ? 0 : undefined}
          onHost={(drawn, why) => report({ drawn, why })}
        />
      )}
    </div>
  );
}
