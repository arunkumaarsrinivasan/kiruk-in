"use client";

/**
 * TelescopeBox — the career as a faint star field you read THROUGH a telescope.
 * Naked eye: very minimal dim dots. The cursor is the eyepiece: a clean lens
 * ring tracks the pointer and magnifies that patch of sky; the rest dims to a
 * minimal tunnel. Aiming the lens at a star locks it — the constellation lines
 * connect, the dot brightens, and a tooltip charts the career node. Click opens
 * the full Work observatory. Reskins per era via `palette`.
 */

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { CALM_MOTION_QUERY } from "@/hooks/useCalmMotion";
import type { GamePalette } from "./types";

export interface TelescopeNode {
  label: string;
  sub?: string;
  meta?: string;
  live?: boolean;
}

type Pt = { x: number; y: number; node: TelescopeNode; i: number };
type Dust = { x: number; y: number; r: number; d: number };

/** Field rendered twice: `minimal` (naked-eye base) and `rich` (magnified loupe). */
function Starfield({
  ns,
  palette,
  space,
  pts,
  dust,
  focus,
  reduce,
  mode,
  interactive,
  onFocus,
  onOpen,
}: {
  ns: string;
  palette: GamePalette;
  space: string;
  pts: Pt[];
  dust: Dust[];
  focus: number | null;
  reduce: boolean;
  mode: "minimal" | "rich";
  interactive: boolean;
  onFocus?: (i: number | null) => void;
  onOpen?: () => void;
}) {
  const rich = mode === "rich";
  const A = palette.accent;
  const B = palette.bright;
  const anim = (s: string) => (reduce ? undefined : s);

  return (
    <>
      <defs>
        <filter id={`g-${ns}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="0.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`neb-${ns}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor={A} stopOpacity="0.14" />
          <stop offset="70%" stopColor={A} stopOpacity="0.02" />
          <stop offset="100%" stopColor={A} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`path-${ns}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={A} stopOpacity="0.1" />
          <stop offset="50%" stopColor={B} stopOpacity="0.85" />
          <stop offset="100%" stopColor={A} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="100" height="72" fill={space} />
      {rich && <rect x="0" y="0" width="100" height="72" fill={`url(#neb-${ns})`} />}

      {/* dust — minimal both, fainter naked-eye */}
      {dust.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={palette.fg}
          opacity={rich ? 0.5 : 0.22}
          style={{ animation: anim(`tw-tg ${2.6 + d.d}s ease-in-out ${d.d}s infinite`) }}
        />
      ))}

      {/* constellation lines — only once a star is locked (hover reveals) */}
      {focus != null && (
        <polyline
          points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={`url(#path-${ns})`}
          strokeWidth={rich ? 0.4 : 0.3}
          strokeLinecap="round"
          opacity={rich ? 1 : 0.85}
          filter={`url(#g-${ns})`}
        />
      )}

      {/* stars — minimal dots */}
      {pts.map((p) => {
        const on = focus === p.i;
        const r =
          (p.node.live ? 0.95 : 0.72) *
          (rich ? (on ? 1.7 : 1.25) : 0.85);
        return (
          <g
            key={p.i}
            onMouseEnter={interactive ? () => onFocus?.(p.i) : undefined}
            onMouseLeave={
              interactive ? () => onFocus?.(focus === p.i ? null : focus) : undefined
            }
            onClick={
              interactive
                ? (e) => {
                    e.stopPropagation();
                    onOpen?.();
                  }
                : undefined
            }
            style={{ cursor: interactive ? "pointer" : "default" }}
          >
            {interactive && <circle cx={p.x} cy={p.y} r="4.5" fill="transparent" />}
            {rich && on && <circle cx={p.x} cy={p.y} r={r * 2.6} fill={A} opacity="0.14" />}
            {rich && p.node.live && (
              <circle
                cx={p.x}
                cy={p.y}
                r="2.4"
                fill="none"
                stroke={B}
                strokeWidth="0.25"
                style={{ animation: anim(`pulse-tg 2.6s ease-out infinite`) }}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={r}
              fill={rich ? (on ? B : A) : on ? B : palette.dim}
              opacity={rich ? (on ? 1 : 0.85) : on ? 0.85 : 0.5}
              filter={rich ? `url(#g-${ns})` : undefined}
              style={{
                animation: anim(`core-tg ${2.4 + (p.i % 3)}s ease-in-out ${p.i * 0.3}s infinite`),
              }}
            />
          </g>
        );
      })}
    </>
  );
}

export function TelescopeBox({
  palette,
  title,
  nodes,
  onOpen,
  height = 240,
  className,
}: {
  palette: GamePalette;
  title: string;
  nodes: TelescopeNode[];
  onOpen: () => void;
  height?: number;
  className?: string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [lensing, setLensing] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    // Phones get still stars too: the twinkle is decoration, not data.
    setReduce(globalThis.matchMedia?.(CALM_MOTION_QUERY).matches ?? false);
  }, []);

  const pts: Pt[] = useMemo(() => {
    const n = Math.max(nodes.length, 1);
    return nodes.map((node, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      return { x: 12 + t * 76, y: 58 - Math.sin(t * Math.PI) * 30 - t * 4, node, i };
    });
  }, [nodes]);

  const dust: Dust[] = useMemo(() => {
    let seed = 7;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    return Array.from({ length: 42 }, () => ({
      x: 2 + rnd() * 96,
      y: 2 + rnd() * 92,
      r: 0.1 + rnd() * 0.28,
      d: rnd() * 4,
    }));
  }, []);

  const space = palette.space ?? "#04060d";
  const f = focus != null ? pts[focus] : null;

  const onMove = (e: React.PointerEvent) => {
    // Measure from the FIELD container (below the header) so the lens, loupe and
    // ring sit exactly under the cursor — not offset by the header height.
    const field = fieldRef.current;
    if (!field) return;
    const r = field.getBoundingClientRect();
    field.style.setProperty("--mx", `${e.clientX - r.left}px`);
    field.style.setProperty("--my", `${e.clientY - r.top}px`);
    if (!lensing) setLensing(true);
  };

  const fieldProps = { palette, space, pts, dust, focus, reduce };
  const lensMask =
    "radial-gradient(circle var(--lr) at var(--mx) var(--my), #000 0 calc(var(--lr) - 12px), transparent var(--lr))";

  return (
    <div
      ref={wrapRef}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onPointerMove={onMove}
      onPointerEnter={onMove}
      onPointerLeave={() => {
        setLensing(false);
        setFocus(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`${title} — career charted as a constellation; Enter or click to open Work`}
      className={`group/scope relative w-full cursor-pointer select-none overflow-hidden ${className ?? ""}`}
      style={
        {
          background: space,
          border: `2px solid ${palette.dim}`,
          fontFamily: palette.font,
          ["--lr" as string]: "66px",
        } as React.CSSProperties
      }
    >
      <style>{`
        @keyframes tw-tg{0%,100%{opacity:.18}50%{opacity:.7}}
        @keyframes core-tg{0%,100%{opacity:.45}50%{opacity:.9}}
        @keyframes pulse-tg{0%{opacity:.5;r:2.4}70%{opacity:0;r:5.5}100%{opacity:0;r:5.5}}
      `}</style>

      {/* header */}
      <div
        className="relative z-20 flex items-center justify-between px-3 py-1.5 text-[13px] uppercase tracking-[0.16em]"
        style={{ color: palette.dim, borderBottom: `1px solid ${palette.dim}` }}
      >
        <span style={{ color: palette.bright }}>🔭 {title}</span>
        <span className="opacity-70">move the eyepiece · click to open ⤢</span>
      </div>

      <div ref={fieldRef} className="relative" style={{ height }}>
        {/* BASE — naked-eye minimal field */}
        <svg viewBox="0 0 100 72" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <Starfield ns={`b${uid}`} mode="minimal" interactive onFocus={setFocus} onOpen={onOpen} {...fieldProps} />
        </svg>

        {/* soft tunnel-vision — minimal, not blank */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{ background: space, opacity: lensing ? 0.6 : 0 }}
        />

        {/* MAGNIFIED loupe — rich field clipped to the lens at the cursor */}
        <svg
          aria-hidden
          viewBox="0 0 100 72"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-150"
          style={{
            opacity: lensing ? 1 : 0,
            transform: "scale(1.85)",
            transformOrigin: "var(--mx) var(--my)",
            WebkitMaskImage: lensMask,
            maskImage: lensMask,
          }}
        >
          <Starfield ns={`l${uid}`} mode="rich" interactive={false} {...fieldProps} />
        </svg>

        {/* EYEPIECE ring — clean */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 transition-opacity duration-150"
          style={{
            opacity: lensing ? 1 : 0,
            width: "calc(var(--lr) * 2)",
            height: "calc(var(--lr) * 2)",
            transform: "translate(var(--mx), var(--my)) translate(-50%, -50%)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `1.5px solid color-mix(in srgb, ${palette.bright} 70%, transparent)`,
              boxShadow: `0 0 10px color-mix(in srgb, ${palette.accent} 40%, transparent)`,
            }}
          />
          {/* N/E/S/W ticks */}
          {[
            "left-1/2 top-0 h-1.5 w-px -translate-x-1/2",
            "left-1/2 bottom-0 h-1.5 w-px -translate-x-1/2",
            "left-0 top-1/2 h-px w-1.5 -translate-y-1/2",
            "right-0 top-1/2 h-px w-1.5 -translate-y-1/2",
          ].map((c) => (
            <div key={c} className={`absolute ${c}`} style={{ background: palette.bright, opacity: 0.7 }} />
          ))}
          {/* crosshair */}
          <div className="absolute left-1/2 top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2" style={{ background: palette.bright, opacity: 0.45 }} />
          <div className="absolute left-1/2 top-1/2 h-px w-2 -translate-x-1/2 -translate-y-1/2" style={{ background: palette.bright, opacity: 0.45 }} />
        </div>

        {/* TOOLTIP — charts the locked star, by the lens */}
        {lensing && f && (
          <div
            className="pointer-events-none absolute left-0 top-0 z-20 max-w-[60%] whitespace-nowrap px-2 py-1 text-[12px] leading-tight"
            style={{
              transform: "translate(var(--mx), var(--my)) translate(-50%, calc(-1 * var(--lr) - 16px))",
              background: `color-mix(in srgb, ${space} 85%, transparent)`,
              border: `1px solid ${palette.dim}`,
              color: palette.fg,
              boxShadow: `0 0 12px color-mix(in srgb, ${palette.accent} 30%, transparent)`,
            }}
          >
            <span style={{ color: palette.bright }}>
              {f.node.meta ? `${f.node.meta} · ` : ""}
              {f.node.label}
            </span>
            {f.node.sub && (
              <span className="block truncate opacity-80">{f.node.sub}</span>
            )}
          </div>
        )}

        {/* vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 55%, ${space} 100%)` }}
        />

        {/* HUD */}
        <div className="pointer-events-none absolute left-3 top-2 z-10 text-[10px] leading-tight" style={{ color: palette.dim }}>
          {lensing ? "OBSERVING" : "NAKED EYE"}
          <br />
          MAG {lensing ? "7.5" : "1.0"}
        </div>
        <div className="pointer-events-none absolute bottom-2 right-3 z-10 text-right text-[10px] leading-tight" style={{ color: palette.dim }}>
          {nodes.length} career stars
        </div>
      </div>

      {/* readout */}
      <div
        className="relative z-20 flex items-center gap-2 px-3 py-1.5 text-[13px]"
        style={{ color: palette.dim, borderTop: `1px solid ${palette.dim}`, minHeight: 34 }}
      >
        {f ? (
          <span style={{ color: palette.bright }}>
            ↳ {f.node.meta ? `${f.node.meta} · ` : ""}
            {f.node.label}
          </span>
        ) : (
          <span className="opacity-70">aim the eyepiece at a faint star to reveal it</span>
        )}
      </div>
    </div>
  );
}

export default TelescopeBox;
