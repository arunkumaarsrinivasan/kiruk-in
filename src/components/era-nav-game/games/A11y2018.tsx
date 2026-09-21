"use client";

/**
 * 2018 · Accessibility & Inclusion
 * Navigation method: keyboard-first focus navigation. Tab/arrow through
 * high-contrast buttons; focus rings glow; Enter activates. Reduced-motion
 * is honored by default.
 *
 * Game feel: high contrast, semantic landmarks, prominent focus rings. The
 * game is "navigate without a mouse" — a small a11y challenge.
 */

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

export const A11y2018: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusIdx, setFocusIdx] = useState(0);
  const isActive = (href: string) => activeHref === href || (href !== "/" && activeHref.startsWith(href));

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setFocusIdx((i) => {
          const n = (i + 1) % dests.length;
          refs.current[n]?.focus();
          return n;
        });
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusIdx((i) => {
          const n = (i - 1 + dests.length) % dests.length;
          refs.current[n]?.focus();
          return n;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dests.length]);

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--accent-color)" }}>
        Landmark: navigation
      </div>
      {dests.map((d, i) => {
        const active = isActive(d.href);
        return (
          <motion.button
            key={d.href}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            onClick={() => onNavigate(d.href)}
            onFocus={() => setFocusIdx(i)}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.18 }}
            aria-current={active ? "page" : undefined}
            className="flex min-h-14 items-center gap-3 border-2 px-4 text-left text-xl font-semibold"
            style={{
              color: "var(--text-main)",
              background: active ? "color-mix(in srgb, var(--accent-color) 16%, var(--bg-main))" : "var(--bg-main)",
              borderColor: active ? "var(--accent-color)" : "color-mix(in srgb, var(--text-main) 35%, transparent)",
              outline: i === focusIdx ? "3px solid var(--accent-color)" : "none",
              outlineOffset: i === focusIdx ? 3 : 0,
            }}
          >
            <PixelIcon name={d.icon} size={22} />
            <span>{d.label}</span>
            <span className="ml-auto text-[10px] font-mono uppercase" style={{ color: "color-mix(in srgb, var(--text-main) 55%, transparent)" }}>
              {d.href}
            </span>
          </motion.button>
        );
      })}
      <p className="mt-3 text-[11px]" style={{ color: "color-mix(in srgb, var(--text-main) 60%, transparent)" }}>
        [↑↓] MOVE · [ENTER] ACTIVATE · focus ring always visible
      </p>
    </div>
  );
};
