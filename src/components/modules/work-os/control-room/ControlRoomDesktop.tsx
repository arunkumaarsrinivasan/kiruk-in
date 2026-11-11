"use client";

import { VT323 } from "next/font/google";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { WORK_SHOW } from "@/data/work-show";
import type { DesktopProps, WorkCaseDigest } from "../types";
import { useFocusProject } from "../use-focus-project";
import { buildBoard, CLS_LABEL, type Cls, type Unit } from "./model";
import { loadPicture } from "./picture";
import { CW, type Surface } from "./surface";
import { useTube, useTubeConfig, type Pt } from "./use-tube";
import { drawScreen, TINT, TUBE_DEFAULTS, TUBE_RANGE, type Drawn, type TabId, type TubeConfig } from "./views";
import "./control-room.css";

const vt323 = VT323({ weight: "400", subsets: ["latin"], display: "swap" });

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
  const [cfg, setCfg] = useTubeConfig();
  const [cfgOpen, setCfgOpen] = useState(false);
  /** The open work's pictures, dithered for the tube, and which one is showing. */
  const [pics, setPics] = useState<(HTMLCanvasElement | null)[]>([]);
  const [pic, setPic] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const lastId = useRef<string | null>(null);
  const wantFocus = useRef<"open" | "board" | null>(null);

  // What the draw loop reads. It lives outside React so a frame never waits on a render.
  const drawn = useRef<Drawn>({ maxScroll: 0, textCols: 0, cols: 6, tabs: [] });
  const levels = useRef<number[] | null>(null);
  const scroll = useRef(0);

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

  /* ── the tube: one canvas, one loop (use-tube.ts); the screen is views.ts ── */
  const tube = useTube(
    rootRef,
    canvasRef,
    {
      draw: (s, f) => {
        const v = view.current;
        const now = new Date();
        const two = (n: number) => String(n).padStart(2, "0");
        drawn.current = drawScreen(s, {
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
          pointer: f.pointer,
          pics: v.pics,
          pic: v.pic,
          hover: f.hover,
          levels: levels.current,
          time: f.now,
          clock: `${two(now.getHours())}:${two(now.getMinutes())}:${two(now.getSeconds())}`,
          status: v.status,
          safe: f.safe,
        });
        scroll.current = Math.min(scroll.current, drawn.current.maxScroll);
      },
      act: (id) => act(id),
      hover: (id) => {
        const cut = id ? id.indexOf(":") : -1;
        const kind = id && cut > 0 ? id.slice(0, cut) : "";
        const arg = id && cut > 0 ? id.slice(cut + 1) : "";
        point(kind === "tile" || kind === "bar" ? arg : null);
        // pointing at a kind is a new question: the dossier lets go of its project
        if (kind === "kind") setHeldId(null);
        setHoverCls(kind === "kind" && arg !== "all" ? (arg as Cls) : null);
        setMiniId(kind === "mini" ? arg : null);
      },
      // a scene on screen answers the pointer, so it is drawn again as the pointer moves
      point: (p, s) => shine(p, s) || Boolean(view.current.open || view.current.held),
      leave: () => setHeldId(null),
    },
    {
      family: vt323.style.fontFamily,
      settings: { config: cfg, set: setCfg, panel: setCfgOpen },
      // ten times a second for what moves by itself, twice as often while a work's scene is playing;
      // held still, only the clock moves, once a second
      every: (still) => (still ? 1000 : view.current.open || view.current.held ? 50 : 100),
      scroll: {
        at: scroll,
        max: () => (view.current.open ? drawn.current.maxScroll : 0),
        touch: () => Boolean(view.current.open && !view.current.cfgOpen),
      },
      fingerPoints: false,
      wide: false,
    },
  );
  const { scrollBy } = tube;

  /** How far each cell is from the pointer, in cells of its own size: the pointer is the light. Returns whether that changed. */
  const shine = (p: Pt | null, s: Surface): boolean => {
    if (!p || view.current.open) {
      if (!levels.current) return false;
      levels.current = null;
      return true;
    }
    const next = view.current.board.units.map((u) => {
      const z = s.zones.find((zone) => zone.id === `tile:${u.id}`);
      if (!z) return 2;
      const dx = Math.max(z.x - p.x, 0, p.x - (z.x + z.w)) / z.w;
      const dy = Math.max(z.y - p.y, 0, p.y - (z.y + z.h)) / z.h;
      const d = Math.hypot(dx, dy);
      return d === 0 ? 0 : d < 0.6 ? 1 : d < 1.5 ? 2 : 3;
    });
    const prev = levels.current;
    if (prev && !next.some((n, i) => n !== prev[i])) return false;
    levels.current = next;
    return true;
  };

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
      // the display settings' own zones are the tube's
      if (kind === "pic") {
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
      <div ref={rootRef} className="cr" tabIndex={-1} data-own-cursor={tube.ownCursor ? "" : undefined} onKeyDown={onKeyDown}>
        <canvas key={tube.glass} ref={canvasRef} className="cr-canvas" aria-hidden />

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
