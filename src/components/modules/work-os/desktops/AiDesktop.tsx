"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { isProjectNda } from "@/data/project-media";
import { ProjectCaseStudy } from "../ProjectCaseStudy";
import { label } from "../helpers";
import { useFocusProject } from "../use-focus-project";
import { FONT_VARS_2026, MONO_2026 } from "@/components/era-shell/archetypes/prompt-ui/fonts";
import type { DesktopProps, Project } from "../types";

const FILTERS = ["All", "ai", "web", "mobile", "design"] as const;

/** 2026 — No Screen. Ask for work in words and filter, in the quiet room: ink, hairlines, the device orange. */
export function AiDesktop({ era, projects, focusId }: DesktopProps) {
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

  useFocusProject(focusId, (id) => setSelected(projects.find((p) => p.id === id) ?? null));

  return (
    <div className={`relative flex h-full flex-col overflow-hidden ${FONT_VARS_2026}`} style={{ fontFamily: era.fontUi, background: t.wallpaper, color: t.text }}>
      <div className="z-10 flex items-center px-5 py-3 text-[12px]" style={{ fontFamily: MONO_2026, borderBottom: `1px solid ${t.border}` }}>
        <span style={{ color: t.text }}>{era.brand}</span>
        <span className="ml-auto" style={{ color: t.textMuted }}>{era.year}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {/* hero prompt */}
        <div className="mx-auto max-w-4xl pt-8">
          <h2 className="text-[28px] font-medium leading-tight tracking-[-0.02em] sm:text-[34px]" style={{ color: t.text }}>
            What do you want to see?
          </h2>
          <p className="mt-2 text-[15px]" style={{ color: t.textMuted }}>
            Ask for work by tech, type, or outcome — or tap a filter.
          </p>

          <div
            className="mt-5 flex max-w-xl items-center gap-2 focus-within:[box-shadow:0_1px_0_0_currentColor]"
            style={{ borderBottom: `1px solid ${t.text}` }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. “Next.js design system” or “AI fintech”"
              className="h-12 flex-1 bg-transparent text-[16px] outline-none sm:text-[16px]"
              style={{ color: t.text, caretColor: t.accent, borderRadius: 0 }}
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="min-h-11 px-1 text-[14px] underline underline-offset-4" style={{ color: t.textMuted }}>
                clear
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className="min-h-11 px-3 text-[12px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    background: on ? t.text : "transparent",
                    color: on ? t.wallpaper : t.text,
                    border: `1px solid ${on ? t.text : t.border}`,
                    borderRadius: 6,
                    fontFamily: MONO_2026,
                  }}
                >
                  {f === "All" ? "All" : f}
                </button>
              );
            })}
          </div>
        </div>

        {/* result cards */}
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p)}
              className="group flex flex-col gap-2 p-4 text-left transition-colors hover:[border-color:var(--wos-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, ["--wos-ink" as string]: t.text }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: t.textMuted, fontFamily: MONO_2026 }}>
                  {p.category}
                </span>
                {isProjectNda(p.id) ? <span className="text-[11px]" style={{ color: t.textMuted, fontFamily: MONO_2026 }}>nda</span> : null}
              </div>
              <p className="text-[17px] font-medium leading-snug" style={{ color: t.text }}>{label(p)}</p>
              <p className="line-clamp-2 text-[14px] leading-snug" style={{ color: t.textMuted }}>{p.description}</p>
              <div className="mt-auto flex flex-wrap gap-1 pt-1">
                {p.technologies.slice(0, 3).map((tech) => (
                  <span key={tech} className="text-[11px]" style={{ color: t.textMuted, fontFamily: MONO_2026 }}>
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
            style={{ background: "rgba(26,25,21,0.28)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="flex max-h-[88%] w-[min(520px,94%)] flex-col overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, boxShadow: "0 1px 2px rgba(26,25,21,0.06), 0 8px 24px rgba(26,25,21,0.08), 0 24px 64px rgba(26,25,21,0.10)" }}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0, transition: { duration: 0.14 } }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
                <span className="h-1.5 w-1.5" style={{ background: t.accent }} />
                <span className="truncate text-[14px] font-semibold" style={{ color: t.text }}>{label(selected)}</span>
                <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="ml-auto -mr-2 grid h-11 w-11 place-items-center text-[18px] focus-visible:outline focus-visible:outline-2" style={{ color: t.text }}>
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
