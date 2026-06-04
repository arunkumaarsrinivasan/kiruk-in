"use client";

/**
 * 2026 — generative / prompt UI. The eye is holographic: iridescent rings that
 * morph (each breathing out of phase) under a hue shimmer, prismatic glow, and
 * a glassy pupil that pulses and follows. Interface as living material.
 */

import React from "react";
import { motion } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

export default function Eye2026({ gx, gy, reduce }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 9, ty: 6 });
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#f0abfc" />
        </linearGradient>
        <radialGradient id="holo-pupil" cx="40%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#a855f7" />
        </radialGradient>
        <filter id="holo-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>


      {/* iridescent rings morphing (breathing radii, hue shimmering) */}
      <motion.g
        filter="url(#holo-glow)"
        animate={reduce ? undefined : { filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] }}
        transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <motion.circle
          cx={EYE.outer.cx}
          cy={EYE.outer.cy}
          fill="none"
          stroke="url(#holo)"
          strokeWidth="4.5"
          animate={reduce ? { r: EYE.outer.r } : { r: [EYE.outer.r - 1.5, EYE.outer.r + 1.5, EYE.outer.r - 1.5] }}
          transition={reduce ? undefined : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx={EYE.iris.cx}
          cy={EYE.iris.cy}
          fill="none"
          stroke="url(#holo)"
          strokeWidth="4.5"
          animate={reduce ? { r: EYE.iris.r } : { r: [EYE.iris.r + 1.5, EYE.iris.r - 1.5, EYE.iris.r + 1.5] }}
          transition={reduce ? undefined : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <path d={EYE.arc} fill="none" stroke="#f0abfc" strokeWidth="4.2" strokeLinecap="round" />
      </motion.g>

      {/* glassy pulsing pupil */}
      <motion.circle
        fill="url(#holo-pupil)"
        cx={cx} cy={cy}
        animate={reduce ? { r: 10 } : { r: [9, 11.5, 9] }}
        transition={reduce ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
