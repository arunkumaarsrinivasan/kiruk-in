"use client";

/**
 * 2021 · Material You
 * Navigation method: the navigation rail with tonal chips. 28px rounded
 * corners, tonal surface layers, adaptive color. Tap ripples.
 *
 * Game feel: soft, rounded, tonal. A left rail of chips on a tonal surface
 * with a ripple on tap.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

export const MaterialYou2021: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [ripple, setRipple] = useState<number | null>(null);
  const isActive = (href: string) => activeHref === href || (href !== "/" && activeHref.startsWith(href));

  return (
    <div className="flex h-full gap-3 p-4" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* Rail */}
      <div
        className="flex w-full flex-col gap-1.5 rounded-[28px] p-3"
        style={{
          background: "color-mix(in srgb, var(--accent-color) 10%, var(--bg-main))",
        }}
      >
        {dests.map((d, i) => {
          const active = isActive(d.href);
          return (
            <motion.button
              key={d.href}
              type="button"
              onClick={() => {
                setRipple(i);
                onNavigate(d.href);
              }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              className="relative flex min-h-14 items-center gap-3 overflow-hidden rounded-3xl px-4 text-left text-lg font-medium"
              style={{
                color: active ? "var(--accent-color)" : "var(--text-main)",
                background: active ? "color-mix(in srgb, var(--accent-color) 22%, transparent)" : "transparent",
              }}
            >
              <PixelIcon name={d.icon} size={22} />
              <span>{d.label}</span>
              {ripple === i && !reduce && (
                <motion.span
                  className="pointer-events-none absolute left-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                  style={{ background: "var(--accent-color)" }}
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 14, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  onAnimationComplete={() => setRipple(null)}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
