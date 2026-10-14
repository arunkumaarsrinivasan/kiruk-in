"use client";

/**
 * The eye. An iris and pupil floating in the dark room, framed by the
 * navbar's lids. It is a real button: pressing it (or tapping, on a phone)
 * opens the question line under it.
 *
 * What it does, and why:
 *   looking   → the iris turns a little toward the cursor; the reflections
 *               in the cornea slide the other way, like light on a real eye
 *   resting   → the pupil breathes very slightly (hippus)
 *   listening → the pupil dilates: interest
 *   thinking  → the pupil constricts for a beat: focus
 *   speaking  → the answer opens out of the pupil (Lens)
 */

import { forwardRef, useEffect, useMemo, useRef } from "react";
import type { PupilMode } from "./usePupil";

/** How far the iris may turn toward the cursor, in viewBox units (iris radius is 100). */
const GAZE = 14;
/** Reflections hold still in the room while the eye turns: they drift back against it. */
const GLINT = 10;

const PUPIL_SCALE: Record<PupilMode, number> = {
  resting: 1,
  listening: 1.32,
  thinking: 0.68,
  speaking: 1.5,
};

/** Seeded so the iris looks the same on every visit. */
function fibers(count: number) {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + rnd() * 0.05;
    const r0 = 26 + rnd() * 10;
    const r1 = 62 + rnd() * 34;
    const bend = (rnd() - 0.5) * 0.22;
    const rm = (r0 + r1) / 2;
    const p = (r: number, ang: number) =>
      `${(Math.cos(ang) * r).toFixed(1)} ${(Math.sin(ang) * r).toFixed(1)}`;
    return {
      // a strand that wanders a little on its way out
      d: `M ${p(r0, a)} Q ${p(rm, a + bend)} ${p(r1, a + bend * 0.4)}`,
      light: rnd() > 0.5,
      o: 0.1 + rnd() * 0.26,
      w: 0.6 + rnd() * 1.4,
    };
  });
}

function cryptsOf(count: number) {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => {
    const a = rnd() * Math.PI * 2;
    const r = 50 + rnd() * 30;
    return {
      x: Math.cos(a) * r,
      y: Math.sin(a) * r,
      rx: 2 + rnd() * 4,
      ry: 1 + rnd() * 2,
      a: (a * 180) / Math.PI,
      o: 0.25 + rnd() * 0.35,
    };
  });
}

export const Pupil = forwardRef<
  HTMLButtonElement,
  { mode: PupilMode; reduce: boolean; onPress: () => void }
>(function Pupil({ mode, reduce, onPress }, ref) {
  const irisRef = useRef<SVGGElement>(null);
  const glintRef = useRef<SVGGElement>(null);
  const strands = useMemo(() => fibers(170), []);
  const crypts = useMemo(() => cryptsOf(16), []);

  // Gaze, never with reduced motion. The eye keeps looking at you while
  // you type; it only looks inward while it thinks.
  useEffect(() => {
    const iris = irisRef.current;
    const glint = glintRef.current;
    if (!iris || !glint) return;
    const set = (x: number, y: number) => {
      iris.style.transform = `translate(${x * GAZE}px, ${y * GAZE}px)`;
      glint.style.transform = `translate(${-x * GLINT}px, ${-y * GLINT}px)`;
    };
    if (reduce || mode === "thinking") {
      set(0, 0);
      return;
    }
    // A mouse is followed; a finger is glanced at, then the eye comes back to you.
    const fine = window.matchMedia("(pointer: fine)").matches;
    let raf = 0;
    let back: number | undefined;
    const look = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = iris.ownerSVGElement!.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        // Full turn once the pointer is ~400px away; closer, a little less.
        const k = Math.min(1, d / 400);
        set((dx / d) * k, (dy / d) * k);
      });
      if (!fine) {
        window.clearTimeout(back);
        back = window.setTimeout(() => set(0, 0), 1400);
      }
    };
    const type = fine ? "pointermove" : "pointerdown";
    window.addEventListener(type, look, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(back);
      window.removeEventListener(type, look);
    };
  }, [mode, reduce]);

  return (
    <button
      ref={ref}
      type="button"
      className="r26-pupil"
      data-mode={mode}
      onClick={onPress}
      aria-label="Ask Kiruk a question"
      style={{ ["--pupil" as string]: PUPIL_SCALE[mode] }}
    >
      <svg viewBox="-110 -110 220 220" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="r26-iris" r="1">
            <stop offset="0" stopColor="#0b0603" />
            <stop offset="0.3" stopColor="#24160c" />
            <stop offset="0.46" stopColor="#4a3019" />
            <stop offset="0.64" stopColor="#3a2614" />
            <stop offset="0.84" stopColor="#24170d" />
            <stop offset="0.94" stopColor="#0d0805" />
            <stop offset="1" stopColor="#030201" />
          </radialGradient>
          <radialGradient id="r26-pupil" r="1">
            <stop offset="0.82" stopColor="#010101" />
            <stop offset="1" stopColor="#010101" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="r26-cornea" cx="0.35" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.07" />
            <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="r26-socket" r="1">
            <stop offset="0.78" stopColor="#000000" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.85" />
          </radialGradient>
          <filter id="r26-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
          <filter id="r26-fiber" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.45" />
          </filter>
          <clipPath id="r26-clip">
            <circle r="100" />
          </clipPath>
        </defs>

        <g ref={irisRef} className="r26-iris">
          <g clipPath="url(#r26-clip)">
            <g>
              <circle r="100" fill="url(#r26-iris)" />
              <g filter="url(#r26-fiber)">
                {strands.map((s, i) => (
                  <path
                    key={i}
                    d={s.d}
                    fill="none"
                    stroke={s.light ? "#8a6440" : "#100804"}
                    strokeOpacity={s.o}
                    strokeWidth={s.w}
                    strokeLinecap="round"
                  />
                ))}
              </g>
              {/* collarette: the ragged ring where the inner and outer iris meet */}
              <circle
                r="44"
                fill="none"
                stroke="#8c6640"
                strokeOpacity="0.3"
                strokeWidth="3"
                strokeDasharray="2 3"
              />
              {/* crypts: the small dark hollows that make an iris yours */}
              {crypts.map((c, i) => (
                <ellipse
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  rx={c.rx}
                  ry={c.ry}
                  transform={`rotate(${c.a} ${c.x} ${c.y})`}
                  fill="#070402"
                  fillOpacity={c.o}
                />
              ))}
              <circle
                r="95"
                fill="none"
                stroke="#020101"
                strokeOpacity="0.9"
                strokeWidth="10"
              />
              <g className="r26-pupil-disc">
                <circle r="31" fill="url(#r26-pupil)" />
              </g>
            </g>
            {/* the eye sits in a socket of shadow at the rim */}
            <circle r="100" fill="url(#r26-socket)" />
            <circle r="100" fill="url(#r26-cornea)" />
            {/* the wet edge of the cornea catching the room */}
            <path
              d="M 58 62 A 86 86 0 0 1 -20 84"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.07"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <g ref={glintRef} className="r26-glint">
              {/* a window bent by the cornea: four panes, soft, across the pupil's edge */}
              <g
                filter="url(#r26-soft)"
                fill="#fff"
                transform="rotate(-10 -22 -26)"
              >
                <path
                  d="M-36 -38 q7 -3 14 -2 l-1 9 q-6 -1 -12 1 z"
                  fillOpacity="0.5"
                />
                <path
                  d="M-20 -40 q6 0 12 2 l-2 9 q-5 -2 -11 -2 z"
                  fillOpacity="0.42"
                />
                <path
                  d="M-36 -26 q6 -2 12 -1 l-1 8 q-5 0 -10 2 z"
                  fillOpacity="0.38"
                />
                <path
                  d="M-21 -27 q5 0 11 2 l-2 8 q-5 -2 -10 -2 z"
                  fillOpacity="0.32"
                />
              </g>
              {/* and one sharp point of light */}
              <circle cx="15" cy="14" r="2.2" fill="#fff" fillOpacity="0.9" />
            </g>
          </g>
        </g>
      </svg>
    </button>
  );
});
