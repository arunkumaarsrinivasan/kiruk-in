"use client";

/**
 * 1997 · Corporate Web & Frames
 * Navigation method: the frameset. A left "nav" frame with a beveled gold
 * tree of links; tapping a link "loads" it into the main frame preview.
 *
 * Game feel: framesets, beveled gold buttons, gradient nav bar, spacer-GIF
 * gaps. The main frame shows a live preview of the selected destination.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

const BEVEL = "inset 2px 2px 0 #fff, inset -2px -2px 0 #5a5a5a";

export const Frames1997: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [sel, setSel] = useState(0);
  const current = dests[sel];
  const isActive = (href: string) => activeHref === href || (href !== "/" && activeHref.startsWith(href));

  return (
    <div className="flex h-full" style={{ background: "#c0c0c0", color: "#000" }}>
      {/* Left nav frame */}
      <div className="flex w-[42%] shrink-0 flex-col border-r-2" style={{ borderColor: "#5a5a5a", background: "#001529" }}>
        <div className="border-b-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: "#5a5a5a", background: "linear-gradient(#cc8400, #7a5200)", color: "#fff" }}>
          ◢ NAVIGATION
        </div>
        <div className="flex flex-1 flex-col gap-1 p-2">
          {dests.map((d, i) => (
            <motion.button
              key={d.href}
              type="button"
              onClick={() => {
                setSel(i);
                onNavigate(d.href);
              }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.18 }}
              className="flex items-center gap-2 border-2 px-2 py-1.5 text-left text-[12px] font-bold uppercase"
              style={{
                borderColor: "#cc8400",
                background: isActive(d.href) ? "#cc8400" : "linear-gradient(#2a4a6c, #1a3a5c)",
                color: isActive(d.href) ? "#001529" : "#e8dcc8",
                boxShadow: BEVEL,
              }}
            >
              <span className="text-[10px]">{i === sel ? "📂" : "📁"}</span>
              {d.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main frame preview */}
      <div className="flex flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-1 border-b-2 px-2 py-1 text-[10px]" style={{ borderColor: "#5a5a5a", background: "#2a4a6c", color: "#e8dcc8" }}>
          <span className="border px-1" style={{ borderColor: "#5a5a5a" }}>×</span>
          <span className="font-mono">http://kiruk.in{current.href}</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4" style={{ background: "#e8dcc8" }}>
          <motion.div
            key={current.href}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <PixelIcon name={current.icon} size={48} />
            <span className="text-xl font-bold uppercase" style={{ color: "#001529" }}>
              {current.label}
            </span>
            <span className="text-[11px] font-mono" style={{ color: "#5a5a5a" }}>
              loading {current.href}…
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
