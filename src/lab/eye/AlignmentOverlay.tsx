"use client";

/**
 * R0's alignment check (docs/EYE_REALISM_PLAN.md §8.2 C4): the lid margins as
 * the CPU twin computes them from this frame's uniforms (green), projected
 * through the stage's camera, over the opening the era media assume today
 * (`almond()` in post/medium-kit.ts, magenta) and the iris they draw at
 * (dashed). Where green and magenta part, a medium's sign or mask misses
 * the real lid. `window.__eyeAlign()` returns the same gaps as numbers for
 * headless runs (scripts/eye-realism-baseline.mjs).
 */

import { useEffect, useRef, useState } from "react";
import type { EyeStageControl } from "@/components/three/eye/EyeStage";
import { marginCurves } from "@/components/three/eye/twin/margins";

type Pt = { x: number; y: number };

export interface AlignmentReport {
  pxPerMm: number;
  /** Largest vertical gap between the real margin and the media's almond, over the opening (mm). */
  upperMm: number;
  lowerMm: number;
  /** Real corner minus the media's corner, along x (mm; + is further out). */
  medialMm: number;
  lateralMm: number;
}

interface Drawn {
  upper: Pt[];
  lower: Pt[];
  almondTop: Pt[];
  almondBot: Pt[];
  iris: { x: number; y: number; r: number };
  report: AlignmentReport;
}

function measure(c: EyeStageControl): Drawn {
  const L = c.lidUniforms();
  const curves = marginCurves(L, L.blink, 96);
  const upper = curves.upper.map((p) => c.project(p));
  const lower = curves.lower.map((p) => c.project(p));
  const g = c.mediumGeometry();
  const pxPerMm = g.R / 6;
  // the almond as post/medium-kit.ts draws it (k = 1)
  const almondAt = (x: number) => {
    const dx = x - g.e.x;
    const aw = dx < 0 ? g.apX[0] : g.apX[1];
    const sx = Math.pow(Math.max(1 - (dx / aw) * (dx / aw), 0), 0.75);
    return { top: g.e.y - g.apY[0] * sx, bot: g.e.y + g.apY[1] * sx };
  };
  const almondTop: Pt[] = [];
  const almondBot: Pt[] = [];
  for (let i = 0; i <= 96; i++) {
    const x = g.e.x - g.apX[0] + ((g.apX[0] + g.apX[1]) * i) / 96;
    const a = almondAt(x);
    almondTop.push({ x, y: a.top });
    almondBot.push({ x, y: a.bot });
  }
  const inside = (p: Pt) => p.x > g.e.x - g.apX[0] && p.x < g.e.x + g.apX[1];
  const gap = (pts: Pt[], key: "top" | "bot") =>
    pts.filter(inside).reduce((m, p) => Math.max(m, Math.abs(p.y - almondAt(p.x)[key])), 0);
  const report: AlignmentReport = {
    pxPerMm,
    upperMm: gap(upper, "top") / pxPerMm,
    lowerMm: gap(lower, "bot") / pxPerMm,
    medialMm: (g.e.x - g.apX[0] - upper[0].x) / pxPerMm,
    lateralMm: (upper[upper.length - 1].x - (g.e.x + g.apX[1])) / pxPerMm,
  };
  return { upper, lower, almondTop, almondBot, iris: { x: g.pc.x, y: g.pc.y, r: g.R }, report };
}

const path = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("");

export default function AlignmentOverlay({ control }: { control: React.RefObject<EyeStageControl | null> }) {
  const [d, setD] = useState<Drawn | null>(null);
  const last = useRef<Drawn | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const c = control.current;
      if (c) {
        last.current = measure(c);
        setD(last.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const w = window as unknown as { __eyeAlign?: () => AlignmentReport | null };
    w.__eyeAlign = () => last.current?.report ?? null;
    return () => {
      cancelAnimationFrame(raf);
      delete w.__eyeAlign;
    };
  }, [control]);

  if (!d) return null;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <path d={path(d.almondTop)} fill="none" stroke="#ff4fd8" strokeWidth={1.25} />
      <path d={path(d.almondBot)} fill="none" stroke="#ff4fd8" strokeWidth={1.25} />
      <circle cx={d.iris.x} cy={d.iris.y} r={d.iris.r} fill="none" stroke="#ff4fd8" strokeWidth={1} strokeDasharray="4 4" />
      <path d={path(d.upper)} fill="none" stroke="#7cff9e" strokeWidth={1.25} />
      <path d={path(d.lower)} fill="none" stroke="#7cff9e" strokeWidth={1.25} />
    </svg>
  );
}
