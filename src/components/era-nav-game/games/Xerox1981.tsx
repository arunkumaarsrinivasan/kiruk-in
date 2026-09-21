"use client";

/**
 * 1981 · Xerox Star & Early GUI
 * Navigation method: point at bitmap desktop icons. Tap to select (inverts),
 * double-tap (or Enter on selected) to "open" — the original GUI metaphor.
 *
 * Game feel: a gray desktop with window-chrome title bar; icons sit in a grid;
 * selection inverts like a 1-bit bitmap mask.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

export const Xerox1981: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [sel, setSel] = useState<number | null>(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setSel((s) => (s === null ? 0 : (s + 1) % dests.length));
      else if (e.key === "ArrowLeft") setSel((s) => (s === null ? 0 : (s - 1 + dests.length) % dests.length));
      else if (e.key === "ArrowDown") setSel((s) => (s === null ? 0 : (s + 1) % dests.length));
      else if (e.key === "ArrowUp") setSel((s) => (s === null ? 0 : (s - 1 + dests.length) % dests.length));
      else if (e.key === "Enter" && sel !== null) onNavigate(dests[sel].href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dests, sel, onNavigate]);

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* Window title bar */}
      <div
        className="flex shrink-0 items-center gap-2 border-b-2 px-3 py-1"
        style={{
          background: "var(--accent-color)",
          borderColor: "var(--text-main)",
          color: "var(--bg-main)",
        }}
      >
        <span className="h-2 w-2 border" style={{ background: "var(--bg-main)", borderColor: "var(--text-main)" }} />
        <span className="text-[11px] font-bold uppercase tracking-wider">Desktop — Kiruk</span>
      </div>

      {/* Desktop icon grid */}
      <div className="grid flex-1 grid-cols-3 content-start gap-3 p-5">
        {dests.map((d, i) => {
          const active = activeHref === d.href || (d.href !== "/" && activeHref.startsWith(d.href));
          const isSel = sel === i;
          return (
            <motion.button
              key={d.href}
              type="button"
              onClick={() => onNavigate(d.href)}
              onMouseEnter={() => setSel(i)}
              onFocus={() => setSel(i)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.18 }}
              className="flex flex-col items-center gap-2 p-2"
              style={{
                background: isSel ? "var(--text-main)" : "transparent",
                color: isSel ? "var(--bg-main)" : "var(--text-main)",
                border: `2px solid ${isSel ? "var(--text-main)" : "transparent"}`,
              }}
            >
              <PixelIcon name={d.icon} size={40} />
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ textDecoration: active ? "underline" : "none" }}
              >
                {d.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="shrink-0 border-t-2 px-3 py-1 text-[10px] font-mono" style={{ borderColor: "var(--text-main)", color: "var(--text-main)" }}>
        TAP TO OPEN · [←→] SELECT · [ENTER] OPEN
      </div>
    </div>
  );
};
