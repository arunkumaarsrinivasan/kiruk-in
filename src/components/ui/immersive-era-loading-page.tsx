"use client";

/**
 * First-visit era picker.
 *
 * The whole screen is one eye, and the eye is the control: sweep left or right
 * across it to travel through ten eras, and the interface reflected in its
 * cornea changes with you — a phosphor terminal at the left end, generative
 * surfaces at the right.
 *
 * There is no button. You sweep to travel and you tap the iris to go in —
 * through the pupil, which is the same opening the exit transition dilates.
 * The only chrome is the era's own year, the track you are sweeping along, and
 * one line of instruction that rewrites itself once you have understood it.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import { AVAILABLE_THEMES, type ThemeConfig } from "@/data/portfolio-data";
import { useTheme } from "@/contexts/ThemeContext";
import EraDial, {
  useDialGeometry,
  type EraChangeStyle,
} from "@/components/ui/EraDial";
import { eyeFrame } from "@/lib/era-eye-frame";
import { cn } from "@/lib/utils";

const EraEyeCanvas = dynamic(() => import("@/components/three/EraEyeCanvas"), {
  ssr: false,
});

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const ERA_PICKER_ATTR = "data-era-picker-active";
/** Eye height as a share of viewport height; on any landscape screen the eye
 *  is fit by width instead, and spans the display. */
const EYE_HEIGHT = 1;
/** The room the eye sits in — dark in every era, whatever the era's page is. */
const ROOM = "#040507";
/** Dead zone at each side of the sweep, so both ends are easy to reach. */
const SWEEP_INSET = 0.08;
/** A press shorter and stiller than this is a tap, not a sweep. */
const TAP_SLOP = 8;
const TAP_MS = 520;
/**
 * A touch drag scrubs by distance, not by where it landed. Mapping ten
 * eras across 375 points of phone would put under forty points between years
 * and hide the one you wanted under your own thumb; a swipe that moves this
 * many points per year can be thrown, repeated and reversed.
 */
const SWIPE_PITCH_MIN = 26;
const SWIPE_PITCH_MAX = 64;
/** Smallest the "go in" target is ever allowed to be, in points. */
const IRIS_TAP_MIN = 56;
/** A finger deserves a wider target than a cursor. */
const IRIS_TAP_COARSE = 1.3;
/**
 * Wheel and trackpad travel that adds up to one year. Trackpads report a
 * stream of small deltas and mice report a few large ones; accumulating both
 * and spending the total means either device moves at the speed it is pushed
 * instead of at a fixed tick.
 */
const WHEEL_PITCH = 90;
/** Wheel travel is forgotten if nothing arrives for this long. */
const WHEEL_IDLE_MS = 320;

/**
 * How an era announces itself when you land on it. Each year gets the entrance
 * its own interfaces used: 1970 blinks like a cursor, 1981 cuts in with no
 * transition because a 1-bit display had none to give, 1995 tears, 2003 and
 * 2009 spring, 2013 simply appears, and the generative years resolve out of
 * nothing. The theme's own token is only the fallback — most eras declare
 * "none", which is a statement about their page, not about their arrival.
 */
const ARRIVALS: Record<string, EraChangeStyle> = {
  "1970": "blink",
  "1981": "snap",
  "1991": "float",
  "1995": "glitch",
  "1997": "snap",
  "2000": "float",
  "2003": "pulse",
  "2009": "pulse",
  "2013": "none",
  "2026": "morph",
};

function arrivalOf(
  change: EraChangeStyle,
  reduce: boolean,
): { initial: TargetAndTransition; animate: TargetAndTransition; transition: Transition } {
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.12 },
    };
  }
  switch (change) {
    case "snap":
      // no transition at all, because the display had none: a beat of nothing,
      // and then the frame is simply there
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
        initial: { opacity: 0, scale: 1.08, filter: "blur(10px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        transition: { duration: 0.55, ease: EASE_OUT },
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.28, ease: EASE_OUT },
      };
  }
}

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = globalThis.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return coarse;
}

function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const ctx =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");
      setOk(Boolean(ctx));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

interface ImmersiveEraLoadingPageProps {
  onComplete: () => void;
}

export default function ImmersiveEraLoadingPage({
  onComplete,
}: ImmersiveEraLoadingPageProps) {
  const { setTheme } = useTheme();
  const reduce = useReducedMotion() ?? false;
  const isCoarse = useCoarsePointer();
  const webgl = useWebGL();
  const themes = useMemo(() => AVAILABLE_THEMES, []);
  const last = themes.length - 1;

  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  /** Once you have moved through time, the instruction has done its job. */
  const [traveled, setTraveled] = useState(false);
  /** Whether the cursor is over the iris, so it can offer itself as a way in. */
  const [overIris, setOverIris] = useState(false);
  const exitTimer = useRef(0);
  const dragging = useRef(false);
  const wheel = useRef({ acc: 0, at: 0 });
  /** Where a touch drag started, and which era it started on. */
  const swipe = useRef({ x: 0, from: 0 });
  const surface = useRef<HTMLDivElement | null>(null);
  /** Where and when the press started — a still, short press is a tap. */
  const press = useRef({ x: 0, y: 0, t: 0, moved: false });
  /** Repeated input can outpace a render, so steps come off a ref. */
  const idxRef = useRef(0);

  const focused = themes[index] ?? themes[0];
  const accent = focused.colors.accent || focused.colors.primary;
  /**
   * The room is dark in every year, so the chrome is lit for the room and not
   * for the era — half the eras have near-black body text, which would vanish.
   * Only the year itself is allowed to wear the era's colour.
   */
  const ink = "#ffffff";
  /** "1970: Terminal & ASCII" → the part that is not already the year. */
  const eraLabel = (focused.name.split(":")[1] ?? focused.era).trim();
  const dial = useDialGeometry();
  const arrival = arrivalOf(
    ARRIVALS[focused.id] ??
      ((focused.designTokens.animationStyle ?? "none") as EraChangeStyle),
    reduce,
  );

  useEffect(() => {
    idxRef.current = index;
  }, [index]);

  useEffect(() => {
    document.documentElement.setAttribute(ERA_PICKER_ATTR, "");
    return () => {
      document.documentElement.removeAttribute(ERA_PICKER_ATTR);
      window.clearTimeout(exitTimer.current);
    };
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(last, Math.max(0, next));
      if (clamped === idxRef.current) return;
      idxRef.current = clamped;
      setIndex(clamped);
      setTraveled(true);
    },
    [last],
  );

  const step = useCallback((delta: number) => goTo(idxRef.current + delta), [goTo]);

  const confirmEra = useCallback(
    (theme: ThemeConfig) => {
      if (exiting) return;
      setExiting(true);
      setTheme(theme.id);
      exitTimer.current = window.setTimeout(
        () => onComplete(),
        reduce ? 200 : 760,
      );
    },
    [exiting, onComplete, reduce, setTheme],
  );

  /** Sweep across the eye: the left edge is 1970, the right edge is 2026. */
  const indexFromX = useCallback(
    (clientX: number) => {
      const w = Math.max(window.visualViewport?.width ?? window.innerWidth, 1);
      const t = (clientX / w - SWEEP_INSET) / (1 - SWEEP_INSET * 2);
      return Math.round(Math.min(1, Math.max(0, t)) * last);
    },
    [last],
  );

  /**
   * The iris, in viewport points. Taken from the same framing the shader is
   * drawing with, so the target is under the iris on a phone — where the shot
   * has pushed in and lifted the eye — and not where a desktop's would be.
   */
  const overIrisAt = useCallback(
    (clientX: number, clientY: number) => {
      const vv = window.visualViewport;
      const f = eyeFrame(
        vv?.width ?? window.innerWidth,
        vv?.height ?? window.innerHeight,
        EYE_HEIGHT,
      );
      const r = Math.max(
        IRIS_TAP_MIN,
        f.irisPx * (isCoarse ? IRIS_TAP_COARSE : 1),
      );
      return Math.hypot(clientX - f.cx, clientY - f.cy) < r;
    },
    [isCoarse],
  );

  /** Points of drag that move one year, on a touch screen. */
  const swipePitch = useCallback(() => {
    const w = Math.max(window.innerWidth, 1);
    return Math.min(SWIPE_PITCH_MAX, Math.max(SWIPE_PITCH_MIN, w / (last + 2)));
  }, [last]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (exiting) return;
      // Capture is a nicety, not a requirement — never let it drop the sweep.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* no active pointer with this id */
      }
      // Travel does not begin on the press: a press that never moves is a tap,
      // and a tap on the iris means "take me in", not "take me to this year".
      dragging.current = false;
      press.current = {
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
        moved: false,
      };
      swipe.current = { x: e.clientX, from: idxRef.current };
    },
    [exiting],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (exiting) return;
      if (e.pointerType === "mouse" && !dragging.current) {
        setOverIris(overIrisAt(e.clientX, e.clientY));
      }
      if (!press.current.t) return;
      if (!dragging.current) {
        const far =
          Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) >
          TAP_SLOP;
        if (!far) return;
        dragging.current = true;
        press.current.moved = true;
        swipe.current = { x: e.clientX, from: idxRef.current };
      }
      // A cursor sweeps: the pointer is a needle and the screen is the track.
      // A finger scrubs: it starts where it starts and drags time with it,
      // because it cannot point at a year it is standing on.
      if (e.pointerType === "mouse") {
        goTo(indexFromX(e.clientX));
      } else {
        const moved = (e.clientX - swipe.current.x) / swipePitch();
        goTo(swipe.current.from + Math.round(moved));
      }
    },
    [exiting, goTo, indexFromX, overIrisAt, swipePitch],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* already released */
      }
      const p = press.current;
      const wasTap =
        p.t > 0 && !p.moved && performance.now() - p.t < TAP_MS && !exiting;
      dragging.current = false;
      press.current = { x: 0, y: 0, t: 0, moved: false };
      if (!wasTap) return;
      // Tap the eye to go in. A click off the eye lands on the year under the
      // cursor; a tap off it does nothing, because on a phone half the taps
      // that miss the iris are a thumb finding the screen, not a request to
      // jump sixty years.
      if (overIrisAt(e.clientX, e.clientY)) confirmEra(themes[idxRef.current]);
      else if (e.pointerType === "mouse") goTo(indexFromX(e.clientX));
    },
    [confirmEra, exiting, goTo, indexFromX, overIrisAt, themes],
  );

  const cancelDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* already released */
    }
    dragging.current = false;
    press.current = { x: 0, y: 0, t: 0, moved: false };
  }, []);

  /**
   * The picker owns the whole screen, so it owns the whole keyboard. Bound to
   * the window rather than to the slider, because nobody tabs to a full-screen
   * dialog before pressing an arrow key — they press the arrow key.
   */
  useEffect(() => {
    if (exiting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      // never eat a key someone is typing into something
      if (el?.isContentEditable) return;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          step(1);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          step(-1);
          break;
        case "PageUp":
          e.preventDefault();
          step(3);
          break;
        case "PageDown":
          e.preventDefault();
          step(-3);
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(last);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          confirmEra(themes[idxRef.current]);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmEra, exiting, goTo, last, step, themes]);

  // Focus the control on mount, so a screen reader announces the year it is on
  // and the focus ring has somewhere to land.
  useEffect(() => {
    surface.current?.focus({ preventScroll: true });
  }, []);

  /**
   * Wheel and trackpad travel, as a non-passive native listener. Deltas are
   * banked and spent a year at a time rather than throttled: a trackpad's
   * hundred small deltas move as far as a mouse's three big ones, and a hard
   * flick moves several years in one gesture instead of one per tick.
   */
  useEffect(() => {
    if (exiting) return;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 0.5) return;
      e.preventDefault();
      const now = performance.now();
      // a new gesture starts from zero, and so does a reversal
      if (now - wheel.current.at > WHEEL_IDLE_MS || wheel.current.acc * d < 0) {
        wheel.current.acc = 0;
      }
      wheel.current.at = now;
      wheel.current.acc += d;
      const years = Math.trunc(wheel.current.acc / WHEEL_PITCH);
      if (years === 0) return;
      wheel.current.acc -= years * WHEEL_PITCH;
      step(years);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [exiting, step]);

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[200] flex h-dvh w-full flex-col overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{
        duration: reduce ? 0.18 : 0.55,
        delay: exiting && !reduce ? 0.22 : 0,
        ease: EASE_OUT,
      }}
      style={{
        background: ROOM,
        touchAction: "none",
        overscrollBehavior: "none",
        WebkitTapHighlightColor: "transparent",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a design era"
    >
      {/* --- the eye ------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0">
        {webgl === true && (
          <EraEyeCanvas
            era={focused}
            eyeHeight={EYE_HEIGHT}
            exiting={exiting}
            reduce={reduce}
            interactive
          />
        )}
      </div>

      {/* --- the eye is the control: sweep across it to travel ------------- */}
      <div
        role="slider"
        tabIndex={exiting ? -1 : 0}
        aria-label="Design era"
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={index}
        aria-valuetext={focused.name}
        className={cn(
          "absolute inset-0 z-10 touch-none focus-visible:outline-none",
          exiting ? "cursor-default" : overIris ? "cursor-pointer" : "cursor-ew-resize",
        )}
        ref={surface}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
      />

      {webgl === false && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center px-8 text-center"
          style={{ color: ink }}
        >
          <p className="max-w-xs text-xs leading-relaxed opacity-45">
            The eye needs WebGL. Sweep left or right anyway, then press Enter.
          </p>
        </div>
      )}

      {/* The eye is lit and the chrome is small, so the floor of the room
          comes up to meet it — the dial and the year always have something to
          sit on. Painted under the dial, not over it. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[48%]"
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: reduce ? 0.12 : 0.3, ease: EASE_OUT }}
        style={{
          background: `linear-gradient(to top, ${ROOM} 0%, ${ROOM}f2 30%, ${ROOM}a6 58%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      {/* --- the dial: the eras ride a ring around the bottom of the eye -- */}
      <EraDial
        themes={themes}
        index={index}
        era={focused}
        onSelect={goTo}
        reduce={reduce}
        exiting={exiting}
      />

      {/* --- the title card, sitting inside the arc ------------------------ */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 z-30 select-none"
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: reduce ? 0.12 : 0.3, ease: EASE_OUT }}
        style={{
          fontFamily: focused.fonts.accent,
          // just inside the ring, so the card and the dial read as one dial
          bottom: dial.h ? Math.max(14, dial.h - (dial.cy + dial.r) + 30) : 96,
        }}
      >
        <motion.div
          key={focused.id}
          className="relative flex flex-col items-center gap-1 text-center"
          initial={arrival.initial}
          animate={arrival.animate}
          transition={arrival.transition}
        >
          {/* the movement this year belongs to */}
          <span
            className="text-[11px] uppercase tracking-[0.22em] opacity-70 sm:text-[9px] sm:tracking-[0.4em] sm:opacity-[0.42]"
            style={{ color: ink }}
          >
            {focused.era}
          </span>
          <span
            className="text-[clamp(2.75rem,12vw,4.6rem)] leading-[0.95]"
            style={{
              color: accent,
              fontFamily: focused.fonts.primary,
              textShadow: `0 0 30px ${accent}55`,
            }}
          >
            {focused.id}
          </span>
          <span
            className="text-[12px] uppercase tracking-[0.22em] sm:text-[11px] sm:tracking-[0.34em]"
            style={{ color: ink, opacity: 0.72 }}
          >
            {eraLabel}
          </span>
        </motion.div>

        {/* instruction, which rewrites itself once you have understood it */}
        <p
          className={cn(
            "relative z-[1] px-5 pt-4 text-center uppercase",
            "text-[11px] leading-relaxed tracking-[0.12em]",
            "transition-opacity duration-500 sm:text-[10px] sm:leading-[2.1] sm:tracking-[0.2em]",
          )}
          style={{ color: ink, opacity: overIris ? 0.85 : 0.45 }}
        >
          {traveled ? (
            <>tap the eye to enter {focused.id}</>
          ) : (
            <>
              {/* one line on a phone, one sentence on a desktop */}
              <span className="block sm:inline">
                {isCoarse
                  ? "swipe across the eye, or turn the ring"
                  : "arrow keys, scroll, or sweep across the eye"}
              </span>
              <span className="mx-2 hidden opacity-50 sm:inline">·</span>
              <span className="block sm:inline">tap the eye to enter</span>
            </>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}
