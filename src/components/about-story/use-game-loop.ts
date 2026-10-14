"use client";

/**
 * useGameLoop — one rAF loop per game, asleep when nobody can see it.
 *
 * Pauses while the element is offscreen or the tab is hidden (see
 * docs/PERF_IDENTITY.md). `step(dt)` gets seconds since the last frame,
 * clamped so a wake-up never teleports the player. Write to canvas or DOM
 * refs inside `step`; do not setState every frame.
 */

import { useEffect, useRef, type RefObject } from "react";

export function useGameLoop(
  ref: RefObject<HTMLElement | null>,
  step: (dt: number, t: number) => void,
  running = true,
) {
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    if (!running) return;
    const el = ref.current;
    let inView = true;
    let raf = 0;
    let last = 0;

    const frame = (t: number) => {
      const dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60;
      last = t;
      stepRef.current(dt, t / 1000);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || !inView || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = el
      ? new IntersectionObserver(([e]) => {
          inView = e.isIntersecting;
          if (inView) start();
          else stop();
        })
      : null;
    if (el) io?.observe(el);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref, running]);
}

/** Size a canvas to its parent at device pixel ratio (capped at 2). */
export function useCanvasFit(
  wrapRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  onFit?: (w: number, h: number) => void,
) {
  const onFitRef = useRef(onFit);
  onFitRef.current = onFit;

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv) return;
    const fit = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      cv.style.width = `${r.width}px`;
      cv.style.height = `${r.height}px`;
      cv.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      onFitRef.current?.(r.width, r.height);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [wrapRef, canvasRef]);
}

/** Read a CSS custom property off <body> (era tokens live there). */
export function readToken(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.body).getPropertyValue(name).trim();
  return v || fallback;
}
