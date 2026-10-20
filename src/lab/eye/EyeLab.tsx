"use client";

/**
 * EyeLab — the workbench for the TSL eye at /lab/eye (docs/EYE_TSL_PLAN.md).
 *
 * One stage fills the screen: the live GLSL eye, or the TSL stage being built.
 * The panel switches eras, forces the WebGL2 backend, solos layers, flips
 * debug views, holds the gaze and the pupil, overlays a reference photo, shows
 * what the frame costs, and captures the posters the loader paints first.
 *
 * Reference photos stay on this machine: they are read as object URLs and
 * never uploaded or written anywhere. Production imports nothing from here.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ERA_MEDIA } from "@/components/three/eye/post/era-medium";
import dynamic from "next/dynamic";
import { AVAILABLE_THEMES, type ThemeConfig } from "@/data/portfolio-data";
import type { EyeLayer, EyeStageControl } from "@/components/three/eye/EyeStage";
import { EYE_LAYERS } from "@/components/three/eye/EyeStage";
import { DEBUG_VIEWS } from "@/components/three/eye/uniforms";
import {
  LID_SHAPES,
  MONK_TONES,
  getEyeIdentity,
  type LidType,
  type MonkTone,
} from "@/components/three/eye/identity";
import { TIERS } from "@/components/three/eye/tiers";
import type { GazeSample } from "@/components/three/eye/rig/gaze";
import { GAZE_PATTERNS, type GazePattern } from "@/components/three/eye/look";
import { POSTER_VARIANTS, posterSrc, type PosterVariant } from "@/components/three/eye/posters";
import { ROOM_HEX } from "@/components/three/eye/nodes/room";

const EraEyeCanvas = dynamic(() => import("@/components/three/EraEyeCanvas"), { ssr: false });
const EyeStage = dynamic(() => import("@/components/three/eye/EyeStage"), { ssr: false });
const GlslScreenRef = dynamic(() => import("./GlslScreenRef"), { ssr: false });

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
/** Long enough for the live eye to fade in, swap palettes and settle its pupil. */
const SETTLE_MS = 3400;

type StageKind = "tsl" | "glsl";
/** How the live shader's screen is set against the TSL one. */
type Parity = "off" | "glsl" | "difference";

interface HudState {
  backend: string;
  tier: string;
  fps: number;
  cpuMs: number;
  gpuMs: number | null;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  dpr: number;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Lab focus holds, mm toward the camera from the globe's centre (null racks to the pointer). */
const FOCUS_HOLDS = { auto: null, iris: 11.6, lashes: 15.5, skin: 6 } as const;

/** The person's lash numbers the lab can override. */
const LASH_KNOBS = ["upper", "lower", "length", "curl", "clump", "mascara"] as const;
type LashKnob = (typeof LASH_KNOBS)[number];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 px-4 py-3">
      <h2 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/45">{title}</h2>
      {children}
    </section>
  );
}

function Seg<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className="rounded px-2 py-1 text-[11px] transition-colors duration-150 disabled:opacity-35"
          style={{
            background: value === o.id ? "#f4f3f0" : "rgba(255,255,255,0.06)",
            color: value === o.id ? "#0b0b0b" : "rgba(255,255,255,0.8)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] text-white/75" style={{ opacity: disabled ? 0.35 : 1 }}>
      <span className="w-14 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1 accent-white"
      />
      <span className="w-10 shrink-0 text-right tabular-nums">{value.toFixed(2)}</span>
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] text-white/80" style={{ opacity: disabled ? 0.35 : 1 }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-white"
      />
      {label}
    </label>
  );
}

/** The pupil's diameter over the last six seconds, 1.5–8.5 mm. */
function PupilTrace({ samples }: { samples: number[] }) {
  const W = 288;
  const H = 56;
  const y = (mm: number) => H - ((mm - 1.5) / 7) * H;
  const pts = samples.map((mm, i) => `${(i / 179) * W},${y(mm).toFixed(1)}`).join(" ");
  const now = samples[samples.length - 1];
  return (
    <div className="relative">
      <svg width={W} height={H} className="block rounded bg-white/[0.04]" aria-label="Pupil diameter over time">
        {[2, 4, 6, 8].map((mm) => (
          <line key={mm} x1={0} x2={W} y1={y(mm)} y2={y(mm)} stroke="rgba(255,255,255,0.08)" />
        ))}
        <polyline points={pts} fill="none" stroke="#f4f3f0" strokeWidth={1.4} />
      </svg>
      <span className="absolute right-1 top-1 text-[10px] tabular-nums text-white/70">
        {now === undefined ? "" : `${now.toFixed(2)} mm`}
      </span>
    </div>
  );
}

/**
 * The gaze as an eye tracker would plot it: yaw and pitch over the last six
 * seconds (saccades are the near-vertical steps, fixations the flats, drift
 * and microsaccades the fuzz on them), and the scanpath on the right.
 */
function GazeTrace({ samples }: { samples: GazeSample[] }) {
  const W = 168;
  const H = 84;
  const S = 84;
  if (samples.length < 2) return <div className="h-[84px] rounded bg-white/[0.04]" />;
  const t1 = samples[samples.length - 1].t;
  const x = (t: number) => W - ((t1 - t) / 6) * W;
  const y = (deg: number) => H / 2 - (deg / 26) * (H / 2);
  const yaw = samples.map((p) => `${x(p.t).toFixed(1)},${y(p.x).toFixed(1)}`).join(" ");
  const pitch = samples.map((p) => `${x(p.t).toFixed(1)},${y(p.y).toFixed(1)}`).join(" ");
  // the scanpath, ±26° wide and ±17° tall
  const sx = (deg: number) => S / 2 + (deg / 26) * (S / 2);
  const sy = (deg: number) => S / 2 - (deg / 17) * (S / 2);
  const path = samples.map((p) => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const now = samples[samples.length - 1];
  return (
    <div className="flex gap-1">
      <svg width={W} height={H} className="block rounded bg-white/[0.04]" aria-label="Gaze yaw and pitch over time">
        <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.08)" />
        <polyline points={yaw} fill="none" stroke="#7fb6ff" strokeWidth={1.2} />
        <polyline points={pitch} fill="none" stroke="#ffb36b" strokeWidth={1.2} />
      </svg>
      <svg width={S} height={S} className="block rounded bg-white/[0.04]" aria-label="Scanpath">
        <polyline points={path} fill="none" stroke="rgba(244,243,240,0.55)" strokeWidth={0.8} />
        <circle cx={sx(now.x)} cy={sy(now.y)} r={2.2} fill="#f4f3f0" />
      </svg>
    </div>
  );
}

export default function EyeLab() {
  const themes = AVAILABLE_THEMES;
  const [kind, setKind] = useState<StageKind>("tsl");
  const [forceWebGL, setForceWebGL] = useState(false);
  const [dprCap, setDprCap] = useState<"auto" | "1">("auto");
  const [reduce, setReduce] = useState(false);
  const [era, setEra] = useState<ThemeConfig>(themes[0]);
  const [panel, setPanel] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);

  // ---- TSL stage control --------------------------------------------------
  const control = useRef<EyeStageControl | null>(null);
  const [layers, setLayers] = useState<Record<EyeLayer, boolean>>({
    room: true,
    eyeball: true,
    cornea: true,
    lids: true,
    lashes: true,
    tears: true,
    socket: true,
  });
  /** A stare: the eye stops blinking on its own, so the tear film breaks up. */
  const [stare, setStare] = useState(false);
  const [tearInfo, setTearInfo] = useState({ sinceBlink: 0, tearing: 0 });
  const [gazeTrace, setGazeTrace] = useState<GazeSample[]>([]);
  /** The era's lens, and a held focus (null: racks to the pointer). */
  const [lensOn, setLensOn] = useState(true);
  const [pagesOn, setPagesOn] = useState(true);
  /** Ten ways of seeing (post/era-medium.ts): on, and which medium ("era": the era's own; 0 none). */
  const [seeing, setSeeing] = useState(false);
  const [medium, setMedium] = useState<"era" | number>("era");
  const [focusHold, setFocusHold] = useState<"auto" | "iris" | "lashes" | "skin">("auto");
  const [focusZ, setFocusZ] = useState(0);
  const [gazePattern, setGazePattern] = useState<GazePattern | null>(null);
  const [gazeInfo, setGazeInfo] = useState<{ pattern: GazePattern; blinkEvery: number } | null>(null);
  /** Lab overrides of the person's lashes; a missing key follows the era's identity. */
  const [lashOverride, setLashOverride] = useState<Partial<Record<LashKnob, number>>>({});
  /** Lab overrides of the person's white; null follows the era's identity. */
  const [vessels, setVessels] = useState<number | null>(null);
  const [age, setAge] = useState<number | null>(null);
  /** Lab overrides of the person's face; null follows the era's identity. */
  const [monk, setMonk] = useState<MonkTone | null>(null);
  const [lidType, setLidType] = useState<LidType | null>(null);
  const [debugView, setDebugView] = useState<(typeof DEBUG_VIEWS)[number]>("final");
  const [holdGaze, setHoldGaze] = useState(false);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [holdPupil, setHoldPupil] = useState(false);
  const [pupil, setPupil] = useState(0.34);
  const [holdLid, setHoldLid] = useState(false);
  const [lid, setLid] = useState(0.5);
  const [holdSquint, setHoldSquint] = useState(false);
  const [squint, setSquint] = useState(1);
  const [hud, setHud] = useState<HudState | null>(null);
  /** The pupil's last few seconds, mm, and whether the lab's light step is on. */
  const [pupilTrace, setPupilTrace] = useState<number[]>([]);
  const [lightOn, setLightOn] = useState(false);
  const [parity, setParity] = useState<Parity>("off");

  // ---- reference overlay ----------------------------------------------------
  const [ref, setRef] = useState<string | null>(null);
  const [refShow, setRefShow] = useState(true);
  const [refOpacity, setRefOpacity] = useState(0.5);
  const [refScale, setRefScale] = useState(1);
  const [refX, setRefX] = useState(0);
  const [refY, setRefY] = useState(0);

  // ---- posters ---------------------------------------------------------------
  const capture = useRef<(() => Promise<string>) | null>(null);
  const [capVariant, setCapVariant] = useState<PosterVariant | null>(null);
  const [capEra, setCapEra] = useState<ThemeConfig>(themes[0]);
  const [capLog, setCapLog] = useState<string[]>([]);
  const [capPreview, setCapPreview] = useState<string | null>(null);
  const capturing = capVariant !== null;
  /** Bumped after a capture run so the poster previews re-fetch. */
  const [posterRev, setPosterRev] = useState(0);

  const stageKey = `${kind}-${forceWebGL ? "gl" : "auto"}`;

  // Reapply the panel's state whenever a new stage comes up.
  const applyControls = useCallback(() => {
    const c = control.current;
    if (!c) return;
    for (const l of EYE_LAYERS) c.setLayerVisible(l, layers[l]);
    c.uniforms.debugView.value = DEBUG_VIEWS.indexOf(debugView);
    c.holdGaze(holdGaze ? gaze : null);
    c.holdPupil(holdPupil ? pupil : null);
    c.holdBlink(holdLid ? lid : null);
    c.holdSquint(holdSquint ? squint : null);
    c.stare(stare);
    c.setGazePattern(gazePattern);
    c.lensOn(lensOn);
    c.pagesOn(pagesOn);
    c.setMedium(medium === "era" ? null : medium);
    c.holdFocus(FOCUS_HOLDS[focusHold]);
    const id = getEyeIdentity(era.id);
    c.uniforms.sclera.vessels.value = vessels ?? id.sclera.vessels;
    c.uniforms.sclera.age.value = age ?? id.sclera.age;
    c.uniforms.skin.tone.value.set(MONK_TONES[monk ?? id.skin.monk]);
    const shape = LID_SHAPES[lidType ?? id.lids.type];
    c.uniforms.skin.creaseD.value = shape.creaseD;
    c.uniforms.skin.creaseDepth.value = shape.creaseDepth;
    c.uniforms.skin.hood.value = shape.hood;
    c.uniforms.lids.epicanthus.value = shape.epicanthus;
    for (const k of LASH_KNOBS) c.uniforms.lashes[k].value = lashOverride[k] ?? id.lashes[k];
  }, [lensOn, pagesOn, medium, focusHold, gazePattern, stare, lashOverride, layers, debugView, holdGaze, gaze, holdPupil, pupil, holdLid, lid, holdSquint, squint, vessels, age, monk, lidType, era.id]);

  useEffect(() => {
    applyControls();
  }, [applyControls]);

  useEffect(() => {
    if (kind !== "tsl") return;
    const id = window.setInterval(() => {
      const c = control.current;
      if (c) {
        setPupilTrace(c.pupilTrace());
        setTearInfo(c.tearInfo());
        setGazeTrace(c.gazeTrace());
        setGazeInfo(c.gazeInfo());
        setFocusZ(c.focusZ());
      }
    }, 120);
    return () => window.clearInterval(id);
  }, [kind]);

  useEffect(() => {
    control.current?.lightStep(lightOn ? 2.4 : 0);
  }, [lightOn, hud]);

  // Headless checks (scripts/eye-lab-shots.mjs "eval") read the stage from here.
  useEffect(() => {
    (window as unknown as { __eyeLab?: typeof control }).__eyeLab = control;
    return () => {
      delete (window as unknown as { __eyeLab?: typeof control }).__eyeLab;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const c = control.current;
      if (!c || kind !== "tsl") {
        setHud(null);
        return;
      }
      applyControls();
      const s = c.stats;
      setHud({
        backend: c.info.backend,
        tier: c.info.tier === 0 ? "T0 poster" : TIERS[c.info.tier as 1 | 2 | 3].label,
        fps: s.fps,
        cpuMs: s.cpuMs,
        gpuMs: s.gpuMs,
        drawCalls: s.drawCalls,
        triangles: s.triangles,
        geometries: s.geometries,
        textures: s.textures,
        dpr: s.dpr,
      });
    }, 500);
    return () => window.clearInterval(id);
  }, [kind, applyControls]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "h" || e.key === "H") setPanel((p) => !p);
      if (e.key === "b" || e.key === "B") control.current?.blink();
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const i = themes.findIndex((t) => t.id === era.id);
        const next = themes[Math.min(themes.length - 1, Math.max(0, i + (e.key === "ArrowRight" ? 1 : -1)))];
        setEra(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [era.id, themes]);

  const loadRef = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setRef((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setRefShow(true);
  }, []);

  useEffect(
    () => () => {
      if (ref) URL.revokeObjectURL(ref);
    },
    [ref],
  );

  /** Captures what the loader shows: the live eye through each era's own screen. */
  const captureAll = useCallback(async (only?: string[]) => {
    setCapLog([]);
    const log = (line: string) => setCapLog((l) => [...l, line]);
    const eras = only ? themes.filter((t) => only.includes(t.id)) : themes;
    for (const variant of Object.keys(POSTER_VARIANTS) as PosterVariant[]) {
      setCapEra(eras[0]);
      setCapVariant(variant);
      // the eye compiles behind its own poster first: give it the time
      await sleep(SETTLE_MS * 2);
      for (const t of eras) {
        setCapEra(t);
        await sleep(SETTLE_MS);
        const shot = capture.current;
        if (!shot) {
          log(`${t.id} ${variant}: capture frame not mounted`);
          continue;
        }
        const png = await shot();
        setCapPreview(png);
        const res = await fetch("/api/lab/eye-poster", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ era: t.id, variant, png }),
        });
        const out = (await res.json().catch(() => ({}))) as { bytes?: number; error?: string };
        log(
          res.ok
            ? `${t.id} ${variant}: ${Math.round((out.bytes ?? 0) / 1024)} KB`
            : `${t.id} ${variant}: ${out.error ?? res.status}`,
        );
      }
    }
    setCapVariant(null);
    setPosterRev((r) => r + 1);
  }, [themes]);

  const capSize = capVariant ? POSTER_VARIANTS[capVariant] : null;

  return (
    <div
      className="fixed inset-0 z-[10050] overflow-hidden text-white"
      style={{ background: ROOM_HEX, fontFamily: MONO }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        loadRef(e.dataTransfer.files?.[0]);
      }}
    >
      {/* ---- the stage ------------------------------------------------------ */}
      <div className="absolute inset-0">
        {kind === "tsl" ? (
          <EyeStage
            key={stageKey}
            era={era}
            reduce={reduce}
            forceWebGL={forceWebGL}
            dprCap={dprCap === "1" ? 1 : 2}
            profile
            media={seeing}
            control={control}
            onReady={() => applyControls()}
            onFail={(err) => setFailure(err instanceof Error ? err.message : String(err))}
          />
        ) : (
          <EraEyeCanvas key={stageKey} era={era} reduce={reduce} />
        )}
      </div>

      {/* ---- P1 parity: the live shader's screen over the TSL one ----------- */}
      {kind === "tsl" && parity !== "off" && (
        <GlslScreenRef
          era={era}
          reduce={reduce}
          source={() => control.current?.screenState ?? null}
          style={{ mixBlendMode: parity === "difference" ? "difference" : "normal" }}
        />
      )}

      {ref && refShow && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ref}
          alt=""
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
          style={{
            opacity: refOpacity,
            height: `${100 * refScale}vh`,
            transform: `translate(calc(-50% + ${refX}vw), calc(-50% + ${refY}vh))`,
          }}
        />
      )}

      {failure && (
        <div className="absolute left-4 top-4 max-w-md rounded bg-red-900/80 px-3 py-2 text-[11px]">
          Stage failed: {failure}
        </div>
      )}

      {/* ---- the capture frame: off screen, at the poster's exact CSS size -- */}
      {capSize && (
        <div
          aria-hidden="true"
          style={{ position: "fixed", left: -20000, top: 0, width: capSize.cssW, height: capSize.cssH }}
        >
          <EyeStage key={`cap-${capVariant}`} era={capEra} reduce interactive={false} media capture={capture} />
        </div>
      )}

      {/* ---- the panel ------------------------------------------------------ */}
      {panel && (
        <aside
          className="absolute bottom-0 right-0 top-0 w-[320px] overflow-y-auto border-l border-white/10"
          style={{ background: "rgba(8,9,11,0.88)", backdropFilter: "blur(8px)" }}
        >
          <header className="flex items-baseline justify-between px-4 py-3">
            <h1 className="text-[12px] tracking-[0.12em]">EYE LAB · P11 A</h1>
            <span className="text-[10px] text-white/40">H panel · B blink · ←→ era</span>
          </header>

          <Section title="Stage">
            <div className="flex flex-col gap-2">
              <Seg
                value={kind}
                options={[
                  { id: "tsl", label: "TSL stage" },
                  { id: "glsl", label: "GLSL (live)" },
                ]}
                onChange={(v) => {
                  setFailure(null);
                  setKind(v);
                }}
              />
              <Check
                label="Force WebGL2 backend"
                checked={forceWebGL}
                disabled={kind !== "tsl"}
                onChange={(v) => {
                  setFailure(null);
                  setForceWebGL(v);
                }}
              />
              <Check label="Reduced motion" checked={reduce} onChange={setReduce} />
              <div className="flex items-center gap-2 text-[11px] text-white/75">
                <span className="w-20 shrink-0">pixel ratio</span>
                <Seg
                  value={dprCap}
                  options={[
                    { id: "auto", label: "tier" },
                    { id: "1", label: "1×" },
                  ]}
                  onChange={setDprCap}
                  disabled={kind !== "tsl"}
                />
              </div>
            </div>
          </Section>

          <Section title="Era">
            <div className="grid grid-cols-5 gap-1">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEra(t)}
                  className="rounded py-1 text-[11px] tabular-nums transition-colors duration-150"
                  style={{
                    background: era.id === t.id ? "#f4f3f0" : "rgba(255,255,255,0.06)",
                    color: era.id === t.id ? "#0b0b0b" : "rgba(255,255,255,0.8)",
                  }}
                >
                  {t.id}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-white/50">{era.name}</p>
          </Section>

          <Section title="Frame">
            {hud ? (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px] tabular-nums">
                <dt className="text-white/45">backend</dt>
                <dd>{hud.backend}</dd>
                <dt className="text-white/45">tier</dt>
                <dd>{hud.tier}</dd>
                <dt className="text-white/45">fps</dt>
                <dd>{hud.fps.toFixed(0)}</dd>
                <dt className="text-white/45">cpu</dt>
                <dd>{hud.cpuMs.toFixed(2)} ms</dd>
                <dt className="text-white/45">gpu</dt>
                <dd>{hud.gpuMs === null ? "n/a" : `${hud.gpuMs.toFixed(2)} ms`}</dd>
                <dt className="text-white/45">draws</dt>
                <dd>
                  {hud.drawCalls} · {hud.triangles.toLocaleString()} tris
                </dd>
                <dt className="text-white/45">memory</dt>
                <dd>
                  {hud.geometries} geo · {hud.textures} tex
                </dd>
                <dt className="text-white/45">dpr</dt>
                <dd>{hud.dpr.toFixed(2)}</dd>
              </dl>
            ) : (
              <p className="text-[11px] text-white/45">
                {kind === "tsl" ? "Compiling…" : "The live eye reports no numbers."}
              </p>
            )}
          </Section>

          <Section title="Face">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1" role="group" aria-label="Monk skin tone">
                {(Object.keys(MONK_TONES) as unknown as MonkTone[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={kind !== "tsl"}
                    onClick={() => setMonk(Number(k) as MonkTone)}
                    title={`Monk ${k}`}
                    className="h-6 w-6 rounded-full disabled:opacity-35"
                    style={{
                      background: MONK_TONES[Number(k) as MonkTone],
                      outline: monk === Number(k) ? "2px solid #f4f3f0" : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
              <Seg
                value={lidType ?? getEyeIdentity(era.id).lids.type}
                options={(Object.keys(LID_SHAPES) as LidType[]).map((t) => ({ id: t, label: t }))}
                onChange={(v) => setLidType(v)}
                disabled={kind !== "tsl"}
              />
              <button
                type="button"
                disabled={kind !== "tsl" || (monk === null && lidType === null)}
                onClick={() => {
                  setMonk(null);
                  setLidType(null);
                }}
                className="self-start rounded bg-white/10 px-2 py-1 text-[11px] disabled:opacity-35"
              >
                Era&apos;s own
              </button>
            </div>
          </Section>

          <Section title="Lashes">
            <div className="flex flex-col gap-2">
              {LASH_KNOBS.map((k) => (
                <Slider
                  key={k}
                  label={`lashes ${k}`}
                  value={lashOverride[k] ?? getEyeIdentity(era.id).lashes[k]}
                  min={0}
                  max={k === "length" ? 1.4 : 1}
                  step={0.01}
                  disabled={kind !== "tsl"}
                  onChange={(v) => setLashOverride((o) => ({ ...o, [k]: v }))}
                />
              ))}
              <button
                type="button"
                disabled={kind !== "tsl" || Object.keys(lashOverride).length === 0}
                onClick={() => setLashOverride({})}
                className="self-start rounded bg-white/10 px-2 py-1 text-[11px] disabled:opacity-35"
              >
                Era&apos;s own
              </button>
            </div>
          </Section>

          <Section title="Sclera">
            <div className="flex flex-col gap-2">
              <Slider
                label="vessels"
                value={vessels ?? 0.4}
                min={0}
                max={1.5}
                step={0.01}
                disabled={kind !== "tsl"}
                onChange={setVessels}
              />
              <Slider label="age" value={age ?? 0.3} min={0} max={1} step={0.01} disabled={kind !== "tsl"} onChange={setAge} />
              <button
                type="button"
                disabled={kind !== "tsl" || (vessels === null && age === null)}
                onClick={() => {
                  setVessels(null);
                  setAge(null);
                }}
                className="self-start rounded bg-white/10 px-2 py-1 text-[11px] disabled:opacity-35"
              >
                Era&apos;s own
              </button>
            </div>
          </Section>

          <Section title="Layers">
            <div className="flex flex-col gap-1.5">
              {EYE_LAYERS.map((l) => (
                <Check
                  key={l}
                  label={l}
                  checked={layers[l]}
                  disabled={kind !== "tsl"}
                  onChange={(v) => setLayers((s) => ({ ...s, [l]: v }))}
                />
              ))}
              <p className="text-[10px] leading-relaxed text-white/35">
                Each phase adds its layer here: cornea, iris, pupil, lids, lashes, tear film.
              </p>
            </div>
          </Section>

          <Section title="Debug view">
            <Seg
              value={debugView}
              options={DEBUG_VIEWS.map((v) => ({ id: v, label: v }))}
              onChange={setDebugView}
              disabled={kind !== "tsl"}
            />
          </Section>

          <Section title="Screen parity">
            <div className="flex flex-col gap-2">
              <Seg
                value={parity}
                options={[
                  { id: "off", label: "off" },
                  { id: "glsl", label: "GLSL on top" },
                  { id: "difference", label: "difference" },
                ]}
                onChange={(v) => {
                  setParity(v);
                  if (v !== "off") setDebugView("screen");
                }}
                disabled={kind !== "tsl"}
              />
              <p className="text-[10px] leading-relaxed text-white/35">
                The live shader&apos;s screen pass, from the same state, over the TSL one&apos;s
                &ldquo;screen&rdquo; view. Turn on reduced motion to freeze both clocks;
                in difference, anything not black is a mismatch.
              </p>
            </div>
          </Section>

          <Section title="Pupil">
            <div className="flex flex-col gap-2">
              <PupilTrace samples={pupilTrace} />
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={kind !== "tsl"}
                  onClick={() => setLightOn((v) => !v)}
                  className="rounded px-2 py-1 text-[11px] disabled:opacity-35"
                  style={{
                    background: lightOn ? "#f4f3f0" : "rgba(255,255,255,0.1)",
                    color: lightOn ? "#0b0b0b" : "rgba(255,255,255,0.85)",
                  }}
                >
                  {lightOn ? "Light off" : "Light step"}
                </button>
                <button
                  type="button"
                  disabled={kind !== "tsl"}
                  onClick={() => control.current?.flash()}
                  className="rounded bg-white/10 px-2 py-1 text-[11px] disabled:opacity-35"
                >
                  Flash
                </button>
              </div>
              <p className="text-[10px] leading-relaxed text-white/35">
                Light step adds 2.4 log units over the screen: watch the 0.22 s latency, the fast
                constriction, the escape, and the slow reopening. Rest the pointer on the iris for
                interest; bring it in for the near reflex.
              </p>
            </div>
          </Section>

          <Section title="Camera & lens">
            <div className="flex flex-col gap-2">
              <Check label="Era lens" checked={lensOn} disabled={kind !== "tsl"} onChange={setLensOn} />
              <Check label="Real pages" checked={pagesOn} disabled={kind !== "tsl"} onChange={setPagesOn} />
              <Check label="Ways of seeing" checked={seeing} disabled={kind !== "tsl"} onChange={setSeeing} />
              {seeing && (
                <select
                  aria-label="medium"
                  className="rounded bg-white/10 px-2 py-1 font-mono text-[11px] text-white"
                  value={String(medium)}
                  onChange={(e) => setMedium(e.target.value === "era" ? "era" : Number(e.target.value))}
                >
                  <option value="era">medium: the era&apos;s own</option>
                  <option value="0">medium: none</option>
                  {ERA_MEDIA.map((id, i) => (
                    <option key={id} value={i + 1}>
                      medium: {id}
                    </option>
                  ))}
                </select>
              )}
              <Seg
                value={focusHold}
                options={(["auto", "iris", "lashes", "skin"] as const).map((f) => ({ id: f, label: `focus ${f}` }))}
                onChange={(v) => setFocusHold(v)}
                disabled={kind !== "tsl"}
              />
              <p className="font-mono text-[10px] text-white/55">focus {focusZ.toFixed(1)} mm from the globe&apos;s centre</p>
              <p className="text-[10px] leading-relaxed text-white/35">
                Lens off is a clean photograph: focus, bloom, the grade. Auto focus racks to what the
                pointer is over. Debug views &ldquo;focus&rdquo; (red in front, blue behind) and
                &ldquo;emissive&rdquo; (what blooms).
              </p>
            </div>
          </Section>

          <Section title="Gaze">
            <div className="flex flex-col gap-2">
              <GazeTrace samples={gazeTrace} />
              <p className="font-mono text-[10px] text-white/55">
                <span className="text-[#7fb6ff]">yaw</span> · <span className="text-[#ffb36b]">pitch</span> · 6 s ·{" "}
                {gazeInfo ? `${gazeInfo.pattern}, a blink every ~${gazeInfo.blinkEvery.toFixed(1)} s` : ""}
              </p>
              <Seg
                value={gazePattern ?? "era"}
                options={[
                  { id: "era", label: "era" },
                  ...GAZE_PATTERNS.map((g) => ({ id: g, label: g })),
                ]}
                onChange={(v) => setGazePattern(v === "era" ? null : (v as GazePattern))}
                disabled={kind !== "tsl"}
              />
              <p className="text-[10px] leading-relaxed text-white/35">
                Saccades on the main sequence, fixations from a gamma distribution, drift and
                microsaccades between. Move the pointer slowly for pursuit, fast for catch-up saccades.
              </p>
            </div>
          </Section>

          <Section title="Tears">
            <div className="flex flex-col gap-2">
              <Check label="Stare (no blinks)" checked={stare} disabled={kind !== "tsl"} onChange={setStare} />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={kind !== "tsl"}
                  onClick={() => control.current?.blink()}
                  className="rounded bg-white/10 px-2 py-1 text-[11px] disabled:opacity-35"
                >
                  Blink now
                </button>
                <button
                  type="button"
                  disabled={kind !== "tsl"}
                  onClick={() => control.current?.reflexTears()}
                  className="rounded bg-white/10 px-2 py-1 text-[11px] disabled:opacity-35"
                >
                  Reflex tears
                </button>
              </div>
              <p className="font-mono text-[10px] text-white/55">
                since blink {tearInfo.sinceBlink.toFixed(1)} s · tearing {tearInfo.tearing.toFixed(2)}
              </p>
              <p className="text-[10px] leading-relaxed text-white/35">
                Stare: after ~8 s the film breaks up and the reflection turns patchy (debug view
                &ldquo;tear&rdquo; shows it). A blink lays it down fresh and drags it up for a second.
              </p>
            </div>
          </Section>

          <Section title="Drive">
            <div className="flex flex-col gap-2">
              <Check label="Hold gaze" checked={holdGaze} disabled={kind !== "tsl"} onChange={setHoldGaze} />
              <Slider label="gaze x" value={gaze.x} min={-1} max={1} step={0.01} disabled={!holdGaze || kind !== "tsl"} onChange={(x) => setGaze((g) => ({ ...g, x }))} />
              <Slider label="gaze y" value={gaze.y} min={-1} max={1} step={0.01} disabled={!holdGaze || kind !== "tsl"} onChange={(y) => setGaze((g) => ({ ...g, y }))} />
              <Check label="Hold pupil" checked={holdPupil} disabled={kind !== "tsl"} onChange={setHoldPupil} />
              <Slider label="pupil" value={pupil} min={0.1} max={0.95} step={0.01} disabled={!holdPupil || kind !== "tsl"} onChange={setPupil} />
              <Check label="Hold lids" checked={holdLid} disabled={kind !== "tsl"} onChange={setHoldLid} />
              <Slider label="blink" value={lid} min={0} max={1} step={0.01} disabled={!holdLid || kind !== "tsl"} onChange={setLid} />
              <Check label="Hold squint" checked={holdSquint} disabled={kind !== "tsl"} onChange={setHoldSquint} />
              <Slider label="squint" value={squint} min={0} max={1} step={0.01} disabled={!holdSquint || kind !== "tsl"} onChange={setSquint} />
              <button
                type="button"
                disabled={kind !== "tsl"}
                onClick={() => control.current?.blink()}
                className="self-start rounded bg-white/10 px-2 py-1 text-[11px] disabled:opacity-35"
              >
                Blink
              </button>
            </div>
          </Section>

          <Section title="Reference">
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer rounded border border-dashed border-white/20 px-3 py-2 text-center text-[11px] text-white/60">
                Drop a photo anywhere, or choose one
                <input type="file" accept="image/*" className="hidden" onChange={(e) => loadRef(e.target.files?.[0])} />
              </label>
              {ref && (
                <>
                  <Check label="Show" checked={refShow} onChange={setRefShow} />
                  <Slider label="opacity" value={refOpacity} min={0} max={1} step={0.01} onChange={setRefOpacity} />
                  <Slider label="scale" value={refScale} min={0.3} max={3} step={0.01} onChange={setRefScale} />
                  <Slider label="x" value={refX} min={-50} max={50} step={0.5} onChange={setRefX} />
                  <Slider label="y" value={refY} min={-50} max={50} step={0.5} onChange={setRefY} />
                </>
              )}
              <p className="text-[10px] leading-relaxed text-white/35">
                Stays in this browser. Nothing is uploaded or saved.
              </p>
            </div>
          </Section>

          <Section title="Posters">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] leading-relaxed text-white/45">
                Stills of the live eye through each era&apos;s own screen, wide and tall, written to
                public/eye/posters. The loader paints them before any shader compiles. Takes about a minute.
              </p>
              <button
                type="button"
                disabled={capturing}
                onClick={() => captureAll()}
                className="self-start rounded bg-[#f4f3f0] px-2 py-1 text-[11px] text-[#0b0b0b] disabled:opacity-40"
              >
                {capturing ? `Capturing ${capEra.id} ${capVariant}…` : "Capture all eras"}
              </button>
              {capPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={capPreview} alt="Last capture" className="w-full rounded border border-white/10" />
              )}
              {capLog.length > 0 && (
                <ol className="max-h-40 overflow-y-auto text-[10px] leading-relaxed text-white/60">
                  {capLog.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ol>
              )}
              {posterRev > 0 && (
                <div className="grid grid-cols-5 gap-1">
                  {themes.map((t) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={t.id}
                      src={`${posterSrc(t.id, "wide")}?v=${posterRev}`}
                      alt={t.id}
                      className="aspect-video w-full rounded object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          </Section>
        </aside>
      )}
    </div>
  );
}
