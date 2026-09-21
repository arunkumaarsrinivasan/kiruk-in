"use client";

/**
 * 1993 · Mosaic & Netscape
 * Navigation method: the clickable image map. Beveled frames with hotspot
 * regions; a 3D-beveled tooltip shows the destination on hover.
 *
 * Game feel: gray system chrome, beveled frames, inline "images" (pixel
 * icons) you click like an early imagemap.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import type { EraNavGameProps } from "../types";

const BEVEL = "inset 2px 2px 0 #fff, inset -2px -2px 0 #808080";

export const Mosaic1993: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate, reduce }) => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* Toolbar chrome */}
      <div className="flex shrink-0 items-center gap-2 border-b-2 px-3 py-1" style={{ borderColor: "var(--text-main)", background: "#c0c0c0" }}>
        <span className="border-2 px-2 text-[10px] font-bold" style={{ borderColor: "var(--text-main)", boxShadow: BEVEL }}>Back</span>
        <span className="border-2 px-2 text-[10px] font-bold" style={{ borderColor: "var(--text-main)", boxShadow: BEVEL }}>Forward</span>
        <span className="ml-auto text-[10px] font-mono">NCSA Mosaic</span>
      </div>

      <div className="flex-1 p-4">
        <div
          className="grid h-full grid-cols-2 gap-4 border-2 p-4"
          style={{ borderColor: "var(--text-main)", background: "#c0c0c0", boxShadow: BEVEL }}
        >
          {dests.map((d, i) => {
            const active = activeHref === d.href || (d.href !== "/" && activeHref.startsWith(d.href));
            return (
              <motion.button
                key={d.href}
                type="button"
                onClick={() => onNavigate(d.href)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="relative flex flex-col items-center justify-center gap-2 border-2"
                style={{
                  borderColor: "var(--text-main)",
                  background: hover === i ? "#a0a0a0" : "#dfdfdf",
                  boxShadow: hover === i ? `inset -2px -2px 0 #fff, inset 2px 2px 0 #808080` : BEVEL,
                }}
              >
                <PixelIcon name={d.icon} size={44} />
                <span className="text-[11px] font-bold uppercase" style={{ textDecoration: active ? "underline" : "none" }}>
                  {d.label}
                </span>
                {hover === i && (
                  <span
                    className="absolute -top-7 left-1/2 -translate-x-1/2 border-2 px-1.5 text-[9px] font-mono whitespace-nowrap"
                    style={{ borderColor: "var(--text-main)", background: "#ffffcc", boxShadow: BEVEL }}
                  >
                    {d.href}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t-2 px-3 py-1 text-[10px] font-mono" style={{ borderColor: "var(--text-main)" }}>
        Document: done · {hover !== null ? dests[hover].href : "—"}
      </div>
    </div>
  );
};
