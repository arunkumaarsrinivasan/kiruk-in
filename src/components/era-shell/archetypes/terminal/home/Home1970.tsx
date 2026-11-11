"use client";

/**
 * The 1970 home. The loader showed the eye; here the visitor is behind it,
 * and what fills the view between the lids is one picture tube, the same tube
 * the work is shown on. On it is the research file the home has always held:
 * who the subject is, the seven records as cells, a dossier for the one
 * pointed at, and the ways out. A record opens on the same glass.
 *
 * The screen is drawn in cells (home-views.ts) and shown through the work's
 * tube shader (control-room/crt.ts). A hidden mirror of real headings, links
 * and buttons carries the same file for keyboards, screen readers and crawlers.
 *
 * Plan: docs/HOME_1970_PLAN.md
 */

import { VT323 } from "next/font/google";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { type Depth } from "@/data/about-story";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { useModules } from "@/contexts/ModuleContext";
import { Crt, unbend, type CrtGeometry } from "@/components/modules/work-os/control-room/crt";
import { ARROW } from "@/components/modules/work-os/control-room/pixel-icons";
import { CH, CW, rgb01, Surface } from "@/components/modules/work-os/control-room/surface";
import { readTubeConfig } from "@/components/modules/work-os/control-room/use-tube";
import {
  phosphorHex,
  plasmaHex,
  TUBE_DEFAULTS,
  TUBE_RANGE,
  type Area,
  type TubeConfig,
} from "@/components/modules/work-os/control-room/views";
import "@/components/modules/work-os/control-room/control-room.css";
import {
  BEATS,
  CARDS,
  CELLS,
  EMPATHY_MAP,
  IMPACT_METRICS,
  LINKS,
  RECORDS,
  SORTS,
  SUBJECT,
  TIMELINE,
  USABILITY_TEST,
  WHY_KIRUK,
  type RecordId,
} from "./home-model";
import { noteSent, restScenes } from "./home-scenes";
import { drawHome, type HomeDrawn, type HomeState } from "./home-views";

const vt323 = VT323({ weight: "400", subsets: ["latin"], display: "swap" });

/** The display settings are the work tube's: set once, they hold on both. */
const STORE = "kiruk-tube-1970";

const HOME_CSS = `
[data-terminal-shell]{display:none}
html:has(#home-1970),body:has(#home-1970){overflow:hidden}`;

/**
 * How long the tube keeps drawing after the last change while nothing moves by
 * itself. The phosphor fades by the clock and loses 0.006 a frame besides, so
 * even a full-white cell is black in about 0.3 s at 30 fps or faster.
 */
const QUIET_MS = 500;
/** A module panel covering the home: once its grow has finished, the tube under it rests. */
const COVERED_MS = 600;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const recordOf = (id: string | null) => RECORDS.find((r) => r.id === id) ?? null;

export function Home1970() {
  const router = useRouter();
  const { setLayoutMode } = useLayoutMode();
  const { open: openModule, openId: moduleOpen } = useModules();

  const [openId, setOpenId] = useState<RecordId | null>(null);
  /** The cell the pointer or the keys are on: a record, or "work". */
  const [onId, setOnId] = useState<string | null>(null);
  /** The way out the pointer is on, for the status line. */
  const [goId, setGoId] = useState<string | null>(null);
  /** The chosen item in each record's scene: a round, a moment, a ledge, a card. */
  const [picks, setPicks] = useState<Record<RecordId, number>>({
    why: 0,
    about: BEATS.length - 2,
    empathy: 0,
    journey: TIMELINE.length - 1,
    impact: 0,
    sort: 0,
    test: 0,
  });
  const [depth, setDepth] = useState<Depth>("skim");
  /** The column the card sorter sorts on. */
  const [tax, setTax] = useState<string>(SORTS[0].id);
  const [cfg, setCfg] = useState<TubeConfig>(TUBE_DEFAULTS);
  const [cfgOpen, setCfgOpen] = useState(false);
  const [ownCursor, setOwnCursor] = useState(false);
  /** WebGL claimed the canvas and then failed: the flat picture needs a canvas of its own. */
  const [noGl, setNoGl] = useState(false);
  const [stamp, setStamp] = useState("---------- --:-- UTC");

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const lastId = useRef<string | null>(null);
  const wantFocus = useRef<"open" | "board" | null>(null);

  // What the draw loop reads. It lives outside React so a frame never waits on a render.
  const dirty = useRef(true);
  const drawn = useRef<HomeDrawn>({ maxScroll: 0, cols: 4, count: 1 });
  const safe = useRef<Area>({ c: 2, r: 1, w: 60, h: 28 });
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const look = useRef<[number, number]>([0, 0]);
  const hover = useRef<string | null>(null);
  const scroll = useRef(0);
  const drag = useRef<{ y: number; scroll: number; moved: boolean } | null>(null);
  const slide = useRef<string | null>(null);
  const born = useRef(0);
  const relayout = useRef<() => void>(() => {});

  const open = recordOf(openId);
  const on = recordOf(onId);
  const pick = open ? picks[open.id] : 0;

  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  // The clock is read on the client only, so the server and the browser never disagree about it.
  useEffect(() => {
    const iso = new Date().toISOString();
    setStamp(`${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`);
  }, []);

  /* ── what the status line says ── */
  let status = "Point at a record · click to open it";
  const go = goId ? LINKS.find((l) => l.id === goId) : null;
  if (go) status = go.href ? `Go to ${go.label} · leaves this screen` : `${go.label} · opens over this screen`;
  else if (open) status = `${open.no} · ${open.label}${open.id === "about" ? ` · ${BEATS[pick].title}` : ` · ${open.sub}`}`;
  else if (on) status = `${on.no} · ${on.label} · ${on.sub}`;
  else if (onId === "work") status = "All work · leaves this screen for the work station";

  const view = useRef({ open, onId, pick, depth, tax, cfg, cfgOpen, stamp, status });
  view.current = { open, onId, pick, depth, tax, cfg, cfgOpen, stamp, status };
  useEffect(() => {
    dirty.current = true;
  });

  /* ── the display settings, shared with the work tube ── */
  useEffect(() => {
    setCfg(readTubeConfig());
  }, []);

  /* ── a module panel over the home: the tube under it can rest ── */
  const coveredAt = useRef(0);
  useEffect(() => {
    // the era picker is not an opaque panel, so the tube keeps playing under it
    coveredAt.current = moduleOpen && moduleOpen !== "eras" ? performance.now() : 0;
  }, [moduleOpen]);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(cfg));
    } catch {
      // the setting still holds for this visit
    }
  }, [cfg]);
  useEffect(() => {
    relayout.current();
  }, [cfg.curve]);

  /* ── opening, closing, leaving ── */
  const openRecord = useCallback((id: string, focus: boolean) => {
    if (!recordOf(id)) return;
    lastId.current = id;
    if (focus) wantFocus.current = "open";
    scroll.current = 0;
    restScenes();
    setOpenId(id as RecordId);
    setOnId(null);
  }, []);

  const close = useCallback(() => {
    wantFocus.current = "board";
    scroll.current = 0;
    restScenes();
    setOpenId(null);
  }, []);

  useEffect(() => {
    const want = wantFocus.current;
    wantFocus.current = null;
    if (want === "open" && openId) backRef.current?.focus({ preventScroll: true });
    else if (want === "board" && !openId && lastId.current) buttons.current.get(lastId.current)?.focus({ preventScroll: true });
  }, [openId]);

  const leave = useCallback(
    (id: string) => {
      const link = LINKS.find((l) => l.id === id);
      if (!link) return;
      if (link.href) router.push(link.href);
      else {
        const r = rootRef.current?.getBoundingClientRect();
        openModule(id === "era" ? "era-story" : "eras", r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
      }
    },
    [openModule, router],
  );

  // The nav's About link, a cold load of /#about, and the hash changing under a
  // mounted home all mean: open the About record here.
  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === "#about") openRecord("about", false);
    };
    fromHash();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href$="#about"]');
      if (a) openRecord("about", false);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", fromHash);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [openRecord]);

  const scrollBy = useCallback((rows: number) => {
    const next = clamp(scroll.current + rows, 0, drawn.current.maxScroll);
    if (next !== scroll.current) {
      scroll.current = next;
      dirty.current = true;
    }
  }, []);

  /** Choose an item of the open record's scene. */
  const choose = useCallback((n: number) => {
    const rec = view.current.open;
    if (!rec) return;
    scroll.current = 0;
    setPicks((p) => ({ ...p, [rec.id]: n }));
  }, []);

  /** Step to the next or the last item. The story stops at its ends; the others go round. */
  const stepItem = useCallback(
    (by: number) => {
      const v = view.current;
      if (!v.open) return;
      const n = Math.max(1, drawn.current.count);
      choose(v.open.id === "about" ? clamp(v.pick + by, 0, n - 1) : (v.pick + by + n) % n);
    },
    [choose],
  );

  /** Turn to the next or the last record. */
  const turn = useCallback(
    (by: number) => {
      const i = RECORDS.findIndex((r) => r.id === view.current.open?.id);
      if (i >= 0) openRecord(RECORDS[(i + by + RECORDS.length) % RECORDS.length].id, false);
    },
    [openRecord],
  );

  /** The arrow keys, on the glass and on the keyboard. Returns false at an edge. */
  const move = useCallback(
    (dx: number, dy: number): boolean => {
      const v = view.current;
      if (v.open) {
        if (dx) stepItem(dx);
        else scrollBy(dy * 3);
        return true;
      }
      const cols = Math.max(1, drawn.current.cols);
      let next: number;
      if (!v.onId) next = Math.max(0, CELLS.indexOf(lastId.current ?? ""));
      else {
        const i = CELLS.indexOf(v.onId);
        const col = i % cols;
        if (dx && (col + dx < 0 || col + dx >= cols)) return false;
        next = i + dx + dy * cols;
        if (next < 0 || next >= CELLS.length) return false;
      }
      const id = CELLS[next];
      lastId.current = id;
      const focused = document.activeElement;
      if (focused instanceof HTMLButtonElement && focused.dataset.cell) buttons.current.get(id)?.focus({ preventScroll: true });
      else setOnId(id);
      return true;
    },
    [scrollBy, stepItem],
  );

  const press = useCallback(
    (cell: string) => {
      if (cell === "work") leave("work");
      else openRecord(cell, true);
    },
    [leave, openRecord],
  );

  /** Press whatever the pointer is on. */
  const act = useCallback(
    (id: string) => {
      const v = view.current;
      const cut = id.indexOf(":");
      const kind = cut < 0 ? id : id.slice(0, cut);
      const arg = cut < 0 ? "" : id.slice(cut + 1);
      if (kind === "tube") setCfgOpen(true);
      else if (kind === "cfg") {
        if (arg === "close" || arg === "done") setCfgOpen(false);
        else if (arg === "replay") {
          born.current = performance.now();
          setCfgOpen(false);
        } else if (arg === "color") {
          setCfg((c) => ({ ...c, color: c.color === "crt" ? "plasma" : c.color === "plasma" ? "ice" : "crt" }));
        } else if (arg === "scan") setCfg((c) => ({ ...c, scan: !c.scan }));
        else if (arg === "hum") setCfg((c) => ({ ...c, hum: !c.hum }));
        else if (arg === "reset") setCfg(TUBE_DEFAULTS);
      } else if (kind === "rec") openRecord(arg, true);
      else if (kind === "mini") openRecord(arg, false);
      else if (kind === "go") leave(arg);
      else if (kind === "pick") choose(Number(arg));
      else if (kind === "step") stepItem(arg === "next" ? 1 : -1);
      else if (kind === "depth") {
        scroll.current = 0;
        setDepth(arg as Depth);
      } else if (kind === "tax") {
        scroll.current = 0;
        setTax(arg);
      } else if (kind === "proj") router.push(`/work/${arg}`);
      else if (kind === "chan") {
        const href = USABILITY_TEST.channels[Number(arg)]?.href;
        if (href) noteSent();
        if (href?.startsWith("http")) globalThis.open(href, "_blank", "noopener,noreferrer");
        else if (href) globalThis.location.assign(href);
      } else if (kind === "scroll") scrollBy(arg === "up" ? -6 : 6);
      else if (kind === "key") {
        if (arg === "b") {
          if (v.open) close();
        } else if (arg === "a") {
          if (!v.open) press(v.onId ?? lastId.current ?? CELLS[0]);
        } else if (arg === "left") move(-1, 0);
        else if (arg === "right") move(1, 0);
        else if (arg === "up") move(0, -1);
        else if (arg === "down") move(0, 1);
      }
    },
    [choose, close, leave, move, openRecord, press, router, scrollBy, stepItem],
  );

  /* ── the keys: they work from anywhere on the page, as long as nothing else is asking for them ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || moduleOpen) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (t && t !== document.body && !rootRef.current?.contains(t)) return;
      const v = view.current;
      if (v.cfgOpen) {
        if (e.key === "Escape") {
          setCfgOpen(false);
          e.preventDefault();
        }
        return;
      }
      const digit = /^[1-9]$/.test(e.key) ? RECORDS[Number(e.key) - 1] : undefined;
      if (v.open) {
        if (e.key === "Escape" || e.key === "Backspace") close();
        else if (e.key === "ArrowLeft") move(-1, 0);
        else if (e.key === "ArrowRight") move(1, 0);
        else if (e.key === "ArrowUp") scrollBy(-2);
        else if (e.key === "ArrowDown") scrollBy(2);
        else if (e.key === "PageUp") scrollBy(-8);
        else if (e.key === "PageDown") scrollBy(8);
        else if (e.key === "[" || e.key === "]") turn(e.key === "]" ? 1 : -1);
        else if (digit) openRecord(digit.id, false);
        else return;
        e.preventDefault();
        return;
      }
      const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (step) {
        if (move(step[0], step[1])) e.preventDefault();
        return;
      }
      if (digit) openRecord(digit.id, true);
      else if (e.key === "Enter" && (t === document.body || t === rootRef.current)) {
        const target = v.onId ?? lastId.current;
        if (!target) return;
        press(target);
      } else {
        const link = LINKS.find((l) => l.key === e.key.toLowerCase());
        if (!link) return;
        leave(link.id);
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, leave, moduleOpen, move, openRecord, press, scrollBy, turn]);

  /* ── the tube: one canvas, one loop ── */
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const family = vt323.style.fontFamily;
    let surface: Surface;
    try {
      surface = new Surface(family);
    } catch {
      return;
    }

    let crt = null as Crt | null;
    let flat = null as CanvasRenderingContext2D | null;
    const boot = () => {
      crt = null;
      flat = null;
      if (!noGl) {
        try {
          crt = new Crt(canvas, { fill: ARROW, width: 12, height: 17 });
          return;
        } catch {
          // no WebGL2: show the flat picture, unbent
        }
      }
      flat = canvas.getContext("2d");
      // a canvas WebGL claimed before it failed can never draw flat: start over on a fresh one
      if (!flat && !noGl) setNoGl(true);
    };
    boot();

    const fine = globalThis.matchMedia("(pointer: fine)");
    const still = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
    const syncCursor = () => setOwnCursor(Boolean(crt) && fine.matches);
    syncCursor();
    fine.addEventListener("change", syncCursor);

    let geo: CrtGeometry = { w: 1, h: 1, x0: 0, y0: 0, x1: 1, y1: 1, k: view.current.cfg.curve, radius: 24 };

    /** Fit the picture to the stage, and find the cells the eye's lids leave in view. */
    const layout = () => {
      const rect = root.getBoundingClientRect();
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
      const lidBottom = (x: number) => Math.max(0, bottom.mid + (bottom.edge - bottom.mid) * under(x) - (vh - rect.bottom));

      const pad = W < 560 ? 4 : 8;
      geo = {
        w: W,
        h: H,
        x0: pad,
        x1: W - pad,
        y0: Math.max(pad, lidTop(W / 2) + 3),
        y1: H - Math.max(pad, lidBottom(W / 2) + 3),
        k: view.current.cfg.curve,
        radius: W < 560 ? 18 : 28,
      };
      const pw = geo.x1 - geo.x0;
      const ph = Math.max(40, geo.y1 - geo.y0);
      // on a desk the board wants about a hundred columns, however tall the window is
      const rowPx = clamp(Math.min(ph / 34, pw >= 900 ? pw / 52 : Infinity), 18, 26);
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
      safe.current = { c: c0, r: r0, w: c1 - c0, h: r1 - r0 + 1 };

      crt?.resize(geo, surface.canvas.width, surface.canvas.height);
      if (!crt) {
        const d = Math.min(globalThis.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * d);
        canvas.height = Math.round(H * d);
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
    ro.observe(root);
    globalThis.addEventListener("resize", refit);
    // the nav measures its lids a moment after the page mounts
    const settle = globalThis.setTimeout(layout, 400);

    void document.fonts?.load(`20px ${family}`).then(() => {
      dirty.current = true;
    });

    const redraw = (time: number) => {
      const v = view.current;
      const now = new Date();
      const two = (n: number) => String(n).padStart(2, "0");
      const state: HomeState = {
        open: v.open,
        on: v.onId,
        scroll: scroll.current,
        pick: v.pick,
        depth: v.depth,
        tax: v.tax,
        tube: v.cfg.color,
        config: v.cfg,
        configOpen: v.cfgOpen,
        hover: hover.current,
        pointer: pointer.current,
        time: still.matches ? 0 : time,
        age: still.matches ? 99 : time - born.current / 1000,
        clock: `${two(now.getHours())}:${two(now.getMinutes())}:${two(now.getSeconds())}`,
        stamp: v.stamp,
        status: v.status,
        safe: safe.current,
      };
      drawn.current = drawHome(surface, state);
      scroll.current = Math.min(scroll.current, drawn.current.maxScroll);
    };

    let raf = 0;
    let last = performance.now();
    let lastTick = 0;
    born.current = last;
    /** When the tube last had something new to show; and what the pointer was then. */
    let changedAt = last;
    let seenPointer = pointer.current;
    let seenLook = look.current;
    /** The phosphor's colours, worked out again only when the setting changes. */
    let colorOf = "";
    let hot: [number, number, number] = [1, 1, 1];
    let tint: [number, number, number] = [1, 1, 1];

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const covered = coveredAt.current > 0 && t - coveredAt.current > COVERED_MS;
      if (document.hidden || covered) {
        last = t;
        return;
      }
      const dt = Math.min(5, (t - last) / 1000);
      last = t;
      // redrawn when something changed, ten times a second for the clock and what blinks,
      // and twice as often while a record's scene is playing; held still, only the clock moves, once a second
      const every = still.matches ? 1000 : view.current.open ? 50 : 100;
      const tick = t - lastTick > every;
      const fresh = dirty.current || tick;
      if (fresh) {
        if (tick) lastTick = t;
        dirty.current = false;
        redraw(t / 1000);
      }
      const set = view.current.cfg;
      if (set.color !== colorOf) {
        colorOf = set.color;
        hot = rgb01(plasmaHex(set.color));
        tint = rgb01(phosphorHex(set.color));
      }
      const warm = still.matches ? 1 : clamp((t - born.current) / 1100, 0, 1);
      const motion = !still.matches && set.hum;
      // Hum, flicker and grain move every frame, and so does the tube warming up.
      // Without them the glass changes only with the picture or the pointer; once
      // the phosphor has let go of the last change, another frame would be the same.
      if (fresh || motion || warm < 1 || pointer.current !== seenPointer || look.current !== seenLook) changedAt = t;
      seenPointer = pointer.current;
      seenLook = look.current;
      if (crt && t - changedAt < QUIET_MS) {
        crt.draw(surface.canvas, {
          time: t / 1000,
          dt,
          dirty: fresh,
          pointer: pointer.current,
          pointerColor: hover.current && hover.current !== "cfg:panel" ? hot : [0.95, 1, 0.96],
          tint,
          look: look.current,
          warm,
          motion,
          gain: set.gain,
          glow: set.glow,
          scan: set.scan,
        });
      } else if (flat && fresh) {
        const d = canvas.width / geo.w;
        flat.fillStyle = "#020302";
        flat.fillRect(0, 0, canvas.width, canvas.height);
        flat.imageSmoothingEnabled = false;
        flat.drawImage(surface.canvas, geo.x0 * d, geo.y0 * d, (geo.x1 - geo.x0) * d, (geo.y1 - geo.y0) * d);
      }
    };
    raf = requestAnimationFrame(frame);

    /* the pointer, mapped through the glass */
    const locate = (e: { clientX: number; clientY: number }) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (crt) return crt.map(x, y);
      const sx = ((x - geo.x0) / (geo.x1 - geo.x0)) * surface.canvas.width;
      const sy = ((y - geo.y0) / (geo.y1 - geo.y0)) * surface.canvas.height;
      return { x: sx, y: sy, inside: sx >= 0 && sy >= 0 && sx < surface.canvas.width && sy < surface.canvas.height };
    };

    const setHover = (id: string | null) => {
      if (id === hover.current) return;
      hover.current = id;
      dirty.current = true;
      const cut = id ? id.indexOf(":") : -1;
      const kind = id && cut > 0 ? id.slice(0, cut) : "";
      const arg = id && cut > 0 ? id.slice(cut + 1) : "";
      const cell = kind === "rec" ? arg : id === "go:work" && !view.current.open ? "work" : null;
      if (cell) lastId.current = cell;
      setOnId(cell);
      setGoId(kind === "go" && !cell ? arg : null);
    };

    /** Set a slider from where the pointer is along its track. */
    const setSlider = (id: string, x: number) => {
      const z = surface.zones.find((zone) => zone.id === id);
      const key = id.slice(4) as keyof typeof TUBE_RANGE;
      if (!z || !(key in TUBE_RANGE)) return;
      const [lo, hi] = TUBE_RANGE[key];
      const at = clamp((x - z.x - 4) / (z.w - 8), 0, 1);
      setCfg((c) => ({ ...c, [key]: Math.round((lo + (hi - lo) * at) * 200) / 200 }));
    };

    const onMove = (e: PointerEvent) => {
      const m = locate(e);
      if (slide.current) {
        setSlider(slide.current, m.x);
        if (e.pointerType === "mouse") pointer.current = m.inside ? { x: m.x, y: m.y } : null;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      look.current = [((e.clientX - rect.left) / rect.width) * 2 - 1, ((e.clientY - rect.top) / rect.height) * 2 - 1];
      const d = drag.current;
      if (d) {
        // a finger drags the page inside the tube
        if (Math.abs(d.y - m.y) > 8) d.moved = true;
        const next = clamp(d.scroll + Math.round((d.y - m.y) / CH), 0, drawn.current.maxScroll);
        if (next !== scroll.current) {
          scroll.current = next;
          dirty.current = true;
        }
        return;
      }
      if (e.pointerType !== "mouse") return;
      pointer.current = m.inside ? { x: m.x, y: m.y } : null;
      setHover(m.inside ? surface.hit(m.x, m.y) : null);
      // the figure, the moth and the Pong paddle all answer the pointer as it moves
      dirty.current = true;
    };
    const onLeave = () => {
      pointer.current = null;
      drag.current = null;
      setHover(null);
    };
    const onDown = (e: PointerEvent) => {
      root.focus({ preventScroll: true });
      const m = locate(e);
      const id = m.inside ? surface.hit(m.x, m.y) : null;
      if (id === "cfg:gain" || id === "cfg:curve" || id === "cfg:glow") {
        slide.current = id;
        canvas.setPointerCapture(e.pointerId);
        setSlider(id, m.x);
        return;
      }
      if (e.pointerType !== "mouse" && view.current.open && !view.current.cfgOpen) {
        drag.current = { y: m.y, scroll: scroll.current, moved: false };
      }
    };
    const onUp = () => {
      slide.current = null;
      // keep a drag from landing as a press: the click comes right after this
      if (drag.current?.moved) setTimeout(() => (drag.current = null), 0);
      else drag.current = null;
    };
    const onClick = (e: MouseEvent) => {
      if (drag.current?.moved) return;
      const m = locate(e);
      const id = m.inside ? surface.hit(m.x, m.y) : null;
      if (id) act(id);
    };
    const onWheel = (e: WheelEvent) => {
      if (!view.current.open || drawn.current.maxScroll <= 0) return;
      e.preventDefault();
      scrollBy(Math.sign(e.deltaY) * 3);
    };
    const onLost = (e: Event) => e.preventDefault();
    const onRestored = () => {
      boot();
      layout();
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fitting);
      globalThis.clearTimeout(settle);
      ro.disconnect();
      globalThis.removeEventListener("resize", refit);
      fine.removeEventListener("change", syncCursor);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      crt?.dispose();
    };
  }, [act, scrollBy, noGl]);

  /* ── the mirror: the same file as real headings, links and buttons ── */
  return (
    <div id="home-1970" style={{ position: "fixed", inset: 0, zIndex: 1, backgroundColor: "#030403" }}>
      <style>{HOME_CSS}</style>
      <div className="cr-host">
        <div ref={rootRef} className="cr" tabIndex={-1} data-own-cursor={ownCursor ? "" : undefined}>
          <canvas key={noGl ? "flat" : "glass"} ref={canvasRef} className="cr-canvas" aria-hidden />

          <div className="cr-mirror">
            <h1>{SUBJECT.name}</h1>
            <p>
              {SUBJECT.role}. {SUBJECT.place}.
            </p>
            <p>{SUBJECT.framing}</p>
            <nav aria-label="Go to">
              {LINKS.map((l) =>
                l.href ? (
                  <a key={l.id} href={l.href}>
                    {l.label}
                  </a>
                ) : (
                  <button key={l.id} type="button" onClick={() => leave(l.id)}>
                    {l.label}
                  </button>
                ),
              )}
            </nav>
            {open ? (
              <button ref={backRef} type="button" onClick={close}>
                Back to the whole file
              </button>
            ) : null}
            <h2>Research file, {RECORDS.length} records</h2>
            <ul>
              {RECORDS.map((rec) => (
                <li key={rec.id}>
                  <button
                    type="button"
                    data-cell={rec.id}
                    aria-pressed={openId === rec.id}
                    ref={(el) => {
                      if (el) buttons.current.set(rec.id, el);
                      else buttons.current.delete(rec.id);
                    }}
                    onFocus={() => {
                      lastId.current = rec.id;
                      if (!openId) setOnId(rec.id);
                    }}
                    onBlur={() => setOnId((p) => (p === rec.id ? null : p))}
                    onClick={() => openRecord(rec.id, true)}
                  >
                    Record {rec.no}, {rec.label}: {rec.sub}. Show it on the screen.
                  </button>
                </li>
              ))}
            </ul>

            <section aria-label="Record 001, Why Kiruk">
              <h3>Why Kiruk</h3>
              <p>{WHY_KIRUK.hook}</p>
              <p>{WHY_KIRUK.pain}</p>
              <p>{WHY_KIRUK.bridge}</p>
              <p>{WHY_KIRUK.tagline}</p>
            </section>
            <section id="about" aria-label="Record 002, About">
              <h3>About</h3>
              {BEATS.map((b) => (
                <div key={b.id}>
                  <h4>
                    {b.period}, {b.place}: {b.title}
                  </h4>
                  <p>{b.read}</p>
                </div>
              ))}
            </section>
            <section aria-label="Record 003, Empathy map">
              <h3>Empathy map</h3>
              <p>Says: {EMPATHY_MAP.says.quote}</p>
              <p>Skills: {EMPATHY_MAP.says.skills.join(", ")}</p>
              <p>Thinks: {EMPATHY_MAP.thinks.join(". ")}</p>
              <p>Does: {EMPATHY_MAP.does.join(", ")}</p>
              <p>Feels: {EMPATHY_MAP.feels.join(". ")}</p>
            </section>
            <section aria-label="Record 004, Journey map">
              <h3>Journey map</h3>
              <ol>
                {TIMELINE.map((n) => (
                  <li key={n.year}>
                    {n.year}, {n.phase}: {n.position}, {n.org}. {n.detail}
                  </li>
                ))}
              </ol>
            </section>
            <section aria-label="Record 005, Impact">
              <h3>Impact</h3>
              <ul>
                {IMPACT_METRICS.slice(0, 8).map((m) => (
                  <li key={m.id}>
                    {m.value} {m.label}
                    {m.context ? `, ${m.context}` : ""}
                  </li>
                ))}
              </ul>
            </section>
            <section aria-label="Record 006, Card sort">
              <h3>Card sort</h3>
              <ul>
                {CARDS.map((p) => (
                  <li key={p.id}>
                    <a href={`/work/${p.id}`}>{p.title}</a>: {p.description} {p.role}. Kind: {p.kind}. Place: {p.place}.{" "}
                    {p.technologies.join(", ")}. {p.duration}.
                  </li>
                ))}
              </ul>
            </section>
            <section aria-label="Record 007, Usability test">
              <h3>Usability test</h3>
              <p>
                Task: {USABILITY_TEST.task}. {USABILITY_TEST.taskBody}
              </p>
              <p>{USABILITY_TEST.successMetrics.join(". ")}</p>
              {USABILITY_TEST.channels.map((ch) => (
                <a
                  key={ch.label}
                  href={ch.href}
                  target={ch.href.startsWith("http") ? "_blank" : undefined}
                  rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {ch.label}: {ch.value}
                </a>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home1970;
