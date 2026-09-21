"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { portfolioData } from "@/data/portfolio-data";
import { isProjectNda } from "@/data/project-media";
import {
  ProjectCategoryCover,
  isRasterThumbnail,
} from "@/components/ui/ProjectCategoryCover";
import { ProjectThumbnail } from "@/components/ui/ProjectThumbnail";
import type { CharacterSide } from "@/components/ui/SplitCharacter";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type Project = (typeof portfolioData.projects)[number];
type Side = "designer" | "developer" | "both";

const CATEGORIES = ["All", "Web", "Mobile", "Design", "AI"] as const;

function projectSide(p: Project): Side {
  const role = p.role.toLowerCase();
  if (role.includes("full-stack") || role.includes("&")) return "both";
  if (p.category === "design" || role.includes("design")) return "designer";
  if (p.links?.github || p.technologies.some((t) => /next|react|node|cms/i.test(t)))
    return "developer";
  return "designer";
}

function matchesCategory(p: Project, cat: string): boolean {
  if (cat === "All") return true;
  if (cat === "Design") return p.category === "design";
  if (cat === "AI") return p.tags.some((t) => /ai|ml|chat/i.test(t));
  return p.category.toLowerCase() === cat.toLowerCase();
}

function matchesSide(p: Project, side: CharacterSide): boolean {
  if (!side) return true;
  const s = projectSide(p);
  return s === "both" || s === side;
}

interface ProjectShowcaseSliderProps {
  readonly activeSide: CharacterSide;
}

export function ProjectShowcaseSlider({ activeSide }: ProjectShowcaseSliderProps) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [activeIndex, setActiveIndex] = useState(0);

  const projects = useMemo(
    () =>
      portfolioData.projects.filter(
        (p) => matchesCategory(p, category) && matchesSide(p, activeSide),
      ),
    [category, activeSide],
  );

  useEffect(() => {
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ left: 0, behavior: reduce ? "auto" : "smooth" });
  }, [category, activeSide, reduce]);

  const syncIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || projects.length === 0) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let min = Number.POSITIVE_INFINITY;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const mid = card.offsetLeft + card.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < min) {
        min = d;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }, [projects.length]);

  const scrollTo = useCallback(
    (index: number) => {
      const card = cardRefs.current[index];
      const el = scrollRef.current;
      if (!card || !el) return;
      const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
      el.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
      setActiveIndex(index);
    },
    [reduce],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncIndex);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [syncIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollTo(Math.max(0, activeIndex - 1));
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollTo(Math.min(projects.length - 1, activeIndex + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, projects.length, scrollTo]);

  const primaryProjectUrl = (p: Project): string | undefined => {
    if (isProjectNda(p.id)) return undefined;
    return p.links?.live ?? p.links?.demo ?? p.links?.figma ?? p.links?.behance ?? p.links?.github;
  };

  const primaryCtaLabel = (p: Project): string => {
    if (p.links?.live) return "Live site";
    if (p.links?.figma) return "Figma";
    if (p.links?.behance) return "Behance";
    if (p.links?.github) return "GitHub";
    return "View project";
  };

  const showPrimaryCta = (p: Project): boolean => !!primaryProjectUrl(p);

  const openProject = (p: Project) => {
    const url = primaryProjectUrl(p);
    if (url) globalThis.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section aria-label="Featured projects" className="w-full">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: "var(--accent-color)" }}
          >
            Work · deep dives
          </p>
          <h2
            className="mt-1 text-xl font-bold sm:text-2xl"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}
          >
            Selected work
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const on = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
                style={{
                  border: `1px solid ${on ? "var(--accent-color)" : "var(--border-color)"}`,
                  borderRadius: "var(--era-radius-full, 999px)",
                  background: on
                    ? "color-mix(in srgb, var(--accent-color) 14%, transparent)"
                    : "transparent",
                  color: on ? "var(--accent-color)" : "var(--text-muted)",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {projects.length === 0 ? (
        <div
          className="rounded-[var(--era-radius-md,10px)] border px-6 py-12 text-center text-sm"
          style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          No projects in this filter — try another category or tap the character to reset.
        </div>
      ) : (
        <>
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollPaddingInline: "max(1rem, 8vw)" }}
            >
              {projects.map((p, i) => {
                const active = i === activeIndex;
                return (
                  <motion.article
                    key={p.id}
                    id={p.id}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    layout
                    className="relative shrink-0 snap-center scroll-mt-24"
                    style={{ width: "min(88vw, 420px)" }}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: EASE_OUT }}
                  >
                    <div
                      className="flex h-full min-h-[460px] flex-col overflow-hidden border-2 transition-[transform,box-shadow] duration-300"
                      style={{
                        borderColor: active ? "var(--accent-color)" : "var(--border-color)",
                        borderRadius: "var(--era-radius-md, 10px)",
                        background: "var(--bg-card)",
                        boxShadow: active
                          ? "0 12px 40px color-mix(in srgb, var(--accent-color) 18%, transparent)"
                          : "var(--era-shadow, none)",
                        transform: active ? "scale(1)" : "scale(0.97)",
                      }}
                    >
                      <div className="relative h-44 shrink-0 overflow-hidden">
                        {p.images?.thumbnail && isRasterThumbnail(p.images.thumbnail) ? (
                          <ProjectThumbnail src={p.images.thumbnail} />
                        ) : (
                          <ProjectCategoryCover
                            projectId={p.id}
                            title={p.title}
                            category={p.category}
                          />
                        )}
                        <span
                          className="absolute left-4 top-4 z-[1] text-[12px] font-bold tabular-nums uppercase tracking-[0.2em]"
                          style={{
                            color: "rgba(255,255,255,0.55)",
                            textShadow: "0 1px 10px rgba(0,0,0,0.6)",
                          }}
                        >
                          {["I", "II", "III", "IV", "V"][i] ?? i + 1}
                        </span>
                        {isProjectNda(p.id) ? (
                          <span
                            className="absolute right-4 top-12 z-[1] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                            style={{
                              background: "rgba(245,158,11,0.18)",
                              border: "1px solid rgba(245,158,11,0.7)",
                              borderRadius: "var(--era-radius-sm, 4px)",
                              color: "#fbbf24",
                            }}
                          >
                            NDA
                          </span>
                        ) : null}
                        <div
                          className="absolute inset-x-0 bottom-0 h-px"
                          style={{
                            background: active
                              ? "var(--accent-color)"
                              : "color-mix(in srgb, var(--border-color) 80%, transparent)",
                          }}
                        />
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <h3
                          className="text-lg font-bold leading-tight"
                          style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}
                        >
                          {p.title}
                        </h3>
                        <p
                          className="line-clamp-3 text-sm leading-relaxed"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {p.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.technologies.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 text-[10px] uppercase tracking-wide"
                              style={{
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--era-radius-sm, 4px)",
                                color: "var(--text-muted)",
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        {p.metrics?.impact ? (
                          <div
                            className="flex items-start gap-2 rounded-[var(--era-radius-sm,4px)] px-2.5 py-2"
                            style={{
                              background: "color-mix(in srgb, var(--accent-color) 8%, transparent)",
                              border: "1px solid color-mix(in srgb, var(--accent-color) 22%, transparent)",
                            }}
                          >
                            <span aria-hidden style={{ color: "var(--accent-color)" }}>
                              ↗
                            </span>
                            <p
                              className="text-[11px] leading-snug"
                              style={{ color: "var(--text-main)" }}
                            >
                              {p.metrics.impact}
                            </p>
                          </div>
                        ) : null}
                        <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
                          {p.role} · {p.timeline.duration}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-2 pt-2">
                          {showPrimaryCta(p) ? (
                            <button
                              type="button"
                              onClick={() => openProject(p)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
                              style={{
                                background: "var(--accent-color)",
                                color: "var(--bg-main)",
                                borderRadius: "var(--era-radius-full, 999px)",
                              }}
                            >
                              {primaryCtaLabel(p)}
                              <span aria-hidden>→</span>
                            </button>
                          ) : null}
                          {!isProjectNda(p.id) && p.links?.figma && p.links.figma !== primaryProjectUrl(p) ? (
                            <Link
                              href={p.links.figma}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70"
                              style={{
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--era-radius-full, 999px)",
                                color: "var(--text-main)",
                              }}
                            >
                              Figma
                            </Link>
                          ) : null}
                          {!isProjectNda(p.id) && p.links?.behance && p.links.behance !== primaryProjectUrl(p) ? (
                            <Link
                              href={p.links.behance}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70"
                              style={{
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--era-radius-full, 999px)",
                                color: "var(--text-main)",
                              }}
                            >
                              Behance
                            </Link>
                          ) : null}
                          {!isProjectNda(p.id) && p.links?.github && p.links.github !== primaryProjectUrl(p) ? (
                            <Link
                              href={p.links.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70"
                              style={{
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--era-radius-full, 999px)",
                                color: "var(--text-main)",
                              }}
                            >
                              GitHub
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            {projects.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  aria-label="Previous project"
                  className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 px-2 py-3 sm:block disabled:opacity-30"
                  style={{
                    background: "color-mix(in srgb, var(--bg-main) 85%, transparent)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--era-radius-full, 999px)",
                    color: "var(--text-main)",
                  }}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo(Math.min(projects.length - 1, activeIndex + 1))}
                  disabled={activeIndex >= projects.length - 1}
                  aria-label="Next project"
                  className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 px-2 py-3 sm:block disabled:opacity-30"
                  style={{
                    background: "color-mix(in srgb, var(--bg-main) 85%, transparent)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--era-radius-full, 999px)",
                    color: "var(--text-main)",
                  }}
                >
                  →
                </button>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex gap-1.5">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Go to ${p.title}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  onClick={() => scrollTo(i)}
                  className="h-1.5 rounded-full transition-[width,background-color] duration-300"
                  style={{
                    width: i === activeIndex ? 24 : 8,
                    background:
                      i === activeIndex ? "var(--accent-color)" : "var(--border-color)",
                  }}
                />
              ))}
            </div>
            <span className="text-[11px] tabular-nums uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
              {activeIndex + 1} / {projects.length}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

export default ProjectShowcaseSlider;
