"use client";

/**
 * 2000 — Macromedia Flash. Glossy vector with a forever-loading preloader:
 * a progress ring fills around the iris (0→100% then resets — a load bar, not
 * a spinner), over muted web gradients. "Skip intro" energy.
 */

import React from "react";
import { motion } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const BLUE = "#336699";
const MAROON = "#993333";
const GREEN = "#669933";

export default function Eye2000({ gx, gy, reduce }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 8, ty: 5 });
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id="fl-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbf7ee" />
          <stop offset="100%" stopColor="#e3dccb" />
        </linearGradient>
        <radialGradient id="fl-pupil" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#8fb3d6" />
          <stop offset="55%" stopColor={BLUE} />
          <stop offset="100%" stopColor="#1f4a6e" />
        </radialGradient>
      </defs>


      <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke={MAROON} strokeWidth="6" />
      {/* faint track + animated preloader arc around the iris */}
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke="#cfc6b2" strokeWidth="6" />
      <motion.circle
        cx={EYE.iris.cx}
        cy={EYE.iris.cy}
        r={EYE.iris.r}
        fill="none"
        stroke={GREEN}
        strokeWidth="6"
        strokeLinecap="round"
        transform={`rotate(-90 ${EYE.iris.cx} ${EYE.iris.cy})`}
        initial={{ pathLength: 0 }}
        animate={reduce ? { pathLength: 1 } : { pathLength: [0, 1, 1] }}
        transition={reduce ? undefined : { duration: 1.8, times: [0, 0.75, 1], repeat: Infinity, ease: "easeInOut" }}
      />
      <path d={EYE.arc} fill="none" stroke={BLUE} strokeWidth="5" strokeLinecap="round" />

      <motion.circle r="11" fill="url(#fl-pupil)" cx={cx} cy={cy} />
    </svg>
  );
}
