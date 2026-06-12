"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { isProjectNda } from "@/data/project-media";
import { ProjectCaseStudy } from "../ProjectCaseStudy";
import { label, categoryGlyph } from "../helpers";
import type { DesktopEra, Project } from "../types";

const FILTERS = ["All", "ai", "web", "mobile", "design"] as const;

/** 2026 — AI-native. Prompt-driven, filterable glass cards, glass result panel. */
export function AiDesktop({ era, projects }: { era: DesktopEra; projects: Project[] }) {
  const t = era.tokens;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selected, setSelected] = useState<Project | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter !== "All" && p.category !== filter) return false;
      if (!q) return true;
      const hay = [p.title, p.description, p.category, ...(p.tags ?? []), ...(p.technologies ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, query, filter]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden" style={{ fontFamily: era.fontUi, background: t.wallpaper, color: t.text }}>
      <div className="z-10 flex items-center px-5 py-3 text-[13px]">
        <span className="font-semibold" style={{ color: t.text }}>◈ {era.brand}</span>
        <span className="ml-auto" style={{ color: t.textMuted }}>{era.year}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {/* hero prompt */}
        <div className="mx-auto max-w-2xl pt-4 text-center">
          <h2 className="text-2xl font-semibold" style={{ color: t.text }}>
            What do you want to see?
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: t.textMuted }}>
            Ask for work by tech, type, or outcome — or tap a filter.
          </p>

          <div
            className="mt-4 flex items-center gap-2 px-4 py-3"
            style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, backdropFilter: "blur(18px)" }}
          >
            <span style={{ color: t.accent }}>✦</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. “Next.js design system” or “AI fintech”"
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:opacity-60"
              style={{ color: t.text }}
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="text-[13px]" style={{ color: t.textMuted }}>
                clear
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {FILTERS.map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className="px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
                  style={{
                    background: on ? t.accent : "transparent",
                    color: on ? t.accentText : t.textMuted,
                    border: `1px solid ${on ? t.accent : t.border}`,
                    borderRadius: 999,
                  }}
                >
                  {f === "All" ? "All" : f}
                </button>
              );
            })}
          </div>
        </div>

        {/* result cards */}
        <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p)}
              className="group flex flex-col gap-2 p-4 text-left transition-transform hover:-translate-y-1"
              style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, backdropFilter: "blur(16px)" }}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl text-base" style={{ background: `color-mix(in srgb, ${t.accent} 22%, transparent)`, color: t.accent }}>
                  {categoryGlyph(p.category)}
                </span>
                {isProjectNda(p.id) ? <span className="text-[9px] font-bold uppercase" style={{ color: t.textMuted }}>NDA</span> : null}
              </div>
              <p className="text-[15px] font-semibold leading-tight" style={{ color: t.text }}>{label(p)}</p>
              <p className="line-clamp-2 text-[12px] leading-snug" style={{ color: t.textMuted }}>{p.description}</p>
              <div className="mt-auto flex flex-wrap gap-1 pt-1">
                {p.technologies.slice(0, 3).map((tech) => (
                  <span key={tech} className="px-1.5 py-0.5 text-[9px] uppercase tracking-wide" style={{ border: `1px solid ${t.border}`, color: t.textMuted, borderRadius: 4 }}>
                    {tech}
                  </span>
                ))}
              </div>
            </button>
          ))}
          {results.length === 0 ? (
            <p className="col-span-full py-10 text-center text-[13px]" style={{ color: t.textMuted }}>
              No work matches “{query}”. Try another phrase or filter.
            </p>
          ) : null}
        </div>
      </div>

      {/* glass result panel */}
      <AnimatePresence>
        {selected ? (
          <motion.div
            className="absolute inset-0 z-30 grid place-items-center p-4"
            style={{ background: "rgba(4,6,14,0.55)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="flex max-h-[88%] w-[min(520px,94%)] flex-col overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, backdropFilter: "blur(24px)", boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.accent }} />
                <span className="truncate text-[14px] font-semibold" style={{ color: t.text }}>{label(selected)}</span>
                <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="ml-auto grid h-6 w-6 place-items-center rounded-full text-[14px] hover:bg-white/10" style={{ color: t.text }}>
                  ×
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ProjectCaseStudy project={selected} era={era} />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
