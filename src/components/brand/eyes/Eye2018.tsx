"use client";

/**
 * 2018 — Notion. The document becomes a canvas of blocks: grayscale ink, one
 * quiet accent, a drag-handle, and a pupil that is the blinking text caret you
 * type beside.
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const INK = "#191919";
const GRAY = "#9b9b9b";
const ACCENT = "#0a85d1";

export default function Eye2018({ gx, gy, reduce }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 7, ty: 4 });
  const caretX = useTransform(cx, (v) => v - 1.6);
  const caretY = useTransform(cy, (v) => v - 13);
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>

      {/* drag handle (⠿) at the left, like a Notion block */}
      <g fill={GRAY}>
        {[0, 1, 2].map((r) =>
          [0, 1].map((c) => <circle key={`${r}-${c}`} cx={12 + c * 4} cy={32 + r * 6} r="1.4" />),
        )}
      </g>

      <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke={INK} strokeWidth="3.4" />
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke={GRAY} strokeWidth="3.4" />
      <path d={EYE.arc} fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />

      {/* blinking text caret pupil */}
      <motion.rect
        width="3.2"
        height="26"
        rx="1.6"
        fill={ACCENT}
        x={caretX} y={caretY}
        animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
        transition={reduce ? undefined : { duration: 1.1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}
