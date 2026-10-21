"use client";

/**
 * GeocitiesShellLayer — global atmosphere for era=1995.
 *
 * Twinkling starfield over deep navy. Generated once from a deterministic
 * seed so the pattern is stable across renders. Each star pulses on its
 * own delay → that authentic "background.gif" feel without weighing the
 * page down with an actual tiled image. On phones the stars hold still
 * (data-era-calm), like the real tiled GIF did.
 */

import { useMemo } from "react";
import type { ShellLayerProps } from "../../registry";

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const COLORS = ["#ffffff", "#ffff99", "#00ffff", "#ff99ff"];

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = (n: number) => ((seed * n * 9301 + 49297) % 233280) / 233280;
    return {
      x: r(1) * 100,
      y: r(2) * 100,
      size: 1 + Math.floor(r(3) * 2.5),
      delay: r(4) * 6,
      duration: 1.6 + r(5) * 3.4,
      color: COLORS[i % COLORS.length],
    };
  });
}

export function GeocitiesShellLayer({ active }: ShellLayerProps) {
  const stars = useMemo(() => makeStars(140), []);
  if (!active) return null;
  return (
    <>
      <style jsx global>{`
        @keyframes kiruk-1995-twinkle {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        /* Phones: still stars sit at a mid glow, not the twinkle's peak. */
        @media (pointer: coarse), (max-width: 767px) {
          .kiruk-1995-star { opacity: 0.5; }
        }
      `}</style>
      {/* Twinkling starfield — layer stays transparent so page bg shows */}
      {stars.map((s, i) => (
        <span
          key={i}
          aria-hidden
          data-era-calm
          className="kiruk-1995-star absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
            animation: `kiruk-1995-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      {/* Galactic gradient sweep */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(120, 0, 200, 0.25), transparent 60%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(0, 80, 160, 0.25), transparent 65%)",
        }}
      />
    </>
  );
}

export default GeocitiesShellLayer;
