"use client";

/**
 * 2026 · Generative Interfaces
 * Navigation method: the command palette (⌘K). Type to filter, ↑↓ to select,
 * Enter to "generate" (navigate). A live preview line shows the selection.
 *
 * Game feel: prompt-to-UI. A floating palette over a dark canvas; typing
 * filters the destinations; the selected one previews live.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

export const Generative2026: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = (href: string) => activeHref === href || (href !== "/" && activeHref.startsWith(href));

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return dests;
    return dests.filter((d) => d.label.toLowerCase().includes(needle) || d.href.includes(needle));
  }, [q, dests]);

  useEffect(() => {
    setSel(0);
  }, [q]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" && filtered[sel]) {
        e.preventDefault();
        onNavigate(filtered[sel].href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, sel, onNavigate]);

  const current = filtered[sel] ?? filtered[0];

  return (
    <div className="flex h-full flex-col gap-3 p-5" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* Search input */}
      <div
        className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
        style={{
          borderColor: "color-mix(in srgb, var(--accent-color) 35%, transparent)",
          background: "color-mix(in srgb, var(--text-main) 6%, transparent)",
          boxShadow: "0 0 0 4px color-mix(in srgb, var(--accent-color) 12%, transparent)",
        }}
      >
        <span style={{ color: "var(--accent-color)" }}>⌘</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Generate navigation…"
          className="flex-1 bg-transparent text-base outline-none"
          style={{ color: "var(--text-main)" }}
        />
        <kbd className="border px-1.5 text-[10px] font-mono" style={{ borderColor: "color-mix(in srgb, var(--text-main) 20%, transparent)" }}>K</kbd>
      </div>

      {/* Results */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-3 py-6 text-center text-[12px]" style={{ color: "color-mix(in srgb, var(--text-main) 50%, transparent)" }}>
            No matches. Try “home”, “work”, “read”…
          </div>
        )}
        {filtered.map((d, i) => {
          const active = isActive(d.href);
          const isSel = i === sel;
          return (
            <motion.button
              key={d.href}
              type="button"
              onClick={() => onNavigate(d.href)}
              onMouseEnter={() => setSel(i)}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left"
              style={{
                background: isSel ? "color-mix(in srgb, var(--accent-color) 16%, transparent)" : "transparent",
                color: active ? "var(--accent-color)" : "var(--text-main)",
                border: `1px solid ${isSel ? "color-mix(in srgb, var(--accent-color) 40%, transparent)" : "transparent"}`,
              }}
            >
              <PixelIcon name={d.icon} size={18} />
              <span className="text-base font-medium">{d.label}</span>
              <span className="ml-auto text-[11px] font-mono" style={{ color: "color-mix(in srgb, var(--text-main) 45%, transparent)" }}>
                {d.href}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Live preview line */}
      {current && (
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-mono"
          style={{ borderColor: "color-mix(in srgb, var(--accent-color) 30%, transparent)", color: "var(--accent-color)" }}
        >
          <span className="opacity-60">preview ⇄</span>
          <span>generating {current.label.toLowerCase()} → {current.href}</span>
        </div>
      )}
    </div>
  );
};
