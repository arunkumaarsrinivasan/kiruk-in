"use client";

/**
 * Blueprint QA harness — /proto/blueprint
 *
 * Systematic check of the era-travel wireframe: pick an era and a route,
 * scrub the phases (grid → rulers → skeleton → reveal) or play the sequence,
 * in slow motion when you need to see the timing. The stage wears the
 * selected era's tokens locally, so the global theme is untouched.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AVAILABLE_THEMES } from "@/data/portfolio-data";
import type { EraPageKey } from "@/components/era-shell/registry";
import {
  EraBlueprint,
  type BlueprintPhase,
} from "@/components/era-travel/EraBlueprint";
import { getBlueprintSpec } from "@/components/era-travel/specs";
import type { BlueprintRegion } from "@/components/era-travel/blueprint-types";

const GRID_MS = 200;
const RULERS_MS = 220;
const SKELETON_MS = 360;
const REVEAL_MS = 240;

const PHASES: BlueprintPhase[] = ["grid", "rulers", "skeleton", "reveal"];

const PAGE_KEYS: EraPageKey[] = [
  "home",
  "work",
  "about",
  "contact",
  "blog",
  "progress",
  "case-studies",
  "portfolio",
];

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

/** Offset stand-ins for the real page's elements — when enabled, the
 *  skeleton must FLIP from its spec rects onto these. */
function dummyRect(
  r: BlueprintRegion,
  column: { x: number; w: number; mobileX: number; mobileW: number },
  stageW: number,
): React.CSSProperties {
  const mobile = stageW < 768;
  if (mobile && r.mobile?.hidden) return { display: "none" };
  const m = mobile ? r.mobile : undefined;
  const rx = m?.x ?? r.x;
  const rw = m?.w ?? r.w;
  const ry = m?.y ?? r.y;
  const rh = m?.h ?? r.h;
  const cx = mobile ? column.mobileX : column.x;
  const cw = mobile ? column.mobileW : column.w;
  const baseX = r.space === "viewport" ? 0 : cx;
  const baseW = r.space === "viewport" ? 1 : cw;
  return {
    left: `${(baseX + Math.min(rx + 0.07, 0.9) * baseW) * 100}%`,
    top: `${Math.min(ry + 0.05, 0.9) * 100}%`,
    width: `${rw * 0.88 * baseW * 100}%`,
    height: `${rh * 0.85 * 100}%`,
  };
}

export function Harness() {
  const [eraId, setEraId] = useState("1970");
  const [pageKey, setPageKey] = useState<EraPageKey>("home");
  const [phase, setPhase] = useState<BlueprintPhase>("skeleton");
  const [slow, setSlow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [snapDemo, setSnapDemo] = useState(false);
  const [viewportW, setViewportW] = useState<"full" | number>("full");
  const timers = useRef<number[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageW, setStageW] = useState(1280);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageW(el.clientWidth || 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const theme =
    AVAILABLE_THEMES.find((t) => t.id === eraId) ?? AVAILABLE_THEMES[0];
  const { spec, grammar } = getBlueprintSpec(eraId, pageKey);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const play = useCallback(() => {
    clearTimers();
    const k = slow ? 3 : 1;
    setPlaying(true);
    setPhase("grid");
    const at = (ms: number, fn: () => void) =>
      timers.current.push(window.setTimeout(fn, ms * k));
    at(GRID_MS, () => setPhase("rulers"));
    at(GRID_MS + RULERS_MS, () => setPhase("skeleton"));
    at(GRID_MS + RULERS_MS + SKELETON_MS, () => setPhase("reveal"));
    at(GRID_MS + RULERS_MS + SKELETON_MS + REVEAL_MS + 120, () =>
      setPlaying(false),
    );
  }, [slow]);

  // Local era tokens for the stage only.
  const stageVars = {
    "--bg-main": theme.colors.background,
    "--bg-card": theme.colors.secondary,
    "--text-main": theme.colors.text,
    "--text-muted": `color-mix(in srgb, ${theme.colors.text} 55%, ${theme.colors.background})`,
    "--accent-color": theme.colors.accent,
    "--border-color": `color-mix(in srgb, ${theme.colors.text} 24%, ${theme.colors.background})`,
    "--font-heading": theme.fonts.primary,
    "--font-main": theme.fonts.secondary,
  } as React.CSSProperties;

  const gridOverride = {
    size: theme.designTokens?.gridSize || 20,
    opacity: theme.designTokens?.gridOpacity || 0.1,
  };

  const btn = (active: boolean): React.CSSProperties => ({
    fontFamily: MONO,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    padding: "6px 10px",
    border: `1px solid ${active ? "#fff" : "#333"}`,
    background: active ? "#fff" : "transparent",
    color: active ? "#000" : "#aaa",
    cursor: "pointer",
  });

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "#0a0a0a", color: "#eee", fontFamily: MONO }}
    >
      {/* ── controls ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 px-4 py-3 pt-20">
        <span className="mr-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          era
        </span>
        {AVAILABLE_THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            style={btn(t.id === eraId)}
            onClick={() => setEraId(t.id)}
          >
            {t.id}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 px-4 py-2">
        <span className="mr-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          route
        </span>
        {PAGE_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            style={btn(k === pageKey)}
            onClick={() => setPageKey(k)}
          >
            {k}
          </button>
        ))}
        <span className="mx-3 h-4 w-px bg-neutral-700" />
        {PHASES.map((p) => (
          <button
            key={p}
            type="button"
            style={btn(p === phase && !playing)}
            onClick={() => {
              clearTimers();
              setPlaying(false);
              setPhase(p);
            }}
          >
            {p}
          </button>
        ))}
        <button type="button" style={btn(playing)} onClick={play}>
          ▶ play
        </button>
        <button
          type="button"
          style={btn(slow)}
          onClick={() => setSlow((v) => !v)}
        >
          ¼× slow
        </button>
        <button
          type="button"
          style={btn(snapDemo)}
          onClick={() => setSnapDemo((v) => !v)}
          title="Render offset dummy targets with data-blueprint ids — boxes FLIP-snap to them, like the live DOM snap"
        >
          snap targets
        </button>
        <span className="mx-3 h-4 w-px bg-neutral-700" />
        {(
          [
            ["full", "full"],
            [1280, "1280"],
            [768, "768"],
            [390, "390"],
          ] as const
        ).map(([w, label]) => (
          <button
            key={label}
            type="button"
            style={btn(viewportW === w)}
            onClick={() => setViewportW(w as "full" | number)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── stage ── */}
      <div
        ref={stageRef}
        className="relative m-4 flex-1 overflow-hidden border border-neutral-700"
        style={{
          minHeight: "70vh",
          width: viewportW === "full" ? undefined : viewportW,
          marginInline: viewportW === "full" ? undefined : "auto",
          ...stageVars,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "var(--bg-main)" }}
        />
        {snapDemo &&
          spec.regions.map((r) => (
            <div
              key={`target-${r.id}`}
              data-blueprint={r.id}
              className="absolute border border-dashed"
              style={{
                ...dummyRect(r, spec.column, stageW),
                borderColor:
                  "color-mix(in srgb, var(--text-main) 30%, transparent)",
              }}
            />
          ))}
        <EraBlueprint
          key={`${eraId}:${pageKey}:${snapDemo}`}
          spec={spec}
          grammar={grammar}
          phase={phase}
          reduce={false}
          gridOverride={gridOverride}
        />
        <div
          className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.16em]"
          style={{ color: "var(--text-muted)", fontFamily: MONO }}
        >
          {eraId} · {pageKey} · grammar {grammar} · {spec.regions.length}{" "}
          regions
        </div>
      </div>
    </div>
  );
}

export default Harness;
