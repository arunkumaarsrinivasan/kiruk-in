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
import { useTube, useTubeConfig } from "@/components/modules/work-os/control-room/use-tube";
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
import { drawHome, type HomeDrawn } from "./home-views";

const vt323 = VT323({ weight: "400", subsets: ["latin"], display: "swap" });

const HOME_CSS = `
[data-terminal-shell]{display:none}
html:has(#home-1970),body:has(#home-1970){overflow:hidden}`;

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
  const [cfg, setCfg] = useTubeConfig();
  const [cfgOpen, setCfgOpen] = useState(false);
  const [stamp, setStamp] = useState("---------- --:-- UTC");

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const lastId = useRef<string | null>(null);
  const wantFocus = useRef<"open" | "board" | null>(null);

  // What the draw loop reads. It lives outside React so a frame never waits on a render.
  const drawn = useRef<HomeDrawn>({ maxScroll: 0, cols: 4, count: 1 });
  const scroll = useRef(0);

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

  /* ── a module panel over the home: once its grow has finished, the tube under it can rest ── */
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    setCovered(false);
    // the era picker is not an opaque panel, so the tube keeps playing under it
    if (!moduleOpen || moduleOpen === "eras") return;
    const id = globalThis.setTimeout(() => setCovered(true), COVERED_MS);
    return () => globalThis.clearTimeout(id);
  }, [moduleOpen]);

  /* ── the tube: one canvas, one loop (use-tube.ts); the screen is home-views.ts ── */
  const tube = useTube(
    rootRef,
    canvasRef,
    {
      draw: (s, f) => {
        const v = view.current;
        const now = new Date();
        const two = (n: number) => String(n).padStart(2, "0");
        drawn.current = drawHome(s, {
          open: v.open,
          on: v.onId,
          scroll: scroll.current,
          pick: v.pick,
          depth: v.depth,
          tax: v.tax,
          tube: v.cfg.color,
          config: v.cfg,
          configOpen: v.cfgOpen,
          hover: f.hover,
          pointer: f.pointer,
          time: f.now,
          age: f.age,
          clock: `${two(now.getHours())}:${two(now.getMinutes())}:${two(now.getSeconds())}`,
          stamp: v.stamp,
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
        const cell = kind === "rec" ? arg : id === "go:work" && !view.current.open ? "work" : null;
        if (cell) lastId.current = cell;
        setOnId(cell);
        setGoId(kind === "go" && !cell ? arg : null);
      },
      // the figure, the moth and the Pong paddle all answer the pointer as it moves
    },
    {
      family: vt323.style.fontFamily,
      settings: { config: cfg, set: setCfg, panel: setCfgOpen },
      paused: covered,
      // ten times a second for the clock and what blinks, twice as often while a record's scene is playing;
      // held still, only the clock moves, once a second
      every: (still) => (still ? 1000 : view.current.open ? 50 : 100),
      scroll: {
        at: scroll,
        max: () => (view.current.open ? drawn.current.maxScroll : 0),
        touch: () => Boolean(view.current.open && !view.current.cfgOpen),
      },
      fingerPoints: false,
    },
  );
  const { scrollBy } = tube;

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
      // the display settings' own zones are the tube's
      if (kind === "rec") openRecord(arg, true);
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

  /* ── the mirror: the same file as real headings, links and buttons ── */
  return (
    <div id="home-1970" style={{ position: "fixed", inset: 0, zIndex: 1, backgroundColor: "#030403" }}>
      <style>{HOME_CSS}</style>
      <div className="cr-host">
        <div ref={rootRef} className="cr" tabIndex={-1} data-own-cursor={tube.ownCursor ? "" : undefined}>
          <canvas key={tube.glass} ref={canvasRef} className="cr-canvas" aria-hidden />

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
