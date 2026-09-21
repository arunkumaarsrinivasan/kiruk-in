"use client";

/**
 * 2003 · Web 2.0 Candy
 * Navigation method: glossy pill buttons with reflections + a star rating
 * that fills on hover. Tap to navigate.
 *
 * Game feel: candy gloss — rounded pills, gradient highlights, drop shadows,
 * a little star rating for flavor.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

export const Web2003: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [hover, setHover] = useState<number | null>(null);
  const isActive = (href: string) => activeHref === href || (href !== "/" && activeHref.startsWith(href));

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      <div className="mb-1 text-center text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--accent-color)" }}>
        ★ Navigate · Rate · Share ★
      </div>
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
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.22 }}
            className="relative flex items-center gap-3 overflow-hidden px-4 py-3"
            style={{
              borderRadius: 999,
              color: lit ? "#fff" : "var(--text-main)",
              background: active
                ? "linear-gradient(var(--accent-color), color-mix(in srgb, var(--accent-color) 60%, #000))"
                : lit
                  ? "linear-gradient(color-mix(in srgb, var(--accent-color) 80%, #fff), var(--accent-color))"
                  : "linear-gradient(#ffffff, #e8e8e8)",
              boxShadow: "0 2px 6px color-mix(in srgb, var(--text-main) 20%, transparent), inset 0 1px 0 rgba(255,255,255,0.6)",
              border: "1px solid color-mix(in srgb, var(--text-main) 18%, transparent)",
            }}
          >
            <PixelIcon name={d.icon} size={24} />
            <span className="text-lg font-bold uppercase tracking-wide">{d.label}</span>
            <span className="ml-auto flex gap-0.5 text-[12px]" style={{ color: active ? "#fff" : "#ff8800" }}>
              {[0, 1, 2, 3, 4].map((s) => (
                <span key={s} style={{ opacity: lit ? 1 : 0.35 }}>★</span>
              ))}
            </span>
            {/* reflection */}
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
              style={{ background: "linear-gradient(rgba(255,255,255,0.5), transparent)", borderRadius: 999 }}
            />
          </motion.button>
        );
      })}
    </div>
  );
};
