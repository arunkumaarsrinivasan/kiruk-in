"use client";

/**
 * 1991 — the first web page. The eye is an inline <img> in a Times-Roman
 * document: a 1px image border, unvisited-link-blue rings, a visited-purple
 * iris, and the underline that meant "this is a link".
 */

import React from "react";
import { motion } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const LINK = "#0000ee";
const VISITED = "#551a8b";

export default function Eye1991({ gx, gy }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 8, ty: 5 });
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      {/* link-blue rings */}
      <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke={LINK} strokeWidth="4" />
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke={VISITED} strokeWidth="4" />
      <path d={EYE.arc} fill="none" stroke={LINK} strokeWidth="4" />

      {/* hyperlink underlines beneath each ring */}
      <line x1={16} y1={73} x2={72} y2={73} stroke={LINK} strokeWidth="1.5" />
      <line x1={48} y1={66} x2={86} y2={66} stroke={VISITED} strokeWidth="1.5" />

      {/* pupil = the link target */}
      <motion.circle
        r="9"
        fill={VISITED}
        cx={cx} cy={cy}
      />
    </svg>
  );
}
