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
/** Arc length between two years on a wide screen, in pixels. The angle follows
 *  from the radius, and a 9° floor keeps a desktop's years from crowding. */
const PITCH = 34;
/** Thickness of the band that takes a drag. */
const GRAB = 60;

const RAD = Math.PI / 180;

/**
 * The ring is as wide as the room allows. On a wide screen the space under the
 * eye sets the radius. On a phone, capping at half the width turns the ring
 * into a semicircle and the years collide, so the radius is chosen for a bow:
 * curved enough to read as the same ring, shallow enough that each year has
 * room for its four digits.
 */
function radiusFor(w: number, h: number) {
  const centerY = eyeFrame(w, h).centerY;
  const underEye = h * (1 - centerY) - FLOOR;
  if (w >= 720) return Math.max(90, Math.min(underEye, w * 0.5));
  const bow = Math.min(72, Math.max(36, w * 0.16));
  const shallow = (w * w) / (8 * bow);
  return Math.max(w * 0.62, Math.min(shallow, underEye * 1.35));
}

function floorFor(safe: number) {
  return FLOOR + safe;
}

/** The ring's centre: its lowest point clears the floor, and the home indicator. */
function centreFor(w: number, h: number, safe = 0) {
  return { cx: w / 2, cy: h - floorFor(safe) - radiusFor(w, h) };
}

/** Pixels of arc between two years. A phone needs room for four digits. */
function pitchFor(w: number) {
  if (w >= 720) return PITCH;
  return Math.min(58, Math.max(50, w * 0.14));
}

/**
 * Degrees between two years. Wide screens keep a 9° floor so the arc stays
 * open. A phone spaces the years by `pitchFor` instead, so the labels stay
 * apart on a smaller ring.
 */
function stepFor(r: number, w: number) {
  const minStep = w >= 720 ? 9 : 5.5;
  return Math.max(minStep, pitchFor(w) / (r * RAD));
}

function readSafeBottom() {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)";
  document.body.appendChild(probe);
  const px = Number.parseFloat(getComputedStyle(probe).paddingBottom) || 0;
  probe.remove();
  return px;
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
  const [size, setSize] = useState({ w: 0, h: 0, safe: 0 });
  useEffect(() => {
    const sync = () => {
      const vv = window.visualViewport;
      setSize({
        w: vv?.width ?? window.innerWidth,
        h: vv?.height ?? window.innerHeight,
        safe: readSafeBottom(),
      });
    };
    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
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
  const { w, h, safe } = useViewport();
  return { w, h, safe, ...centreFor(w, h, safe), r: radiusFor(w, h) };
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
  const { w, h, safe } = useViewport();
  const last = themes.length - 1;
  const narrow = w > 0 && w < 720;

  const { cx, cy } = centreFor(w, h, safe);
  const r = radiusFor(w, h);
  const step = stepFor(r, w);
  const hit = Math.min(22, pitchFor(w) * 0.42);

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
      style={{
        opacity: exiting ? 0 : 1,
        transition: "opacity 260ms ease-out",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
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
              {/* invisible target, as wide as the gap to the next year allows */}
              <circle cx={x} cy={y} r={hit} fill="transparent" />
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
                y={y + (narrow ? 26 : 22)}
                textAnchor="middle"
                fill={here ? tint : "#ffffff"}
                fillOpacity={here ? 0.95 : narrow ? 0.7 : 0.42}
                transform={`rotate(${deg - 90} ${x} ${y})`}
                style={{
                  fontFamily: t.fonts.accent,
                  fontSize: here ? (narrow ? 15 : 13) : narrow ? 13 : 10,
                  letterSpacing: "0.06em",
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
