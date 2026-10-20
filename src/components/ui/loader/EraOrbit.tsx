"use client";

/**
 * The eras' orbit: a U that wraps the lower half of the eye.
 *
 * Its arms rise up the empty sides of the screen to the eye's own height, so
 * 1970 sits beside the inner corner, 2026 beside the outer one, and the years
 * between swing down under the eye. Each era sits exactly where the sweep puts
 * it across the screen, so when you sweep across the eye the lit node is
 * always under your pointer: the orbit is the track you are moving along.
 *
 * Between the eras every intervening year is a faint bead on the track, so the
 * gaps show time: 1970 to 1981 is a long run of beads, 1995 to 1997 one.
 *
 * Inside the U, under the eye, the era you are on: its movement, its year in
 * its own display type and colour (arriving the way that era's interfaces
 * did), its name. On a phone the U flattens into a shallow bow below the eye.
 */

import React, { useEffect, useMemo, useState } from "react";
import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import type { ThemeConfig } from "@/data/portfolio-data";
import type { EyeStageControl } from "@/components/three/eye/EyeStage";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const SANS = `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
/** Room under the U's lowest point for the labels that hang below it, px. */
const FLOOR = 58;
const FLOOR_PHONE = 46;

/**
 * The era's colour, lit for a dark room: a near-black accent (2026's ink, a
 * 1-bit year's black) would vanish here, so a dark one is lifted toward white.
 */
function legible(hex: string): string {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const rgb = [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
  if (rgb.some((v) => Number.isNaN(v))) return "#e8e8e8";
  const lin = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const lum = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  if (lum >= 0.2) return hex;
  const t = Math.min(0.85, (0.2 - lum) * 4.2);
  const m = rgb.map((v) => Math.round((v + (1 - v) * t) * 255));
  return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
}

interface Geometry {
  w: number;
  h: number;
  /** The eye's centre at rest, px. */
  cx: number;
  cy: number;
}

/**
 * The screen and where the eye sits in it. The live eye knows its own centre
 * (its framing differs from the shared one); until it is up, and without it,
 * the shared framing answers.
 */
function useGeometry(
  control: React.MutableRefObject<EyeStageControl | null>,
  fallback: () => { x: number; y: number },
): Geometry {
  const [g, setG] = useState<Geometry>({ w: 0, h: 0, cx: 0, cy: 0 });
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const read = (ms: number) => {
      raf = requestAnimationFrame(read);
      if (ms - last < 250 && last !== 0) return;
      last = ms;
      const vv = window.visualViewport;
      const w = vv?.width ?? window.innerWidth;
      const h = vv?.height ?? window.innerHeight;
      const live = control.current?.eyeCentre();
      const c = live && live.y > 0 ? live : fallback();
      setG((p) =>
        Math.abs(p.w - w) < 1 && Math.abs(p.h - h) < 1 && Math.abs(p.cx - c.x) < 1 && Math.abs(p.cy - c.y) < 1
          ? p
          : { w, h, cx: c.x, cy: c.y },
      );
    };
    raf = requestAnimationFrame(read);
    return () => cancelAnimationFrame(raf);
  }, [control, fallback]);
  return g;
}

export interface EraOrbitProps {
  themes: ThemeConfig[];
  index: number;
  onSelect: (index: number) => void;
  control: React.MutableRefObject<EyeStageControl | null>;
  /** The eye's centre from the shared framing, px (the GLSL eye's, and the fallback). */
  centreFallback: () => { x: number; y: number };
  reduce: boolean;
  exiting: boolean;
  traveled: boolean;
  overIris: boolean;
  coarse: boolean;
  /** The share of the width at each side that the sweep leaves dead; the orbit matches it. */
  sweepInset: number;
  arrival: { initial: TargetAndTransition; animate: TargetAndTransition; transition: Transition };
}

export default function EraOrbit({
  themes,
  index,
  onSelect,
  control,
  centreFallback,
  reduce,
  exiting,
  traveled,
  overIris,
  coarse,
  sweepInset,
  arrival,
}: EraOrbitProps) {
  const era = themes[index] ?? themes[0];
  const accent = legible(era.colors.accent || era.colors.primary);
  const eraName = (era.name.split(":")[1] ?? era.era).trim();
  const { w, h, cx, cy } = useGeometry(control, centreFallback);
  const last = themes.length - 1;

  // ---- the U: the lower half of an ellipse round the eye ---------------------
  const orbit = useMemo(() => {
    if (!w || !h) return null;
    const wide = w >= 720 && w / h > 1.05;
    const a = (0.5 - sweepInset) * w;
    const bottom = h - (wide ? FLOOR : FLOOR_PHONE);
    // wide: the arms rise to the eye's height; a phone: a shallow bow under it
    const top = wide ? Math.min(cy, bottom - 120) : bottom - Math.min(64, Math.max(40, w * 0.12));
    const b = bottom - top;
    const at = (x: number) => {
      const u = Math.max(-1, Math.min(1, (x - cx) / a));
      const y = top + b * Math.sqrt(Math.max(0, 1 - u * u));
      // outward normal of the ellipse, for where a label hangs
      const nx = (x - cx) / (a * a);
      const ny = (y - top) / (b * b);
      const nl = Math.hypot(nx, ny) || 1;
      return { x, y, nx: nx / nl, ny: ny / nl };
    };
    const xOf = (t: number) => (sweepInset + t * (1 - sweepInset * 2)) * w;
    const eras = themes.map((_, i) => at(xOf(i / Math.max(last, 1))));
    // the years between two eras, as beads
    const beads: { x: number; y: number }[] = [];
    themes.slice(0, -1).forEach((t, i) => {
      const span = Math.max(1, Number(themes[i + 1].id) - Number(t.id));
      for (let k = 1; k < span; k++) beads.push(at(xOf((i + k / span) / Math.max(last, 1))));
    });
    const path = `M ${cx - a} ${top} A ${a} ${b} 0 0 0 ${cx + a} ${top}`;
    return { wide, a, b, top, bottom, eras, beads, path };
  }, [w, h, cx, cy, sweepInset, themes, last]);

  if (!orbit) return null;
  const node = orbit.eras[index];
  // just above the U's floor on a wide screen; above the bow's arms on a phone
  const titleBottom = h - orbit.bottom + (orbit.wide ? 16 : orbit.b + 18);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-30 select-none"
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: reduce ? 0.12 : 0.3, ease: EASE_OUT }}
      style={{ fontFamily: SANS }}
    >
      {/* a pool of the room's dark under the words, so they read over the cheek */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: orbit.wide ? "46%" : "40%",
          background: "radial-gradient(60% 75% at 50% 100%, rgba(4,5,7,0.92) 0%, rgba(4,5,7,0.6) 45%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* ---- the track ----------------------------------------------------- */}
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          {/* the arms dissolve as they rise toward the eye */}
          <linearGradient id="orbit-fade" x1="0" y1={orbit.top} x2="0" y2={orbit.bottom} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path d={orbit.path} fill="none" stroke="url(#orbit-fade)" strokeWidth={1} />
        {orbit.beads.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={0.9} fill="#ffffff" fillOpacity={0.28} />
        ))}
        {orbit.eras.map((p, i) => (
          <circle key={themes[i].id} cx={p.x} cy={p.y} r={2.4} fill="#ffffff" fillOpacity={i === index ? 0 : 0.6} />
        ))}
        {/* the era you are on: a lit node with a halo, gliding along the U */}
        <motion.circle
          r={13}
          fill="none"
          stroke={accent}
          strokeOpacity={0.35}
          strokeWidth={1}
          initial={false}
          animate={{ cx: node.x, cy: node.y }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
        />
        <motion.circle
          r={5}
          fill={accent}
          style={{ filter: `drop-shadow(0 0 8px ${accent})` }}
          initial={false}
          animate={{ cx: node.x, cy: node.y }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
        />
      </svg>

      {/* ---- the years, hanging off the U ----------------------------------- */}
      {orbit.eras.map((p, i) => {
        const on = i === index;
        const near = Math.abs(i - index) <= 1;
        const off = orbit.wide ? 22 : 18;
        const nx = orbit.wide ? p.nx : 0;
        const ny = orbit.wide ? p.ny : 1;
        return (
          <button
            key={themes[i].id}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={themes[i].name}
            aria-current={on ? "true" : undefined}
            className={cn(
              "pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 tabular-nums transition-[color,font-size] duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
              !orbit.wide && !near && "hidden",
            )}
            style={{
              left: Math.min(w - 24, Math.max(24, p.x + nx * off)),
              top: p.y + ny * off,
              color: on ? accent : "rgba(255,255,255,0.46)",
              fontSize: on ? 13 : 11,
              fontFamily: on ? themes[i].fonts.accent : SANS,
              letterSpacing: "0.06em",
            }}
          >
            {themes[i].id}
          </button>
        );
      })}

      {/* ---- the era you are on, inside the U ------------------------------- */}
      <div className="absolute inset-x-0 flex flex-col items-center px-6 text-center" style={{ bottom: titleBottom }}>
        <motion.div
          key={era.id}
          className="flex flex-col items-center"
          initial={arrival.initial}
          animate={arrival.animate}
          transition={arrival.transition}
        >
          <span
            className="text-[11px] uppercase tracking-[0.3em] text-white/55"
            style={{ fontFamily: era.fonts.accent }}
          >
            {era.era}
          </span>
          <span
            className="mt-1 text-[clamp(3rem,6.5vw,5.25rem)] leading-[0.92]"
            style={{ color: accent, fontFamily: era.fonts.primary, textShadow: `0 0 32px ${accent}44` }}
          >
            {era.id}
          </span>
          <span className="mt-2 text-[17px] text-white/85" style={{ fontFamily: era.fonts.secondary }}>
            {eraName}
          </span>
        </motion.div>
        <p
          className="mt-3 text-[13px] text-white transition-opacity duration-500"
          style={{ opacity: overIris ? 0.85 : 0.45 }}
        >
          {traveled ? (
            <>Tap the eye to enter {era.id}</>
          ) : coarse ? (
            <>Swipe across the eye to travel · tap it to enter</>
          ) : (
            <>Sweep across the eye to travel · tap it to enter</>
          )}
        </p>
      </div>
    </motion.div>
  );
}
