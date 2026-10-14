"use client";

/**
 * 2000 — The Search Box. The eye becomes a magnifying glass on a plain white
 * ground: the outer ring is the lens rim, the iris ring the glass, the lid arc
 * a highlight, and a handle angles out of the rim. Letter colours from the
 * Kiruk wordmark. Flat, no gradients.
 */

import React from "react";
import { motion } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const BLUE = "#1637F2";
const PINK = "#F2055C";
const ORANGE = "#F2A71B";
const PLUM = "#BF0B80";

// Handle leaves the outer rim at 135° (lower left).
const HX = EYE.outer.cx - EYE.outer.r * Math.SQRT1_2;
const HY = EYE.outer.cy + EYE.outer.r * Math.SQRT1_2;

export default function Eye2000({ gx, gy }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 8, ty: 5 });
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <line x1={HX} y1={HY} x2={HX - 12} y2={HY + 12} stroke={PLUM} strokeWidth="9" strokeLinecap="square" />
      <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="#ffffff" stroke={BLUE} strokeWidth="6" />
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke={PINK} strokeWidth="6" />
      <path d={EYE.arc} fill="none" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
      <motion.circle r="10" fill={BLUE} cx={cx} cy={cy} />
    </svg>
  );
}
