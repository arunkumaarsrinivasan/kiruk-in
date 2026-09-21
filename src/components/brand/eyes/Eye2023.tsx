"use client";

/**
 * 2023 — the AI turn. The iris becomes a generative orb: a radial mesh of
 * violet/cyan/pink that breathes and shimmers, ringed in glowing gradient, with
 * particles drifting and a pupil that pulses like a thinking token stream.
 */

import React from "react";
import { motion } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const PARTICLES = [
  { x: 26, y: 24 },
  { x: 96, y: 28 },
  { x: 30, y: 58 },
  { x: 92, y: 56 },
  { x: 60, y: 16 },
];

export default function Eye2023({ gx, gy, reduce }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 9, ty: 6 });
  const looping = !reduce;
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id="ai-orb" cx="42%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="45%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </radialGradient>
        <linearGradient id="ai-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="ai-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>


      {/* drifting particles */}
      {looping &&
        PARTICLES.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.4"
            fill="#c4b5fd"
            animate={{ opacity: [0.2, 0.9, 0.2], cy: [p.y, p.y - 3, p.y] }}
            transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}

      <g filter="url(#ai-glow)">
        {/* generative orb iris, breathing */}
        <motion.circle
          cx={EYE.iris.cx}
          cy={EYE.iris.cy}
          fill="url(#ai-orb)"
          animate={looping ? { r: [EYE.iris.r - 4, EYE.iris.r - 1.5, EYE.iris.r - 4] } : { r: EYE.iris.r - 3 }}
          transition={looping ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke="url(#ai-ring)" strokeWidth="4.5" />
        <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke="url(#ai-ring)" strokeWidth="3" opacity="0.7" />
        <path d={EYE.arc} fill="none" stroke="#f472b6" strokeWidth="4.4" strokeLinecap="round" />

        {/* pulsing pupil */}
        <motion.circle
          fill="#ffffff"
          cx={cx} cy={cy}
          animate={looping ? { r: [5, 8, 5], opacity: [0.85, 1, 0.85] } : { r: 6 }}
          transition={looping ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
      </g>
    </svg>
  );
}
