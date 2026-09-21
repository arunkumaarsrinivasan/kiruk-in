"use client";

/**
 * TimeTravelOverlay — the cut between two eras, rebuilt as a wireframe
 * build-up of where you are landing.
 *
 * The site's premise is that every era is a whole, self-consistent design
 * world. So the transition is not a third world you pass through: it is the
 * destination era's own surface, assembling. A directional plane covers the
 * old era wearing the new era's tokens; then the target page draws itself as
 * a blueprint — grid, ruler lines, component skeleton — and dissolves
 * region-by-region into the real page already mounted underneath.
 *
 * Direction is still the one piece of information the cover carries: later
 * eras arrive from below, earlier eras from above, so you feel which way you
 * moved along the timeline.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EraPageKey } from "@/components/era-shell/registry";
import {
  EraBlueprint,
  type BlueprintPhase,
} from "@/components/era-travel/EraBlueprint";
import { getBlueprintSpec } from "@/components/era-travel/specs";

/** Cover is the longer half — it has to hide the old era. The build-up then
 *  runs grid → rulers → skeleton → reveal; the reveal is quicker, you've
 *  already arrived. */
const COVER_MS = 240;
const GRID_MS = 360;
const RULERS_MS = 420;
const SKELETON_MS = 1000;
/** Hard cap on how long the skeleton phase waits for the destination page's
 *  chunks to mount before revealing anyway (fallback to spec geometry). */
const SKELETON_MAX_MS = 1500;
const REVEAL_MS = 260;
const EASE = [0.32, 0.72, 0, 1] as const;

type Phase = "cover" | BlueprintPhase;

export function TimeTravelOverlay({
  active,
  toId,
  dir,
  pageKey = "home",
  onMid,
  onDone,
  reduce,
}: Readonly<{
  active: boolean;
  toId: string;
  /** +1 travelling to a later era, -1 to an earlier one. */
  dir: 1 | -1;
  /** Which page the target wireframe should describe. */
  pageKey?: EraPageKey;
  onMid: () => void;
  onDone: () => void;
  reduce: boolean;
}>) {
  const [phase, setPhase] = useState<Phase>("cover");
  const [ready, setReady] = useState(false);
  const timers = useRef<number[]>([]);
  const midFiredRef = useRef(false);
  const readyRef = useRef(false);
  const skeletonStartRef = useRef(0);

  // Held in refs so a new callback identity can never restart a transition
  // that is already half-played.
  const midRef = useRef(onMid);
  const doneRef = useRef(onDone);
  midRef.current = onMid;
  doneRef.current = onDone;
  readyRef.current = ready;

  useEffect(() => {
    if (!active) return;
    document.documentElement.setAttribute("data-time-travel", "");
    return () => document.documentElement.removeAttribute("data-time-travel");
  }, [active]);

  // The wireframe of where we are landing — authored spec + era grammar.
  const { spec, grammar } = useMemo(
    () => getBlueprintSpec(toId, pageKey),
    [toId, pageKey],
  );

  useEffect(() => {
    const clearAll = () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
    if (!active) {
      setPhase("cover");
      setReady(false);
      midFiredRef.current = false;
      return clearAll;
    }

    // Fresh travel: clear any stale readiness from a previous run.
    setReady(false);

    if (reduce) {
      document.documentElement.setAttribute("data-era-swapping", "");
      midRef.current();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      timers.current.push(
        window.setTimeout(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              document.documentElement.removeAttribute("data-era-swapping");
            });
          });
          doneRef.current();
        }, 0),
      );
      return clearAll;
    }

    const at = (ms: number, fn: () => void) =>
      timers.current.push(window.setTimeout(fn, ms));

    // Swap the era while the plane hides it. Era tokens live on hundreds of
    // properties; suppress transitions across the swap so nothing is still
    // easing to its new colour once the plane has passed.
    at(COVER_MS, () => {
      document.documentElement.setAttribute("data-era-swapping", "");
      midRef.current();
      midFiredRef.current = true;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      setPhase("grid");
    });
    at(COVER_MS + GRID_MS, () => setPhase("rulers"));
    at(COVER_MS + GRID_MS + RULERS_MS, () => setPhase("skeleton"));
    // reveal + done are driven by the skeleton→reveal effect below, which
    // waits for the destination page to mount (ready) before dissolving.

    return clearAll;
  }, [active, reduce]);

  // Re-pick retargeting: if the destination changes after the mid-swap,
  // the plane is already covering — swap eras again underneath and restart
  // the build-up from the grid, aimed at the new target. The original
  // timeline's timers are cancelled so its reveal/done don't fire early.
  useEffect(() => {
    if (!active || reduce || !midFiredRef.current) return;
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    setReady(false);
    document.documentElement.setAttribute("data-era-swapping", "");
    midRef.current();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setPhase("grid");
    const at = (ms: number, fn: () => void) =>
      timers.current.push(window.setTimeout(fn, ms));
    at(GRID_MS, () => setPhase("rulers"));
    at(GRID_MS + RULERS_MS, () => setPhase("skeleton"));
    // reveal + done driven by the skeleton→reveal effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toId, active, reduce]);

  // skeleton → reveal: hold the skeleton until the destination page has
  // mounted its [data-blueprint] regions (EraBlueprint calls onReady), so the
  // reveal dissolves over the real page instead of a loading fallback. A
  // minimum dwell (SKELETON_MS) keeps the build-up readable; a hard max
  // (SKELETON_MAX_MS) guarantees we never hang waiting for a chunk.
  useEffect(() => {
    if (phase !== "skeleton") return;
    skeletonStartRef.current = Date.now();
    let revealed = false;
    const go = () => {
      if (revealed) return;
      revealed = true;
      setPhase("reveal");
    };
    const minT = window.setTimeout(() => {
      if (readyRef.current) go();
    }, SKELETON_MS);
    const maxT = window.setTimeout(go, SKELETON_MAX_MS);
    return () => {
      clearTimeout(minT);
      clearTimeout(maxT);
    };
  }, [phase]);

  // If ready arrives during the skeleton dwell, reveal once the minimum
  // dwell is satisfied.
  useEffect(() => {
    if (phase !== "skeleton" || !ready) return;
    const elapsed = Date.now() - skeletonStartRef.current;
    const remaining = Math.max(0, SKELETON_MS - elapsed);
    const t = window.setTimeout(() => setPhase("reveal"), remaining);
    return () => clearTimeout(t);
  }, [phase, ready]);

  // reveal → done: dissolve, then hand control back to the caller.
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = window.setTimeout(() => doneRef.current(), REVEAL_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (active) return;
    document.documentElement.removeAttribute("data-era-swapping");
  }, [active]);

  if (reduce) return null;

  const from = dir > 0 ? "100%" : "-100%";
  const covered = phase !== "cover";
  const revealing = phase === "reveal";
  // Phase → 0..1 progress for the bottom progress bar and scan-line.
  const phaseProgress =
    phase === "cover"
      ? 0
      : phase === "grid"
        ? 0.25
        : phase === "rulers"
          ? 0.5
          : phase === "skeleton"
            ? 0.75
            : 1;
  // Scan-line sweeps during grid + rulers (the "surveying" beat before the
  // skeleton resolves), then is gone by skeleton.
  const scanning = phase === "grid" || phase === "rulers";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden
          data-era-surface={toId}
          className="fixed inset-0 z-[300] overflow-hidden"
          style={{ willChange: "transform" }}
          initial={{ y: from }}
          animate={{ y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: COVER_MS / 1000, ease: EASE }}
        >
          {/* The era's own surface — opaque through the build-up. In the
              reveal it fades in step with the skeleton boxes (whose dissolve
              is staggered per region), so the real page emerges as the boxes
              disappear instead of the bg dropping out and leaving boxes
              floating over the page. */}
          {(() => {
            const regionCount = Math.max(1, spec.regions.length);
            // Matches EraBlueprint's reveal: 0.18s box fade + 0.035s stagger.
            const dissolveMs = 180 + (regionCount - 1) * 35;
            return (
              <motion.div
                className="absolute inset-0"
                style={{ background: "var(--bg-main)" }}
                initial={{ opacity: 1 }}
                animate={{ opacity: revealing ? 0 : 1 }}
                transition={{
                  delay: revealing ? 0.04 : 0,
                  duration: revealing ? dissolveMs / 1000 : 0.1,
                  ease: revealing ? "easeIn" : "linear",
                }}
              />
            );
          })()}

          {/* Grid → rulers → skeleton, wearing the target era's tokens.
              Mounted only after the mid-swap so the grid tokens read the
              destination era. */}
          {covered && (
            <EraBlueprint
              spec={spec}
              grammar={grammar}
              phase={phase}
              reduce={reduce}
              onReady={() => setReady(true)}
            />
          )}

          {/* Scan-line — a single accent rule that sweeps top→bottom during
              the grid + rulers "surveying" beat, reinforcing the blueprint
              metaphor (the page is being measured before it is drawn). It is
              gone by the skeleton phase so it never fights the content. */}
          <motion.div
            aria-hidden
            className="absolute left-0 right-0 h-px"
            style={{
              background: "var(--accent-color)",
              boxShadow: "0 0 10px var(--accent-color)",
              opacity: scanning ? 0.5 : 0,
              top: 0,
            }}
            initial={{ y: "0%" }}
            animate={{ y: scanning ? "100%" : "0%", opacity: scanning ? 0.5 : 0 }}
            transition={{
              duration: scanning ? (GRID_MS + RULERS_MS) / 1000 : 0.2,
              ease: scanning ? "linear" : "easeIn",
            }}
          />

          {/* Phase progress — a hairline at the foot of the overlay that fills
              as the build-up advances (cover → grid → rulers → skeleton →
              reveal), so the viewer senses the cut moving forward. */}
          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "color-mix(in srgb, var(--border-color) 50%, transparent)" }}
          >
            <motion.div
              className="h-full"
              style={{ background: "var(--accent-color)" }}
              initial={{ width: "0%" }}
              animate={{ width: `${phaseProgress * 100}%` }}
              transition={{ duration: 0.3, ease: EASE }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TimeTravelOverlay;
