"use client";

/**
 * Harness — the lab console for /lab/maze-nav.
 *
 * Mode tabs (Quadrant / Spaghetti / Braid), every knob always visible (no
 * conditional leva rows), seed shown, Shuffle + click-canvas for a new
 * variation, Save (writes JSON + clipboard), and a rail of saved configs that
 * re-apply on click. Everything re-renders live as knobs move.
 *
 * The stage wears the selected era's tokens locally so the global theme is
 * untouched. Production imports nothing from here.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MazeNav } from "./MazeNav";
import {
  DEFAULT_CONFIG,
  ERA_LABELS,
  MODE_LABELS,
  type EraId,
  type MazeConfig,
  type MazeMode,
} from "./types";

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

const KNOB_DEFS = [
  { key: "cols", label: "COLS", min: 11, max: 25, step: 2 },
  { key: "rows", label: "ROWS", min: 9, max: 19, step: 2 },
  { key: "tileSize", label: "TILE", min: 12, max: 28, step: 1 },
  { key: "corridorInset", label: "PATH INSET", min: 0, max: 8, step: 1 },
  { key: "wallBevel", label: "BEVEL", min: 0, max: 4, step: 1 },
  { key: "doorGlow", label: "DOOR GLOW", min: 0, max: 20, step: 1 },
  { key: "labelScale", label: "LABEL", min: 0.7, max: 1.4, step: 0.05 },
  { key: "playerScale", label: "PLAYER", min: 0.55, max: 0.9, step: 0.05 },
  { key: "pathStepMs", label: "STEP MS", min: 40, max: 140, step: 5 },
  { key: "proximityRadius", label: "PROX", min: 1, max: 3, step: 1 },
  { key: "braidRate", label: "BRAID", min: 0, max: 0.5, step: 0.02 },
  { key: "spawnBias", label: "SPAWN BIAS", min: 0, max: 1, step: 0.05 },
  { key: "overlayOpacity", label: "OPACITY", min: 0.8, max: 1, step: 0.01 },
] as const;

type KnobKey = (typeof KNOB_DEFS)[number]["key"];

// Era token snapshots for the stage preview. Mirrors globals.css enough to judge.
const ERA_TOKENS: Record<EraId, React.CSSProperties> = ({
  default: {
    "--bg-main": "#0a0a0a",
    "--bg-card": "#141414",
    "--text-main": "#f5f5f5",
    "--text-muted": "#9a9a9a",
    "--accent-color": "#39ff14",
    "--border-color": "#3a3a3a",
    "--nav-surface": "#141414",
    "--nav-text": "#f5f5f5",
    "--nav-text-muted": "#9a9a9a",
  },
  "1970": {
    "--bg-main": "#000000",
    "--bg-card": "#000000",
    "--text-main": "#00ff00",
    "--text-muted": "#008800",
    "--accent-color": "#39ff14",
    "--border-color": "#00ff00",
    "--nav-surface": "#000000",
    "--nav-text": "#39ff14",
    "--nav-text-muted": "#00cc00",
  },
  "1995": {
    "--bg-main": "#008080",
    "--bg-card": "#c0c0c0",
    "--text-main": "#000080",
    "--text-muted": "#404080",
    "--accent-color": "#ff00ff",
    "--border-color": "#000080",
    "--nav-surface": "#c0c0c0",
    "--nav-text": "#000080",
    "--nav-text-muted": "#404080",
  },
  "2000": {
    "--bg-main": "#1a1f2e",
    "--bg-card": "#2a3040",
    "--text-main": "#e8e8f0",
    "--text-muted": "#8888a0",
    "--accent-color": "#00aaff",
    "--border-color": "#3a4050",
    "--nav-surface": "#2a3040",
    "--nav-text": "#e8e8f0",
    "--nav-text-muted": "#8888a0",
  },
  "2026": {
    "--bg-main": "#0d0d12",
    "--bg-card": "#16161e",
    "--text-main": "#f0f0f5",
    "--text-muted": "#8a8a96",
    "--accent-color": "#a855f7",
    "--border-color": "#2a2a36",
    "--nav-surface": "#16161e",
    "--nav-text": "#f0f0f5",
    "--nav-text-muted": "#8a8a96",
  },
} as Record<EraId, React.CSSProperties>);

function randomSeed(): string {
  return "kiruk-" + Math.random().toString(36).slice(2, 8);
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center justify-between text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
        <span className="tabular-nums" style={{ color: "var(--text-main)" }}>{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-current"
        style={{ accentColor: "var(--accent-color)" }}
      />
    </label>
  );
}

export function Harness() {
  const [config, setConfig] = useState<MazeConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState<MazeConfig[]>([]);
  const [saveState, setSaveState] = useState<{ path?: string; ok?: boolean; err?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Load any saved configs from /api/lab/save index on mount.
  useEffect(() => {
    if (!mounted) return;
    fetch("/api/lab/save", { method: "GET" })
      .then((r) => (r.ok ? r.json() : { configs: [] }))
      .then((data: { configs?: MazeConfig[] }) => setSaved(data.configs ?? []))
      .catch(() => setSaved([]));
  }, [mounted]);

  const set = useCallback(<K extends keyof MazeConfig>(key: K, value: MazeConfig[K]) => {
    setConfig((c) => ({ ...c, [key]: value }));
  }, []);

  const shuffle = useCallback(() => {
    setConfig((c) => ({ ...c, seed: randomSeed() }));
  }, []);

  const onSave = useCallback(async () => {
    setSaveState(null);
    try {
      const res = await fetch("/api/lab/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveState({ err: data?.error ?? "save failed" });
        return;
      }
      setSaveState({ ok: true, path: data.path });
      // refresh rail
      const list = await fetch("/api/lab/save", { method: "GET" }).then((r) => r.json());
      setSaved(list.configs ?? []);
      // also copy to clipboard
      try {
        await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      } catch {
        /* clipboard may be blocked; file is the source of truth */
      }
    } catch (e) {
      setSaveState({ err: String(e) });
    }
  }, [config]);

  const eraVars = ERA_TOKENS[config.era] as React.CSSProperties;

  const stage = (
    <div
      className="fixed inset-0"
      style={{
        zIndex: 20000,
        background: `rgba(8,8,10,${config.overlayOpacity})`,
        fontFamily: MONO,
        color: "#e8e8f0",
        ...eraVars,
      }}
    >
      <div className="mx-auto flex h-full max-w-[1180px] flex-col gap-3 p-3 sm:p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent-color)" }}>
              ◉ MAZE NAV
            </span>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              lab
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase" style={{ color: "var(--text-muted)" }}>
              seed
            </span>
            <code className="border px-1.5 py-0.5 text-[10px]" style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}>
              {config.seed}
            </code>
            <button
              onClick={shuffle}
              className="border-2 px-2 py-1 text-[10px] font-bold uppercase"
              style={{ borderColor: "var(--accent-color)", color: "var(--accent-color)" }}
            >
              Shuffle
            </button>
          </div>
        </div>

        {/* Body: stage + panel */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
          {/* Stage */}
          <div
            ref={stageRef}
            className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded border"
            style={{ borderColor: "var(--border-color)", background: "var(--bg-main)" }}
          >
            <MazeNav config={config} onClose={() => setConfig((c) => ({ ...c }))} />
          </div>

          {/* Panel */}
          <aside
            className="flex w-full shrink-0 flex-col gap-3 overflow-auto rounded border p-3 lg:w-[300px]"
            style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
          >
            {/* Mode tabs */}
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-1 text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Mode
              </legend>
              <div className="grid grid-cols-3 gap-1">
                {(Object.keys(MODE_LABELS) as MazeMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => set("mode", m)}
                    className="border-2 px-1 py-1 text-[9px] font-bold uppercase"
                    style={{
                      borderColor: config.mode === m ? "var(--accent-color)" : "var(--border-color)",
                      color: config.mode === m ? "var(--accent-color)" : "var(--text-main)",
                      background: config.mode === m ? "color-mix(in srgb, var(--accent-color) 12%, transparent)" : "transparent",
                    }}
                  >
                    {MODE_LABELS[m]}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Era preview */}
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-1 text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Era preview
              </legend>
              <select
                value={config.era}
                onChange={(e) => set("era", e.target.value as EraId)}
                className="border-2 bg-transparent px-1 py-1 text-[10px]"
                style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}
              >
                {(Object.keys(ERA_LABELS) as EraId[]).map((e) => (
                  <option key={e} value={e} style={{ color: "#000" }}>
                    {ERA_LABELS[e]}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* Knobs */}
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Knobs
              </legend>
              {KNOB_DEFS.map((k) => (
                <Slider
                  key={k.key}
                  label={k.label}
                  value={config[k.key] as number}
                  min={k.min}
                  max={k.max}
                  step={k.step}
                  onChange={(v) => set(k.key as KnobKey, v)}
                />
              ))}
              <label className="flex items-center justify-between text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                D-PAD
                <input
                  type="checkbox"
                  checked={config.showDpad}
                  onChange={(e) => set("showDpad", e.target.checked)}
                  style={{ accentColor: "var(--accent-color)" }}
                />
              </label>
            </fieldset>

            {/* Save */}
            <div className="flex flex-col gap-1">
              <button
                onClick={onSave}
                className="border-2 px-2 py-1.5 text-[10px] font-bold uppercase"
                style={{ borderColor: "var(--accent-color)", color: "var(--accent-color)" }}
              >
                Save config
              </button>
              {saveState?.ok && (
                <span className="text-[9px]" style={{ color: "var(--accent-color)" }}>
                  saved → {saveState.path}
                </span>
              )}
              {saveState?.err && (
                <span className="text-[9px]" style={{ color: "#ff6b6b" }}>
                  {saveState.err}
                </span>
              )}
            </div>

            {/* Saved rail */}
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-1 text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Saved ({saved.length})
              </legend>
              {saved.length === 0 ? (
                <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                  nothing saved yet
                </span>
              ) : (
                <div className="flex flex-col gap-1">
                  {saved.map((s, i) => (
                    <button
                      key={`${s.seed}-${i}`}
                      onClick={() => setConfig(s)}
                      className="border px-1.5 py-1 text-left text-[9px]"
                      style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    >
                      <span style={{ color: "var(--accent-color)" }}>{MODE_LABELS[s.mode][0]}</span>{" "}
                      <code>{s.seed}</code> · {s.cols}×{s.rows}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
          </aside>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(stage, document.body);
}
