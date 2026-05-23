"use client";

/**
 * EraNavRail — neutral bottom rail rendered on top of every archetype.
 *
 * Keeps year picker + transport controls consistent across archetypes so the
 * user can scrub the timeline without learning a new control surface every
 * era. The rail picks up the active era's accent so it still feels native.
 */

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { ThemeConfig } from "@/data/portfolio-data";

interface EraNavRailProps {
  eras: ThemeConfig[];
  era: ThemeConfig;
  selectedIndex: number;
  onSelect: (eraId: string) => void;
  onCustomize: () => void;
}

export function EraNavRail({
  eras,
  era,
  selectedIndex,
  onSelect,
  onCustomize,
}: EraNavRailProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = rowRef.current?.querySelector(
      '[data-era-active="true"]',
    ) as HTMLElement | null;
    dot?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [era.id]);

  const radius = Math.min(era.designTokens.borderRadius, 8);

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[60] border-t backdrop-blur-md"
      style={{
        borderColor: `${era.colors.text}0c`,
        backgroundColor: `${era.colors.background}dd`,
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 md:px-6 py-2.5">
        <div
          ref={rowRef}
          role="tablist"
          aria-label="Jump to a design era"
          className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1 scroll-px-3 snap-x snap-mandatory"
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
                className="flex-shrink-0 snap-center min-h-9 min-w-10 px-2.5 sm:px-3 font-mono text-[10px] sm:text-[11px] font-bold tabular-nums border-2 transition-[color,background-color,border-color,transform] duration-150 hover:brightness-110 active:scale-[0.97]"
                style={{
                  borderRadius: `${radius}px`,
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

        <span
          className="text-[8px] font-mono uppercase tracking-wider hidden sm:block flex-shrink-0 sm:text-right sm:max-w-[6rem]"
          style={{ color: `${era.colors.text}38` }}
        >
          Tap · keys ← →
        </span>

        <motion.button
          onClick={onCustomize}
          className="px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-wider border-2 flex-shrink-0"
          style={{
            borderColor: era.colors.accent,
            color: era.colors.accent,
            borderRadius: `${radius}px`,
            backgroundColor: `${era.colors.accent}0c`,
          }}
          whileHover={{
            backgroundColor: era.colors.accent,
            color: era.colors.background,
          }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15 }}
        >
          Customize
        </motion.button>
      </div>
    </div>
  );
}
