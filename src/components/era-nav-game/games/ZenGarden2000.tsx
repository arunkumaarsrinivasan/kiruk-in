"use client";

/**
 * 2000 · CSS Zen Garden
 * Navigation method: elegant CSS tabs. Soft drop shadows, centered, a
 * sliding underline. The layout revolution was CSS-only styling.
 *
 * Game feel: refined, semantic, soft. Tabs sit in a centered column; the
 * active tab has a soft shadow and a sliding accent underline.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { EraNavGameProps } from "../types";

export const ZenGarden2000: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [hover, setHover] = useState<number | null>(null);
  const isActive = (href: string) => activeHref === href || (href !== "/" && activeHref.startsWith(href));

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      <div className="text-center">
        <h1 className="text-3xl font-light tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
          Kiruk Studio
        </h1>
        <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: "color-mix(in srgb, var(--text-main) 55%, var(--bg-main))" }}>
          The Beauty of Navigation
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-1">
        {dests.map((d, i) => {
          const active = isActive(d.href);
          const lit = hover === i || active;
          return (
            <motion.button
              key={d.href}
              type="button"
              onClick={() => onNavigate(d.href)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className="relative flex items-center justify-between px-4 py-3 text-left text-lg"
              style={{
                color: lit ? "var(--accent-color)" : "var(--text-main)",
                background: lit ? "color-mix(in srgb, var(--accent-color) 8%, var(--bg-main))" : "transparent",
                borderRadius: 4,
                boxShadow: active ? "0 4px 14px color-mix(in srgb, var(--text-main) 18%, transparent)" : "none",
              }}
            >
              <span style={{ fontFamily: "Georgia, serif" }}>{d.label}</span>
              <span className="text-[10px] font-mono" style={{ color: "color-mix(in srgb, var(--text-main) 50%, var(--bg-main))" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {lit && (
                <motion.span
                  layoutId="zen-underline"
                  className="absolute bottom-0 left-4 right-4 h-px"
                  style={{ background: "var(--accent-color)" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="text-[10px]" style={{ color: "color-mix(in srgb, var(--text-main) 45%, var(--bg-main))" }}>
        A demonstration of what can be accomplished through CSS alone.
      </p>
    </div>
  );
};
