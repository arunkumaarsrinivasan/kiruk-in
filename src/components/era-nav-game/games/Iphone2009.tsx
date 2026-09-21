"use client";

/**
 * 2009 · iPhone & Touch Web
 * Navigation method: the app grid home screen. Skeuomorphic app icons with
 * rounded gloss; tap to "launch" (navigate). 44px touch targets.
 *
 * Game feel: a springboard — glossy icons in a grid, a dock bar, page dots.
 * The touch revolution.
 */

import React from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

export const Iphone2009: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const isActive = (href: string) => activeHref === href || (href !== "/" && activeHref.startsWith(href));
  return (
    <div className="flex h-full flex-col p-6" style={{ background: "linear-gradient(180deg, var(--bg-main), color-mix(in srgb, var(--text-main) 6%, var(--bg-main)))", color: "var(--text-main)" }}>
      {/* Status bar */}
      <div className="mb-6 flex items-center justify-between text-[11px] font-bold" style={{ color: "var(--text-main)" }}>
        <span>9:41 AM</span>
        <span className="flex items-center gap-1">
          <span>●●●●</span> <span>100%</span>
        </span>
      </div>

      <div className="grid flex-1 grid-cols-3 content-start gap-x-4 gap-y-6">
        {dests.map((d, i) => {
          const active = isActive(d.href);
          return (
            <motion.button
              key={d.href}
              type="button"
              onClick={() => onNavigate(d.href)}
              whileTap={{ scale: reduce ? 1 : 0.9 }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 18 }}
              className="flex min-h-[72px] flex-col items-center gap-1.5"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-[14px]"
                style={{
                  background: "linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 70%, #fff), var(--accent-color))",
                  boxShadow: "0 2px 4px color-mix(in srgb, var(--text-main) 25%, transparent), inset 0 1px 0 rgba(255,255,255,0.5)",
                  border: "1px solid color-mix(in srgb, var(--text-main) 18%, transparent)",
                  color: "#fff",
                }}
              >
                <PixelIcon name={d.icon} size={30} />
              </span>
              <span className="text-[11px] font-medium" style={{ color: "var(--text-main)", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
                {d.label}
              </span>
              {active && <span className="h-1 w-1 rounded-full" style={{ background: "var(--accent-color)" }} />}
            </motion.button>
          );
        })}
      </div>

      {/* Page dots */}
      <div className="flex justify-center gap-1.5 py-3">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "color-mix(in srgb, var(--text-main) 70%, transparent)" }} />
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "color-mix(in srgb, var(--text-main) 25%, transparent)" }} />
      </div>

      {/* Dock */}
      <div
        className="flex items-center justify-around rounded-2xl px-3 py-2"
        style={{
          background: "color-mix(in srgb, var(--text-main) 12%, transparent)",
          backdropFilter: "blur(20px)",
          border: "1px solid color-mix(in srgb, var(--text-main) 10%, transparent)",
        }}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
          Kiruk
        </span>
        <span className="text-[10px]" style={{ color: "color-mix(in srgb, var(--text-main) 50%, transparent)" }}>
          Tap an app
        </span>
      </div>
    </div>
  );
};
