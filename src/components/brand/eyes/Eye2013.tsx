"use client";

/**
 * 2013 — iOS 7. The reset to flat: hairline strokes, candy tints, no shadows,
 * and a frosted translucent disc behind the iris. Light, bright, and springy.
 */

import React from "react";
import { motion } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const BLUE = "#007aff";
const PINK = "#ff2d55";
const YELLOW = "#ffcc00";

export default function Eye2013({ gx, gy }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 11, ty: 7 });
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <filter id="ios7-frost" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>


      {/* frosted translucent disc behind the iris */}
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r - 2} fill="#007aff" opacity="0.16" filter="url(#ios7-frost)" />

      {/* hairline flat rings */}
      <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke={BLUE} strokeWidth="2.2" />
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke={PINK} strokeWidth="2.2" />
      <path d={EYE.arc} fill="none" stroke={YELLOW} strokeWidth="2.4" strokeLinecap="round" />

      <motion.circle
        r="10"
        fill={PINK}
        cx={cx} cy={cy}
      />
    </svg>
  );
}
