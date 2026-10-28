"use client";

/**
 * The brow's bone chain over the face (docs/EYE_BROW_EMOTION_PLAN.md): its
 * five nodes where they rest (dim) and where the rig has them now (lit),
 * joined by their bones, with each muscle's pull and the strongest feelings.
 * Lab only. `window.__eyeBrow()` returns the same as numbers for headless runs.
 */

import { useEffect, useRef, useState } from "react";
import type { EyeStageControl } from "@/components/three/eye/EyeStage";
import type { BrowInfo } from "@/components/three/eye/rig/brow";

type Pt = { x: number; y: number };

interface Drawn {
  rest: Pt[];
  live: Pt[];
  info: BrowInfo;
}

const AU_NAMES = ["AU1 inner", "AU2 outer", "AU4 lower", "AU6 orbic."];

const path = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("");

export default function BrowOverlay({ control }: { control: React.RefObject<EyeStageControl | null> }) {
  const [d, setD] = useState<Drawn | null>(null);
  const last = useRef<BrowInfo | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const c = control.current;
      if (c) {
        const info = c.browInfo();
        last.current = info;
        const live = info.points.map((p) => c.project(p));
        const rest = info.points.map((p, i) => c.project([p[0] - info.nodes[i].dx, p[1] - info.nodes[i].dy, p[2] - info.nodes[i].bulge]));
        setD({ rest, live, info });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const w = window as unknown as { __eyeBrow?: () => BrowInfo | null };
    w.__eyeBrow = () => last.current;
    return () => {
      cancelAnimationFrame(raf);
      delete w.__eyeBrow;
    };
  }, [control]);

  if (!d) return null;
  const top = Object.entries(d.info.emotions)
    .filter(([, v]) => v > 0.02)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={path(d.rest)} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1} strokeDasharray="3 4" />
        {d.rest.map((p, i) => (
          <circle key={`r${i}`} cx={p.x} cy={p.y} r={3} fill="none" stroke="rgba(255,255,255,0.35)" />
        ))}
        <path d={path(d.live)} fill="none" stroke="#ffcf5a" strokeWidth={2} />
        {d.live.map((p, i) => (
          <circle key={`l${i}`} cx={p.x} cy={p.y} r={4.5} fill="#ffcf5a" stroke="#000" strokeWidth={1} />
        ))}
      </svg>
      <div className="pointer-events-none absolute left-4 top-4 rounded bg-black/60 px-3 py-2 font-mono text-[10px] leading-[1.5] text-white/85">
        {d.info.au.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16">{AU_NAMES[i]}</span>
            <span className="inline-block h-1.5 bg-[#ffcf5a]" style={{ width: `${Math.min(v, 2) * 40}px` }} />
            <span className="text-white/50">{v.toFixed(2)}</span>
          </div>
        ))}
        <div className="mt-1 text-white/60">{top.length ? top.map(([k, v]) => `${k} ${v.toFixed(2)}`).join(" · ") : "rest"}</div>
      </div>
    </>
  );
}
