"use client";

/**
 * 2006 — the Apple turn. Restraint as a feature: hairline rings, a single blue
 * accent, perfect geometry, and a lot of white. Everything unnecessary removed.
 */

import React from "react";
import { motion } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const INK = "#1d1d1f";
const BLUE = "#0071e3";

export default function Eye2006({ gx, gy }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 9, ty: 6 });
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke={INK} strokeWidth="2" />
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke="#c7c7cc" strokeWidth="2" />
      <path d={EYE.arc} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <motion.circle r="9" fill={BLUE} cx={cx} cy={cy} />
    </svg>
  );
}
