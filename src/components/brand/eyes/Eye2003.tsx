"use client";

/**
 * 2003 — Web 2.0. Glossy aqua candy: gel rings with a top sheen, a glass-bead
 * pupil with a specular highlight, soft drop shadow, and a "beta" star. Round,
 * reflective, optimistic.
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { EYE, EyeProps, usePupil } from "./eye-core";

export default function Eye2003({ gx, gy }: EyeProps) {
  const { cx, cy } = usePupil(gx, gy, { tx: 9, ty: 6 });
  const hlx = useTransform(cx, (v) => v - 3.4);
  const hly = useTransform(cy, (v) => v - 3.6);
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id="gel-o" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb37a" />
          <stop offset="50%" stopColor="#ff6600" />
          <stop offset="100%" stopColor="#c44e00" />
        </linearGradient>
        <linearGradient id="gel-i" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7fd0f5" />
          <stop offset="50%" stopColor="#0088cc" />
          <stop offset="100%" stopColor="#005f93" />
        </linearGradient>
        <radialGradient id="gel-p" cx="36%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#ffd0b0" />
          <stop offset="50%" stopColor="#ff3366" />
          <stop offset="100%" stopColor="#c01540" />
        </radialGradient>
        <filter id="gel-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.4" floodColor="#00000044" />
        </filter>
      </defs>


      <g filter="url(#gel-shadow)">
        <circle cx={EYE.outer.cx} cy={EYE.outer.cy} r={EYE.outer.r} fill="none" stroke="url(#gel-o)" strokeWidth="8" />
        <circle cx={EYE.iris.cx} cy={EYE.iris.cy} r={EYE.iris.r} fill="none" stroke="url(#gel-i)" strokeWidth="8" />
        <path d={EYE.arc} fill="none" stroke="url(#gel-o)" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* top sheen on the rings */}
      <path
        d={`M${EYE.outer.cx - 22} ${EYE.outer.cy - 20} A 30 30 0 0 1 ${EYE.outer.cx + 22} ${EYE.outer.cy - 20}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* glass-bead pupil + specular highlight */}
      <motion.circle r="11" fill="url(#gel-p)" cx={cx} cy={cy} />
      <motion.ellipse
        rx="3.6"
        ry="2.4"
        fill="#ffffff"
        opacity="0.85"
        cx={hlx} cy={hly}
      />

      {/* beta star badge */}
      <g transform="translate(104 16)">
        <path
          d="M0 -7 L1.8 -2.2 L7 -2.2 L2.8 1 L4.4 6 L0 3 L-4.4 6 L-2.8 1 L-7 -2.2 L-1.8 -2.2 Z"
          fill="#ff3366"
        />
      </g>
    </svg>
  );
}
