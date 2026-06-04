"use client";

/**
 * 2009 — iPhone skeuomorphism. The eye is a physical object: a brushed-metal
 * outer ring, a glass pupil with a specular highlight and inner shadow, set on
 * stitched leather. The pupil presses inward when you touch it.
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

export default function Eye2009({ gx, gy, reduce, hovered }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 8, ty: 5 });
  const hlx = useTransform(cx, (v) => v - 3);
  const hly = useTransform(cy, (v) => v - 3.4);
  const pr = hovered ? 8.5 : 11;
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id="sk-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4f4f6" />
          <stop offset="48%" stopColor="#b9b9c0" />
          <stop offset="52%" stopColor="#9a9aa2" />
          <stop offset="100%" stopColor="#d6d6dc" />
        </linearGradient>
        <linearGradient id="sk-iris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5aa8ff" />
          <stop offset="100%" stopColor="#0050c8" />
        </linearGradient>
        <radialGradient id="sk-pupil" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#7a78e0" />
          <stop offset="55%" stopColor="#5856d6" />
          <stop offset="100%" stopColor="#2b2a80" />
        </radialGradient>
        <radialGradient id="sk-leather" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#3a342e" />
          <stop offset="100%" stopColor="#1c1813" />
        </radialGradient>
        <filter id="sk-inner" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.6" floodColor="#00000066" />
        </filter>
      </defs>

      <g filter="url(#sk-inner)">
        <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke="url(#sk-metal)" strokeWidth="8" />
        <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke="url(#sk-iris)" strokeWidth="8" />
        <path d={EYE.arc} fill="none" stroke="#2bb24c" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* metal top highlight */}
      <path
        d={`M${EYE.outer.cx - 21} ${EYE.outer.cy - 21} A 30 30 0 0 1 ${EYE.outer.cx + 21} ${EYE.outer.cy - 21}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* glass pupil that presses in */}
      <motion.circle
        fill="url(#sk-pupil)"
        cx={cx} cy={cy}
        animate={{ r: reduce ? 11 : pr }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
      />
      <motion.circle
        r="2.6"
        fill="#ffffff"
        opacity="0.7"
        cx={hlx} cy={hly}
      />
    </svg>
  );
}
