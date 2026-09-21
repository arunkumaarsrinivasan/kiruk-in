"use client";

/**
 * ListFallback — a clean, era-token list of destinations.
 *
 * Used when an era has no bespoke game yet. Still reads era tokens, so it
 * matches whatever era is active. Never broken.
 */

import React from "react";
import { motion } from "framer-motion";
import type { EraNavGameProps } from "../types";

export const ListFallback: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  return (
    <div className="flex flex-col gap-1 px-6 py-6">
      {dests.map((d, i) => {
        const active = activeHref === d.href || (d.href !== "/" && activeHref.startsWith(d.href));
        return (
          <motion.button
            key={d.href}
            type="button"
            onClick={() => onNavigate(d.href)}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 + i * 0.04, duration: 0.25 }}
            className="flex min-h-14 items-center text-left text-2xl uppercase tracking-[0.06em]"
            style={{ color: active ? "var(--accent-color)" : "var(--nav-text)" }}
          >
            {d.label}
          </motion.button>
        );
      })}
    </div>
  );
};
