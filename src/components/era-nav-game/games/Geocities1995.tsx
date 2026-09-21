"use client";

/**
 * 1995 · GeoCities Explosion
 * Navigation method: tacky bouncing GIF-style buttons on a starfield, with a
 * visitor counter that ticks up. Tap a button to navigate.
 *
 * Game feel: maximalist chaos — starfield, neon, a "You are visitor #" counter,
 * buttons that wobble. The opposite of restraint, on purpose.
 */

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

export const Geocities1995: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [visitors, setVisitors] = useState(1337);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (reduce) return;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 1400) {
        last = t;
        setVisitors((v) => v + 1);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [reduce]);

  return (
    <div
      className="relative h-full overflow-hidden p-5"
      style={{
        background: "var(--bg-main)",
        backgroundImage:
          "radial-gradient(1px 1px at 20% 30%, #fff 50%, transparent), radial-gradient(1px 1px at 70% 60%, #fff 50%, transparent), radial-gradient(1px 1px at 40% 80%, #fff 50%, transparent), radial-gradient(1px 1px at 85% 20%, #fff 50%, transparent), radial-gradient(1px 1px at 10% 70%, #fff 50%, transparent)",
        color: "var(--text-main)",
      }}
    >
      <div className="mb-3 text-center">
        <span
          className="border-2 px-2 py-1 text-2xl font-bold tracking-wider"
          style={{ borderColor: "var(--accent-color)", color: "var(--accent-color)", textShadow: "0 0 6px var(--accent-color)" }}
        >
          ✦ WELCOME TO KIRUK ✦
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {dests.map((d, i) => {
          const active = activeHref === d.href || (d.href !== "/" && activeHref.startsWith(d.href));
          return (
            <motion.button
              key={d.href}
              type="button"
              onClick={() => onNavigate(d.href)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={
                reduce
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 1, scale: 1, rotate: [0, -2, 2, -1, 0] }
              }
              transition={
                reduce
                  ? { delay: i * 0.04, duration: 0.2 }
                  : { delay: i * 0.04, duration: 0.2, rotate: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }
              }
              className="flex flex-col items-center gap-1 border-2 p-3"
              style={{
                borderColor: i % 2 ? "var(--accent-color)" : "var(--text-main)",
                background: "color-mix(in srgb, var(--accent-color) 12%, var(--bg-main))",
                color: active ? "var(--accent-color)" : "var(--text-main)",
              }}
            >
              <PixelIcon name={d.icon} size={34} />
              <span className="text-[12px] font-bold uppercase">{d.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 border-2 px-2 py-1 text-[11px] font-mono" style={{ borderColor: "var(--text-main)", background: "#000", color: "#00ff00" }}>
        YOU ARE VISITOR <span style={{ color: "#ff00ff" }}>{visitors.toString().padStart(6, "0")}</span>
      </div>
      <div className="absolute right-2 top-2 border-2 px-1.5 py-0.5 text-[8px] font-bold" style={{ borderColor: "#ffff00", color: "#ffff00", background: "#000" }}>
        🚧 UNDER CONSTRUCTION
      </div>
    </div>
  );
};
