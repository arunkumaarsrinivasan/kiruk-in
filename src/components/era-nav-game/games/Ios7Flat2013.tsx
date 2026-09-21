"use client";

/**
 * 2013 · iOS 7 Flat Revolution
 * Navigation method: the frosted bottom tab bar. Ultra-thin type, vivid pastel
 * accents, zero chrome. Tap switches with a blur slide.
 *
 * Game feel: flat, frosted, pastel. A bottom tab bar with thin labels and a
 * sliding accent indicator.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

export const Ios7Flat2013: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [sel, setSel] = useState(() => dests.findIndex((d) => activeHref === d.href || (d.href !== "/" && activeHref.startsWith(d.href))) || 0);
  const current = dests[sel];

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* Big content preview */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <motion.div
          key={current.href}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-3"
        >
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "color-mix(in srgb, var(--accent-color) 14%, transparent)",
              color: "var(--accent-color)",
            }}
          >
            <PixelIcon name={current.icon} size={36} />
          </span>
          <h1 className="text-3xl font-extralight tracking-tight" style={{ color: "var(--text-main)" }}>
            {current.label}
          </h1>
          <p className="text-[12px] font-light" style={{ color: "color-mix(in srgb, var(--text-main) 50%, var(--bg-main))" }}>
            {current.href}
          </p>
        </motion.div>
      </div>

      {/* Frosted bottom tab bar */}
      <div
        className="flex shrink-0 items-stretch border-t px-2 pb-2 pt-2"
        style={{
          borderColor: "color-mix(in srgb, var(--text-main) 10%, transparent)",
          background: "color-mix(in srgb, var(--bg-main) 80%, transparent)",
          backdropFilter: "blur(20px) saturate(1.4)",
        }}
      >
        {dests.map((d, i) => {
          const active = i === sel;
          return (
            <button
              key={d.href}
              type="button"
              onClick={() => {
                setSel(i);
                onNavigate(d.href);
              }}
              className="relative flex flex-1 flex-col items-center gap-1 py-1.5"
              style={{ color: active ? "var(--accent-color)" : "color-mix(in srgb, var(--text-main) 45%, transparent)" }}
            >
              {active && (
                <motion.span
                  layoutId="ios7-tab"
                  className="absolute -top-2 h-0.5 w-8"
                  style={{ background: "var(--accent-color)" }}
                />
              )}
              <PixelIcon name={d.icon} size={22} />
              <span className="text-[9px] font-medium uppercase tracking-wide">{d.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
