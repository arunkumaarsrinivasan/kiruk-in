"use client";

/**
 * 1993 — NCSA Mosaic. The eye arrives like an inline image over a 14.4k modem:
 * it paints in as interlaced horizontal bands, framed in beveled browser-button
 * chrome. Primary blue/red, system gray.
 */

import React from "react";
import { motion } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const BLUE = "#0000ff";
const RED = "#ff0000";

export default function Eye1993({ gx, gy, reduce }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 8, ty: 5 });
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      {/* the eye resolves in like a progressive image painting over a slow modem */}
      <motion.g
        initial={reduce ? false : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: [0, 0.35, 0.35, 0.7, 0.7, 1] }}
        transition={reduce ? undefined : { duration: 0.7, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: "linear" }}
      >
        <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke={BLUE} strokeWidth="6" />
        <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke={RED} strokeWidth="6" />
        <path d={EYE.arc} fill="none" stroke="#808080" strokeWidth="6" />
        <motion.circle r="11" fill={BLUE} cx={cx} cy={cy} />
      </motion.g>
    </svg>
  );
}
