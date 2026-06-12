"use client";

import { motion, useDragControls } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { isProjectNda } from "@/data/project-media";
import { buildWorkDir, linkGlyph } from "../work-fs";
import type { DirNode, DocNode, FsNode } from "../work-fs";
import { monogram } from "../helpers";
import { DocBody } from "../DocBody";
import type { DesktopEra, Project } from "../types";

interface VWin { key: string; dir: DirNode; x: number; y: number; z: number }

/** 2023 — Spatial OS. Glass slabs floating in real 3D depth, mouse parallax. */
export function VisionDesktop({ era, projects }: { era: DesktopEra; projects: Project[] }) {
  const t = era.tokens;
  const stageRef = useRef<HTMLDivElement>(null);
  const root = useMemo(() => buildWorkDir(projects, era.id), [projects]);
  const [wins, setWins] = useState<VWin[]>([]);
  const [par, setPar] = useState({ x: 0, y: 0 });
  const [stageW, setStageW] = useState(800);
  const counter = useRef(0);
  const z = useRef(10);

  useEffect(() => {
    const measure = () => setStageW(stageRef.current?.clientWidth ?? 800);
    measure();
    globalThis.addEventListener("resize", measure);
    return () => globalThis.removeEventListener("resize", measure);
  }, []);

  const open = (dir: DirNode) => {
    const existing = wins.find((w) => w.dir.name === dir.name);
    z.current += 1;
    if (existing) { setWins((w) => w.map((x) => (x.key === existing.key ? { ...x, z: z.current } : x))); return; }
    counter.current += 1;
    const n = counter.current;
    setWins((w) => [...w, { key: `w${n}`, dir, x: 90 + (n % 4) * 150, y: 70 + (n % 3) * 70, z: z.current }]);
  };
  const focus = (key: string) => { z.current += 1; setWins((w) => w.map((x) => (x.key === key ? { ...x, z: z.current } : x))); };
  const close = (key: string) => setWins((w) => w.filter((x) => x.key !== key));

  const onMove = (e: React.PointerEvent) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    setPar({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={onMove}
      className="relative h-full overflow-hidden"
      style={{ fontFamily: era.fontUi, background: "radial-gradient(90% 70% at 50% 0%, #20223a 0%, #111120 50%, #06060c 100%)", perspective: "1400px" }}
    >
      {/* parallax environment */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ transform: `translate(${par.x * -16}px, ${par.y * -12}px)`, transition: "transform 0.25s ease-out", transformStyle: "preserve-3d" }}
      >
        {/* stars */}
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 20%, #cfe, transparent), radial-gradient(1px 1px at 40% 60%, #fff, transparent), radial-gradient(1px 1px at 85% 50%, #bdf, transparent), radial-gradient(1px 1px at 55% 80%, #fff, transparent)", backgroundSize: "100% 100%" }} />
        {/* depth orbs */}
        <div className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full opacity-50" style={{ background: "radial-gradient(circle, rgba(127,208,255,0.55), transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute right-[6%] top-[40%] h-80 w-80 rounded-full opacity-50" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.5), transparent 70%)", filter: "blur(46px)" }} />
        {/* receding floor grid */}
        <div
          className="absolute inset-x-[-30%] bottom-[-10%] h-[55%]"
          style={{
            transform: `rotateX(72deg) translateY(${par.y * 8}px)`,
            transformOrigin: "center top",
            backgroundImage: "linear-gradient(rgba(127,208,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(127,208,255,0.22) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 80%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 80%)",
          }}
        />
      </div>

      {/* greeting */}
      <div className="pointer-events-none absolute left-1/2 top-6 z-[1] -translate-x-1/2 text-center" style={{ transform: `translateX(-50%) translate(${par.x * 6}px, ${par.y * 4}px)` }}>
        <p className="text-[16px] font-semibold" style={{ color: t.text, textShadow: "0 2px 20px rgba(127,208,255,0.5)" }}>Your work, in space</p>
        <p className="text-[12px]" style={{ color: t.textMuted }}>Tap an app — drag the glass slabs anywhere</p>
      </div>

      {/* floating windows */}
      {wins.map((w) => {
        const tilt = Math.max(-20, Math.min(20, ((w.x + 150 - stageW / 2) / (stageW / 2)) * -18));
        return <VisionWindow key={w.key} win={w} tilt={tilt} stageRef={stageRef} t={t} onClose={() => close(w.key)} onFocus={() => focus(w.key)} />;
      })}

      {/* app launcher — curved glass shelf */}
      <div className="absolute bottom-6 left-1/2 z-[2] flex -translate-x-1/2 items-end gap-3 rounded-[32px] px-5 py-3"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(34px) saturate(1.4)", boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.35)", transformStyle: "preserve-3d" }}>
        {root.children.slice(0, 10).map((d, i) => {
          const p = (d as DirNode).project as Project;
          const mid = (10 - 1) / 2;
          const lift = Math.round((1 - Math.abs(i - mid) / mid) * 8); // center icons lifted
          return (
            <button key={d.name} type="button" onClick={() => open(d as DirNode)} title={(d as DirNode).label}
              className="group relative grid h-14 w-14 place-items-center rounded-2xl text-lg font-bold transition-transform duration-200 hover:-translate-y-3 hover:scale-110"
              style={{ transform: `translateY(${-lift}px)`, background: `linear-gradient(150deg, color-mix(in srgb, ${t.accent} 78%, #fff) 0%, ${t.accent} 55%, color-mix(in srgb, ${t.accent} 72%, #000) 100%)`, color: t.accentText, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 22px rgba(0,0,0,0.5)" }}>
              {monogram(p)}
              {isProjectNda(p.id) ? <span className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1 text-[7px] font-bold text-white">NDA</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VisionWindow({ win, tilt, stageRef, t, onClose, onFocus }: { win: VWin; tilt: number; stageRef: React.RefObject<HTMLDivElement | null>; t: DesktopEra["tokens"]; onClose: () => void; onFocus: () => void }) {
  const controls = useDragControls();
  const files = win.dir.children;
  const [sel, setSel] = useState<FsNode | null>(files.find((f) => f.kind === "doc") ?? files[0] ?? null);

  return (
    <motion.div
      drag dragListener={false} dragControls={controls} dragMomentum={false} dragConstraints={stageRef}
      onPointerDown={onFocus}
      initial={{ opacity: 0, scale: 0.9, rotateY: tilt }}
      animate={{ opacity: 1, scale: 1, rotateY: tilt, rotateX: -4 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className="absolute flex max-h-[78%] w-[min(440px,88%)] flex-col overflow-hidden rounded-[26px]"
      style={{
        left: win.x, top: win.y, zIndex: win.z,
        background: "rgba(36,38,56,0.5)",
        border: "1px solid rgba(255,255,255,0.28)",
        backdropFilter: "blur(40px) saturate(1.5)",
        boxShadow: "0 60px 120px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.35) inset",
        transformStyle: "preserve-3d",
      }}
    >
      {/* top: close orb + title */}
      <div className="flex items-center gap-2 px-4 pt-3">
        <button type="button" aria-label="Close" onClick={onClose} className="grid h-7 w-7 place-items-center rounded-full text-[14px]" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", color: t.text }}>×</button>
        <span className="flex-1 truncate text-center text-[14px] font-semibold" style={{ color: t.text }}>{win.dir.label}</span>
        <span className="w-7" />
      </div>

      <div className="flex min-h-0 flex-1 px-2 pb-2 pt-2">
        {/* file list */}
        <div className="w-[148px] shrink-0 overflow-y-auto pr-1">
          {files.map((n) => {
            const on = sel?.name === n.name;
            return (
              <button key={n.name} type="button" onClick={() => { if (n.kind === "link") globalThis.open(n.href, "_blank", "noopener"); else setSel(n); }}
                className="mb-1 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-[12px] transition-colors"
                style={{ background: on ? "rgba(127,208,255,0.22)" : "rgba(255,255,255,0.05)", color: t.text, border: `1px solid ${on ? "rgba(127,208,255,0.4)" : "transparent"}` }}>
                <span>{n.kind === "link" ? linkGlyph(n.linkType) : "📄"}</span>
                <span className="truncate">{n.name}</span>
              </button>
            );
          })}
        </div>
        {/* content */}
        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl px-4 py-3" style={{ background: "rgba(0,0,0,0.18)" }}>
          {sel && sel.kind === "doc" ? (
            <DocBody lines={(sel as DocNode).lines} skin="glass" t={t} />
          ) : sel && sel.kind === "link" ? (
            <div className="flex flex-col items-start gap-2 text-[13px]" style={{ color: t.text }}>
              <span className="text-3xl">{linkGlyph(sel.linkType)}</span>
              <p className="font-semibold">{sel.label}</p>
              <a href={sel.href} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-1.5 text-[12px] font-semibold" style={{ background: t.accent, color: t.accentText }}>Open ↗</a>
            </div>
          ) : <p className="text-[12px]" style={{ color: t.textMuted }}>Select a file</p>}
        </div>
      </div>

      {/* visionOS grabber bar */}
      <div onPointerDown={(e: PointerEvent) => controls.start(e)} className="flex cursor-grab justify-center py-2 active:cursor-grabbing">
        <span className="h-1.5 w-16 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
      </div>
    </motion.div>
  );
}
