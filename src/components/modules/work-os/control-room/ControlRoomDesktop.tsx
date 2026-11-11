"use client";

import { VT323 } from "next/font/google";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { WORK_SHOW } from "@/data/work-show";
import type { DesktopProps, WorkCaseDigest } from "../types";
import { useFocusProject } from "../use-focus-project";
import { Crt, unbend, type CrtGeometry } from "./crt";
import { buildBoard, CLS_LABEL, type Cls, type Unit } from "./model";
import { loadPicture } from "./picture";
import { ARROW } from "./pixel-icons";
import { CH, CW, rgb01, Surface } from "./surface";
import { readTubeConfig } from "./use-tube";
import {
  drawScreen,
  phosphorHex,
  plasmaHex,
  TINT,
  TUBE_DEFAULTS,
  TUBE_RANGE,
  type Area,
  type Drawn,
  type TabId,
  type TubeConfig,
  type ViewState,
} from "./views";
import "./control-room.css";

const vt323 = VT323({ weight: "400", subsets: ["latin"], display: "swap" });

/** Where the visitor's display settings are kept between visits. */
const STORE = "kiruk-tube-1970";

/**
 * How long the tube keeps drawing after the last change while nothing moves by
 * itself. The phosphor fades by the clock and loses 0.006 a frame besides, so
 * even a full-white cell is black in about 0.3 s at 30 fps or faster.
 */
const QUIET_MS = 500;

const STATUS: Record<string, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  planned: "Planned",
};

const LINK_LABEL: Record<string, string> = {
  live: "Live site",
  demo: "Demo",
  figma: "Figma",
  behance: "Behance",
  github: "Source",
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * 1970: the work on one picture tube. The whole interface is a character
 * screen drawn on a small canvas (views.ts) and shown through a tube shader
 * (crt.ts): curved glass, scan lines, bloom and phosphor that holds its glow.
 * The pointer is mapped through the same curve, so what it points at is what
 * it presses. A hidden list of real buttons and text mirrors the screen for
 * keyboards and screen readers.
 */
export function ControlRoomDesktop({ projects, focusId, cases }: DesktopProps) {
  const board = useMemo(() => buildBoard(projects, new Date()), [projects]);
  const { units } = board;
  const byId = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);
  const caseOf = useMemo(() => {
    const map = new Map<string, WorkCaseDigest>();
    for (const c of cases ?? []) {
      map.set(c.project, c);
      for (const id of c.also) map.set(id, c);
    }
    return map;
  }, [cases]);

  const [openId, setOpenId] = useState<string | null>(null);
  /** A narrow tube starts a project on ABOUT; a wide one has no such tab and falls to the first it has. */
  const [tab, setTab] = useState<TabId>("about");
  /** The project the pointer or the keys are on. */
  const [onId, setOnId] = useState<string | null>(null);
  /** The last project pointed at; the dossier holds it while the pointer is on the glass. */
  const [heldId, setHeldId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Cls | null>(null);
  const [hoverCls, setHoverCls] = useState<Cls | null>(null);
  /** The mini key under the pointer on a project's screen. */
  const [miniId, setMiniId] = useState<string | null>(null);
  const [cfg, setCfg] = useState<TubeConfig>(TUBE_DEFAULTS);
  const [cfgOpen, setCfgOpen] = useState(false);
  /** The open work's pictures, dithered for the tube, and which one is showing. */
  const [pics, setPics] = useState<(HTMLCanvasElement | null)[]>([]);
  const [pic, setPic] = useState(0);
  /** The tube draws its own pointer, so the system one is hidden. */
  const [ownCursor, setOwnCursor] = useState(false);
  /** WebGL claimed the canvas and then failed: the flat picture needs a canvas of its own. */
  const [noGl, setNoGl] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const lastId = useRef<string | null>(null);
  const wantFocus = useRef<"open" | "board" | null>(null);

  // What the draw loop reads. It lives outside React so a frame never waits on a render.
  const dirty = useRef(true);
  const drawn = useRef<Drawn>({ maxScroll: 0, textCols: 0, cols: 6, tabs: [] });
  const safe = useRef<Area>({ c: 2, r: 1, w: 60, h: 28 });
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const look = useRef<[number, number]>([0, 0]);
  const hover = useRef<string | null>(null);
  const levels = useRef<number[] | null>(null);
  const scroll = useRef(0);
  const drag = useRef<{ y: number; scroll: number; moved: boolean } | null>(null);
  /** The slider being dragged, by its zone. */
  const slide = useRef<string | null>(null);
  /** When the tube last began to warm up. */
  const born = useRef(0);
  const relayout = useRef<() => void>(() => {});

  const open = openId ? (byId.get(openId) ?? null) : null;
  const on = onId ? (byId.get(onId) ?? null) : null;
  const held = on ?? (heldId ? (byId.get(heldId) ?? null) : null);
  const shownCls = hoverCls ?? filter;

  /* ── what the status line says ── */
  let status = "Point at a screen · click to open it";
  if (open) {
    const mini = miniId ? byId.get(miniId) : null;
    status =
      mini && mini.id !== open.id
        ? `Switch to ${mini.no} · ${mini.label}`
        : `${open.no} · ${open.label} · on the main screen`;
  } else if (held) {
    status = `${held.no} · ${held.label} · ${held.project.description}`;
  } else if (shownCls) {
    const n = units.filter((u) => u.cls === shownCls).length;
    status = `${CLS_LABEL[shownCls]} · ${n} project${n === 1 ? "" : "s"} lit`;
  }

  const view = useRef({ board, caseOf, open, tab, held, onId, shownCls, filter, cfg, cfgOpen, pics, pic, status });
  view.current = { board, caseOf, open, tab, held, onId, shownCls, filter, cfg, cfgOpen, pics, pic, status };
  useEffect(() => {
    dirty.current = true;
  });

  /* ── the display settings: kept between visits, and the glass refitted when its curve changes ── */
  useEffect(() => {
    setCfg(readTubeConfig());
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(cfg));
    } catch {
      // nothing to do: the setting still holds for this visit
    }
  }, [cfg]);
  useEffect(() => {
    relayout.current();
  }, [cfg.curve]);

  /* ── the open work's pictures, redrawn in the tube's shades ── */
  const openKey = open ? `${open.id}:${open.tint}` : "";
  useEffect(() => {
    setPic(0);
    const [id, tint] = openKey.split(":");
    const media = WORK_SHOW[id]?.media ?? [];
    setPics(media.map(() => null));
    if (!media.length) return;
    let live = true;
    const maxW = Math.max(160, Math.min(560, (drawn.current.textCols || 44) * CW));
    media.forEach((m, i) => {
      loadPicture(m.src, maxW, 300, TINT[tint as keyof typeof TINT])
        .then((canvas) => {
          if (live) setPics((prev) => prev.map((old, j) => (j === i ? canvas : old)));
        })
        .catch(() => {
          // a missing picture leaves its caption and its words
        });
    });
    return () => {
      live = false;
    };
  }, [openKey]);

  /* ── pointing, opening, stepping ── */
  const point = useCallback((id: string | null) => {
    if (id) {
      lastId.current = id;
      setHeldId(id);
    }
    setOnId(id);
  }, []);

  const openUnit = useCallback(
    (id: string, focus: boolean) => {
      if (!byId.has(id)) return;
      lastId.current = id;
      if (focus) wantFocus.current = "open";
      scroll.current = 0;
      levels.current = null;
      setOpenId(id);
      setOnId(null);
    },
    [byId],
  );

  const close = useCallback(() => {
    wantFocus.current = "board";
    scroll.current = 0;
    setOpenId(null);
    setTab("about");
  }, []);

  useEffect(() => {
    const want = wantFocus.current;
    wantFocus.current = null;
    if (want === "open" && openId) backRef.current?.focus({ preventScroll: true });
    else if (want === "board" && !openId && lastId.current) {
      buttons.current.get(lastId.current)?.focus({ preventScroll: true });
    }
  }, [openId]);

  useFocusProject(focusId, (id) => openUnit(id, false));

  const pickTab = useCallback((t: TabId) => {
    scroll.current = 0;
    setTab(t);
  }, []);

  const scrollBy = useCallback((rows: number) => {
    const next = clamp(scroll.current + rows, 0, drawn.current.maxScroll);
    if (next !== scroll.current) {
      scroll.current = next;
      dirty.current = true;
    }
  }, []);

  /** The arrow keys, on the glass and on the keyboard. Returns false at an edge. */
  const move = useCallback(
    (dx: number, dy: number): boolean => {
      const v = view.current;
      if (!units.length) return false;
      if (v.open) {
        if (dx) {
          const i = units.findIndex((u) => u.id === v.open?.id);
          openUnit(units[(i + dx + units.length) % units.length].id, false);
        } else {
          scrollBy(dy * 3);
        }
        return true;
      }
      const cols = Math.max(1, drawn.current.cols);
      let next: number;
      if (!v.onId) {
        next = Math.max(0, units.findIndex((u) => u.id === lastId.current));
      } else {
        const i = units.findIndex((u) => u.id === v.onId);
        const col = i % cols;
        if (dx && (col + dx < 0 || col + dx >= cols)) return false;
        next = i + dx + dy * cols;
        if (next < 0 || next >= units.length) return false;
      }
      const id = units[next].id;
      const focused = document.activeElement;
      if (focused instanceof HTMLButtonElement && focused.dataset.unit) {
        buttons.current.get(id)?.focus({ preventScroll: true });
      } else {
        point(id);
      }
      return true;
    },
    [units, openUnit, point, scrollBy],
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
      } else if (kind === "pic") {
        const n = v.open ? (WORK_SHOW[v.open.id]?.media.length ?? 0) : 0;
        if (n) setPic((i) => (i + (arg === "next" ? 1 : n - 1)) % n);
      } else if (kind === "text") {
        // the same work as a plain page in this era, for anyone the tube does not suit
        if (v.open) globalThis.location.assign(`/work/${v.open.id}/read`);
      } else if (kind === "read") {
        // from the head: the open work's page, or the list of all of them
        globalThis.location.assign(v.open ? `/work/${v.open.id}/read` : "/work/read");
      }
      else if (kind === "tile" || kind === "bar") openUnit(arg, true);
      else if (kind === "mini") openUnit(arg, false);
      else if (kind === "kind") setFilter((f) => (arg === "all" || f === arg ? null : (arg as Cls)));
      else if (kind === "tab") pickTab(arg as TabId);
      else if (kind === "scroll") scrollBy(arg === "up" ? -6 : 6);
      else if (kind === "link") {
        const href = (v.open?.project.links as Record<string, string | undefined> | undefined)?.[arg];
        if (href) globalThis.open(href, "_blank", "noopener,noreferrer");
      } else if (kind === "case") {
        const href = v.open ? v.caseOf.get(v.open.id)?.links[Number(arg)]?.href : undefined;
        if (href) globalThis.open(href, "_blank", "noopener,noreferrer");
      } else if (kind === "key") {
        if (arg === "b") {
          if (v.open) close();
        } else if (arg === "a") {
          const target = v.onId ?? lastId.current ?? units[0]?.id;
          if (!v.open && target) openUnit(target, true);
        } else if (arg === "left") move(-1, 0);
        else if (arg === "right") move(1, 0);
        else if (arg === "up") move(0, -1);
        else if (arg === "down") move(0, 1);
      }
    },
    [close, move, openUnit, pickTab, scrollBy, units],
  );

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (cfgOpen) {
      if (e.key === "Escape") {
        setCfgOpen(false);
        e.preventDefault();
      }
      return;
    }
    const tabs = drawn.current.tabs;
    if (open) {
      if (e.key === "Escape" || e.key === "Backspace") close();
      else if (e.key === "ArrowLeft") move(-1, 0);
      else if (e.key === "ArrowRight") move(1, 0);
      else if (e.key === "ArrowUp") scrollBy(-2);
      else if (e.key === "ArrowDown") scrollBy(2);
      else if (e.key === "PageUp") scrollBy(-8);
      else if (e.key === "PageDown") scrollBy(8);
      else if ((e.key === "[" || e.key === "]") && tabs.length) {
        const i = Math.max(0, tabs.indexOf(tab));
        pickTab(tabs[(i + (e.key === "]" ? 1 : -1) + tabs.length) % tabs.length]);
      } else if (/^[1-9]$/.test(e.key) && tabs[Number(e.key) - 1]) pickTab(tabs[Number(e.key) - 1]);
      else return;
      e.preventDefault();
      return;
    }
    const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (step) {
      if (move(step[0], step[1])) e.preventDefault();
    } else if (e.key === "Enter" && e.target === rootRef.current) {
      const target = onId ?? lastId.current;
      if (target) openUnit(target, true);
    }
  };

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

    // Both are set inside boot(), so they are typed by assertion rather than by their first value.
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
        k: view.current.cfg.curve,
        radius: W < 560 ? 18 : 28,
      };
      const pw = geo.x1 - geo.x0;
      const ph = Math.max(40, geo.y1 - geo.y0);
      const rowPx = clamp(ph / 34, 18, 26);
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
      const state: ViewState = {
        board: v.board,
        cases: v.caseOf,
        open: v.open,
        tab: v.tab,
        scroll: scroll.current,
        peek: v.held,
        onId: v.onId,
        shownCls: v.shownCls,
        filter: v.filter,
        tube: v.cfg.color,
        config: v.cfg,
        configOpen: v.cfgOpen,
        pointer: pointer.current,
        pics: v.pics,
        pic: v.pic,
        hover: hover.current,
        levels: levels.current,
        time: still.matches ? 0 : time,
        clock: `${two(now.getHours())}:${two(now.getMinutes())}:${two(now.getSeconds())}`,
        status: v.status,
        safe: safe.current,
      };
      drawn.current = drawScreen(surface, state);
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
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(root);

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !visible) {
        last = t;
        return;
      }
      const dt = Math.min(5, (t - last) / 1000);
      last = t;
      // the picture is redrawn when something changed, and ten times a second for what moves by itself,
      // twice as often while a work's scene is playing; held still, only the clock moves, once a second
      const every = still.matches ? 1000 : view.current.open || view.current.held ? 50 : 100;
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
      point(kind === "tile" || kind === "bar" ? arg : null);
      // pointing at a kind is a new question: the dossier lets go of its project
      if (kind === "kind") setHeldId(null);
      setHoverCls(kind === "kind" && arg !== "all" ? (arg as Cls) : null);
      setMiniId(kind === "mini" ? arg : null);
    };

    /** How far each cell is from the pointer, in cells of its own size: the pointer is the light. */
    const shine = (p: { x: number; y: number } | null) => {
      if (!p || view.current.open) {
        if (levels.current) {
          levels.current = null;
          dirty.current = true;
        }
        return;
      }
      const next = view.current.board.units.map((u) => {
        const z = surface.zones.find((zone) => zone.id === `tile:${u.id}`);
        if (!z) return 2;
        const dx = Math.max(z.x - p.x, 0, p.x - (z.x + z.w)) / z.w;
        const dy = Math.max(z.y - p.y, 0, p.y - (z.y + z.h)) / z.h;
        const d = Math.hypot(dx, dy);
        return d === 0 ? 0 : d < 0.6 ? 1 : d < 1.5 ? 2 : 3;
      });
      const prev = levels.current;
      if (!prev || next.some((n, i) => n !== prev[i])) {
        levels.current = next;
        dirty.current = true;
      }
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
      shine(m.inside ? m : null);
      // a scene on screen answers the pointer, so it is drawn again as the pointer moves
      if (view.current.open || view.current.held) dirty.current = true;
    };
    const onLeave = () => {
      pointer.current = null;
      drag.current = null;
      setHover(null);
      shine(null);
      setHeldId(null);
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
        drag.current = { y: locate(e).y, scroll: scroll.current, moved: false };
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
      io.disconnect();
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
  }, [act, point, scrollBy, noGl]);

  /* ── the mirror: the same screen as real buttons and text ── */
  const kase = open ? caseOf.get(open.id) : undefined;
  const links = open
    ? (Object.entries(open.project.links ?? {}).filter(([, v]) => typeof v === "string" && v) as [string, string][])
    : [];

  const facts = (u: Unit) => (
    <dl>
      <dt>Role</dt>
      <dd>{u.project.role}</dd>
      <dt>When</dt>
      <dd>
        {u.period}, {u.project.timeline.duration}
      </dd>
      <dt>Kind</dt>
      <dd>{CLS_LABEL[u.cls]}</dd>
      <dt>State</dt>
      <dd>
        {STATUS[u.project.status] ?? u.project.status}
        {u.nda ? ", under NDA" : ""}
      </dd>
    </dl>
  );

  return (
    <div className="cr-host">
      <div ref={rootRef} className="cr" tabIndex={-1} data-own-cursor={ownCursor ? "" : undefined} onKeyDown={onKeyDown}>
        <canvas key={noGl ? "flat" : "glass"} ref={canvasRef} className="cr-canvas" aria-hidden />

        <div className="cr-mirror">
          <fieldset onFocus={() => setCfgOpen(true)} onBlur={() => setCfgOpen(false)}>
            <legend>Display settings</legend>
            {(["gain", "curve", "glow"] as const).map((key) => (
              <label key={key}>
                {key === "gain" ? "Phosphor gain" : key === "curve" ? "Lens curvature" : "Glyph glow"}
                <input
                  type="range"
                  min={TUBE_RANGE[key][0]}
                  max={TUBE_RANGE[key][1]}
                  step={(TUBE_RANGE[key][1] - TUBE_RANGE[key][0]) / 40}
                  value={cfg[key]}
                  onChange={(e) => setCfg((c) => ({ ...c, [key]: Number(e.target.value) }))}
                />
              </label>
            ))}
            <label>
              Phosphor colour
              <select value={cfg.color} onChange={(e) => setCfg((c) => ({ ...c, color: e.target.value as TubeConfig["color"] }))}>
                <option value="crt">Green</option>
                <option value="plasma">Plasma orange</option>
                <option value="ice">Blue</option>
              </select>
            </label>
            <label>
              <input type="checkbox" checked={cfg.scan} onChange={(e) => setCfg((c) => ({ ...c, scan: e.target.checked }))} />
              Scan lines
            </label>
            <label>
              <input type="checkbox" checked={cfg.hum} onChange={(e) => setCfg((c) => ({ ...c, hum: e.target.checked }))} />
              Hum and flicker
            </label>
            <button type="button" onClick={() => setCfg(TUBE_DEFAULTS)}>
              Restore display defaults
            </button>
          </fieldset>
          {open ? (
            <article aria-label={`${open.label}, project ${open.no} of ${units.length}`}>
              <button ref={backRef} type="button" onClick={close}>
                Back to all projects
              </button>
              <a href={`/work/${open.id}/read`}>This work as a plain page</a>
              <h2>{open.label}</h2>
              <p>{open.project.description}</p>
              <p>{open.project.longDescription}</p>
              {facts(open)}
              <h3>What I built</h3>
              <ul>
                {open.project.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {open.project.metrics?.impact ? <p>Impact: {open.project.metrics.impact}</p> : null}
              <h3>Stack</h3>
              <p>{open.project.technologies.join(", ")}</p>
              {kase ? (
                <>
                  <h3>
                    Full case: {kase.title}, {kase.when}
                  </h3>
                  <p>{kase.pitch}</p>
                  <ul>
                    {[kase.lead ?? kase.headline, ...kase.stats].map((st) => (
                      <li key={st.label}>
                        {st.value} {st.label}
                      </li>
                    ))}
                    {kase.iterations.map((it) => (
                      <li key={it.title}>
                        {it.tag}, {it.when}: {it.title}. {it.note}
                      </li>
                    ))}
                  </ul>
                  {kase.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ))}
                </>
              ) : null}
              {links.map(([kind, href]) => (
                <a key={kind} href={href} target="_blank" rel="noopener noreferrer">
                  {LINK_LABEL[kind] ?? kind}
                </a>
              ))}
            </article>
          ) : (
            <>
              <h2>
                {units.length} projects, {board.firstYear} to {board.lastYear}
              </h2>
              <ul>
                {units.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      data-unit={u.id}
                      ref={(el) => {
                        if (el) buttons.current.set(u.id, el);
                        else buttons.current.delete(u.id);
                      }}
                      onFocus={() => point(u.id)}
                      onBlur={() => setOnId((p) => (p === u.id ? null : p))}
                      onClick={() => openUnit(u.id, true)}
                    >
                      {u.label}: {u.project.description}. {u.year}, {CLS_LABEL[u.cls]}.
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
