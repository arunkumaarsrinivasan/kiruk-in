"use client";

/**
 * useTube — one picture tube, hosted. The work and the home each grew their
 * own host for the 1970 tube; this is the same machinery in one piece for any
 * other screen that wants it: a character surface (surface.ts) shown through
 * the tube shader (crt.ts), fitted under the eye's lids, with the pointer
 * mapped back through the glass so what it points at is what it presses.
 *
 * The screen says what to draw and what a press does; the tube does the rest.
 * The visitor's display settings are the work tube's, read from the same key.
 */

import { useEffect, useRef, useState, type RefObject } from "react";
import { Crt, unbend, type CrtGeometry } from "./crt";
import { ARROW } from "./pixel-icons";
import { CH, CW, rgb01, Surface } from "./surface";
import { phosphorHex, plasmaHex, TUBE_DEFAULTS, TUBE_RANGE, type Area, type TubeConfig } from "./views";

export type Pt = { x: number; y: number };

export interface TubeFrame {
  /** Seconds since the tube came on; 0 under reduced motion. */
  time: number;
  /** The cells the lids and the corners leave in view. */
  safe: Area;
  /** The pointer in surface pixels, or null when it is off the glass. */
  pointer: Pt | null;
  /** The zone under the pointer. */
  hover: string | null;
  config: TubeConfig;
}

export interface TubeScreen {
  draw: (s: Surface, f: TubeFrame) => void;
  /** A click on a zone. */
  act?: (id: string) => void;
  /** A press starting on a zone. Return true to take the drag that follows. */
  down?: (id: string | null, p: Pt) => boolean;
  /** The pointer moving during a drag the screen took. */
  drag?: (p: Pt | null) => void;
  /** The drag ending, over a zone or none. */
  up?: (id: string | null, p: Pt | null) => void;
  hover?: (id: string | null) => void;
}

const STORE = "kiruk-tube-1970";
/**
 * How long the tube keeps drawing after the last change while nothing moves by
 * itself. The phosphor fades by the clock and loses 0.006 a frame besides, so
 * even a full-white cell is black in about 0.3 s at 30 fps or faster.
 */
const QUIET_MS = 500;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** The work tube's display settings, as the visitor left them. */
export function readTubeConfig(): TubeConfig {
  const out = { ...TUBE_DEFAULTS };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? "null") as Partial<TubeConfig> | null;
    if (!saved || typeof saved !== "object") return out;
    for (const key of ["gain", "curve", "glow"] as const) {
      const [lo, hi] = TUBE_RANGE[key];
      const value = saved[key];
      if (typeof value === "number" && Number.isFinite(value)) out[key] = clamp(value, lo, hi);
    }
    if (typeof saved.scan === "boolean") out.scan = saved.scan;
    if (typeof saved.hum === "boolean") out.hum = saved.hum;
    if (saved.color === "crt" || saved.color === "plasma" || saved.color === "ice") out.color = saved.color;
  } catch {
    // an unreadable setting is no setting
  }
  return out;
}

/**
 * Host a tube on `canvas`, filling `root`. `screen` is read afresh on every
 * frame, so it can close over the latest state. Returns whether the tube is
 * drawing its own pointer (hide the system one when it is), and a way to ask
 * for a redraw now.
 */
export function useTube(
  root: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLCanvasElement | null>,
  screen: TubeScreen,
  family: string,
): { ownCursor: boolean; redraw: () => void } {
  const latest = useRef(screen);
  latest.current = screen;
  const dirty = useRef(true);
  const [ownCursor, setOwnCursor] = useState(false);

  useEffect(() => {
    const host = root.current;
    const glass = canvas.current;
    if (!host || !glass) return;

    let surface: Surface;
    try {
      surface = new Surface(family);
    } catch {
      return;
    }
    let crt = null as Crt | null;
    let flat = null as CanvasRenderingContext2D | null;
    const boot = () => {
      try {
        crt = new Crt(glass, { fill: ARROW, width: 12, height: 17 });
      } catch {
        // No WebGL2: the flat picture, unbent. If WebGL claimed this canvas
        // before it failed, the 2D context is null and the screen stays dark:
        // the canvas belongs to the caller, so this hook cannot swap it.
        crt = null;
        flat = glass.getContext("2d");
      }
    };
    boot();

    const config = readTubeConfig();
    const fine = globalThis.matchMedia("(pointer: fine)");
    const still = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
    const syncCursor = () => setOwnCursor(Boolean(crt) && fine.matches);
    syncCursor();
    fine.addEventListener("change", syncCursor);

    let geo: CrtGeometry = { w: 1, h: 1, x0: 0, y0: 0, x1: 1, y1: 1, k: config.curve, radius: 24 };
    let safe: Area = { c: 2, r: 1, w: 60, h: 28 };
    let pointer: Pt | null = null;
    let hover: string | null = null;
    let look: [number, number] = [0, 0];
    let dragging = false;

    /** Fit the picture to the stage, and find the cells the eye's lids leave in view. */
    const layout = () => {
      const rect = host.getBoundingClientRect();
      const W = Math.max(1, rect.width);
      const H = Math.max(1, rect.height);
      const vw = globalThis.innerWidth;
      const vh = globalThis.innerHeight;
      const css = getComputedStyle(document.documentElement);
      const num = (name: string) => Number.parseFloat(css.getPropertyValue(name)) || 0;
      const top = { edge: num("--simple-game-nav-bottom"), mid: num("--eye-mid") };
      const bottomEdge = num("--eye-lid-bottom");
      const bottom = { edge: bottomEdge, mid: num("--eye-lid-bottom-mid") || bottomEdge * 0.52 };
      const under = (x: number) => ((rect.left + x - vw / 2) / (vw / 2)) ** 2;
      const lidTop = (x: number) => Math.max(0, top.mid + (top.edge - top.mid) * under(x) - rect.top);
      const lidBottom = (x: number) => Math.max(0, bottom.mid + (bottom.edge - bottom.mid) * under(x) - (vh - rect.bottom));

      const pad = W < 560 ? 4 : 8;
      geo = {
        w: W,
        h: H,
        x0: pad,
        x1: W - pad,
        y0: Math.max(pad, lidTop(W / 2) + 3),
        y1: H - Math.max(pad, lidBottom(W / 2) + 3),
        k: config.curve,
        radius: W < 560 ? 18 : 28,
      };
      const pw = geo.x1 - geo.x0;
      const ph = Math.max(40, geo.y1 - geo.y0);
      const rowPx = clamp(Math.min(ph / 34, pw >= 900 ? pw / 52 : Infinity), 18, 26);
      const rows = Math.max(16, Math.round(ph / rowPx));
      const cols = Math.max(28, Math.round(pw / (rowPx * (CW / CH))));
      surface.resize(cols, rows);

      const seen = (col: number, row: number) => {
        const [px, py] = unbend(((col + 0.5) / cols) * 2 - 1, ((row + 0.5) / rows) * 2 - 1, geo.k);
        const x = (geo.x0 + geo.x1) / 2 + (px * pw) / 2;
        const y = (geo.y0 + geo.y1) / 2 + (py * ph) / 2;
        return y - rowPx * 0.62 >= lidTop(x) && y + rowPx * 0.62 <= H - lidBottom(x);
      };
      const c0 = cols >= 60 ? 3 : 2;
      const c1 = cols - c0;
      let r0 = 1;
      while (r0 < rows / 3 && !(seen(c0, r0) && seen(c1 - 1, r0))) r0 += 1;
      let r1 = rows - 2;
      while (r1 > (rows * 2) / 3 && !(seen(c0, r1) && seen(c1 - 1, r1))) r1 -= 1;
      safe = { c: c0, r: r0, w: c1 - c0, h: r1 - r0 + 1 };

      crt?.resize(geo, surface.canvas.width, surface.canvas.height);
      if (!crt) {
        const d = Math.min(globalThis.devicePixelRatio || 1, 2);
        glass.width = Math.round(W * d);
        glass.height = Math.round(H * d);
      }
      dirty.current = true;
    };
    layout();
    // the observer and the window both report a resize: fit once, on the next frame
    let fitting = 0;
    const refit = () => {
      if (!fitting) {
        fitting = requestAnimationFrame(() => {
          fitting = 0;
          layout();
        });
      }
    };
    const ro = new ResizeObserver(refit);
    ro.observe(host);
    globalThis.addEventListener("resize", refit);
    const settle = globalThis.setTimeout(layout, 400);
    void document.fonts?.load(`20px ${family}`).then(() => {
      dirty.current = true;
    });

    let raf = 0;
    let last = performance.now();
    let lastTick = 0;
    const born = last;
    /** When the tube last had something new to show; and what the pointer was then. */
    let changedAt = last;
    let seenPointer: Pt | null = pointer;
    let seenLook = look;
    // the settings are read once, so the phosphor's colours are too
    const hot = rgb01(plasmaHex(config.color));
    const tint = rgb01(phosphorHex(config.color));

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) {
        last = t;
        return;
      }
      const dt = Math.min(5, (t - last) / 1000);
      last = t;
      // twenty times a second: cords swing and lamps blink by themselves. This stays at 50 ms
      // even when held still: a screen may change its state without asking for a redraw, and
      // this tick is what picks that up.
      const tick = t - lastTick > 50;
      const fresh = dirty.current || tick;
      if (fresh) {
        if (tick) lastTick = t;
        dirty.current = false;
        surface.clear();
        latest.current.draw(surface, { time: still.matches ? 0 : (t - born) / 1000, safe, pointer, hover, config });
      }
      const warm = still.matches ? 1 : clamp((t - born) / 1100, 0, 1);
      const motion = !still.matches && config.hum;
      // Hum, flicker and grain move every frame, and so does the tube warming up.
      // Without them the glass changes only with the picture or the pointer; once
      // the phosphor has let go of the last change, another frame would be the same.
      if (fresh || motion || warm < 1 || pointer !== seenPointer || look !== seenLook) changedAt = t;
      seenPointer = pointer;
      seenLook = look;
      if (crt && t - changedAt < QUIET_MS) {
        crt.draw(surface.canvas, {
          time: t / 1000,
          dt,
          dirty: fresh,
          pointer,
          pointerColor: hover ? hot : [0.95, 1, 0.96],
          tint,
          look,
          warm,
          motion,
          gain: config.gain,
          glow: config.glow,
          scan: config.scan,
        });
      } else if (flat && fresh) {
        const d = glass.width / geo.w;
        flat.fillStyle = "#020302";
        flat.fillRect(0, 0, glass.width, glass.height);
        flat.imageSmoothingEnabled = false;
        flat.drawImage(surface.canvas, geo.x0 * d, geo.y0 * d, (geo.x1 - geo.x0) * d, (geo.y1 - geo.y0) * d);
      }
    };
    raf = requestAnimationFrame(frame);

    const locate = (e: { clientX: number; clientY: number }) => {
      const rect = glass.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (crt) return crt.map(x, y);
      const sx = ((x - geo.x0) / (geo.x1 - geo.x0)) * surface.canvas.width;
      const sy = ((y - geo.y0) / (geo.y1 - geo.y0)) * surface.canvas.height;
      return { x: sx, y: sy, inside: sx >= 0 && sy >= 0 && sx < surface.canvas.width && sy < surface.canvas.height };
    };
    const setHover = (id: string | null) => {
      if (id === hover) return;
      hover = id;
      dirty.current = true;
      latest.current.hover?.(id);
    };

    const onMove = (e: PointerEvent) => {
      const m = locate(e);
      const rect = glass.getBoundingClientRect();
      look = [((e.clientX - rect.left) / rect.width) * 2 - 1, ((e.clientY - rect.top) / rect.height) * 2 - 1];
      pointer = m.inside ? { x: m.x, y: m.y } : null;
      if (dragging) latest.current.drag?.(pointer);
      setHover(m.inside ? surface.hit(m.x, m.y) : null);
      dirty.current = true;
    };
    const onLeave = () => {
      pointer = null;
      setHover(null);
    };
    const onDown = (e: PointerEvent) => {
      host.focus({ preventScroll: true });
      const m = locate(e);
      const id = m.inside ? surface.hit(m.x, m.y) : null;
      pointer = m.inside ? { x: m.x, y: m.y } : null;
      if (latest.current.down?.(id, { x: m.x, y: m.y })) {
        dragging = true;
        glass.setPointerCapture(e.pointerId);
        e.preventDefault();
      }
      dirty.current = true;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const m = locate(e);
      const id = m.inside ? surface.hit(m.x, m.y) : null;
      latest.current.up?.(id, m.inside ? { x: m.x, y: m.y } : null);
      dirty.current = true;
      // the click that follows a drag is the drag's own end, not a press
      skipClick = true;
      setTimeout(() => (skipClick = false), 0);
    };
    let skipClick = false;
    const onClick = (e: MouseEvent) => {
      if (skipClick) return;
      const m = locate(e);
      const id = m.inside ? surface.hit(m.x, m.y) : null;
      if (id) latest.current.act?.(id);
      dirty.current = true;
    };
    const onLost = (e: Event) => e.preventDefault();
    const onRestored = () => {
      boot();
      layout();
    };

    glass.addEventListener("pointermove", onMove);
    glass.addEventListener("pointerleave", onLeave);
    glass.addEventListener("pointerdown", onDown);
    glass.addEventListener("pointerup", onUp);
    glass.addEventListener("pointercancel", onUp);
    glass.addEventListener("click", onClick);
    glass.addEventListener("webglcontextlost", onLost);
    glass.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fitting);
      globalThis.clearTimeout(settle);
      ro.disconnect();
      globalThis.removeEventListener("resize", refit);
      fine.removeEventListener("change", syncCursor);
      glass.removeEventListener("pointermove", onMove);
      glass.removeEventListener("pointerleave", onLeave);
      glass.removeEventListener("pointerdown", onDown);
      glass.removeEventListener("pointerup", onUp);
      glass.removeEventListener("pointercancel", onUp);
      glass.removeEventListener("click", onClick);
      glass.removeEventListener("webglcontextlost", onLost);
      glass.removeEventListener("webglcontextrestored", onRestored);
      crt?.dispose();
    };
  }, [root, canvas, family]);

  return {
    ownCursor,
    redraw: () => {
      dirty.current = true;
    },
  };
}
