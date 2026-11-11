"use client";

/**
 * useTube — one picture tube, hosted. The home, the work and the contact desk
 * all show their screen on the same 1970 tube, and this is its one host: a
 * character surface (surface.ts) shown through the tube shader (crt.ts),
 * fitted under the eye's lids, with the pointer mapped back through the glass
 * so what it points at is what it presses.
 *
 * The screen says what to draw and what a press does; the tube does the rest:
 * booting (with a flat picture when WebGL2 is missing, on a fresh canvas when
 * WebGL claimed the old one before it failed), the fit and the lids, the frame
 * loop and its rest when nothing moves, the wheel and a finger scrolling the
 * page inside, the display settings' panel and sliders, and a lost context.
 */

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from "react";
import { Crt, unbend, type CrtGeometry } from "./crt";
import { ARROW } from "./pixel-icons";
import { CH, CW, rgb01, Surface } from "./surface";
import { phosphorHex, plasmaHex, TUBE_DEFAULTS, TUBE_RANGE, type Area, type TubeConfig } from "./views";

export type Pt = { x: number; y: number };

export interface TubeFrame {
  /** Seconds since the tube came on; 0 under reduced motion. */
  time: number;
  /** Seconds on the page's clock; 0 under reduced motion. */
  now: number;
  /** Seconds since the tube last began to warm up (it starts over on a replay); 99 under reduced motion. */
  age: number;
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
  /** A click on a zone. The display settings' own zones never reach it when the tube keeps them. */
  act?: (id: string) => void;
  hover?: (id: string | null) => void;
  /**
   * The pointer moved on the glass, or left it (null). Return false when the
   * picture does not answer the pointer itself, so it is not drawn again for it.
   */
  point?: (p: Pt | null, s: Surface) => boolean | void;
  /** The pointer left the glass. */
  leave?: () => void;
}

export interface TubeOptions {
  family: string;
  /**
   * The display settings, when this screen lets the visitor change them: the
   * tube then answers the "tube" key and every "cfg:" zone, sliders included.
   * Without them the tube shows the settings as the visitor last left them.
   */
  settings?: {
    config: TubeConfig;
    set: Dispatch<SetStateAction<TubeConfig>>;
    /** Open or close the settings panel. */
    panel: (open: boolean) => void;
  };
  /** Hold the tube still: something opaque covers it. It also rests by itself when off screen. */
  paused?: boolean;
  /**
   * How often, in ms, the picture is drawn again for what moves by itself.
   * By default twenty times a second, and once a second under reduced motion.
   */
  every?: (still: boolean) => number;
  /** A page inside the tube that the wheel and a finger scroll, in rows. */
  scroll?: {
    at: MutableRefObject<number>;
    /** How far it can go now; 0 leaves the wheel to the page. */
    max: () => number;
    /** Whether a finger dragging on the glass scrolls it now. */
    touch: () => boolean;
  };
  /** Whether a finger points like a mouse does (true), or only scrolls (false). */
  fingerPoints?: boolean;
  /** On a desk, size the cells so the board has about a hundred columns, however tall the window is. */
  wide?: boolean;
}

export interface Tube {
  /** The tube is drawing its own pointer: hide the system one. */
  ownCursor: boolean;
  /** Draw the picture again on the next frame. */
  redraw: () => void;
  /** Warm the tube up again from cold. */
  replay: () => void;
  /** Scroll the page inside by rows, within its reach. */
  scrollBy: (rows: number) => void;
  /** Key the canvas with this: it changes when the tube needs a fresh canvas for its flat picture. */
  glass: string;
}

const STORE = "kiruk-tube-1970";
/**
 * How long the tube keeps drawing after the last change while nothing moves by
 * itself. The phosphor fades by the clock and loses 0.006 a frame besides, so
 * even a full-white cell is black in about 0.3 s at 30 fps or faster.
 */
const QUIET_MS = 500;
const SLIDERS = new Set(["cfg:gain", "cfg:curve", "cfg:glow"]);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const defaultEvery = (still: boolean) => (still ? 1000 : 50);

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
 * The display settings as state: read once on the client (so the server and
 * the browser agree on the first render) and kept between visits. They are the
 * same on every tube, so set once they hold on all.
 */
export function useTubeConfig(): [TubeConfig, Dispatch<SetStateAction<TubeConfig>>] {
  const [config, setConfig] = useState<TubeConfig>(TUBE_DEFAULTS);
  const read = useRef(false);
  useEffect(() => {
    setConfig(readTubeConfig());
    read.current = true;
  }, []);
  useEffect(() => {
    // the defaults the first render shows are not the visitor's choice
    if (!read.current) return;
    try {
      localStorage.setItem(STORE, JSON.stringify(config));
    } catch {
      // nothing to do: the setting still holds for this visit
    }
  }, [config]);
  return [config, setConfig];
}

/**
 * Host a tube on `canvas`, filling `root`. `screen` and the options are read
 * afresh on every frame, so they can close over the latest state; and every
 * render of the caller draws the picture again. Pass the font family alone,
 * or the options.
 */
export function useTube(
  root: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLCanvasElement | null>,
  screen: TubeScreen,
  options: TubeOptions | string,
): Tube {
  const opts: TubeOptions = typeof options === "string" ? { family: options } : options;
  const latest = useRef(screen);
  latest.current = screen;
  const set = useRef(opts);
  set.current = opts;
  const dirty = useRef(true);
  /** When the tube last began to warm up. */
  const born = useRef(0);
  const relayout = useRef<() => void>(() => {});
  const [ownCursor, setOwnCursor] = useState(false);
  /** WebGL claimed the canvas and then failed: the flat picture needs a canvas of its own. */
  const [noGl, setNoGl] = useState(false);
  const { family } = opts;

  const api = useRef<Omit<Tube, "ownCursor" | "glass"> | null>(null);
  api.current ??= {
    redraw: () => {
      dirty.current = true;
    },
    replay: () => {
      born.current = performance.now();
    },
    scrollBy: (rows: number) => {
      const s = set.current.scroll;
      if (!s) return;
      const next = clamp(s.at.current + rows, 0, s.max());
      if (next !== s.at.current) {
        s.at.current = next;
        dirty.current = true;
      }
    },
  };

  // whatever the caller rendered for is drawn on the next frame
  useEffect(() => {
    dirty.current = true;
  });

  // a new curve bends the glass differently, so the lids cover other cells
  const curve = opts.settings?.config.curve;
  useEffect(() => {
    relayout.current();
  }, [curve]);

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
    /** Without settings of its own, the tube shows them as last left, read once. */
    let kept: TubeConfig | null = null;
    const config = () => set.current.settings?.config ?? (kept ??= readTubeConfig());

    // Both are set inside boot(), so they are typed by assertion rather than by their first value.
    let crt = null as Crt | null;
    let flat = null as CanvasRenderingContext2D | null;
    const boot = () => {
      crt = null;
      flat = null;
      if (!noGl) {
        try {
          crt = new Crt(glass, { fill: ARROW, width: 12, height: 17 });
          return;
        } catch {
          // no WebGL2: show the flat picture, unbent
        }
      }
      flat = glass.getContext("2d");
      // a canvas WebGL claimed before it failed can never draw flat: start over on a fresh one
      if (!flat && !noGl) setNoGl(true);
    };
    boot();

    const fine = globalThis.matchMedia("(pointer: fine)");
    const still = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
    const syncCursor = () => setOwnCursor(Boolean(crt) && fine.matches);
    syncCursor();
    fine.addEventListener("change", syncCursor);

    let geo: CrtGeometry = { w: 1, h: 1, x0: 0, y0: 0, x1: 1, y1: 1, k: config().curve, radius: 24 };
    let safe: Area = { c: 2, r: 1, w: 60, h: 28 };
    let pointer: Pt | null = null;
    let hover: string | null = null;
    let look: [number, number] = [0, 0];
    /** A finger dragging the page inside, from where it went down. */
    let drag: { y: number; scroll: number; moved: boolean } | null = null;
    /** The slider being dragged, by its zone. */
    let slide: string | null = null;

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
      // The site's lids are parabolas over the viewport; they cover this stage only where it runs under them.
      const under = (x: number) => ((rect.left + x - vw / 2) / (vw / 2)) ** 2;
      const lidTop = (x: number) => Math.max(0, top.mid + (top.edge - top.mid) * under(x) - rect.top);
      const lidBottom = (x: number) =>
        Math.max(0, bottom.mid + (bottom.edge - bottom.mid) * under(x) - (vh - rect.bottom));

      const pad = W < 560 ? 4 : 8;
      geo = {
        w: W,
        h: H,
        x0: pad,
        x1: W - pad,
        y0: Math.max(pad, lidTop(W / 2) + 3),
        y1: H - Math.max(pad, lidBottom(W / 2) + 3),
        k: config().curve,
        radius: W < 560 ? 18 : 28,
      };
      const pw = geo.x1 - geo.x0;
      const ph = Math.max(40, geo.y1 - geo.y0);
      const wide = set.current.wide ?? true;
      const rowPx = clamp(Math.min(ph / 34, wide && pw >= 900 ? pw / 52 : Infinity), 18, 26);
      const rows = Math.max(16, Math.round(ph / rowPx));
      const cols = Math.max(28, Math.round(pw / (rowPx * (CW / CH))));
      surface.resize(cols, rows);

      // A cell is in view when its box, bent through the glass, clears both lids.
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
    relayout.current = layout;
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
    // the nav measures its lids a moment after the page mounts
    const settle = globalThis.setTimeout(layout, 400);
    void document.fonts?.load(`20px ${family}`).then(() => {
      dirty.current = true;
    });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(host);

    let raf = 0;
    let last = performance.now();
    let lastTick = 0;
    const on = last;
    born.current = last;
    /** When the tube last had something new to show; and what the pointer was then. */
    let changedAt = last;
    let seenPointer: Pt | null = pointer;
    let seenLook = look;
    /** The phosphor's colours, worked out again only when the setting changes. */
    let colorOf = "";
    let hot: [number, number, number] = [1, 1, 1];
    let tint: [number, number, number] = [1, 1, 1];

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !visible || set.current.paused) {
        last = t;
        return;
      }
      const dt = Math.min(5, (t - last) / 1000);
      last = t;
      const cfg = config();
      // the picture is drawn again when something changed, and on a beat for what moves by itself
      const tick = t - lastTick > (set.current.every ?? defaultEvery)(still.matches);
      const fresh = dirty.current || tick;
      if (fresh) {
        if (tick) lastTick = t;
        dirty.current = false;
        surface.clear();
        latest.current.draw(surface, {
          time: still.matches ? 0 : (t - on) / 1000,
          now: still.matches ? 0 : t / 1000,
          age: still.matches ? 99 : (t - born.current) / 1000,
          safe,
          pointer,
          hover,
          config: cfg,
        });
      }
      if (cfg.color !== colorOf) {
        colorOf = cfg.color;
        hot = rgb01(plasmaHex(cfg.color));
        tint = rgb01(phosphorHex(cfg.color));
      }
      const warm = still.matches ? 1 : clamp((t - born.current) / 1100, 0, 1);
      const motion = !still.matches && cfg.hum;
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
          pointerColor: hover && hover !== "cfg:panel" ? hot : [0.95, 1, 0.96],
          tint,
          look,
          warm,
          motion,
          gain: cfg.gain,
          glow: cfg.glow,
          scan: cfg.scan,
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

    /* the pointer, mapped through the glass */
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
    /** Tell the screen where the pointer is; it is drawn again unless the screen says it does not answer. */
    const tell = (p: Pt | null) => {
      if (latest.current.point?.(p, surface) !== false) dirty.current = true;
    };
    /** Whether this pointer points, or (a finger, on a screen that scrolls by fingers) only scrolls. */
    const points = (e: PointerEvent) => e.pointerType === "mouse" || (set.current.fingerPoints ?? true);

    /** Set a slider from where the pointer is along its track. */
    const setSlider = (id: string, x: number) => {
      const settings = set.current.settings;
      const z = surface.zones.find((zone) => zone.id === id);
      const key = id.slice(4) as keyof typeof TUBE_RANGE;
      if (!settings || !z || !(key in TUBE_RANGE)) return;
      const [lo, hi] = TUBE_RANGE[key];
      const at = clamp((x - z.x - 4) / (z.w - 8), 0, 1);
      settings.set((c) => ({ ...c, [key]: Math.round((lo + (hi - lo) * at) * 200) / 200 }));
    };

    /** Press a zone: the display settings' own, or the screen's. */
    const act = (id: string) => {
      const settings = set.current.settings;
      if (!settings || (id !== "tube" && !id.startsWith("cfg:"))) {
        latest.current.act?.(id);
        return;
      }
      const arg = id.slice(4);
      if (id === "tube") settings.panel(true);
      else if (arg === "close" || arg === "done") settings.panel(false);
      else if (arg === "replay") {
        born.current = performance.now();
        settings.panel(false);
      } else if (arg === "color") {
        settings.set((c) => ({ ...c, color: c.color === "crt" ? "plasma" : c.color === "plasma" ? "ice" : "crt" }));
      } else if (arg === "scan") settings.set((c) => ({ ...c, scan: !c.scan }));
      else if (arg === "hum") settings.set((c) => ({ ...c, hum: !c.hum }));
      else if (arg === "reset") settings.set(TUBE_DEFAULTS);
    };

    const onMove = (e: PointerEvent) => {
      const m = locate(e);
      if (slide) {
        setSlider(slide, m.x);
        if (points(e)) pointer = m.inside ? { x: m.x, y: m.y } : null;
        return;
      }
      const rect = glass.getBoundingClientRect();
      look = [((e.clientX - rect.left) / rect.width) * 2 - 1, ((e.clientY - rect.top) / rect.height) * 2 - 1];
      const scroll = set.current.scroll;
      if (drag && scroll) {
        // a finger drags the page inside the tube
        if (Math.abs(drag.y - m.y) > 8) drag.moved = true;
        const next = clamp(drag.scroll + Math.round((drag.y - m.y) / CH), 0, scroll.max());
        if (next !== scroll.at.current) {
          scroll.at.current = next;
          dirty.current = true;
        }
        return;
      }
      if (!points(e)) return;
      pointer = m.inside ? { x: m.x, y: m.y } : null;
      setHover(m.inside ? surface.hit(m.x, m.y) : null);
      tell(m.inside ? { x: m.x, y: m.y } : null);
    };
    const onLeave = () => {
      pointer = null;
      drag = null;
      setHover(null);
      tell(null);
      latest.current.leave?.();
    };
    const onDown = (e: PointerEvent) => {
      host.focus({ preventScroll: true });
      const m = locate(e);
      const id = m.inside ? surface.hit(m.x, m.y) : null;
      if (id && SLIDERS.has(id) && set.current.settings) {
        slide = id;
        glass.setPointerCapture(e.pointerId);
        setSlider(id, m.x);
        return;
      }
      if (e.pointerType !== "mouse" && points(e)) {
        pointer = m.inside ? { x: m.x, y: m.y } : null;
        dirty.current = true;
      }
      const scroll = set.current.scroll;
      if (scroll && e.pointerType !== "mouse" && scroll.touch()) {
        drag = { y: m.y, scroll: scroll.at.current, moved: false };
      }
    };
    const onUp = () => {
      slide = null;
      // keep a drag from landing as a press: the click comes right after this
      if (drag?.moved) setTimeout(() => (drag = null), 0);
      else drag = null;
    };
    const onClick = (e: MouseEvent) => {
      if (drag?.moved) return;
      const m = locate(e);
      const id = m.inside ? surface.hit(m.x, m.y) : null;
      if (id) act(id);
      dirty.current = true;
    };
    const onWheel = (e: WheelEvent) => {
      const scroll = set.current.scroll;
      if (!scroll || scroll.max() <= 0) return;
      e.preventDefault();
      api.current?.scrollBy(Math.sign(e.deltaY) * 3);
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
    glass.addEventListener("wheel", onWheel, { passive: false });
    glass.addEventListener("webglcontextlost", onLost);
    glass.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fitting);
      globalThis.clearTimeout(settle);
      ro.disconnect();
      io.disconnect();
      relayout.current = () => {};
      globalThis.removeEventListener("resize", refit);
      fine.removeEventListener("change", syncCursor);
      glass.removeEventListener("pointermove", onMove);
      glass.removeEventListener("pointerleave", onLeave);
      glass.removeEventListener("pointerdown", onDown);
      glass.removeEventListener("pointerup", onUp);
      glass.removeEventListener("pointercancel", onUp);
      glass.removeEventListener("click", onClick);
      glass.removeEventListener("wheel", onWheel);
      glass.removeEventListener("webglcontextlost", onLost);
      glass.removeEventListener("webglcontextrestored", onRestored);
      crt?.dispose();
    };
  }, [root, canvas, family, noGl]);

  return { ownCursor, glass: noGl ? "flat" : "glass", ...api.current };
}
