"use client";

/**
 * 1981 — 1-bit bitmap GUI. Black ink on silver, hard pixel edges, ordered
 * dither for the only "gray" the screen can make, a beveled icon tile, and a
 * pupil that snaps between discrete cells (no smooth motion — the mouse is new).
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const INK = "#0b0b0b";
const NAVY = "#000080";

export default function Eye1981({ gx, gy, reduce }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 12, ty: 8, snap: true });
  const px = useTransform(cx, (v) => v - 7);
  const py = useTransform(cy, (v) => v - 7);
  return (
    <svg
      viewBox="0 0 120 80"
      className="h-full w-full"
      style={{ overflow: "visible" }}
      shapeRendering="crispEdges"
      aria-hidden
    >
      <defs>
        {/* ordered dither — the classic 50% checkerboard */}
        <pattern id="dither81" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="#d8d8d8" />
          <rect width="2" height="2" fill={INK} />
          <rect x="2" y="2" width="2" height="2" fill={INK} />
        </pattern>
      </defs>

      {/* dithered iris disc */}
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="url(#dither81)" />

      {/* hard 1-bit rings */}
      <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke={NAVY} strokeWidth="5" />
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke={INK} strokeWidth="5" />
      <path d={EYE.arc} fill="none" stroke="#404040" strokeWidth="5" />

      {/* black square pupil, snapping cell to cell */}
      <motion.rect
        width="14"
        height="14"
        fill={NAVY}
        x={px} y={py}
        transition={{ type: "tween", duration: 0.05 }}
      />
    </svg>
  );
}
