"use client";

import { useRef } from "react";
import { isProjectNda } from "@/data/project-media";
import { useWindows } from "../use-windows";
import { WindowLayer } from "../WindowLayer";
import { label, monogram } from "../helpers";
import type { DesktopEra, Project } from "../types";

/** 2020 — Big Sur. Translucent menubar, top-right icons, floating dock. */
export function ModernDesktop({ era, projects }: { era: DesktopEra; projects: Project[] }) {
  const t = era.tokens;
  const stageRef = useRef<HTMLDivElement>(null);
  const { windows, open, close, focus } = useWindows(era.id, { x: 112, y: 24 });

  return (
    <div className="relative flex h-full flex-col" style={{ fontFamily: era.fontUi }}>
      {/* translucent menu bar */}
      <div
        className="z-20 flex items-center gap-4 px-4 py-1 text-[13px]"
        style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", color: "#1c1c1e" }}
      >
        <span aria-hidden></span>
        <span className="font-semibold">{era.brand}</span>
        {["File", "Edit", "View", "Window"].map((m) => (
          <span key={m} className="opacity-80">{m}</span>
        ))}
        <span className="ml-auto tabular-nums opacity-80">{era.os} · {era.year}</span>
      </div>

      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ background: t.wallpaper }}>
        {/* top-right rounded icons */}
        <div className="absolute right-3 top-3 z-[1] flex max-h-full flex-col items-center gap-3 overflow-y-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((p) => (
            <button key={p.id} type="button" onClick={() => open(p.id)} className="group flex w-[80px] flex-col items-center gap-1 text-center">
              <span className="relative grid h-14 w-14 place-items-center text-xl font-extrabold transition-transform group-hover:scale-105 group-active:scale-95"
                style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${t.accent} 62%, #fff) 0%, ${t.accent} 50%, color-mix(in srgb, ${t.accent} 72%, #000) 100%)`, color: t.accentText, borderRadius: 16, boxShadow: "0 6px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.55)", textShadow: t.accentText === "#ffffff" ? "0 1px 2px rgba(0,0,0,0.45)" : "none" }}>
                {monogram(p)}
                {isProjectNda(p.id) ? <span className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1 text-[8px] font-bold text-white">NDA</span> : null}
              </span>
              <span className="line-clamp-2 text-[11px] font-medium leading-tight text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                {label(p)}
              </span>
            </button>
          ))}
        </div>

        <WindowLayer era={era} projects={projects} windows={windows} onClose={close} onFocus={focus} stageRef={stageRef} />

        {/* floating centered dock */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center">
          <div
            className="pointer-events-auto flex items-end gap-2 px-3 py-2"
            style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.55)", borderRadius: 22, backdropFilter: "blur(24px)", boxShadow: "0 12px 36px rgba(0,0,0,0.3)" }}
          >
            {projects.slice(0, 9).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => open(p.id)}
                title={label(p)}
                className="grid h-12 w-12 origin-bottom place-items-center text-lg font-extrabold transition-transform duration-150 hover:-translate-y-2.5 hover:scale-[1.4]"
                style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${t.accent} 62%, #fff) 0%, ${t.accent} 50%, color-mix(in srgb, ${t.accent} 72%, #000) 100%)`, color: t.accentText, borderRadius: 14, boxShadow: "0 4px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55)", textShadow: t.accentText === "#ffffff" ? "0 1px 2px rgba(0,0,0,0.45)" : "none" }}
              >
                {monogram(p)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
