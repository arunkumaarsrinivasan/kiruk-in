"use client";

/**
 * 2023 · AI-Native Interfaces
 * Navigation method: the chat. Tap a suggested prompt (or type + Enter) to
 * navigate. A "thinking" aurora shimmer, then it routes you.
 *
 * Game feel: chat bubbles, streaming cursor, aurora gradient glow. You talk
 * to the nav.
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

export const AiNative2023: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [thinking, setThinking] = useState<string | null>(null);
  const timer = useRef<number>(0);
  const isActive = (href: string) => activeHref === href || (href !== "/" && activeHref.startsWith(href));

  const go = (d: { label: string; href: string }) => {
    if (reduce) {
      onNavigate(d.href);
      return;
    }
    setThinking(d.label);
    timer.current = window.setTimeout(() => {
      onNavigate(d.href);
      setThinking(null);
    }, 650);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div
      className="relative flex h-full flex-col gap-3 overflow-hidden p-5"
      style={{ background: "var(--bg-main)", color: "var(--text-main)" }}
    >
      {/* aurora glow */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent-color), transparent 70%)" }}
        />

      <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--accent-color)" }}>
        <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent-color)", boxShadow: "0 0 8px var(--accent-color)" }} />
        kiruk · ask me to take you somewhere
      </div>

      {/* chat thread */}
      <div className="relative flex flex-1 flex-col justify-end gap-2 overflow-y-auto">
        <div
          className="max-w-[80%] self-start rounded-2xl rounded-bl-md px-3 py-2 text-[13px]"
          style={{ background: "color-mix(in srgb, var(--text-main) 10%, transparent)", color: "var(--text-main)" }}
        >
          Where would you like to go?
        </div>
        <AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-[80%] self-end rounded-2xl rounded-br-md px-3 py-2 text-[13px]"
              style={{ background: "var(--accent-color)", color: "var(--bg-main)" }}
            >
              <span className="font-medium">take me to {thinking.toLowerCase()}</span>
              <span className="ml-1 inline-flex">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={reduce ? {} : { opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                    className="px-0.5"
                  >
                    ·
                  </motion.span>
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* suggested prompts */}
      <div className="relative flex flex-wrap gap-2">
        {dests.map((d, i) => {
          const active = isActive(d.href);
          return (
            <motion.button
              key={d.href}
              type="button"
              onClick={() => go(d)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-medium"
              style={{
                color: active ? "var(--accent-color)" : "var(--text-main)",
                background: active ? "color-mix(in srgb, var(--accent-color) 16%, transparent)" : "color-mix(in srgb, var(--text-main) 8%, transparent)",
                border: `1px solid color-mix(in srgb, var(--accent-color) ${active ? 60 : 25}%, transparent)`,
              }}
            >
              <PixelIcon name={d.icon} size={16} />
              take me to {d.label.toLowerCase()}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
