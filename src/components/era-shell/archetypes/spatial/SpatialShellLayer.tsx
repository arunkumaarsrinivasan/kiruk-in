"use client";

/**
 * SpatialShellLayer — global atmosphere mounted by <EraShell> when the
 * active era resolves to the spatial archetype (2025).
 *
 * Layers (back → front):
 *   - deep navy base + slow gradient mesh
 *   - 3 drifting volumetric orbs (purple / blue / teal)
 *   - faint depth grid that fades to edges
 *   - subtle film grain
 *
 * Pointer-events none. Pure visual layer over whatever the page renders.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { ShellLayerProps } from "../../registry";

const PURPLE = "#8b5cf6";
const BLUE = "#3b82f6";
const TEAL = "#14b8a6";

export function SpatialShellLayer({ active }: ShellLayerProps) {
  const reduced = useReducedMotion();
  if (!active) return null;

  return (
    <>
      {/* Gradient mesh — semi-transparent so body bg (era token) shows through */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 20% 10%, rgba(139,92,246,0.22), transparent 60%), " +
            "radial-gradient(ellipse 90% 70% at 80% 20%, rgba(59,130,246,0.18), transparent 60%), " +
            "radial-gradient(ellipse 90% 70% at 60% 90%, rgba(20,184,166,0.16), transparent 60%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Volumetric drifting orbs */}
      {!reduced && (
        <>
          <DriftOrb color={PURPLE} size={620} x="-12%" y="-8%" dx={28} dy={18} dur={22} />
          <DriftOrb color={BLUE} size={520} x="68%" y="22%" dx={-22} dy={26} dur={28} />
          <DriftOrb color={TEAL} size={460} x="22%" y="70%" dx={22} dy={-18} dur={24} />
        </>
      )}

      {/* Depth grid — fades at edges with mask */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 90%)",
        }}
      />

      {/* Volumetric light beam — diagonal sweep */}
      {!reduced && (
        <motion.div
          className="absolute -inset-x-1/4 top-0 bottom-0"
          style={{
            background:
              "linear-gradient(110deg, transparent 30%, rgba(20,184,166,0.07) 45%, rgba(255,255,255,0.05) 50%, rgba(20,184,166,0.07) 55%, transparent 70%)",
            mixBlendMode: "screen",
            filter: "blur(20px)",
          }}
          animate={{ x: ["-15%", "15%", "-15%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Ambient AI particles */}
      {!reduced && <AmbientParticles />}

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
        }}
      />
    </>
  );
}

function AmbientParticles() {
  // Deterministic positions so layout is stable between renders / SSR.
  const PARTICLES = Array.from({ length: 28 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const rand = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
    const left = rand(seed) * 100;
    const top = rand(seed + 1) * 100;
    const size = 1.5 + rand(seed + 2) * 2.5;
    const dur = 12 + rand(seed + 3) * 18;
    const delay = rand(seed + 4) * 8;
    const opacity = 0.25 + rand(seed + 5) * 0.45;
    const palette = ["#8b5cf6", "#3b82f6", "#14b8a6", "#f8fafc"];
    const color = palette[i % palette.length];
    return { left, top, size, dur, delay, opacity, color };
  });

  return (
    <>
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -22, 0, 14, 0],
            x: [0, 10, -6, 0],
            opacity: [p.opacity, p.opacity * 1.4, p.opacity * 0.6, p.opacity],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </>
  );
}

function DriftOrb({
  color,
  size,
  x,
  y,
  dx,
  dy,
  dur,
}: {
  color: string;
  size: number;
  x: string;
  y: string;
  dx: number;
  dy: number;
  dur: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color}aa 0%, ${color}33 35%, transparent 70%)`,
        filter: "blur(20px)",
        mixBlendMode: "screen",
        opacity: 0.55,
      }}
      animate={{ x: [0, dx, 0], y: [0, dy, 0] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default SpatialShellLayer;
