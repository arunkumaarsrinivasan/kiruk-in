"use client";

/**
 * The era picker as the eye's own network.
 *
 * The live eye fills the middle of the window, large. Around it, loose on the
 * table like a patch in a node editor, sit the things that make it: the era's
 * own components (its button, its field, its chrome, drawn as that era drew
 * them), its palette and type, its page, and the stages of the eye that page
 * feeds (light, cornea, lens, the era's picture technology, its sign, its
 * blink). Wires run between them and into the part of the eye each one makes.
 *
 * Every node is small and mostly a picture. Each can be dragged anywhere; its
 * wires follow. Choosing an era (the era node, scroll, arrow keys) rewires the
 * lot at once: the eye blinks (medium-director.ts) and every node redraws in
 * the new era. Clicking the eye enters the era.
 *
 * The person node takes no wire from the era: the same face in every era.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ThemeConfig } from "@/data/portfolio-data";
import type { EyeStageControl, FrameBox } from "@/components/three/eye/EyeStage";
import { eyeShot } from "@/components/three/eye/framing";
import { getEraLook, getEraMedium } from "@/components/three/eye/look";
import { posterPlacement, posterVariantFor } from "@/components/three/eye/posters";
import { useModuleA11y } from "@/components/modules/useModuleA11y";

const EyeStage = dynamic(() => import("@/components/three/eye/EyeStage"), { ssr: false });

/** The shot, mm round the globe's centre: the whole eye, corner to corner, large in the middle. */
const EYE_BOX: FrameBox = { halfW: 13, top: 8.8, bottom: -9.2 };
/** A phone, or a narrow window: the eyeball across the width. */
const EYE_BOX_TALL: FrameBox = { halfW: 8.2, top: 9, bottom: -11 };
/** The mirror's strength here (look's default is 0.7): the page is the content. */
const PICKER_REFLECT = 1.9;
/** How far the gaze may follow the pointer, so the cornea never leaves the shot. */
const GAZE_REACH = 0.22;
/** Sharper than the loader: the page in the cornea is what is being read. */
const PICKER_MIP_BIAS = -1.1;
/** One era per wheel gesture. */
const WHEEL_GAP_MS = 650;

/** Each era's picture technology, as era-medium.ts draws it. */
const MEDIUM: Record<string, string> = {
  "1970": "phosphor raster",
  "1981": "1-bit etching",
  "1991": "four greys",
  "1995": "216 web-safe",
  "1997": "16-bit bands",
  "2000": "laptop panel",
  "2003": "candy colour",
  "2009": "phone photo",
  "2013": "the system",
  "2026": "measured",
};

export interface EraEyePickerProps {
  eras: ThemeConfig[];
  /** The era the site is in now (marked in the list). */
  currentEraId: string;
  /** Use this era (travel to it). */
  onUse: (eraId: string) => void;
  onClose: () => void;
  reduce: boolean;
}

type NodeId =
  | "era"
  | "palette"
  | "type"
  | "button"
  | "field"
  | "chrome"
  | "page"
  | "light"
  | "cornea"
  | "person"
  | "sign"
  | "lens"
  | "medium"
  | "cut";

interface NodeDef {
  id: NodeId;
  kind: string;
  w: number;
  h: number;
  /** Where it starts, as shares of the window (its top-left). */
  fx: number;
  fy: number;
  /** The part of the eye it makes: an offset from the eye's centre, in cornea radii. */
  eye?: [number, number];
}

/** The patch as it is first laid out: two loose clusters either side of the eye. */
const NODES: NodeDef[] = [
  { id: "era", kind: "select", w: 198, h: 204, fx: 0.018, fy: 0.085 },
  { id: "palette", kind: "tokens", w: 150, h: 62, fx: 0.172, fy: 0.07 },
  { id: "type", kind: "tokens", w: 164, h: 84, fx: 0.04, fy: 0.345 },
  { id: "button", kind: "component", w: 150, h: 78, fx: 0.176, fy: 0.215 },
  { id: "field", kind: "component", w: 176, h: 78, fx: 0.158, fy: 0.42 },
  { id: "chrome", kind: "component", w: 214, h: 82, fx: 0.022, fy: 0.54 },
  { id: "page", kind: "screen", w: 172, h: 132, fx: 0.168, fy: 0.655, eye: [-0.42, 0.3] },
  { id: "light", kind: "key light", w: 156, h: 104, fx: 0.735, fy: 0.075, eye: [-0.2, -1.5] },
  { id: "cornea", kind: "mirror", w: 136, h: 134, fx: 0.875, fy: 0.15, eye: [0.42, -0.36] },
  { id: "person", kind: "constant", w: 150, h: 96, fx: 0.752, fy: 0.335, eye: [1.02, 0.1] },
  { id: "sign", kind: "cursor", w: 116, h: 80, fx: 0.895, fy: 0.42, eye: [0, 0] },
  { id: "lens", kind: "camera", w: 172, h: 98, fx: 0.722, fy: 0.55 },
  { id: "medium", kind: "shader", w: 186, h: 130, fx: 0.846, fy: 0.6, eye: [1.55, 0.75] },
  { id: "cut", kind: "blink", w: 188, h: 64, fx: 0.742, fy: 0.815, eye: [0.5, 0.98] },
];

/** Wires between nodes, source → target. */
const WIRES: [NodeId, NodeId][] = [
  ["era", "palette"],
  ["era", "type"],
  ["palette", "button"],
  ["type", "button"],
  ["type", "field"],
  ["button", "page"],
  ["field", "page"],
  ["chrome", "page"],
  ["light", "cornea"],
  ["lens", "medium"],
];

interface Pt {
  x: number;
  y: number;
}

export function EraEyePicker({ eras, currentEraId, onUse, onClose, reduce }: EraEyePickerProps) {
  const start = Math.max(0, eras.findIndex((e) => e.id === currentEraId));
  const [index, setIndex] = useState(start);
  const [ready, setReady] = useState(false);
  const [onIris, setOnIris] = useState(false);
  const [hot, setHot] = useState<NodeId | null>(null);
  // client-only (the host renders nothing on the server), so the first frame already has the real window
  const [size, setSize] = useState(() =>
    typeof window === "undefined" ? { w: 1440, h: 900 } : { w: window.innerWidth, h: window.innerHeight },
  );
  const [moved, setMoved] = useState<Partial<Record<NodeId, Pt>>>({});
  const [order, setOrder] = useState<NodeId[]>(() => NODES.map((n) => n.id));
  const control = useRef<EyeStageControl | null>(null);
  const lastWheel = useRef(0);
  const grab = useRef<{ id: NodeId; dx: number; dy: number } | null>(null);
  /** A touch or pen drag just moved a node: its touchend is not a swipe. */
  const dragged = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const era = eras[index] ?? eras[0];

  // scroll lock, focus in and trapped, Escape closes, focus back to the trigger on close
  useModuleA11y(true, rootRef, onClose);

  useEffect(() => {
    const read = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const go = useCallback(
    (next: number) => setIndex(Math.min(eras.length - 1, Math.max(0, next))),
    [eras.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // a focused control answers its own Enter (close, a year); Escape is useModuleA11y's
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "Enter" && t?.closest?.("button, a[href]")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(index + 1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(index - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(eras.length - 1);
      else if (e.key === "Enter") onUse(era.id);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, eras.length, era.id, onUse]);

  const onWheel = (e: React.WheelEvent) => {
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 12) return;
    const now = performance.now();
    if (now - lastWheel.current < WHEEL_GAP_MS) return;
    lastWheel.current = now;
    go(index + (d > 0 ? 1 : -1));
  };

  const touch = useRef<Pt | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current;
    touch.current = null;
    // pointerup (which ends a drag) fires before touchend, so a drag is remembered here
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (!s || grab.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    const d = Math.abs(dx) > Math.abs(dy) ? -dx : -dy;
    if (Math.abs(d) > 40) go(index + (d > 0 ? 1 : -1));
  };

  // ---- the shot and the table ----
  const { w: W, h: H } = size;
  const graph = W >= 1100 && H >= 620;
  const box = W / Math.max(H, 1) < 0.95 ? EYE_BOX_TALL : EYE_BOX;

  // the table resets only when it appears or goes (not on every small resize)
  useEffect(() => {
    setMoved({});
  }, [graph]);
  const shot = useMemo(() => eyeShot(W, H, box), [W, H, box]);

  // The live eye builds its pipelines before it fades in, which can take a
  // while on a slow GPU: the era's poster holds the middle until then, placed
  // so its iris sits where the live iris will be, and goes once the eye is up.
  const stillVariant = posterVariantFor(W, H);
  const still = useMemo(() => posterPlacement(W, H, stillVariant, box), [W, H, stillVariant, box]);
  const [stillGone, setStillGone] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setStillGone(true), reduce ? 0 : 700);
    return () => window.clearTimeout(t);
  }, [ready, reduce]);
  const corneaPx = shot.irisPx * 1.08;

  const at = (n: NodeDef): Pt => moved[n.id] ?? { x: Math.round(n.fx * W), y: Math.round(n.fy * H) };
  const irisHit = (x: number, y: number) => Math.hypot(x - shot.cx, y - shot.cy) <= corneaPx;

  const onPointerMove = (e: React.PointerEvent) => {
    const g = grab.current;
    if (g && e.buttons === 0) {
      // the button came up somewhere we never heard about: the drag is over
      grab.current = null;
    } else if (g) {
      const def = NODES.find((n) => n.id === g.id);
      if (def) {
        const x = Math.min(W - 40, Math.max(40 - def.w, e.clientX - g.dx));
        const y = Math.min(H - 30, Math.max(0, e.clientY - g.dy));
        setMoved((m) => ({ ...m, [g.id]: { x, y } }));
      }
      return;
    }
    setOnIris(irisHit(e.clientX, e.clientY));
    const c = control.current;
    if (c && !reduce) {
      c.holdGaze({
        x: ((e.clientX / W) * 2 - 1) * GAZE_REACH,
        y: (-(e.clientY / H) * 2 + 1) * GAZE_REACH,
      });
    }
  };
  const drop = () => {
    grab.current = null;
  };
  const pick = (n: NodeDef, e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const p = at(n);
    grab.current = { id: n.id, dx: e.clientX - p.x, dy: e.clientY - p.y };
    dragged.current = e.pointerType !== "mouse";
    // keep the drag's events even when the pointer leaves the node or the window
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* the pointer is already gone */
    }
    setOrder((o) => [...o.filter((id) => id !== n.id), n.id]);
    e.preventDefault();
  };

  const onReady = useCallback(() => {
    const c = control.current;
    if (c) {
      c.uniforms.reflect.value = PICKER_REFLECT;
      c.holdGaze({ x: 0, y: 0 });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const c = control.current;
    if (c) c.uniforms.reflect.value = PICKER_REFLECT;
  }, [index]);

  const look = useMemo(() => getEraLook(era.id), [era.id]);
  const medium = useMemo(() => getEraMedium(era.id), [era.id]);
  const [year, ...rest] = era.name.split(": ");
  const title = rest.join(": ");
  const accent = liftOnBlack(era.colors.primary);
  const c = era.colors;
  const lens = look.lens;
  const light = look.light;
  const fontName = era.fonts.primary.split(",")[0].replace(/["']/g, "");
  const pageSrc = `/eye/screens/${era.id}.webp`;
  const posterSrc = `/eye/posters/${era.id}-wide.avif`;
  const glow = c.background.toLowerCase() === "#000000" ? c.primary : c.background;

  const linked = (id: NodeId) =>
    hot === null || hot === id || WIRES.some(([a, b]) => (a === hot && b === id) || (b === hot && a === id));

  // the eye's element is kept across drags and hovers: only its own props re-render the stage
  const stage = useMemo(
    () => (
      <EyeStage
        era={era}
        reduce={reduce}
        // the picker reads the hand itself (the iris to enter, the wheel to travel):
        // the eye keeps still for it, and blinks only at the cut between eras
        interactive={false}
        showcase
        media
        calm={!graph}
        frameBox={box}
        mipBias={PICKER_MIP_BIAS}
        control={control}
        onReady={onReady}
      />
    ),
    [era, reduce, graph, box, onReady],
  );

  // the nodes are drawn only where the table is shown
  const body: Record<NodeId, React.ReactNode> | null = !graph ? null : {
    era: (
      <div className="flex h-full flex-col">
        <div className="flex items-baseline justify-between">
          <span className="text-[38px] leading-none text-white" style={{ fontFamily: era.fonts.primary, textShadow: `0 0 18px ${accent}66` }}>
            {year}
          </span>
          <span className="text-[9px] text-white/40">
            {index + 1}/{eras.length}
          </span>
        </div>
        <div className="mt-1 truncate text-[10px] text-white/70">{title}</div>
        <div className="mt-auto grid grid-cols-5 gap-1">
          {eras.map((e, k) => {
            const on = k === index;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => go(k)}
                aria-label={e.name}
                aria-current={on ? "true" : undefined}
                className="relative rounded-[2px] py-1.5 text-[9px] tabular-nums transition-colors hover:bg-white/10"
                style={on ? { background: accent, color: "#000" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}
              >
                ’{e.id.slice(2)}
                {e.id === currentEraId && <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full" style={{ background: on ? "#000" : "#fff" }} />}
              </button>
            );
          })}
        </div>
      </div>
    ),
    palette: (
      <div className="flex h-full overflow-hidden rounded-[2px]">
        {[c.background, c.secondary, c.primary, c.accent, c.text].map((v, k) => (
          <span key={k} className="flex-1" style={{ background: v }} title={v} />
        ))}
      </div>
    ),
    type: (
      <div className="flex h-full flex-col justify-between">
        <span className="truncate text-[30px] leading-none text-white" style={{ fontFamily: era.fonts.primary }}>
          Aa Kiruk
        </span>
        <span className="truncate text-[9px] text-white/45">{fontName}</span>
      </div>
    ),
    button: <Ground era={era}>{eraButton(era)}</Ground>,
    field: <Ground era={era}>{eraField(era, reduce)}</Ground>,
    chrome: <Ground era={era} flush>{eraChrome(era)}</Ground>,
    page: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={pageSrc}
        alt=""
        draggable={false}
        className="h-full w-full rounded-[2px] object-cover"
        style={reduce ? { objectPosition: "top" } : { animation: "eraPagePan 26s ease-in-out infinite alternate" }}
      />
    ),
    light: (
      <div className="relative h-full w-full overflow-hidden rounded-[2px]" style={{ background: "#040404" }}>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "40%",
            aspectRatio: `${light.real.mm[0]} / ${light.real.mm[1]}`,
            background: glow,
            boxShadow: `0 0 30px 10px ${glow}77`,
            borderRadius: light.device.startsWith("crt") ? 6 : 2,
          }}
        />
        {light.fill && <div className="absolute right-2 top-2 h-1.5 w-8 rounded-full" style={{ background: light.fill.color, boxShadow: `0 0 10px ${light.fill.color}` }} />}
        <span className="absolute bottom-1 left-1.5 text-[9px] text-white/50">
          {light.device} · {light.real.dist} mm
        </span>
      </div>
    ),
    cornea: (
      <div className="grid h-full w-full place-items-center">
        <div className="relative aspect-square h-full overflow-hidden rounded-full border border-white/25 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pageSrc}
            alt=""
            draggable={false}
            className="absolute left-1/2 top-1/2 w-[80%] object-cover object-top"
            style={{ aspectRatio: "16 / 10", transform: "translate(-50%,-50%) scaleX(-1)", borderRadius: "18% / 26%" }}
          />
          <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 16px 6px rgba(0,0,0,0.85)" }} />
        </div>
      </div>
    ),
    person: (
      <div className="relative h-full w-full">
        <svg viewBox="0 0 160 70" className="h-full w-full">
          <path d="M10 37 Q 80 -6 150 37 Q 80 72 10 37 Z" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <circle cx="80" cy="35" r="24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
          <circle cx="80" cy="35" r={24 * look.pupil} fill="rgba(255,255,255,0.9)" style={{ transition: "r 500ms cubic-bezier(0.23,1,0.32,1)" }} />
        </svg>
        <span className="absolute bottom-0 left-0 text-[9px] text-white/45">pupil {Math.round(look.pupil * 100)}% · same face</span>
      </div>
    ),
    sign: (
      <div className="grid h-full place-items-center">
        <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black">
          <span
            className="block"
            style={
              look.cursor === "block"
                ? { width: 8, height: 14, background: accent, animation: reduce ? undefined : "eraCaret 1.1s steps(1) infinite" }
                : look.cursor === "caret"
                  ? { width: 1.5, height: 16, background: accent, animation: reduce ? undefined : "eraCaret 1.1s steps(1) infinite" }
                  : look.cursor === "arrow"
                    ? { width: 11, height: 14, background: accent, clipPath: "polygon(0 0,100% 62%,48% 64%,32% 100%)" }
                    : { width: 10, height: 10, borderRadius: 10, background: accent }
            }
          />
        </span>
      </div>
    ),
    lens: (
      <div className="flex h-full flex-col justify-between">
        <Meter k="grain" v={lens.grain} accent={accent} />
        <Meter k="glow" v={lens.halation} accent={accent} />
        <Meter k="colour" v={lens.sat / 1.4} accent={accent} />
        <Meter k="warm" v={(lens.wb + 1) / 2} accent={accent} mid />
        <span className="text-[9px] text-white/45">artefact · {lens.artefact}</span>
      </div>
    ),
    medium: (
      <div className="relative h-full w-full overflow-hidden rounded-[2px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={posterSrc} alt="" draggable={false} className="h-full w-full object-cover" />
        <span className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 text-[9px] text-white/85">{MEDIUM[era.id] ?? "medium"}</span>
      </div>
    ),
    cut: (
      <div className="flex h-full flex-col justify-center gap-1">
        <div className="flex h-3.5 overflow-hidden rounded-[2px] text-[8px] uppercase tracking-wider">
          <span className="grid place-items-center bg-white/12 text-white/60" style={{ flex: medium.departMs }}>
            shut
          </span>
          <span className="w-3" style={{ background: medium.flood }} />
          <span className="grid place-items-center text-black" style={{ flex: medium.arriveMs, background: accent }}>
            open
          </span>
        </div>
        <span className="text-[9px] text-white/45">
          {medium.departMs} + {medium.arriveMs} ms
        </span>
      </div>
    ),
  };

  const rects = Object.fromEntries(NODES.map((n) => [n.id, { ...at(n), w: n.w, h: n.h }])) as Record<NodeId, Pt & { w: number; h: number }>;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] overflow-hidden text-white select-none"
      style={{ background: "#050506", touchAction: "none" }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Choose an era"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onPointerMove={onPointerMove}
      onPointerUp={drop}
      onPointerCancel={drop}
    >
      {/* the era's still, until the live eye has faded in over it */}
      {!stillGone && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/eye/posters/${era.id}-${stillVariant}.avif`}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute max-w-none select-none"
          style={{ left: still.left, top: still.top, width: still.width, height: still.height }}
        />
      )}

      {/* the eye, in the middle, large */}
      <div
        className="absolute inset-0"
        style={{ opacity: ready ? 1 : 0, transition: reduce ? "none" : "opacity 600ms cubic-bezier(0.23,1,0.32,1)", cursor: onIris ? "pointer" : "default" }}
        onPointerLeave={() => setOnIris(false)}
        onClick={(e) => {
          if (irisHit(e.clientX, e.clientY)) onUse(era.id);
        }}
        role="slider"
        aria-label="Era"
        aria-valuemin={0}
        aria-valuemax={eras.length - 1}
        aria-valuenow={index}
        aria-valuetext={`${era.name}. Arrow keys change era, Enter enters it, Escape closes.`}
        tabIndex={0}
      >
        {stage}
      </div>

      {/* the table: the eye lit in the middle, the rest falling to a dark dotted floor */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse ${corneaPx * 2.5}px ${corneaPx * 1.9}px at ${shot.cx}px ${shot.cy}px, rgba(5,5,6,0) 45%, rgba(5,5,6,0.62) 78%, rgba(5,5,6,0.94) 100%)`,
        }}
      />
      {graph && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1.2px)",
            backgroundSize: "22px 22px",
            maskImage: `radial-gradient(ellipse ${corneaPx * 2.6}px ${corneaPx * 2}px at ${shot.cx}px ${shot.cy}px, transparent 70%, #000 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse ${corneaPx * 2.6}px ${corneaPx * 2}px at ${shot.cx}px ${shot.cy}px, transparent 70%, #000 100%)`,
          }}
        />
      )}

      {graph && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {WIRES.map(([a, b]) => (
            <Wire key={`${a}-${b}`} d={link(rects[a], rects[b])} accent={accent} on={hot === null || hot === a || hot === b} reduce={reduce} />
          ))}
          {NODES.filter((n) => n.eye).map((n) => {
            const A = rects[n.id];
            const tx = shot.cx + n.eye![0] * corneaPx;
            const ty = shot.cy + n.eye![1] * corneaPx;
            return (
              <g key={`${n.id}-eye`}>
                <Wire d={toPoint(A, tx, ty)} accent={accent} on={hot === null || hot === n.id} reduce={reduce} />
                <circle cx={tx} cy={ty} r={hot === n.id ? 7 : 3.5} fill="none" stroke={accent} strokeWidth={1.2} style={{ transition: "r 200ms" }} />
                <circle cx={tx} cy={ty} r={1.3} fill={accent} />
              </g>
            );
          })}
        </svg>
      )}

      {graph &&
        order.map((id) => {
          const n = NODES.find((d) => d.id === id)!;
          const p = rects[id];
          return (
            <section
              key={id}
              // the era node holds the year buttons; the rest are pictures of the network, dragged by pointer only
              role={id === "era" ? "group" : undefined}
              aria-label={id === "era" ? "Eras" : undefined}
              aria-hidden={id === "era" ? undefined : true}
              className="absolute flex cursor-grab flex-col rounded-[4px] border font-mono text-[10px] text-white/75 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)] transition-[opacity,border-color] duration-200 active:cursor-grabbing"
              style={{
                left: p.x,
                top: p.y,
                width: n.w,
                height: n.h,
                background: "rgba(14,15,17,0.94)",
                borderColor: hot === id ? accent : "rgba(255,255,255,0.16)",
                opacity: linked(id) ? 1 : 0.4,
                touchAction: "none",
              }}
              onPointerDown={(e) => pick(n, e)}
              onPointerEnter={() => setHot(id)}
              onPointerLeave={() => setHot((h) => (h === id ? null : h))}
            >
              <header className="flex h-[17px] shrink-0 items-center justify-between px-1.5 text-[9px]">
                <span className="text-white/85">{id}</span>
                <span className="uppercase tracking-[0.14em] text-white/30">{n.kind}</span>
              </header>
              <div className="min-h-0 flex-1 px-1.5 pb-1.5">{body?.[id]}</div>
              <span className="absolute -right-[3px] top-[5px] h-[6px] w-[6px] rounded-full" style={{ background: accent }} />
            </section>
          );
        })}

      {/* title strip (the site's mark sits at the far left) */}
      <div className="pointer-events-none absolute left-16 top-5 font-mono text-[11px] text-white/45">
        <span className="text-white/85">eye.network</span>
        <span className="mx-2 text-white/25">/</span>
        how {year} sees the same eye
        {graph && <span className="ml-3 text-white/25">drag anything</span>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="group absolute right-4 top-3 flex items-center gap-2 px-2 py-1.5 font-mono text-[11px] text-white/55 transition-colors hover:text-white sm:right-6"
      >
        <kbd className="rounded-[3px] border border-white/25 px-1.5 py-0.5 text-[10px] tracking-wider transition-colors group-hover:border-white/60">ESC</kbd>
        <span>close</span>
      </button>

      {/* narrow windows: the caption and the years as a row */}
      {!graph && (
        <>
          <div className="pointer-events-none absolute inset-x-4 bottom-[86px] text-center" aria-live="polite">
            <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/45">{era.era}</div>
            <div className="mt-1.5 text-5xl leading-none tracking-tight" style={{ fontFamily: era.fonts.primary, textShadow: `0 0 24px ${accent}55` }}>
              {year}
            </div>
            <div className="mt-1.5 font-mono text-xs text-white/75">{title}</div>
          </div>
          <nav aria-label="Eras" className="absolute inset-x-0 bottom-10 flex justify-center gap-1 overflow-x-auto px-3 font-mono text-[11px]">
            {eras.map((e, k) => (
              <button
                key={e.id}
                type="button"
                onClick={() => go(k)}
                className="shrink-0 px-1.5 py-1"
                style={{ color: k === index ? "#fff" : "rgba(255,255,255,0.4)", borderBottom: `1px solid ${k === index ? accent : "transparent"}` }}
              >
                ’{e.id.slice(2)}
              </button>
            ))}
          </nav>
        </>
      )}

      {/* the loader's two lines */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between p-3 font-mono text-[11px] sm:px-5 sm:py-4">
        <span>
          <span className="text-white/95">{graph ? "Scroll" : "Swipe"}</span>
          <span className="text-white/40"> · </span>
          <span className="text-white/70">blink to the next era</span>
        </span>
        <span>
          <span className="text-white/95">{graph ? "Click the eye" : "Tap the eye"}</span>
          <span className="text-white/40"> · </span>
          <span className="text-white/70">enter {era.id}</span>
        </span>
      </div>

      <style>{`
        @keyframes eraPagePan { from { object-position: 50% 0% } to { object-position: 50% 100% } }
        @keyframes eraCaret { 0%,55% { opacity: 1 } 56%,100% { opacity: 0.15 } }
        @keyframes eraWire { to { stroke-dashoffset: -28 } }
      `}</style>
    </div>
  );
}

type Box = Pt & { w: number; h: number };

/** Node to node: out of the side that faces the other, in at its facing side. */
function link(A: Box, B: Box) {
  const ax = A.x + A.w / 2;
  const bx = B.x + B.w / 2;
  if (Math.abs(ax - bx) < (A.w + B.w) * 0.3) {
    // one over the other: foot to head (or head to foot)
    const down = B.y > A.y;
    const y1 = down ? A.y + A.h : A.y;
    const y2 = down ? B.y : B.y + B.h;
    const k = Math.max(14, Math.abs(y2 - y1) * 0.5) * (down ? 1 : -1);
    return `M ${ax} ${y1} C ${ax} ${y1 + k}, ${bx} ${y2 - k}, ${bx} ${y2}`;
  }
  const right = bx > ax;
  const x1 = right ? A.x + A.w : A.x;
  const x2 = right ? B.x : B.x + B.w;
  const y1 = A.y + A.h / 2;
  const y2 = B.y + B.h / 2;
  const k = Math.max(18, Math.abs(x2 - x1) * 0.5) * (right ? 1 : -1);
  return `M ${x1} ${y1} C ${x1 + k} ${y1}, ${x2 - k} ${y2}, ${x2} ${y2}`;
}

/** Node to a point on the eye: out of the side that faces it. */
function toPoint(A: Box, tx: number, ty: number) {
  const ax = A.x + A.w / 2;
  const right = tx > ax;
  const x1 = right ? A.x + A.w : A.x;
  const y1 = A.y + A.h / 2;
  const k = Math.max(24, Math.abs(tx - x1) * 0.55) * (right ? 1 : -1);
  return `M ${x1} ${y1} C ${x1 + k} ${y1}, ${tx - k * 0.35} ${ty}, ${tx} ${ty}`;
}

function Wire({ d, accent, on, reduce }: { d: string; accent: string; on: boolean; reduce: boolean }) {
  return (
    <g opacity={on ? 1 : 0.15} style={{ transition: "opacity 200ms" }}>
      <path d={d} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.1} />
      <path
        d={d}
        fill="none"
        stroke={accent}
        strokeOpacity={0.8}
        strokeWidth={1.2}
        strokeDasharray="3 11"
        strokeLinecap="round"
        style={reduce ? undefined : { animation: "eraWire 1.6s linear infinite" }}
      />
    </g>
  );
}

function Meter({ k, v, accent, mid }: { k: string; v: number; accent: string; mid?: boolean }) {
  const t = Math.min(1, Math.max(0, v));
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-9 shrink-0 text-[9px] text-white/40">{k}</span>
      <span className="relative h-[3px] flex-1 rounded-full bg-white/10">
        {mid ? (
          <span className="absolute top-0 h-full rounded-full" style={{ left: `${Math.min(50, t * 100)}%`, width: `${Math.max(2, Math.abs(t - 0.5) * 100)}%`, background: accent }} />
        ) : (
          <span className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${t * 100}%`, background: accent, transition: "width 500ms cubic-bezier(0.23,1,0.32,1)" }} />
        )}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------------
 * The era's own components: each drawn the way that era drew it, on that
 * era's ground, in its font. Small, still, and real enough to recognise.
 * --------------------------------------------------------------------- */

function Ground({ era, flush, children }: { era: ThemeConfig; flush?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`grid h-full w-full place-items-center overflow-hidden rounded-[2px] ${flush ? "" : "px-2"}`}
      style={{ background: era.colors.background, color: era.colors.text, fontFamily: era.fonts.primary, fontSize: 12 }}
    >
      {children}
    </div>
  );
}

function eraButton(era: ThemeConfig): React.ReactNode {
  const c = era.colors;
  switch (era.id) {
    case "1970":
      return <span style={{ background: c.primary, color: "#000", padding: "1px 8px", fontSize: 16, letterSpacing: 2 }}>[ RUN ]</span>;
    case "1981":
      return <span style={{ background: "#fff", color: "#000", border: "1px solid #000", boxShadow: "2px 2px 0 #000", padding: "3px 16px", fontSize: 12 }}>OK</span>;
    case "1991":
      return <span style={{ color: "#0000ee", textDecoration: "underline", fontSize: 15 }}>Hypertext link</span>;
    case "1995":
      return <span style={{ background: "#c0c0c0", color: "#000", border: "2px outset #fff", padding: "2px 9px", fontSize: 12 }}>Sign my guestbook!</span>;
    case "1997":
      return <span style={{ background: "linear-gradient(#0c3a66,#001529)", color: c.primary, border: `1px solid ${c.primary}`, padding: "4px 12px", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>PRODUCTS ▸</span>;
    case "2000":
      return <span style={{ background: "#efefef", color: "#000", border: "2px outset #f8f8f8", padding: "1px 10px", fontSize: 12 }}>Search</span>;
    case "2003":
      return (
        <span style={{ position: "relative", background: "linear-gradient(#ffa64d,#ff6600 55%,#e05500)", color: "#fff", borderRadius: 999, padding: "5px 18px", fontSize: 12, fontWeight: 700, textShadow: "0 -1px 0 rgba(0,0,0,0.35)", boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
          Sign up
        </span>
      );
    case "2009":
      return <span style={{ background: "linear-gradient(#7fb0f7,#3f7fe6 50%,#2463d6 51%,#2a6be0)", color: "#fff", border: "1px solid #1c4fa8", borderRadius: 7, padding: "5px 16px", fontSize: 12, fontWeight: 700, textShadow: "0 -1px 0 rgba(0,0,0,0.4)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)" }}>Done</span>;
    case "2013":
      return <span style={{ color: c.primary, border: `1px solid ${c.primary}`, borderRadius: 8, padding: "5px 18px", fontSize: 13, fontWeight: 300 }}>Continue</span>;
    default:
      return <span style={{ background: "#0b0b0b", color: "#fafafa", borderRadius: 999, padding: "6px 18px", fontSize: 12 }}>Ask</span>;
  }
}

function eraField(era: ThemeConfig, reduce: boolean): React.ReactNode {
  const c = era.colors;
  const blink = reduce ? undefined : "eraCaret 1.1s steps(1) infinite";
  switch (era.id) {
    case "1970":
      return (
        <span style={{ fontSize: 16, width: "100%" }}>
          kiruk@1970:~$ <span style={{ display: "inline-block", width: 8, height: 14, background: c.primary, verticalAlign: -2, animation: blink }} />
        </span>
      );
    case "1981":
      return (
        <span style={{ display: "flex", width: "100%", height: 14, border: "1px solid #000", background: "repeating-conic-gradient(#000 0 25%, #fff 0 50%) 0 0 / 2px 2px" }}>
          <span style={{ width: 14, background: "#fff", borderRight: "1px solid #000", textAlign: "center", fontSize: 9, lineHeight: "12px", color: "#000" }}>◂</span>
          <span style={{ marginLeft: 18, width: 34, background: "#fff", border: "1px solid #000" }} />
          <span style={{ marginLeft: "auto", width: 14, background: "#fff", borderLeft: "1px solid #000", textAlign: "center", fontSize: 9, lineHeight: "12px", color: "#000" }}>▸</span>
        </span>
      );
    case "1991":
      return <span style={{ width: "100%", border: "2px inset #ddd", background: "#fff", color: "#000", padding: "1px 4px", fontSize: 12 }}>search index…</span>;
    case "1995":
      return (
        <span style={{ display: "flex", gap: 1, background: "#000", padding: 3, border: "2px inset #888" }}>
          {"004217".split("").map((d, k) => (
            <span key={k} style={{ background: "#111", color: "#39ff14", fontFamily: "monospace", fontSize: 14, padding: "0 3px" }}>
              {d}
            </span>
          ))}
        </span>
      );
    case "1997":
      return (
        <span style={{ display: "flex", width: "100%", background: "#fff", color: "#000", border: "2px inset #ccc", fontSize: 11 }}>
          <span style={{ flex: 1, padding: "1px 4px" }}>Select a region</span>
          <span style={{ background: "#c0c0c0", border: "2px outset #fff", padding: "0 4px", fontSize: 8, lineHeight: "14px" }}>▼</span>
        </span>
      );
    case "2000":
      return (
        <span style={{ width: "100%", border: "1px solid #7f9db9", background: "#fff", color: "#000", padding: "2px 4px", fontSize: 12 }}>
          kiruk<span style={{ display: "inline-block", width: 1, height: 12, background: "#000", verticalAlign: -2, marginLeft: 1, animation: blink }} />
        </span>
      );
    case "2003":
      return <span style={{ width: "100%", borderRadius: 999, border: "1px solid #c9c9c9", background: "#fff", color: "#9aa5ad", padding: "3px 10px", fontSize: 11, boxShadow: `inset 0 2px 3px rgba(0,0,0,0.15), 0 0 0 2px ${c.primary}33` }}>your email…</span>;
    case "2009":
      return (
        <span style={{ position: "relative", width: 76, height: 26, borderRadius: 5, border: "1px solid #173f8f", background: "linear-gradient(#2f6fe0,#5a96f5)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.35)", color: "#fff", fontSize: 12, fontWeight: 700, lineHeight: "24px", paddingLeft: 10, textShadow: "0 -1px 0 rgba(0,0,0,0.4)" }}>
          ON
          <span style={{ position: "absolute", right: -1, top: -1, width: 34, height: 26, borderRadius: 5, border: "1px solid #888", background: "linear-gradient(#fdfdfd,#cfcfcf)" }} />
        </span>
      );
    case "2013":
      return (
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ position: "relative", width: 44, height: 26, borderRadius: 26, background: "#34c759" }}>
            <span style={{ position: "absolute", right: 2, top: 2, width: 22, height: 22, borderRadius: 22, background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.25)" }} />
          </span>
          <span style={{ position: "relative", width: 62, height: 2, background: "#c7c7cc" }}>
            <span style={{ position: "absolute", left: 0, top: 0, height: 2, width: "55%", background: c.primary }} />
            <span style={{ position: "absolute", left: "55%", top: -9, width: 20, height: 20, borderRadius: 20, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.35)" }} />
          </span>
        </span>
      );
    default:
      return (
        <span style={{ display: "flex", alignItems: "center", width: "100%", border: "1px solid #dcdcdc", borderRadius: 16, background: "#fff", padding: "4px 5px 4px 12px", fontSize: 11, color: "#8a8a8a" }}>
          <span style={{ flex: 1 }}>Ask anything</span>
          <span style={{ width: 18, height: 18, borderRadius: 18, background: "#0b0b0b" }} />
        </span>
      );
  }
}

function eraChrome(era: ThemeConfig): React.ReactNode {
  const c = era.colors;
  const full: React.CSSProperties = { width: "100%", alignSelf: "start" };
  switch (era.id) {
    case "1970":
      return (
        <span style={{ ...full, alignSelf: "center", padding: "0 8px", fontSize: 13 }}>
          <span style={{ display: "flex", justifyContent: "space-between" }}>
            <span>TTY1 · KIRUK@1970</span>
            <span>22:44</span>
          </span>
          <span style={{ display: "block", overflow: "hidden", whiteSpace: "nowrap", opacity: 0.6 }}>════════════════════════════════</span>
        </span>
      );
    case "1981":
      return (
        <span style={{ ...full, alignSelf: "center", margin: "0 8px", width: "calc(100% - 16px)", border: "1px solid #000", background: "#fff" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, height: 16, padding: "0 3px", borderBottom: "1px solid #000", background: "repeating-linear-gradient(#000 0 1px, #fff 1px 3px)" }}>
            <span style={{ width: 9, height: 9, background: "#fff", border: "1px solid #000" }} />
            <span style={{ margin: "0 auto", background: "#fff", color: "#000", padding: "0 6px", fontSize: 10 }}>Portfolio</span>
          </span>
          <span style={{ display: "block", height: 22 }} />
        </span>
      );
    case "1991":
      return (
        <span style={{ ...full, alignSelf: "center", padding: "0 8px", color: "#000" }}>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>World Wide Web</span>
          <span style={{ display: "block", borderTop: "1px solid #888", borderBottom: "1px solid #eee", margin: "3px 0" }} />
          <span style={{ fontSize: 11 }}>
            The <span style={{ color: "#0000ee", textDecoration: "underline" }}>project</span> aims to…
          </span>
        </span>
      );
    case "1995":
      return (
        <span style={{ ...full, background: "#c0c0c0", color: "#000", fontFamily: "Arial, sans-serif" }}>
          <span style={{ display: "flex", justifyContent: "space-between", background: "#000080", color: "#fff", padding: "1px 4px", fontSize: 9 }}>
            <span>Netscape — Welcome!!</span>
            <span>▫ ×</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 2, padding: 3 }}>
            {["Back", "Fwd", "Home", "Reload"].map((t) => (
              <span key={t} style={{ border: "2px outset #fff", padding: "1px 4px", fontSize: 8 }}>
                {t}
              </span>
            ))}
            <span style={{ marginLeft: "auto", width: 18, height: 18, background: "#000033", color: "#fff", fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "18px" }}>N</span>
          </span>
        </span>
      );
    case "1997":
      return (
        <span style={{ ...full, display: "flex", height: "100%", alignSelf: "stretch" }}>
          <span style={{ width: 62, background: "#000d1a", borderRight: `1px solid ${c.primary}`, padding: 4, fontSize: 8, lineHeight: 1.5, color: c.primary }}>
            ▸ Home
            <br />▸ Products
            <br />▸ Contact
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", background: `linear-gradient(90deg, ${c.accent}, ${c.primary})`, color: "#001529", fontSize: 10, fontWeight: 700, padding: "3px 6px" }}>KIRUK CORP.</span>
            <span style={{ display: "block", padding: "4px 6px", fontSize: 8, color: c.text }}>Best viewed at 800×600</span>
          </span>
        </span>
      );
    case "2000":
      return (
        <span style={{ ...full, alignSelf: "center", textAlign: "center", color: "#000" }}>
          <span style={{ fontSize: 22, fontFamily: "Georgia, serif", letterSpacing: -1 }}>
            {["#3366cc", "#cc3333", "#ffcc00", "#3366cc", "#339933"].map((col, k) => (
              <span key={k} style={{ color: col }}>
                {"Kiruk"[k]}
              </span>
            ))}
          </span>
          <span style={{ display: "block", fontSize: 9, marginTop: 2 }}>
            <b>Web</b> <span style={{ color: "#0000cc", textDecoration: "underline" }}>Images</span> <span style={{ color: "#0000cc", textDecoration: "underline" }}>Groups</span>{" "}
            <span style={{ color: "#0000cc", textDecoration: "underline" }}>Directory</span>
          </span>
        </span>
      );
    case "2003":
      return (
        <span style={{ ...full, alignSelf: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "linear-gradient(#7db8ee,#3f86cf 50%,#2f74bd 51%,#3b82cc)", color: "#fff", fontWeight: 700, fontSize: 12, textShadow: "0 -1px 0 rgba(0,0,0,0.3)" }}>
            kiruk
            <span style={{ background: "#ff3366", borderRadius: 3, fontSize: 7, padding: "1px 3px", transform: "rotate(-8deg)" }}>BETA</span>
            <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.9)", color: "#2f74bd", borderRadius: "6px 6px 0 0", padding: "2px 8px", fontSize: 9, textShadow: "none" }}>Home</span>
            <span style={{ fontSize: 9, fontWeight: 400 }}>Tags</span>
          </span>
        </span>
      );
    case "2009":
      return (
        <span style={{ ...full, alignSelf: "center" }}>
          <span style={{ display: "flex", alignItems: "center", padding: "7px 6px", background: "linear-gradient(#b0bccd,#889bb3 50%,#8195af 51%,#6d84a2)", borderBottom: "1px solid #2d3642", color: "#fff", fontWeight: 700, fontSize: 13, textShadow: "0 -1px 0 rgba(0,0,0,0.5)" }}>
            <span style={{ background: "linear-gradient(#8ea4c1,#4f6c93)", border: "1px solid #2f4466", borderRadius: 5, padding: "2px 7px", fontSize: 9 }}>◂ Back</span>
            <span style={{ margin: "0 auto", paddingRight: 30 }}>Kiruk</span>
          </span>
        </span>
      );
    case "2013":
      return (
        <span style={{ ...full, alignSelf: "center" }}>
          <span style={{ display: "flex", alignItems: "center", padding: "8px", background: "rgba(248,248,248,0.95)", borderBottom: "0.5px solid #b2b2b2", color: "#000", fontSize: 13, fontWeight: 500 }}>
            <span style={{ color: c.primary, fontWeight: 300 }}>‹ Back</span>
            <span style={{ margin: "0 auto", paddingRight: 34 }}>Kiruk</span>
          </span>
        </span>
      );
    default:
      return (
        <span style={{ ...full, alignSelf: "center", padding: "0 10px" }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e6e6e6", paddingBottom: 6, fontSize: 12, color: "#0b0b0b" }}>
            kiruk
            <span style={{ width: 10, height: 10, borderRadius: 10, background: "radial-gradient(#0b0b0b 40%, transparent 42%) 0 0 / 3px 3px, #fafafa", border: "1px solid #0b0b0b" }} />
          </span>
        </span>
      );
  }
}

function liftOnBlack(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (l < 0.42) {
    const t = Math.min(0.75, (0.42 - l) * 1.6 + 0.25);
    r = Math.round(r + (255 - r) * t);
    g = Math.round(g + (255 - g) * t);
    b = Math.round(b + (255 - b) * t);
  }
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

export default EraEyePicker;
