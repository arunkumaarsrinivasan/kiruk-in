"use client";

/**
 * The halftone pupil on a canvas. Decorative to assistive tech
 * (aria-hidden): the same information lives in the DOM (the button, the
 * answer's "from" row, the screen-reader index).
 *
 * When it starts thinking it blinks, and the blink is the navbar's lids
 * closing (the "kiruk:blink" event), because the navbar is this eye's lids.
 *
 * One rAF loop, paused when the tab is hidden or the canvas is off screen.
 * With reduced motion there is no loop and no blink: one still frame per change.
 */

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { addRipple, draw, hitTest, type Projected, type SceneMode } from "./dot-scene";
import { buildHalftone, createHalftoneState, halftoneSize, projectHalftone, stepHalftone, type HalftoneOptions } from "./halftone-scene";

const INK = "#0b0b0b";
/** While presenting, the pupil looks down at the answer beneath it. */
const LOOK_DOWN = -0.55;

/** Ask the navbar's lids to blink. */
export const blinkLids = () => window.dispatchEvent(new Event("kiruk:blink"));

export interface HalftonePupilHandle {
  ripple: () => void;
}

interface Props {
  options: HalftoneOptions;
  mode: SceneMode;
  lit?: string[];
  /** A thing pointed at in the answer: its dot swells. */
  highlight?: string | null;
  reduce: boolean;
  onPick?: (entityId: string) => void;
  className?: string;
}

export const HalftonePupil = forwardRef<HalftonePupilHandle, Props>(function HalftonePupil({ options, mode, lit, highlight, reduce, onPick, className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dots = useMemo(() => buildHalftone(options), [options]);
  const { width, height } = halftoneSize(options);
  const state = useRef(createHalftoneState(options));
  const frame = useRef<Projected[]>([]);
  const redraw = useRef<() => void>(() => {});
  const [label, setLabel] = useState<{ name: string; x: number; y: number } | null>(null);

  useImperativeHandle(ref, () => ({
    ripple: () => {
      if (!reduce) addRipple(state.current, performance.now());
    },
  }));

  const litKey = (lit ?? []).join(",");
  useEffect(() => {
    const s = state.current;
    const was = s.mode;
    s.mode = mode;
    s.lit = new Set(lit ?? []);
    if (mode === "thinking" && was !== "thinking" && !reduce) blinkLids();
    if (mode === "presenting" && was !== "presenting" && s.lit.size) s.travel = performance.now();
    if (mode === "presenting") {
      s.tilt.tx = LOOK_DOWN;
      s.tilt.ty = 0;
    } else if (was === "presenting") {
      s.tilt.tx = 0;
    }
    if (reduce) {
      s.r = options.radius;
      s.gx = 0;
      s.gy = 0;
    }
    redraw.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, litKey]);

  useEffect(() => {
    state.current.hover = highlight ?? null;
    redraw.current();
  }, [highlight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const render = (now: number, still: boolean) => {
      frame.current = projectHalftone(dots, state.current, options, now, width / 2, height / 2, still);
      draw(ctx, frame.current, INK, width, height);
    };
    redraw.current = () => render(performance.now(), reduce);
    if (reduce) {
      render(performance.now(), true);
      return;
    }
    let raf = 0;
    let last = performance.now();
    let visible = true;
    const loop = (now: number) => {
      stepHalftone(state.current, options, Math.min(64, now - last));
      last = now;
      render(now, false);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [dots, width, height, reduce, options]);

  // A mouse is followed, a tap is glanced at; the dot under the pointer is named.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let back: number | undefined;
    const aim = (e: PointerEvent) => {
      if (reduce || state.current.mode === "presenting") return;
      const r = canvas.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      state.current.tilt.ty = Math.max(-1, Math.min(1, dx));
      state.current.tilt.tx = -Math.max(-1, Math.min(1, dy));
      if (!fine) {
        window.clearTimeout(back);
        back = window.setTimeout(() => {
          state.current.tilt.tx = 0;
          state.current.tilt.ty = 0;
        }, 1400);
      }
    };
    const at = (e: PointerEvent | MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return hitTest(frame.current, e.clientX - r.left, e.clientY - r.top, fine ? 8 : 20);
    };
    const name = (e: PointerEvent) => {
      const hit = at(e);
      const id = hit?.dot.entity?.id ?? null;
      if (id !== state.current.hover) {
        state.current.hover = id;
        setLabel(hit?.dot.entity ? { name: hit.dot.entity.name, x: hit.x, y: hit.y } : null);
        redraw.current();
      }
    };
    const leave = () => {
      state.current.hover = null;
      setLabel(null);
    };
    const pick = (e: MouseEvent) => {
      const hit = at(e);
      if (hit?.dot.entity && onPick) onPick(hit.dot.entity.id);
    };
    window.addEventListener(fine ? "pointermove" : "pointerdown", aim, { passive: true });
    canvas.addEventListener("pointermove", name);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("click", pick);
    return () => {
      window.clearTimeout(back);
      window.removeEventListener(fine ? "pointermove" : "pointerdown", aim);
      canvas.removeEventListener("pointermove", name);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("click", pick);
    };
  }, [reduce, onPick]);

  return (
    <div className={className} style={{ position: "relative", width, height }}>
      <canvas ref={canvasRef} aria-hidden="true" style={{ width, height, display: "block" }} />
      {label ? (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: label.x,
            top: label.y - 22,
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            font: "500 11px/1 var(--font-2026-mono, ui-monospace), ui-monospace, monospace",
            letterSpacing: "0.04em",
            color: "#fafafa",
            background: INK,
            padding: "4px 6px",
            borderRadius: 4,
          }}
        >
          {label.name}
        </span>
      ) : null}
    </div>
  );
});
