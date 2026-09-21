"use client";

/**
 * 1991 · The First Web Page
 * Navigation method: the hyperlink. Blue underlined links on a Times New
 * Roman document; visited turns purple. The original navigation game.
 *
 * Game feel: a plain academic document. Links are blue and underlined; the
 * active page is "visited" purple. Minimal, because the revolution was the
 * link, not the layout.
 */

import React from "react";
import { motion } from "framer-motion";
import type { EraNavGameProps } from "../types";

export const Web1991: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  return (
    <div
      className="h-full overflow-auto px-6 py-8"
      style={{ background: "var(--bg-main)", color: "var(--text-main)", fontFamily: '"Times New Roman", Georgia, serif' }}
    >
      <h1 className="mb-1 text-3xl font-bold">Kiruk Studio</h1>
      <p className="mb-6 text-base italic" style={{ color: "color-mix(in srgb, var(--text-main) 60%, var(--bg-main))" }}>
        A directory of pages. Click a link to visit.
      </p>
      <hr style={{ borderStyle: "groove", borderColor: "color-mix(in srgb, var(--text-main) 30%, var(--bg-main))" }} className="my-4" />
      <ul className="flex flex-col gap-3 text-xl">
        {dests.map((d, i) => {
          const active = activeHref === d.href || (d.href !== "/" && activeHref.startsWith(d.href));
          const visited = active;
          return (
            <motion.li
              key={d.href}
              initial={reduce ? { opacity: 0 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
            >
              <button
                type="button"
                onClick={() => onNavigate(d.href)}
                className="text-left underline"
                style={{
                  color: visited ? "var(--accent-color)" : "#0000ee",
                  textDecorationColor: visited ? "var(--accent-color)" : "#0000ee",
                }}
              >
                {d.href === "/" ? "Home" : d.label}
              </button>
              <span className="ml-2 text-sm" style={{ color: "color-mix(in srgb, var(--text-main) 50%, var(--bg-main))" }}>
                — {d.href}
              </span>
            </motion.li>
          );
        })}
      </ul>
      <hr style={{ borderStyle: "groove", borderColor: "color-mix(in srgb, var(--text-main) 30%, var(--bg-main))" }} className="my-6" />
      <p className="text-sm" style={{ color: "color-mix(in srgb, var(--text-main) 60%, var(--bg-main))" }}>
        Best viewed in a graphical browser.
      </p>
    </div>
  );
};
