"use client";

/**
 * EraEye — wide geometric brand mark (toggle-eye). Two side rings flank a
 * central iris disc; a light "sclera" circle and an accent pupil dot sit on
 * the disc and track the cursor (gaze). Recolours to the active era and pops
 * on era change.
 *
 * Wide 1.6:1 motif (matches the brand reference). Pure SVG. The nav's capsule
 * shell provides the outer stadium frame; this draws the inner eye.
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ThemeConfig } from "@/data/portfolio-data";

function clampHex(h: string): string {
  if (!h) return "#888888";
  if (h[0] !== "#") return h;
  let s = h.slice(1);
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return "#" + s.slice(0, 6);
}
function lum(hex: string): number {
  const h = clampHex(hex).slice(1);
  return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255;
}

export function EraEye({
  era,
  height = 50,
  gaze = true,
}: {
  era: ThemeConfig;
  height?: number;
  gaze?: boolean;
}) {
  const reduce = useReducedMotion();
  const W = Math.round(height * 1.62);
  const H = height;

  const disc = clampHex(era.colors.primary || "#2438e0");
  const leftRing = clampHex(era.colors.secondary || era.colors.accent || "#e11d74");
  const rightRing = clampHex(era.colors.accent || era.colors.secondary || "#b21e8f");
  let dot = clampHex(era.colors.accent || "#f59e0b");
  if (Math.abs(lum(dot) - lum(disc)) < 0.12) dot = clampHex(era.colors.text || "#f5a623");
  const hole = "#ffffff";

  // gaze
  const [g, setG] = useState({ x: 0, y: 0 });
  const ref = useRef<SVGSVGElement | null>(null);
  const raf = useRef(0);
  useEffect(() => {
    if (!gaze || reduce) return;
    const onMove = (e: MouseEvent) => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        let dx = (e.clientX - (r.left + r.width / 2)) / 200;
        let dy = (e.clientY - (r.top + r.height / 2)) / 200;
        const m = Math.hypot(dx, dy);
        if (m > 1) { dx /= m; dy /= m; }
        setG({ x: dx, y: dy });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf.current); };
  }, [gaze, reduce]);

  const gx = g.x * 7;
  const gy = g.y * 6;

  return (
    <motion.svg
      ref={ref}
      key={era.id}
      width={W}
      height={H}
      viewBox="0 0 160 100"
      aria-hidden
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 20 }}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* side rings (flank the iris) */}
      <circle cx="52" cy="50" r="40" fill="none" stroke={leftRing} strokeWidth="13" />
      <circle cx="116" cy="50" r="34" fill="none" stroke={rightRing} strokeWidth="12" />
      {/* iris disc — overlaps the rings so they read as outer arcs */}
      <circle cx="74" cy="50" r="42" fill={disc} />
      {/* sclera cut + pupil dot (gaze-shifted) */}
      <g style={{ transform: `translate(${gx}px, ${gy}px)`, transition: "transform 120ms ease-out" }}>
        <circle cx="60" cy="50" r="17" fill={hole} />
        <circle cx="90" cy="50" r="19" fill={dot} />
        <circle cx="55" cy="44" r="4.5" fill="#ffffff" opacity="0.95" />
      </g>
    </motion.svg>
  );
}

export default EraEye;
