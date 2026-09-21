"use client";

/**
 * KirukLogo — the Kiruk eye, one identity across a multiverse of eras. The
 * shell owns the stadium pill, the cursor-gaze plumbing, the wordmark, and the
 * live era read from `body[data-era]`. The actual eye is drawn by a bespoke
 * per-era renderer (see ./eyes), each rendering the same eye structure in its
 * era's own display medium.
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { EYE_RATIO } from "@/components/brand/eyes/eye-core";
import { getEraEye } from "@/components/brand/eyes";
import { useChromeQuiet } from "@/hooks/useChromeQuiet";

/* Displayed mark size (px) — keeps the brand's ~1.5:1 ratio. */
const MARK_H = 42;
const MARK_W = Math.round(MARK_H * EYE_RATIO); // ~63
const BAR_H = MARK_H + 14; // 56
/** Compact pill — mark + breathing room. */
const COMPACT_PILL_W = MARK_W + 46;

/** Subscribe to the live era id from `body[data-era]`. */
function useEraId(): string {
  const [era, setEra] = useState<string>("default");
  useEffect(() => {
    const read = () => setEra(document.body.getAttribute("data-era") || "default");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.body, { attributes: true, attributeFilter: ["data-era"] });
    return () => mo.disconnect();
  }, []);
  return era;
}

export function KirukEye({
  gaze = true,
  expanded = false,
  bare = false,
  trailing,
  className,
}: {
  gaze?: boolean;
  /** Full-width nav bar at page top. */
  expanded?: boolean;
  /** Render just the eye mark with no pill chrome (for use inside a bar). */
  bare?: boolean;
  trailing?: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const quiet = useChromeQuiet();
  const eraId = useEraId();
  const EraEye = getEraEye(eraId);
  const [idle, setIdle] = useState(false);
  const live = Boolean(gaze && !reduce && !quiet && !idle);

  const raf = useRef(0);
  const idleRef = useRef(false);
  const gxRaw = useMotionValue(0);
  const gyRaw = useMotionValue(0);
  const gx = useSpring(gxRaw, { stiffness: 180, damping: 18 });
  const gy = useSpring(gyRaw, { stiffness: 180, damping: 18 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!gaze || reduce || quiet) {
      if (idleRef.current) {
        idleRef.current = false;
        setIdle(false);
      }
      gxRaw.set(0);
      gyRaw.set(0);
      return;
    }
    let idleTimer = 0;
    const rest = () => {
      idleRef.current = true;
      setIdle(true);
      gxRaw.set(0);
      gyRaw.set(0);
    };
    const onMove = (e: MouseEvent) => {
      if (idleRef.current) {
        idleRef.current = false;
        setIdle(false);
      }
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(rest, 2500);
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        gxRaw.set(Math.max(-1, Math.min(1, (e.clientX / Math.max(1, innerWidth) - 0.5) * 2)));
        gyRaw.set(Math.max(-1, Math.min(1, (e.clientY / Math.max(1, innerHeight) - 0.5) * 2)));
      });
    };
    idleTimer = window.setTimeout(rest, 2500);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.clearTimeout(idleTimer);
      cancelAnimationFrame(raf.current);
    };
  }, [gaze, reduce, quiet, gxRaw, gyRaw]);

  const spring = reduce
    ? { duration: 0.15 }
    : ({ type: "spring", stiffness: 260, damping: 28 } as const);

  if (bare) {
    return (
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className={`relative inline-flex shrink-0 items-center justify-center ${className ?? ""}`}
        style={{ width: MARK_W, height: MARK_H }}
        data-gaze={live ? "live" : "rest"}
        aria-hidden
      >
        <EraEye gx={gx} gy={gy} reduce={!!reduce} live={live} hovered={hovered} />
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full outline-none ring-0 ${
        expanded ? "w-full" : "mx-auto"
      } ${className ?? ""}`}
      style={{
        height: BAR_H,
        borderRadius: BAR_H / 2,
        background: "color-mix(in srgb, var(--bg-card) 82%, var(--border-color) 18%)",
        border: "2px solid var(--border-color)",
        boxShadow: "none",
      }}
      animate={{ width: expanded ? "100%" : COMPACT_PILL_W }}
      transition={spring}
    >
      <div
        className={`flex h-full w-full min-w-0 items-center gap-4 ${
          expanded && trailing ? "justify-between pl-3 pr-5 sm:pl-4 sm:pr-6" : "justify-center px-4"
        }`}
      >
        <div className="relative shrink-0" style={{ width: MARK_W, height: MARK_H }} data-gaze={live ? "live" : "rest"} aria-hidden>
          <EraEye gx={gx} gy={gy} reduce={!!reduce} live={live} hovered={hovered} />
        </div>

        {trailing ? (
          <div className="relative z-10 min-w-0 shrink-0 pl-2">{trailing}</div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function KirukWordmark({
  size = 22,
  className,
  color = "var(--text-main)",
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Gudini Grotesk', ui-sans-serif, system-ui",
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0.1em",
        color,
        fontWeight: 400,
        whiteSpace: "nowrap",
      }}
    >
      KIRUK
    </span>
  );
}

export default KirukEye;
