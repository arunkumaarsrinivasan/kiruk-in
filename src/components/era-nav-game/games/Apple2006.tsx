"use client";

/**
 * 2006 · Apple & Blog Renaissance
 * Navigation method: the magnifying dock. Hover (or arrow) scales the icon
 * up; neighbors lift too. Click to navigate.
 *
 * Game feel: generous whitespace, a single row of dock icons that magnify
 * toward the cursor, subtle gray gradients. Restraint and polish.
 */

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

export const Apple2006: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [sel, setSel] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setSel((s) => (s + 1) % dests.length);
      else if (e.key === "ArrowLeft") setSel((s) => (s - 1 + dests.length) % dests.length);
      else if (e.key === "Enter") onNavigate(dests[sel].href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dests, sel, onNavigate]);

  const isActive = (href: string) => activeHref === href || (href !== "/" && activeHref.startsWith(href));

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 p-10" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight" style={{ color: "var(--text-main)" }}>
          Kiruk.
        </h1>
        <p className="text-sm" style={{ color: "color-mix(in srgb, var(--text-main) 50%, var(--bg-main))" }}>
          Where to next.
        </p>
      </div>

      <div
        ref={containerRef}
        className="flex items-end gap-3 rounded-2xl px-5 py-3"
        style={{
          background: "color-mix(in srgb, var(--text-main) 6%, transparent)",
          backdropFilter: "blur(20px)",
          border: "1px solid color-mix(in srgb, var(--text-main) 10%, transparent)",
        }}
      >
        {dests.map((d, i) => {
          const active = isActive(d.href);
          const isSel = i === sel;
          const scale = isSel ? 1.6 : Math.abs(i - sel) === 1 ? 1.2 : 1;
          return (
            <motion.button
              key={d.href}
              type="button"
              onClick={() => onNavigate(d.href)}
              onMouseEnter={() => setSel(i)}
              onFocus={() => setSel(i)}
              animate={reduce ? { scale: 1 } : { scale }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="flex flex-col items-center gap-1"
              style={{ color: active ? "var(--accent-color)" : "var(--text-main)" }}
            >
              <span
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 48,
                  height: 48,
                  background: "linear-gradient(180deg, color-mix(in srgb, var(--text-main) 10%, var(--bg-main)), color-mix(in srgb, var(--text-main) 3%, var(--bg-main)))",
                  border: "1px solid color-mix(in srgb, var(--text-main) 12%, transparent)",
                  boxShadow: "0 4px 10px color-mix(in srgb, var(--text-main) 12%, transparent)",
                }}
              >
                <PixelIcon name={d.icon} size={28} />
              </span>
              <span className="text-[10px] font-medium" style={{ opacity: isSel ? 1 : 0 }}>
                {d.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="text-[11px]" style={{ color: "color-mix(in srgb, var(--text-main) 40%, var(--bg-main))" }}>
        [←→] MAGNIFY · [ENTER] OPEN
      </p>
    </div>
  );
};
