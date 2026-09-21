"use client";

/**
 * EraTimeMachineChrome — single shell for era browsing.
 *
 * Header: context + primary actions. Stage: archetype previews only.
 * Footer: prev/next + year scrubber. Avoids duplicate close/transport on each era.
 */

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { ThemeConfig } from "@/data/portfolio-data";

export interface EraTimeMachineChromeProps {
  era: ThemeConfig;
  eras: ThemeConfig[];
  selectedIndex: number;
  total: number;
  prevEra: ThemeConfig | null;
  nextEra: ThemeConfig | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (eraId: string) => void;
  children: React.ReactNode;
}

export function EraTimeMachineChrome({
  era,
  eras,
  selectedIndex,
  total,
  prevEra,
  nextEra,
  onClose,
  onPrev,
  onNext,
  onSelect,
  children,
}: EraTimeMachineChromeProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const radius = Math.min(era.designTokens.borderRadius, 8);
  const eraTitle =
    era.name.split(":")[1]?.trim() || era.name.replace(/^\d{4}\s*/, "");

  useEffect(() => {
    const dot = rowRef.current?.querySelector(
      '[data-era-active="true"]',
    ) as HTMLElement | null;
    dot?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [era.id]);

  const btnBase =
    "flex min-h-11 items-center justify-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider border-2 transition-[color,background-color,border-color,transform,opacity] duration-150 disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none";

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: era.colors.background, color: era.colors.text }}
    >
      {/* ── Header ── */}
      <header
        className="relative z-[70] flex shrink-0 items-center gap-3 border-b px-3 py-2.5 sm:px-5"
        style={{
          borderColor: `${era.colors.text}12`,
          backgroundColor: `${era.colors.background}f2`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[8px] uppercase tracking-[0.28em]"
            style={{ color: `${era.colors.text}45` }}
          >
            Era browser
          </p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span
              className="font-mono text-xl font-black tabular-nums leading-none sm:text-2xl"
              style={{ color: era.colors.accent }}
            >
              {era.id}
            </span>
            <span
              className="truncate text-[11px] font-medium sm:text-xs"
              style={{ color: `${era.colors.text}88` }}
            >
              {eraTitle}
            </span>
            <span
              className="font-mono text-[9px] tabular-nums"
              style={{ color: `${era.colors.text}40` }}
            >
              {selectedIndex + 1}/{total}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <motion.button
            type="button"
            onClick={onClose}
            className={`${btnBase} px-3 py-2`}
            style={{
              borderRadius: radius,
              borderColor: era.colors.accent,
              backgroundColor: era.colors.accent,
              color: era.colors.background,
            }}
            whileHover={{ filter: "brightness(1.06)" }}
            whileTap={{ scale: 0.97 }}
          >
            Use {era.id}
          </motion.button>
          <motion.button
            type="button"
            onClick={onClose}
            aria-label="Close era browser"
            className={`${btnBase} min-h-11 min-w-11 px-2`}
            style={{
              borderRadius: radius,
              borderColor: `${era.colors.text}22`,
              backgroundColor: `${era.colors.text}08`,
              color: era.colors.text,
            }}
            whileHover={{ backgroundColor: `${era.colors.text}12` }}
            whileTap={{ scale: 0.97 }}
          >
            ✕
          </motion.button>
        </div>
      </header>

      {/* ── Stage (era landing pages) ── */}
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>

      {/* ── Footer: transport + timeline ── */}
      <footer
        className="relative z-[70] shrink-0 border-t px-3 py-2.5 sm:px-5"
        style={{
          borderColor: `${era.colors.text}12`,
          backgroundColor: `${era.colors.background}f5`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-2">
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={onPrev}
              disabled={!prevEra}
              aria-label={prevEra ? `Previous era: ${prevEra.id}` : "First era"}
              className={`${btnBase} min-h-11 shrink-0 px-3 py-2`}
              style={{
                borderRadius: radius,
                borderColor: `${era.colors.text}22`,
                backgroundColor: `${era.colors.text}08`,
                color: era.colors.text,
              }}
              whileHover={prevEra ? { backgroundColor: `${era.colors.text}12` } : undefined}
              whileTap={prevEra ? { scale: 0.97 } : undefined}
            >
              <span aria-hidden>‹</span>
              <span className="hidden sm:inline">{prevEra?.id ?? "—"}</span>
            </motion.button>

            <div
              ref={rowRef}
              role="tablist"
              aria-label="Jump to a design era"
              className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scroll-px-2 py-0.5 scrollbar-hide snap-x snap-mandatory"
            >
              {eras.map((t, i) => {
                const active = t.id === era.id;
                const past = i < selectedIndex;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    data-era-active={active}
                    onClick={() => onSelect(t.id)}
                    title={t.name}
                    aria-label={`${t.name}${active ? ", current" : ""}`}
                    className="min-h-9 shrink-0 snap-center border-2 px-2.5 font-mono text-[10px] font-bold tabular-nums transition-[color,background-color,border-color,transform] duration-150 hover:brightness-110 active:scale-[0.97] sm:px-3 sm:text-[11px]"
                    style={{
                      borderRadius: radius,
                      borderColor: active
                        ? era.colors.accent
                        : `${era.colors.text}18`,
                      backgroundColor: active
                        ? era.colors.accent
                        : past
                          ? `${era.colors.text}10`
                          : `${era.colors.text}05`,
                      color: active
                        ? era.colors.background
                        : `${era.colors.text}70`,
                      boxShadow: active
                        ? `0 0 0 1px ${era.colors.accent}40, 0 2px 10px ${era.colors.accent}22`
                        : undefined,
                    }}
                  >
                    {t.id}
                  </button>
                );
              })}
            </div>

            <motion.button
              type="button"
              onClick={onNext}
              disabled={!nextEra}
              aria-label={nextEra ? `Next era: ${nextEra.id}` : "Latest era"}
              className={`${btnBase} min-h-11 shrink-0 px-3 py-2`}
              style={{
                borderRadius: radius,
                borderColor: `${era.colors.text}22`,
                backgroundColor: `${era.colors.text}08`,
                color: era.colors.text,
              }}
              whileHover={nextEra ? { backgroundColor: `${era.colors.text}12` } : undefined}
              whileTap={nextEra ? { scale: 0.97 } : undefined}
            >
              <span className="hidden sm:inline">{nextEra?.id ?? "—"}</span>
              <span aria-hidden>›</span>
            </motion.button>
          </div>

          <p
            className="text-center font-mono text-[8px] uppercase tracking-wider"
            style={{ color: `${era.colors.text}38` }}
          >
            Arrow keys ← → · Esc to close
          </p>
        </div>
      </footer>
    </div>
  );
}
