"use client";

/**
 * 1997 — frameset web. The eye sits inside nested beveled frames, like a
 * <frameset> carved into a page: gilded gold rings embossed over deep teal,
 * web-safe and heavy with chrome.
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const GOLD = "#ffd700";
const GOLD_HI = "#fff3b0";
const TEAL = "#2e5f86";

export default function Eye1997({ gx, gy }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 8, ty: 5 });
  const glx = useTransform(cx, (v) => v - 3);
  const gly = useTransform(cy, (v) => v - 3);
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      {/* embossed gilded rings: dark base + bright highlight offset up-left */}
      <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke="#7a5e0c" strokeWidth="6" />
      <circle cx={EYE.outer.cx - 0.8} cy={EYE.outer.cy - 0.8} r={EYE.outer.r} fill="none" stroke={GOLD} strokeWidth="3.4" />
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke="#0e3047" strokeWidth="6" />
      <circle cx={EYE.iris.cx - 0.8} cy={EYE.iris.cy - 0.8} r={EYE.iris.r} fill="none" stroke={TEAL} strokeWidth="3.2" />
      <path d={EYE.arc} fill="none" stroke="#7a5e0c" strokeWidth="6" />
      <path d={EYE.arc} fill="none" stroke={GOLD} strokeWidth="3" transform="translate(-0.8 -0.8)" />

      {/* gilded pupil with a highlight glint */}
      <motion.circle r="11" fill={GOLD} cx={cx} cy={cy} />
      <motion.circle
        r="3.2"
        fill={GOLD_HI}
        cx={glx} cy={gly}
      />
    </svg>
  );
}
