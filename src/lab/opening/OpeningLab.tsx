"use client";

/**
 * Workbench for the loader's opening (docs/LOADER_OPENING_PLAN.md): the real
 * eye, framed exactly as the loader frames it, with the tube over it and the
 * same hand-off (held shut, the pixels sharpen into it, the lids open).
 *
 * URL: ?speed=0.25 slow motion · ?eye=0 the tube alone · ?main=1 the tube on
 * the main thread (the fallback) · ?reduce=1 reduced motion · ?debug=1|2 the
 * still and arrival map / the pixel levels · ?shut=1 the eye held shut, no
 * tube · ?grid=1 mm round the globe · ?media=0 no era screen look ·
 * ?era=1981 · ?clean=1 no buttons (for captures) · ?covered=0 the eye
 * draws every frame under the tube (the old way, for comparisons).
 * Replay plays it again over the eye that is already up, as a fast machine
 * would see it. window.__opening: the eye's control, replay, skip, capture
 * (the shut stills are captured with it) and stats (the tube's frame times).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";
import type { EyeStageControl } from "@/components/three/eye/EyeStage";
import { eyeShot } from "@/components/three/eye/framing";
import { ANATOMY, MM_PER_UNIT } from "@/components/three/eye/anatomy";
import TubeOpening from "@/components/ui/loader/TubeOpening";
import { holdShut, openLids } from "@/components/ui/loader/open-eye";

const EyeStage = dynamic(() => import("@/components/three/eye/EyeStage"), { ssr: false });

export default function OpeningLab() {
  const control = useRef<EyeStageControl | null>(null);
  /** The eye's next frame as a PNG data URL: the opening's shut-eye stills are captured with it. */
  const capture = useRef<(() => Promise<string>) | null>(null);
  /** The tube's frame times (worker path). */
  const stats = useRef<(() => Promise<unknown>) | null>(null);
  const [ready, setReady] = useState(false);
  const [take, setTake] = useState(0);
  const [tubeOn, setTubeOn] = useState(true);
  const [skip, setSkip] = useState(false);
  /** The tube has begun to hand over: until then the eye under it draws only now and then (?covered=0: every frame, the old way). */
  const [landed, setLanded] = useState(false);
  const cancelLids = useRef<() => void>(() => {});
  /** Where the live pupil is once the eye is up and held still, for the tube's cursor. */
  const [pupil, setPupil] = useState<{ x: number; y: number; r: number } | null>(null);
  // read after mount, so the server's render and the first client render agree
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => setParams(new URLSearchParams(window.location.search)), []);
  const q = useMemo(() => params ?? new URLSearchParams(), [params]);
  const era = AVAILABLE_THEMES.find((t) => t.id === q.get("era")) ?? AVAILABLE_THEMES[0];
  const speed = Number(q.get("speed") ?? 1) || 1;
  const withTube = q.get("shut") !== "1";

  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    (window as unknown as { __opening?: unknown }).__opening = {
      control,
      replay: () => setTake((n) => n + 1),
      skip: () => setSkip(true),
      capture: () => capture.current?.(),
      stats: () => stats.current?.(),
    };
  }, []);

  // the eye comes up under the tube held shut; read its pupil once the held gaze has settled
  useEffect(() => {
    if (!ready || !control.current) return;
    if (tubeOn || !withTube) holdShut(control.current);
    const id = window.setTimeout(() => {
      const c = control.current;
      if (!c) return;
      const iris = c.irisAt();
      setPupil({ x: iris.x, y: iris.y, r: (iris.r * c.pupilMm()) / 2 / ANATOMY.irisRadius });
    }, 350);
    return () => window.clearTimeout(id);
  }, [ready, tubeOn, withTube, take]);

  const replay = () => {
    cancelLids.current();
    if (control.current) holdShut(control.current);
    setSkip(false);
    setLanded(false);
    setTubeOn(true);
    setTake((n) => n + 1);
  };

  const onOpen = useCallback(() => {
    if (control.current) cancelLids.current = openLids(control.current, q.get("reduce") === "1");
  }, [q]);

  if (!params) return null;

  return (
    // over the site shell, as the loader is (AppLoader unmounts the site under it)
    <div className="fixed inset-0 z-[300]" style={{ background: "#040507" }} data-ready={ready || undefined}>
      {q.get("eye") !== "0" && (
        <EyeStage
          era={era}
          interactive
          control={control}
          capture={capture}
          media={q.get("media") !== "0"}
          covered={q.get("covered") !== "0" && withTube && tubeOn && !landed}
          onReady={onReady}
        />
      )}
      {withTube && tubeOn && (
        <TubeOpening
          key={take}
          ready={ready && pupil !== null}
          pupil={pupil}
          late={false}
          skip={skip}
          reduce={q.get("reduce") === "1"}
          speed={speed}
          mainThread={q.get("main") === "1"}
          debug={Number(q.get("debug") ?? 0)}
          stats={stats as React.MutableRefObject<null>}
          onLanding={() => setLanded(true)}
          onOpen={onOpen}
          onGone={() => setTubeOn(false)}
        />
      )}
      {q.get("grid") === "1" && <MmGrid />}
      {q.get("clean") !== "1" && (
        <button
          type="button"
          onClick={replay}
          className="absolute bottom-4 right-4 z-30 rounded border border-white/20 bg-black/60 px-3 py-1.5 font-mono text-xs text-white/80 hover:text-white"
        >
          Replay{ready ? "" : " (eye loading…)"}
        </button>
      )}
    </div>
  );
}

/** Millimetres round the globe's centre, every 2 mm (labels every 4), from the loader's own framing. */
function MmGrid() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const sync = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  if (!size.w) return null;
  const s = eyeShot(size.w, size.h);
  const pxPerMm = size.h / (s.span * MM_PER_UNIT);
  const lines: React.ReactNode[] = [];
  for (let mm = -20; mm <= 20; mm += 2) {
    const x = s.cx + mm * pxPerMm;
    const y = s.cy - mm * pxPerMm;
    const major = mm % 4 === 0;
    const stroke = mm === 0 ? "rgba(255,80,80,.9)" : major ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.14)";
    lines.push(<line key={`x${mm}`} x1={x} y1={0} x2={x} y2={size.h} stroke={stroke} strokeWidth={1} />);
    lines.push(<line key={`y${mm}`} x1={0} y1={y} x2={size.w} y2={y} stroke={stroke} strokeWidth={1} />);
    if (major) {
      lines.push(
        <text key={`tx${mm}`} x={x + 2} y={12} fill="#fff" fontSize={10}>
          {mm}
        </text>,
      );
      lines.push(
        <text key={`ty${mm}`} x={2} y={y - 2} fill="#fff" fontSize={10}>
          {mm}
        </text>,
      );
    }
  }
  return (
    <svg className="pointer-events-none absolute inset-0 z-40" width={size.w} height={size.h}>
      {lines}
    </svg>
  );
}
