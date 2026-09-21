"use client";

/**
 * EraBlueprint — draws the target page as a wireframe while the travel
 * overlay covers the swap.
 *
 * Layered by phase, each layer cumulative until REVEAL dissolves it:
 *   grid    — the era's own mesh fades in (character-cell, pixel, fine…)
 *   rulers  — horizontal + vertical rules sweep in from the edges along grid
 *             lines, intersecting where component regions will land
 *   skeleton— the carved regions resolve into outlined boxes with corner
 *             markers and measurement labels, in the era's motion grammar
 *   reveal  — boxes fade region-by-region over the already-mounted real page
 *
 * All motion is transform/opacity (plus a small blur for the morph grammar).
 * Geometry comes from the authored spec; Batch 3 snaps boxes to measured
 * DOM rects via data-blueprint attributes.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import { CornerMarkers } from "@/components/ui/wireframe/MeasurementLines";
import type {
  BlueprintGrammar,
  BlueprintRegion,
  BlueprintSpec,
} from "./blueprint-types";
import { RegionSkeleton } from "./RegionSkeleton";

export type BlueprintPhase = "grid" | "rulers" | "skeleton" | "reveal";

const PHASE_ORDER: Record<BlueprintPhase, number> = {
  grid: 0,
  rulers: 1,
  skeleton: 2,
  reveal: 3,
};

const EASE_OUT = [0.32, 0.72, 0, 1] as const;
const STAGGER_S = 0.04;
const REVEAL_STAGGER_S = 0.035;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setVp({ w: el.clientWidth || 1, h: el.clientHeight || 1 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return vp;
}

/** Era grid tokens, read once at mount — the overlay mounts us after the
 *  mid-swap, so documentElement already wears the TARGET era. */
function useGridTokens(gridOverride?: BlueprintSpec["grid"]) {
  const [tokens, setTokens] = useState({ size: 20, opacity: 0.1 });
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const size = parseFloat(cs.getPropertyValue("--era-grid-size")) || 0;
    const opacity = parseFloat(cs.getPropertyValue("--era-grid-opacity")) || 0;
    setTokens({
      size: gridOverride?.size ?? (size > 0 ? size : 20),
      opacity:
        gridOverride?.opacity ?? (size > 0 ? Math.max(opacity, 0.05) : 0.07),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return tokens;
}

function resolveRegions(
  spec: BlueprintSpec,
  vw: number,
  vh: number,
): (BlueprintRegion & { rect: Rect })[] {
  const mobile = vw < 768;
  const colX = (mobile ? spec.column.mobileX : spec.column.x) * vw;
  const colW = (mobile ? spec.column.mobileW : spec.column.w) * vw;
  return spec.regions
    .filter((r) => !(mobile && r.mobile?.hidden))
    .map((r) => {
      const m = mobile ? r.mobile : undefined;
      const rx = m?.x ?? r.x;
      const rw = m?.w ?? r.w;
      const ry = m?.y ?? r.y;
      const rh = m?.h ?? r.h;
      const baseX = r.space === "viewport" ? 0 : colX;
      const baseW = r.space === "viewport" ? vw : colW;
      return {
        ...r,
        rect: {
          x: baseX + rx * baseW,
          y: ry * vh,
          w: rw * baseW,
          h: rh * vh,
        },
      };
    });
}

/** Entrance motion per era grammar — the same vocabulary the era picker
 *  uses to announce a year, applied to the wireframe boxes. */
function grammarEntrance(
  grammar: BlueprintGrammar,
  reduce: boolean,
): {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
} {
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.12 },
    };
  }
  switch (grammar) {
    case "snap":
      // a 1-bit display had no transition to give: nothing, then there
      return {
        initial: { opacity: 0 },
        animate: { opacity: [0, 0, 1] },
        transition: { duration: 0.16, times: [0, 0.72, 0.73], ease: "linear" },
      };
    case "blink":
      return {
        initial: { opacity: 0 },
        animate: { opacity: [0, 1, 0, 1] },
        transition: { duration: 0.34, times: [0, 0.3, 0.55, 1] },
      };
    case "glitch":
      return {
        initial: { opacity: 0, x: -14, skewX: 14 },
        animate: { opacity: 1, x: [-14, 9, -4, 0], skewX: [14, -8, 3, 0] },
        transition: { duration: 0.4, ease: "easeOut" },
      };
    case "pulse":
      return {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { type: "spring", stiffness: 420, damping: 16 },
      };
    case "float":
      return {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE_OUT },
      };
    case "morph":
      return {
        initial: { opacity: 0, scale: 1.06, filter: "blur(6px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        transition: { duration: 0.5, ease: EASE_OUT },
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.24, ease: EASE_OUT },
      };
  }
}

/** Era-specific box material — the same grammar that drives entrance motion
 *  also drives the box's surface, so a 1970 terminal wireframe reads as a
 * character cell, a 2003 web-2 box reads as a glossy bevel, and a 2026
 * generative box reads as a soft glow. Returned style is merged onto each
 * skeleton box; content (RegionSkeleton) stays grammar-agnostic. */
function grammarBoxStyle(grammar: BlueprintGrammar): React.CSSProperties {
  const accent = "var(--accent-color)";
  const fill = "color-mix(in srgb, var(--accent-color) 5%, transparent)";
  switch (grammar) {
    case "blink": // 1970 — character cell, phosphor. Double border + block hatch.
      return {
        border: `double ${accent}`,
        background: `repeating-linear-gradient(0deg, ${accent} 0 1px, transparent 1px 6px), ${fill}`,
        backgroundBlendMode: "overlay",
      };
    case "snap": // 1981/1997 — 1-bit pixel. Hard 2px edge, dither fill, no AA.
      return {
        border: `2px solid ${accent}`,
        background: `repeating-conic-gradient(${accent} 0 25%, transparent 0 50%) 0 0 / 4px 4px, ${fill}`,
        borderRadius: 0,
      };
    case "glitch": // 1995 — torn. RGB-split edge.
      return {
        border: `1px solid ${accent}`,
        boxShadow: `2px 0 0 rgba(255,0,80,0.5), -2px 0 0 rgba(0,200,255,0.5)`,
        background: fill,
      };
    case "pulse": // 2003/2009 — glossy bevel.
      return {
        border: `1px solid ${accent}`,
        background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 14%, transparent), ${fill})`,
        boxShadow: `inset 0 1px 0 color-mix(in srgb, #ffffff 25%, transparent)`,
        borderRadius: 4,
      };
    case "morph": // 2021+ — soft glow, gradient mesh.
      return {
        border: `1px solid color-mix(in srgb, ${accent} 60%, transparent)`,
        background: `radial-gradient(120% 120% at 30% 20%, color-mix(in srgb, ${accent} 12%, transparent), ${fill})`,
        boxShadow: `0 0 18px color-mix(in srgb, ${accent} 22%, transparent)`,
        borderRadius: 6,
      };
    case "float": // 1991/1993/2000/2006 — clean hairline.
      return { border: `1px solid ${accent}`, background: fill };
    default: // none / 2013/2018 — flat hairline, no fill.
      return { border: `1px solid var(--border-color)`, background: "transparent" };
  }
}

export function EraBlueprint({
  spec,
  grammar,
  phase,
  reduce,
  gridOverride,
  onReady,
}: Readonly<{
  spec: BlueprintSpec;
  grammar: BlueprintGrammar;
  phase: BlueprintPhase;
  reduce: boolean;
  gridOverride?: BlueprintSpec["grid"];
  /** Fired once the destination page's [data-blueprint] regions have been
   *  measured (so the overlay can reveal over the mounted page), or once the
   *  max wait expires with no match (fallback to spec geometry). */
  onReady?: () => void;
}>) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const onReadyRef = React.useRef(onReady);
  onReadyRef.current = onReady;
  const { w: vw, h: vh } = useContainerSize(rootRef);
  const grid = useGridTokens(gridOverride);
  const phaseIdx = PHASE_ORDER[phase];
  const revealing = phase === "reveal";

  const regions = useMemo(
    () => resolveRegions(spec, vw, vh),
    [spec, vw, vh],
  );

  // ── Live snap ── when the skeleton phase begins, the target page is
  // already mounted underneath (the overlay covers it). Measure elements
  // tagged data-blueprint="<regionId>" in one batched read; matching boxes
  // FLIP from their spec rect to the measured rect, so the wireframe lands
  // at the design's true size and position. The destination chunk may still
  // be loading, so poll until the regions appear (or the max wait expires),
  // then notify the overlay via onReady so it can reveal over a mounted page
  // instead of a loading fallback.
  const [snap, setSnap] = useState<Record<string, Rect> | null>(null);
  const [snapReady, setSnapReady] = useState(false);
  useEffect(() => {
    if (phaseIdx < PHASE_ORDER.skeleton || snapReady) return;
    let cancelled = false;
    let timer: number | undefined;
    const SNAP_POLL_MS = 100;
    // Fallback cap: if no [data-blueprint] markers are found within this
    // window, give up and render the boxes at authored spec geometry
    // (snap stays null → to = from, no FLIP). Without this, eras whose
    // pages carry no markers would wait the full 1500ms and the skeleton
    // boxes would never appear during the ~1s skeleton phase — only the
    // rulers would show.
    const SNAP_FALLBACK_MS = 300;
    // Rects come in viewport-relative; the blueprint's coordinate space is
    // its own container (the overlay plane, or the harness stage).
    const measure = (): number => {
      const base = rootRef.current?.getBoundingClientRect();
      const bx = base?.left ?? 0;
      const by = base?.top ?? 0;
      const found: Record<string, Rect> = {};
      document.querySelectorAll("[data-blueprint]").forEach((el) => {
        const id = el.getAttribute("data-blueprint");
        if (!id) return;
        const r = el.getBoundingClientRect();
        if (r.width > 4 && r.height > 4) {
          found[id] = { x: r.left - bx, y: r.top - by, w: r.width, h: r.height };
        }
      });
      const matches = spec.regions.filter((rg) => found[rg.id]).length;
      if (matches > 0) setSnap(found);
      return matches;
    };
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      setSnapReady(true);
      onReadyRef.current?.();
    };
    if (measure() > 0) {
      finish();
      return;
    }
    // Poll until the destination regions mount, or give up at the max wait.
    const start = Date.now();
    const poll = () => {
      if (cancelled) return;
      if (measure() > 0 || Date.now() - start >= SNAP_FALLBACK_MS) {
        finish();
        return;
      }
      timer = window.setTimeout(poll, SNAP_POLL_MS);
    };
    timer = window.setTimeout(poll, SNAP_POLL_MS);
    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [phaseIdx, snapReady, spec]);

  // A new destination (re-pick mid-flight) means new geometry to measure.
  // Skip the first run — on mount there is no measurement to discard, and
  // wiping here would race the measure effect above.
  const prevSpec = React.useRef(spec);
  useEffect(() => {
    if (prevSpec.current === spec) return;
    prevSpec.current = spec;
    setSnap(null);
    setSnapReady(false);
  }, [spec]);

  // Unique ruler edges — each shared edge draws once.
  const { xEdges, yEdges } = useMemo(() => {
    const xs = new Set<number>();
    const ys = new Set<number>();
    regions.forEach(({ rect }) => {
      xs.add(Math.round(rect.x));
      xs.add(Math.round(rect.x + rect.w));
      ys.add(Math.round(rect.y));
      ys.add(Math.round(rect.y + rect.h));
    });
    return {
      xEdges: [...xs].sort((a, b) => a - b),
      yEdges: [...ys].sort((a, b) => a - b),
    };
  }, [regions]);

  const gridVisible = phaseIdx >= PHASE_ORDER.grid && !revealing;
  const rulersVisible = phaseIdx >= PHASE_ORDER.rulers && !revealing;
  const skeletonVisible = phaseIdx >= PHASE_ORDER.skeleton;

  return (
    <div ref={rootRef} aria-hidden className="absolute inset-0 overflow-hidden">
      {/* ── GRID ── the era's own mesh */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: `${grid.size}px ${grid.size}px`,
          willChange: "opacity",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: gridVisible ? grid.opacity : 0 }}
        transition={{
          duration: revealing ? 0.2 : 0.24,
          ease: revealing ? "easeIn" : EASE_OUT,
        }}
      />

      {/* ── RULERS ── rules sweep in from the edges, intersecting at regions */}
      {xEdges.map((x, i) => (
        <motion.div
          key={`x${x}`}
          className="absolute top-0 bottom-0 w-px"
          style={{
            left: x,
            background: "var(--accent-color)",
            transformOrigin: "top",
            willChange: "transform, opacity",
          }}
          initial={{ scaleY: 0, opacity: 0.4 }}
          animate={
            rulersVisible
              ? { scaleY: 1, opacity: 0.4 }
              : revealing
                ? { opacity: 0 }
                : { scaleY: 0, opacity: 0 }
          }
          transition={
            revealing
              ? { duration: 0.12, ease: "easeIn" }
              : {
                  duration: 0.22,
                  ease: EASE_OUT,
                  delay: reduce ? 0 : i * 0.025,
                }
          }
        />
      ))}
      {yEdges.map((y, i) => (
        <motion.div
          key={`y${y}`}
          className="absolute left-0 right-0 h-px"
          style={{
            top: y,
            background: "var(--accent-color)",
            transformOrigin: "left",
            willChange: "transform, opacity",
          }}
          initial={{ scaleX: 0, opacity: 0.4 }}
          animate={
            rulersVisible
              ? { scaleX: 1, opacity: 0.4 }
              : revealing
                ? { opacity: 0 }
                : { scaleX: 0, opacity: 0 }
          }
          transition={
            revealing
              ? { duration: 0.12, ease: "easeIn" }
              : {
                  duration: 0.22,
                  ease: EASE_OUT,
                  delay: reduce ? 0 : (xEdges.length + i) * 0.025,
                }
          }
        />
      ))}

      {/* ── SKELETON ── regions resolve into boxes, in the era's grammar.
          Boxes lay out at their final rect (measured when the live snap
          matched, spec otherwise); a snap FLIP-glides the box from the spec
          position to the real one, transform-only. */}
      {skeletonVisible &&
        snapReady &&
        regions.map((region, i) => {
          const entrance = grammarEntrance(grammar, reduce);
          const from = region.rect;
          const to = snap?.[region.id] ?? from;
          const moved =
            Math.abs(to.x - from.x) > 2 ||
            Math.abs(to.y - from.y) > 2 ||
            Math.abs(to.w - from.w) > 2 ||
            Math.abs(to.h - from.h) > 2;
          const initial: TargetAndTransition = moved
            ? {
                opacity: 0,
                x: from.x - to.x,
                y: from.y - to.y,
                scaleX: from.w / Math.max(to.w, 1),
                scaleY: from.h / Math.max(to.h, 1),
              }
            : entrance.initial;
          const animate: TargetAndTransition = revealing
            ? { opacity: 0 }
            : moved
              ? { opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1 }
              : { ...entrance.animate, opacity: 1 };
          const transition: Transition = revealing
            ? {
                duration: 0.18,
                ease: "easeIn",
                delay: reduce ? 0 : i * REVEAL_STAGGER_S,
              }
            : {
                ...entrance.transition,
                delay: reduce ? 0 : i * STAGGER_S,
              };
          const big = to.w > 90 && to.h > 26;
          return (
            <motion.div
              key={region.id}
              data-blueprint-box={region.id}
              className="absolute"
              style={{
                left: to.x,
                top: to.y,
                width: to.w,
                height: to.h,
                transformOrigin: "0 0",
                willChange: "transform, opacity",
                overflow: "hidden",
                ...grammarBoxStyle(grammar),
              }}
              initial={initial}
              animate={animate}
              transition={transition}
            >
              <RegionSkeleton
                kind={region.kind}
                grammar={grammar}
                reduce={reduce}
                label={region.label}
              />
              <CornerMarkers />
              {big && region.label ? (
                <span
                  className="absolute left-1 top-1 z-10 px-1 font-mono text-[9px] uppercase tracking-wider"
                  style={{
                    color: "var(--accent-color)",
                    background: "var(--bg-main)",
                  }}
                >
                  {region.label}
                </span>
              ) : null}
            </motion.div>
          );
        })}
    </div>
  );
}

export default EraBlueprint;
