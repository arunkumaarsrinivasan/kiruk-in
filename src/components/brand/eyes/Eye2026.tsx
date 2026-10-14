"use client";

/**
 * 2026 — No Screen. The eye is the pocket device: orange rings for the
 * body, an ink lid, and a pupil drawn as its camera lens. Hover the mark
 * and the lens stops down, the way a camera focuses on you.
 */

import React, { useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const ORANGE = "#ff4f00";
const INK = "#161513";
const LENS = "#121110";

export default function Eye2026({ gx, gy, reduce, hovered }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 9, ty: 6 });
  const aperture = useSpring(4.5, { stiffness: 420, damping: 36 });

  useEffect(() => {
    const target = hovered ? 2.2 : 4.5;
    if (reduce) aperture.jump(target);
    else aperture.set(target);
  }, [hovered, reduce, aperture]);

  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke={ORANGE} strokeWidth="6" />
      <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke={ORANGE} strokeWidth="6" />
      <path d={EYE.arc} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <motion.circle cx={cx} cy={cy} r={11} fill={LENS} stroke={INK} strokeWidth="2" />
      <motion.circle cx={cx} cy={cy} r={aperture} fill="none" stroke="#4a4540" strokeWidth="1.6" />
    </svg>
  );
}
