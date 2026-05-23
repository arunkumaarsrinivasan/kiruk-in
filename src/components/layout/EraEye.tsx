"use client";

/**
 * EraEye — wide geometric brand mark (toggle-eye). Two side rings flank a
 * central iris disc; sclera + pupil track the cursor. When the nav hub opens,
 * the eye blinks, dilates, and glances toward the revealed menu.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { ThemeConfig } from "@/data/portfolio-data";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_CREAK = [0.32, 0.72, 0, 1] as const;

function clampHex(h: string): string {
  if (!h) return "#888888";
  if (h[0] !== "#") return h;
  let s = h.slice(1);
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return "#" + s.slice(0, 6);
}
function lum(hex: string): number {
  const h = clampHex(hex).slice(1);
  return (
    (0.299 * parseInt(h.slice(0, 2), 16) +
      0.587 * parseInt(h.slice(2, 4), 16) +
      0.114 * parseInt(h.slice(4, 6), 16)) /
    255
  );
}

export function EraEye({
  era,
  height = 50,
  gaze = true,
  open = false,
  highlighted = false,
  dimmed = false,
}: {
  era: ThemeConfig;
  height?: number;
  gaze?: boolean;
  /** Nav hub expanded — eye dilates and glances toward menu items */
  open?: boolean;
  /** Picker / focus ring — enlarged, full saturation */
  highlighted?: boolean;
  /** Another eye is focused — recede */
  dimmed?: boolean;
}) {
  const reduce = useReducedMotion();
  const W = Math.round(height * 1.62);
  const H = height;

  const disc = clampHex(era.colors.primary || "#2438e0");
  const leftRing = clampHex(
    era.colors.secondary || era.colors.accent || "#e11d74",
  );
  const rightRing = clampHex(
    era.colors.accent || era.colors.secondary || "#b21e8f",
  );
  let dot = clampHex(era.colors.accent || "#f59e0b");
  if (Math.abs(lum(dot) - lum(disc)) < 0.12)
    dot = clampHex(era.colors.text || "#f5a623");
  const hole = "#ffffff";

  const [blink, setBlink] = useState(false);
  const prevOpen = useRef(open);
  useEffect(() => {
    if (reduce || prevOpen.current === open) {
      prevOpen.current = open;
      return;
    }
    prevOpen.current = open;
    setBlink(true);
    const t = window.setTimeout(() => setBlink(false), open ? 140 : 100);
    return () => window.clearTimeout(t);
  }, [open, reduce]);

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
        if (m > 1) {
          dx /= m;
          dy /= m;
        }
        setG({ x: dx, y: dy });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [gaze, reduce]);

  const gazeMix = open ? 0.28 : 1;
  const openBiasX = open ? 0.62 : 0;
  const openBiasY = open ? -0.08 : 0;
  const targetGx = g.x * gazeMix + openBiasX;
  const targetGy = g.y * gazeMix + openBiasY;

  const springGx = useSpring(targetGx, {
    stiffness: reduce ? 500 : 220,
    damping: reduce ? 40 : 22,
  });
  const springGy = useSpring(targetGy, {
    stiffness: reduce ? 500 : 220,
    damping: reduce ? 40 : 22,
  });
  const gx = useTransform(springGx, (v) => v * 7);
  const gy = useTransform(springGy, (v) => v * 6);

  const irisTransition = reduce
    ? { duration: 0.15 }
    : { duration: 0.42, ease: EASE_CREAK };
  const ringTransition = reduce
    ? { duration: 0.15 }
    : { duration: 0.48, ease: EASE_OUT };

  return (
    <motion.svg
      ref={ref}
      key={era.id}
      width={W}
      height={H}
      viewBox="0 0 160 100"
      aria-hidden
      initial={reduce ? false : { scale: 0.88, opacity: 0 }}
      animate={{
        scale: blink ? 0.94 : highlighted ? 1.1 : dimmed ? 0.9 : 1,
        opacity: dimmed ? 0.38 : 1,
      }}
      transition={
        reduce
          ? { duration: 0.15 }
          : blink
            ? { duration: 0.1, ease: EASE_OUT }
            : { type: "spring", duration: 0.45, bounce: 0.12 }
      }
      style={{ display: "block", overflow: "visible" }}
    >
      <motion.circle
        cx={52}
        cy={50}
        r={40}
        fill="none"
        stroke={leftRing}
        strokeWidth={13}
        animate={{
          cx: open ? 46 : 52,
          opacity: open ? 1 : 0.92,
        }}
        transition={ringTransition}
      />
      <motion.circle
        cx={116}
        cy={50}
        r={34}
        fill="none"
        stroke={rightRing}
        strokeWidth={12}
        animate={{
          cx: open ? 122 : 116,
          opacity: open ? 1 : 0.92,
        }}
        transition={ringTransition}
      />
      <motion.circle
        cx={74}
        cy={50}
        r={42}
        fill={disc}
        animate={{
          scale: open ? 1.04 : 1,
          cx: open ? 70 : 74,
        }}
        transition={irisTransition}
        style={{ transformOrigin: "74px 50px" }}
      />
      <motion.g
        style={{ x: gx, y: gy }}
        animate={{
          scaleY: blink ? 0.12 : 1,
          scaleX: blink ? 1.08 : open ? 1.06 : 1,
        }}
        transition={
          blink
            ? { duration: 0.09, ease: EASE_OUT }
            : reduce
              ? { duration: 0.15 }
              : { duration: 0.38, ease: EASE_CREAK }
        }
      >
        <motion.circle
          cx={60}
          cy={50}
          r={17}
          fill={hole}
          animate={{ r: open ? 19 : 17 }}
          transition={irisTransition}
        />
        <motion.circle
          cx={90}
          cy={50}
          r={19}
          fill={dot}
          animate={{
            r: open ? 21 : 19,
            cx: open ? 94 : 90,
          }}
          transition={irisTransition}
        />
        <motion.circle
          cx={55}
          cy={44}
          r={4.5}
          fill="#ffffff"
          animate={{ opacity: blink ? 0 : 0.95 }}
          transition={{ duration: 0.08 }}
        />
      </motion.g>
      {open && !reduce && (
        <motion.circle
          cx={74}
          cy={50}
          r={44}
          fill="none"
          stroke={rightRing}
          strokeWidth={1}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          style={{ transformOrigin: "74px 50px" }}
        />
      )}
    </motion.svg>
  );
}

export default EraEye;
