"use client";

/**
 * EraDial — the ring the eras ride on.
 *
 * A dial concentric with the eye, big enough that only its lower arc crosses
 * the screen, so the years curve away around the bottom lid. The dial revolves
 * rather than scrolls: the era you are on is always at bottom dead centre, and
 * travelling turns the whole ring under the eye.
 *
 * It is also the era's title card. The ring wears the year it is showing —
 * pixel ticks and a dashed orbit in 1970, gel dots in 2003, soft tonal blobs in
 * 2021 — and every change is announced in that era's own idiom.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ThemeConfig } from "@/data/portfolio-data";
import { eyeFrame } from "@/lib/era-eye-frame";

/** Eras either side of centre that are still drawn. */
const VISIBLE = 7;
/** How far under the bottom of the screen the ring's own arc clears. */
const FLOOR = 44;
/** Arc length between two years, in pixels. The angle follows from the radius. */
const PITCH = 34;
/** Thickness of the band that takes a drag. */
const GRAB = 60;

const RAD = Math.PI / 180;

/**
 * The ring is as wide as the room allows: on a tall display the arc is broad
 * and shallow, and on a short or narrow one it tightens without ever falling
 * off. A phone caps it at half the width, which is a small ring — so the ring
 * is hung off the bottom of the screen rather than off the eye's centre, and
 * the years stay clear of the eyeball the crop has enlarged.
 */
function radiusFor(w: number, h: number) {
  const centerY = eyeFrame(w, h).centerY;
  return Math.max(90, Math.min(h * (1 - centerY) - FLOOR, w * 0.5));
}

/** The ring's centre: its lowest point always clears the floor by FLOOR. */
function centreFor(w: number, h: number) {
  return { cx: w / 2, cy: h - FLOOR - radiusFor(w, h) };
}

/** Degrees between two years — a constant arc length, whatever the radius. */
function stepFor(r: number) {
  return Math.max(9, PITCH / (r * RAD));
}

export type EraChangeStyle =
  | "none"
  | "snap"
  | "blink"
  | "pulse"
  | "float"
  | "morph"
  | "glitch";

interface EraDialProps {
  themes: ThemeConfig[];
  index: number;
  /** The era under the pointer right now — drives colour before the change lands. */
  era: ThemeConfig;
  onSelect: (index: number) => void;
  reduce: boolean;
  exiting: boolean;
}

function useViewport() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const sync = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  return size;
}

/** Where era `i` sits on the ring, in degrees, with 90° at bottom centre. */
function angleOf(i: number, step: number) {
  return 90 - i * step;
}

function pointAt(cx: number, cy: number, r: number, deg: number) {
  return [cx + r * Math.cos(deg * RAD), cy + r * Math.sin(deg * RAD)] as const;
}

/**
 * The dial's geometry, so the title card can sit inside the arc rather than
 * guess where it is.
 */
export function useDialGeometry() {
  const { w, h } = useViewport();
  return { w, h, ...centreFor(w, h), r: radiusFor(w, h) };
}

/** An arc of the dial as a path, drawn left-to-right along the bottom. */
function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const [x0, y0] = pointAt(cx, cy, r, fromDeg);
  const [x1, y1] = pointAt(cx, cy, r, toDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  const sweep = toDeg > fromDeg ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
}

export default function EraDial({
  themes,
  index,
  era,
  onSelect,
  reduce,
  exiting,
}: EraDialProps) {
  const { w, h } = useViewport();
  const last = themes.length - 1;

  const { cx, cy } = centreFor(w, h);
  const r = radiusFor(w, h);
  const step = stepFor(r);

  const accent = era.colors.accent || era.colors.primary;
  const tokens = era.designTokens;
  /** Pixel ticks before the web had rounded corners; dots after. */
  const square = tokens.borderRadius <= 2;

  /* ---- turning the ring by dragging it -------------------------------- */

  const grab = useRef({ active: false, deg: 0, from: 0 });

  const degAt = useCallback(
    (x: number, y: number) => Math.atan2(y - cy, x - cx) / RAD,
    [cx, cy],
  );

  const onDown = useCallback(
    (e: React.PointerEvent<SVGPathElement>) => {
      if (exiting) return;
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* no active pointer with this id */
      }
      grab.current = {
        active: true,
        deg: degAt(e.clientX, e.clientY),
        from: index,
      };
    },
    [degAt, exiting, index],
  );

  const onMove = useCallback(
    (e: React.PointerEvent<SVGPathElement>) => {
      if (!grab.current.active || exiting) return;
      e.stopPropagation();
      // Turning the ring anticlockwise walks forward through the years, which
      // is the direction they are laid out in.
      const delta = degAt(e.clientX, e.clientY) - grab.current.deg;
      const next = grab.current.from + Math.round(delta / step);
      onSelect(Math.min(last, Math.max(0, next)));
    },
    [degAt, exiting, last, onSelect, step],
  );

  const onUp = useCallback((e: React.PointerEvent<SVGPathElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* already released */
    }
    grab.current.active = false;
  }, []);

  /* ---- the ring itself ------------------------------------------------- */

  const spin = index * step;
  const reach = Math.min(96, VISIBLE * step + 8);
  const band = useMemo(
    () => arcPath(cx, cy, r, 90 - reach, 90 + reach),
    [cx, cy, r, reach],
  );

  if (!w || !h) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      style={{ opacity: exiting ? 0 : 1, transition: "opacity 260ms ease-out" }}
    >
      {/* the orbit: a hairline the years ride, plus the lab rings outside it */}
      <path
        d={arcPath(cx, cy, r, 90 - reach, 90 + reach)}
        fill="none"
        stroke={accent}
        strokeOpacity={0.22}
        strokeWidth={1}
        strokeDasharray={square ? "3 5" : undefined}
      />
      <path
        d={arcPath(cx, cy, r + 15, 90 - reach * 0.78, 90 + reach * 0.78)}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.08}
        strokeWidth={1}
        strokeDasharray="1 7"
      />
      <path
        d={arcPath(cx, cy, r - 13, 90 - reach * 0.55, 90 + reach * 0.55)}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.06}
        strokeWidth={1}
      />

      {/* the years, revolving so that the current one is at bottom centre */}
      <g
        style={{
          // The pivot is written out rather than left to transform-origin:
          // on an SVG group that resolves against the element's own bounding
          // box, which swings the whole ring off the bottom of the screen.
          transform: `translate(${cx}px, ${cy}px) rotate(${spin}deg) translate(${-cx}px, ${-cy}px)`,
          transformOrigin: "0 0",
          transformBox: "view-box",
          transition: reduce
            ? "transform 120ms linear"
            : "transform 620ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* the ends of the dial, so the first and last year read as stops
            rather than as a ring that failed to draw */}
        {[-1, themes.length].map((i) => {
          const away = i < 0 ? index + 1 : i - index;
          if (away > VISIBLE) return null;
          const deg = angleOf(i, step);
          const [ax, ay] = pointAt(cx, cy, r - 7, deg);
          const [bx, by] = pointAt(cx, cy, r + 7, deg);
          return (
            <line
              key={`stop-${i}`}
              x1={ax}
              y1={ay}
              x2={bx}
              y2={by}
              stroke="#ffffff"
              strokeOpacity={0.2}
              strokeWidth={1}
            />
          );
        })}

        {themes.map((t, i) => {
          const away = Math.abs(i - index);
          if (away > VISIBLE) return null;
          const deg = angleOf(i, step);
          const [x, y] = pointAt(cx, cy, r, deg);
          const here = i === index;
          const fade = here ? 1 : Math.pow(Math.max(0, 1 - away / (VISIBLE + 1)), 1.7);
          const tint = t.colors.accent || t.colors.primary;
          return (
            <g
              key={t.id}
              className="pointer-events-auto cursor-pointer"
              onClick={() => !exiting && onSelect(i)}
              style={{ transition: "opacity 320ms ease-out" }}
              opacity={fade}
            >
              {/* a generous invisible target, so a year is easy to hit */}
              <circle cx={x} cy={y} r={16} fill="transparent" />
              {square ? (
                <rect
                  x={x - (here ? 4 : 1.5)}
                  y={y - (here ? 4 : 1.5)}
                  width={here ? 8 : 3}
                  height={here ? 8 : 3}
                  fill={here ? tint : "#ffffff"}
                  opacity={here ? 1 : 0.5}
                  style={
                    here ? { filter: `drop-shadow(0 0 7px ${tint})` } : undefined
                  }
                />
              ) : (
                <circle
                  cx={x}
                  cy={y}
                  r={here ? 4.5 : 1.8}
                  fill={here ? tint : "#ffffff"}
                  opacity={here ? 1 : 0.5}
                  style={
                    here ? { filter: `drop-shadow(0 0 8px ${tint})` } : undefined
                  }
                />
              )}
              {/* the needle: the current year points back at the eye */}
              {here && (
                <line
                  x1={x}
                  y1={y}
                  x2={cx + (r - 20) * Math.cos(deg * RAD)}
                  y2={cy + (r - 20) * Math.sin(deg * RAD)}
                  stroke={tint}
                  strokeOpacity={0.55}
                  strokeWidth={1}
                />
              )}
              <text
                x={x}
                y={y + 22}
                textAnchor="middle"
                fill={here ? tint : "#ffffff"}
                fillOpacity={here ? 0.95 : 0.42}
                transform={`rotate(${deg - 90} ${x} ${y})`}
                style={{
                  fontFamily: t.fonts.accent,
                  fontSize: here ? 13 : 10,
                  letterSpacing: "0.08em",
                  transition: "font-size 260ms ease-out",
                }}
              >
                {t.id}
              </text>
            </g>
          );
        })}
      </g>

      {/* the band that takes a drag — invisible, and only along the arc */}
      <path
        d={band}
        fill="none"
        stroke="transparent"
        strokeWidth={GRAB}
        strokeLinecap="round"
        className="pointer-events-auto"
        style={{ cursor: exiting ? "default" : "grab", touchAction: "none" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />

      {/* one mote orbiting the dial, so the ring is never quite still */}
      {!reduce && (
        <motion.g
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: "view-box" }}
        >
          <circle cx={cx} cy={cy + r + 15} r={1.6} fill={accent} opacity={0.5} />
        </motion.g>
      )}
    </svg>
  );
}
