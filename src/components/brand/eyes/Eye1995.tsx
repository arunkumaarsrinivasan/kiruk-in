"use client";

/**
 * 1995 — GeoCities. Maximum web: hot rainbow rings under a shimmering
 * hue-cycle, twinkling star GIFs, a starfield void, and a googly pupil that
 * never sits still. Tasteful was not the assignment.
 */

import React, { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

const STARS = [
  { x: 18, y: 18 },
  { x: 104, y: 22 },
  { x: 16, y: 62 },
  { x: 100, y: 60 },
];

function Star({ x, y, d }: { x: number; y: number; d: number }) {
  return (
    <motion.path
      d={`M${x} ${y - 5} L${x + 1.4} ${y - 1.4} L${x + 5} ${y} L${x + 1.4} ${y + 1.4} L${x} ${y + 5} L${x - 1.4} ${y + 1.4} L${x - 5} ${y} L${x - 1.4} ${y - 1.4} Z`}
      fill="#ffff66"
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.3] }}
      transition={{ duration: 1.3, delay: d, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function Eye1995({ gx, gy, reduce }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 9, ty: 6 });
  const looping = !reduce;

  // googly wobble layered onto the gaze
  const wbx = useMotionValue(0);
  const wby = useMotionValue(0);
  useEffect(() => {
    if (!looping) return;
    const a = animate(wbx, [0, 3, -2, 2, 0], { duration: 1.7, repeat: Infinity, ease: "easeInOut" });
    const b = animate(wby, [0, -2, 2, -1, 0], { duration: 2.1, repeat: Infinity, ease: "easeInOut" });
    return () => {
      a.stop();
      b.stop();
    };
  }, [looping, wbx, wby]);
  const px = useTransform(() => cx.get() + wbx.get());
  const py = useTransform(() => cy.get() + wby.get());

  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <filter id="geo-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* starfield void */}
      {[...Array(10)].map((_, i) => (
        <circle key={i} cx={8 + ((i * 37) % 104)} cy={8 + ((i * 53) % 64)} r="0.7" fill="#ffffff" opacity="0.7" />
      ))}

      {/* rainbow rings, hue shimmering (color cycle — not rotation) */}
      <motion.g
        filter="url(#geo-glow)"
        animate={looping ? { filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] } : undefined}
        transition={looping ? { duration: 4, repeat: Infinity, ease: "linear" } : undefined}
      >
        <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke="#ff00ff" strokeWidth="6" />
        <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke="#00ffff" strokeWidth="6" />
        <path d={EYE.arc} fill="none" stroke="#ffff00" strokeWidth="5" strokeLinecap="round" />
      </motion.g>

      <motion.circle r="11" fill="#ff0099" cx={px} cy={py} />

      {looping && STARS.map((s, i) => <Star key={i} x={s.x} y={s.y} d={i * 0.32} />)}
    </svg>
  );
}
