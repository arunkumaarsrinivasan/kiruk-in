"use client";

/**
 * 1970 · Terminal & ASCII
 * Navigation method: command line. Arrow keys cycle commands, Enter
 * "executes" (navigates). A blinking block cursor + phosphor afterglow.
 *
 * Game feel: you're typing at a CRT. The cursor blinks, the selected command
 * glows, Enter runs it.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { EraNavGameProps } from "../types";

export const Terminal1970: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setSel((s) => (s + 1) % dests.length);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setSel((s) => (s - 1 + dests.length) % dests.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        onNavigate(dests[sel].href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dests, sel, onNavigate]);

  return (
    <div
      className="flex h-full flex-col gap-1 p-6 font-mono"
      style={{ background: "var(--bg-main)", color: "var(--text-main)" }}
    >
      <div className="mb-2 text-[11px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        kiruk@terminal — type or select a command
      </div>
      {dests.map((d, i) => {
        const active = activeHref === d.href || (d.href !== "/" && activeHref.startsWith(d.href));
        const isSel = i === sel;
        return (
          <motion.button
            key={d.href}
            type="button"
            onClick={() => onNavigate(d.href)}
            onMouseEnter={() => setSel(i)}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="flex min-h-12 items-center gap-3 text-left text-xl uppercase tracking-wider"
            style={{
              color: isSel ? "var(--accent-color)" : active ? "var(--text-main)" : "var(--text-muted)",
              textShadow: isSel ? "0 0 8px var(--accent-color)" : "none",
            }}
          >
            <span className="w-4">{isSel ? "▶" : " "}</span>
            <span className="lowercase">{">"}</span>
            <span>{d.href === "/" ? "home" : d.href.replace("/", "")}</span>
            <span style={{ color: "var(--text-muted)" }} className="text-xs">
              {" // "}
              {d.label}
            </span>
            {isSel && !reduce && (
              <motion.span
                className="ml-1 inline-block"
                style={{ background: "var(--accent-color)", width: 10, height: 18 }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
              />
            )}
          </motion.button>
        );
      })}
      <div className="mt-auto pt-4 text-[10px]" style={{ color: "var(--text-muted)" }}>
        [↑↓] SELECT · [ENTER] RUN · [ESC] CLOSE
      </div>
    </div>
  );
};
