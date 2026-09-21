"use client";

/**
 * 1970 — CRT terminal. Phosphor-green vectors blooming on black glass:
 * scanlines, raster flicker, and a pupil that is the blinking block cursor.
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const P = "#00ff41"; // P1 phosphor
const DIM = "#0a3b15";

export default function Eye1970({ gx, gy, reduce }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 9, ty: 6 });
  const bx = useTransform(cx, (v) => v - 7.5);
  const by = useTransform(cy, (v) => v - 10.5);
  const looping = !reduce;
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <filter id="crt-bloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.g
        filter="url(#crt-bloom)"
        animate={looping ? { opacity: [1, 0.9, 1, 0.96, 1] } : undefined}
        transition={looping ? { duration: 2.4, repeat: Infinity, ease: "linear" } : undefined}
      >
        {/* outer ring as phosphor character cells (dashed reads as glyphs) */}
        <circle
          cx={EYE.outer.cx}
          cy={EYE.outer.cy}
          r={EYE.outer.r}
          fill="none"
          stroke={P}
          strokeWidth="3.2"
          strokeDasharray="2 3.1"
          strokeLinecap="round"
        />
        <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke={P} strokeWidth="3.6" />
        <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r - 6} fill="none" stroke={DIM} strokeWidth="2" />
        <path d={EYE.arc} fill="none" stroke={P} strokeWidth="3" strokeLinecap="round" />

        {/* blinking block cursor pupil */}
        <motion.rect
          width="15"
          height="21"
          fill={P}
          x={bx} y={by}
          animate={looping ? { opacity: [1, 1, 0, 0] } : undefined}
          transition={
            looping ? { duration: 0.9, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" } : undefined
          }
        />
      </motion.g>
    </svg>
  );
}
