"use client";

/**
 * 2021 — Linear. Dark, sharp, and keyboard-first: gradient-stroked rings with a
 * faint glow, a focus ring that frames the iris, and a pupil that snaps between
 * positions in crisp increments — like tabbing through a command menu.
 */

import React from "react";
import { motion } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

export default function Eye2021({ gx, gy, reduce }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 9, ty: 6, snap: true });
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id="ln-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b39ddb" />
          <stop offset="50%" stopColor="#8b6fd0" />
          <stop offset="100%" stopColor="#6750a4" />
        </linearGradient>
        <filter id="ln-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>


      {/* keyboard focus ring around the iris */}
      <motion.circle
        cx={EYE.iris.cx}
        cy={EYE.iris.cy}
        r={EYE.iris.r + 6}
        fill="none"
        stroke="#8b6fd0"
        strokeWidth="1.2"
        strokeDasharray="3 3"
        animate={reduce ? undefined : { opacity: [0.3, 0.75, 0.3] }}
        transition={reduce ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      <g filter="url(#ln-glow)">
        <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke="url(#ln-grad)" strokeWidth="5" />
        <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke="url(#ln-grad)" strokeWidth="5" />
        <path d={EYE.arc} fill="none" stroke="#b39ddb" strokeWidth="4.4" strokeLinecap="round" />
        <motion.circle
          r="10"
          fill="#8b6fd0"
          cx={cx} cy={cy}
          transition={{ type: "tween", duration: 0.08 }}
        />
      </g>
    </svg>
  );
}
