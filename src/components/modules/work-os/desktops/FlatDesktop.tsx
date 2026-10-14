"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { isProjectNda } from "@/data/project-media";
import { ProjectCaseStudy } from "../ProjectCaseStudy";
import { label, categoryGlyph } from "../helpers";
import { useFocusProject } from "../use-focus-project";
import type { DesktopProps, Project } from "../types";

const TILE_COLOR: Record<string, string> = {
  ai: "#7c3aed",
  web: "#2563eb",
  mobile: "#0d9488",
  design: "#db2777",
};

/** 2015 — Flat / Metro. Live-tile Start screen, slide-in detail panel. */
export function FlatDesktop({ era, projects, focusId }: DesktopProps) {
  const t = era.tokens;
  const [selected, setSelected] = useState<Project | null>(null);

  useFocusProject(focusId, (id) => setSelected(projects.find((p) => p.id === id) ?? null));

  return (
    <div className="relative flex h-full flex-col overflow-hidden" style={{ fontFamily: era.fontUi, background: t.wallpaper }}>
      {/* top bar */}
      <div className="flex items-center gap-3 px-5 py-3" style={{ color: "#f9fafb" }}>
        <span className="text-[15px] font-semibold">Start</span>
        <div className="ml-2 flex-1 max-w-xs rounded-sm px-3 py-1 text-[12px]" style={{ background: "rgba(255,255,255,0.1)", color: "#cbd5e1" }}>
          🔍 Search work…
        </div>
        <span className="ml-auto text-[12px] opacity-70">{era.brand} · {era.year}</span>
      </div>

      {/* live tiles */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" style={{ gridAutoRows: "108px" }}>
          {projects.map((p, i) => {
            const color = i === 0 ? t.accent : TILE_COLOR[p.category] ?? t.accent;
            const wide = i === 0;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className={`group relative flex flex-col justify-between overflow-hidden p-3 text-left transition-transform active:scale-[0.98] ${wide ? "col-span-2 row-span-2" : ""}`}
                style={{ background: color, color: "#fff" }}
              >
                <span className={`opacity-90 ${wide ? "text-4xl" : "text-2xl"}`}>{categoryGlyph(p.category)}</span>
                <div>
                  <p className={`font-semibold leading-tight ${wide ? "text-lg" : "text-[13px]"}`}>{label(p)}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] opacity-80">{p.category}</p>
                </div>
                {isProjectNda(p.id) ? (
                  <span className="absolute right-2 top-2 bg-black/30 px-1.5 py-0.5 text-[10px] font-bold uppercase">NDA</span>
                ) : null}
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "rgba(255,255,255,0.08)" }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* slide-in detail panel */}
      <AnimatePresence>
        {selected ? (
          <>
            <motion.div
              className="absolute inset-0 z-10"
              style={{ background: "rgba(0,0,0,0.45)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="absolute right-0 top-0 z-20 flex h-full w-[min(460px,92%)] flex-col"
              style={{ background: t.surface }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex items-center gap-2 px-4 py-3" style={{ background: t.accent, color: t.accentText }}>
                <button type="button" onClick={() => setSelected(null)} aria-label="Back" className="text-[18px] leading-none">
                  ←
                </button>
                <span className="truncate text-[15px] font-semibold">{label(selected)}</span>
                <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="ml-auto text-[18px] leading-none">
                  ×
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ProjectCaseStudy project={selected} era={era} />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
