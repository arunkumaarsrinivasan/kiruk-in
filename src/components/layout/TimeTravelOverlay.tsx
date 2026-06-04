"use client";

/**
 * TimeTravelOverlay — era transition as a live architectural rebuild.
 *
 * Instead of guessed boxes, it READS the real rendered DOM and traces the
 * actual structural blocks of each era at the current viewport size. On travel:
 *   1. DECONSTRUCT — the current era's real skeleton is measured and its blocks
 *      are disabled one by one (reverse build order).
 *   2. CONSTRUCT   — the era swaps underneath; the next era's real skeleton is
 *      measured and drawn in block by block, on a ruled blueprint.
 *   3. MORPH       — the wireframe blocks solidify (outline → filled surface),
 *      then the overlay dissolves, revealing the rebuilt era exactly aligned.
 *
 * Because the skeleton is scanned live, it always matches the real layout and
 * reflows with the display (mobile/desktop, content changes — all tracked).
 */

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Rect = { x: number; y: number; w: number; h: number; label: string };

const STAGGER_OUT = 0.06;
const STAGGER_IN = 0.085;
const DUR_OUT = 0.24;
const DUR_IN = 0.32;
const MAX_BLOCKS = 14;

/* ---- live DOM skeleton scanner ------------------------------------------ */

function labelFor(el: Element): string {
  const t = el.tagName.toLowerCase();
  const cls = typeof el.className === "string" ? el.className.toLowerCase() : "";
  const named: Record<string, string> = {
    header: "HEADER",
    nav: "NAV",
    aside: "ASIDE",
    footer: "FOOTER",
    article: "ARTICLE",
    section: "SECTION",
    main: "MAIN",
    form: "FORM",
    ul: "LIST",
    ol: "LIST",
  };
  if (named[t]) return named[t];
  if (/window/.test(cls)) return "WINDOW";
  if (/card/.test(cls)) return "CARD";
  if (/tile/.test(cls)) return "TILE";
  if (/panel/.test(cls)) return "PANEL";
  if (/grid/.test(cls)) return "GRID";
  if (/col/.test(cls)) return "COLUMN";
  return t.toUpperCase().slice(0, 8);
}

const SEL = [
  "header",
  "nav",
  "main",
  "section",
  "article",
  "aside",
  "footer",
  "ul",
  "ol",
  "form",
  "table",
  "#main-content > div",
  "#main-content > div > div",
  '[class*="window"]',
  '[class*="card"]',
  '[class*="panel"]',
  '[class*="tile"]',
  '[class*="col"]',
  '[class*="row"]',
  '[class*="box"]',
  '[class*="sidebar"]',
  '[class*="feed"]',
  '[class*="profile"]',
  '[class*="block"]',
  '[class*="module"]',
  '[class*="grid"] > *',
].join(", ");

function scanSkeleton(): Rect[] {
  if (typeof window === "undefined") return [];
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const root = document.querySelector("#main-content") || document.body;
  const els = Array.from(root.querySelectorAll(SEL)).filter(
    (e) => !e.closest("header[role=banner]") && !e.closest("[data-tt-overlay]"),
  );

  type C = { x: number; y: number; w: number; h: number; label: string };
  let cand: C[] = [];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    // overlaps viewport, not full-bleed wrapper
    if (r.width < vw * 0.07 || r.height < vh * 0.02) continue;
    if (r.top > vh * 0.98 || r.bottom < vh * 0.02) continue;
    if (r.width > vw * 0.985 && r.height > vh * 0.92) continue;
    const x = Math.max(0, r.left);
    const y = Math.max(0, r.top);
    const w = Math.min(vw, r.right) - x;
    const h = Math.min(vh, r.bottom) - y;
    if (w < vw * 0.07 || h < vh * 0.025) continue;
    cand.push({ x, y, w, h, label: labelFor(el) });
  }

  // drop big multi-child wrappers (a giant <main>/<article> that contains
  // everything) so we trace the structural CHILDREN, not the shell
  const vpArea = vw * vh;
  const contains = (big: C, small: C) => {
    const ix = Math.max(0, Math.min(small.x + small.w, big.x + big.w) - Math.max(small.x, big.x));
    const iy = Math.max(0, Math.min(small.y + small.h, big.y + big.h) - Math.max(small.y, big.y));
    return ix * iy >= 0.82 * small.w * small.h;
  };
  const childCount = cand.map((c) => cand.reduce((n, k) => n + (k !== c && contains(c, k) ? 1 : 0), 0));
  cand = cand.filter((c, i) => !(c.w * c.h > 0.4 * vpArea && childCount[i] >= 3));

  // greedy de-overlap (keep larger distinct blocks)
  cand.sort((a, b) => b.w * b.h - a.w * a.h);
  const kept: C[] = [];
  for (const c of cand) {
    const dup = kept.some((k) => {
      const ix = Math.max(0, Math.min(c.x + c.w, k.x + k.w) - Math.max(c.x, k.x));
      const iy = Math.max(0, Math.min(c.y + c.h, k.y + k.h) - Math.max(c.y, k.y));
      const inter = ix * iy;
      const minA = Math.min(c.w * c.h, k.w * k.h);
      return minA > 0 && inter / minA > 0.55;
    });
    if (!dup) kept.push(c);
    if (kept.length >= MAX_BLOCKS) break;
  }
  kept.sort((a, b) => a.y - b.y || a.x - b.x);
  return kept.map((c) => ({ x: (c.x / vw) * 100, y: (c.y / vh) * 100, w: (c.w / vw) * 100, h: (c.h / vh) * 100, label: c.label }));
}

/* ---- blueprint pieces ---------------------------------------------------- */

function Ruler({ color, vw, vh }: { color: string; vw: number; vh: number }) {
  const xTicks = Array.from({ length: 21 }, (_, i) => i * 5);
  const yTicks = Array.from({ length: 21 }, (_, i) => i * 5);
  return (
    <div className="pointer-events-none absolute inset-0" style={{ color }}>
      {/* top ruler */}
      <div className="absolute left-0 top-0 h-4 w-full" style={{ borderBottom: `1px solid ${color}`, opacity: 0.5 }}>
        {xTicks.map((p) => (
          <span key={p} className="absolute top-0" style={{ left: `${p}%`, height: p % 25 === 0 ? 10 : 5, width: 1, background: color, opacity: 0.7 }} />
        ))}
        {[0, 25, 50, 75, 100].map((p) => (
          <span key={p} className="absolute top-[5px] text-[7px] tabular-nums" style={{ left: `calc(${p}% + 2px)`, opacity: 0.7 }}>
            {Math.round((p / 100) * vw)}
          </span>
        ))}
      </div>
      {/* left ruler */}
      <div className="absolute left-0 top-0 h-full w-4" style={{ borderRight: `1px solid ${color}`, opacity: 0.5 }}>
        {yTicks.map((p) => (
          <span key={p} className="absolute left-0" style={{ top: `${p}%`, width: p % 25 === 0 ? 10 : 5, height: 1, background: color, opacity: 0.7 }} />
        ))}
      </div>
      {/* viewport readout */}
      <span className="absolute right-6 top-1 text-[8px] font-semibold tabular-nums tracking-[0.16em]" style={{ opacity: 0.7 }}>
        {vw} × {vh}
      </span>
    </div>
  );
}

function Block({ r, i, total, mode, color, filled }: { r: Rect; i: number; total: number; mode: "in" | "out"; color: string; filled: boolean }) {
  const delay = mode === "in" ? i * STAGGER_IN : (total - 1 - i) * STAGGER_OUT;
  return (
    <motion.div
      className="absolute"
      style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%`, transformOrigin: "top center" }}
      initial={mode === "in" ? { opacity: 0, scaleY: 0.1 } : { opacity: 1, scaleY: 1 }}
      animate={mode === "in" ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0.1 }}
      transition={{ delay, duration: mode === "in" ? DUR_IN : DUR_OUT, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div
        className="relative h-full w-full"
        animate={{
          background: filled ? `color-mix(in srgb, ${color} 16%, transparent)` : `color-mix(in srgb, ${color} 0%, transparent)`,
          borderColor: filled ? color : `color-mix(in srgb, ${color} 70%, transparent)`,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ border: `1px solid ${color}` }}
      >
        <span className="absolute left-1 top-1 text-[7px] font-semibold uppercase leading-none tracking-[0.14em]" style={{ color, opacity: 0.9 }}>
          {r.label}
        </span>
        <span className="absolute -left-px -top-px h-1.5 w-1.5 border-l border-t" style={{ borderColor: color }} />
        <span className="absolute -bottom-px -right-px h-1.5 w-1.5 border-b border-r" style={{ borderColor: color }} />
        {/* width gauge */}
        <span className="absolute -bottom-3 left-0 text-[6px] tabular-nums" style={{ color, opacity: 0.5 }}>
          {Math.round(r.w)}%
        </span>
      </motion.div>
    </motion.div>
  );
}

type Phase = "idle" | "out" | "in" | "morph" | "reveal";

export function TimeTravelOverlay({
  active,
  fromId,
  toId,
  oldColor,
  newColor,
  fromName,
  toName,
  onMid,
  onDone,
  reduce,
}: {
  active: boolean;
  fromId: string;
  toId: string;
  oldColor: string;
  newColor: string;
  fromName: string;
  toName: string;
  onMid: () => void;
  onDone: () => void;
  reduce: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [fromRects, setFromRects] = useState<Rect[]>([]);
  const [toRects, setToRects] = useState<Rect[]>([]);
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const clearAll = () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
    if (!active) {
      setPhase("idle");
      clearAll();
      return;
    }
    setVp({ w: window.innerWidth, h: window.innerHeight });

    if (reduce) {
      onMid();
      setPhase("reveal");
      timers.current.push(window.setTimeout(onDone, 320));
      return clearAll;
    }

    // 1) measure current era and deconstruct
    const from = scanSkeleton();
    const fromR = from.length >= 4 ? from : fallbackFor(fromId);
    setFromRects(fromR);
    setPhase("out");
    const outMs = (fromR.length - 1) * STAGGER_OUT * 1000 + DUR_OUT * 1000 + 140;

    timers.current.push(
      window.setTimeout(() => {
        onMid(); // swap era underneath
        // anchor at the top so the scanned skeleton and the revealed page align
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        // 2) wait for the new era to lay out, then measure its REAL blocks.
        //    retry while sparse so we trace actual content, not a fallback.
        const runConstruct = (toR: Rect[]) => {
          setToRects(toR);
          setPhase("in");
          const inMs = (toR.length - 1) * STAGGER_IN * 1000 + DUR_IN * 1000 + 180;
          timers.current.push(window.setTimeout(() => setPhase("morph"), inMs));
          timers.current.push(window.setTimeout(() => setPhase("reveal"), inMs + 380));
          timers.current.push(window.setTimeout(() => onDone(), inMs + 380 + 560));
        };
        const tryScan = (attempt: number) => {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          const to = scanSkeleton();
          if (to.length >= 4 || attempt >= 3) {
            runConstruct(to.length >= 4 ? to : fallbackFor(toId));
          } else {
            timers.current.push(window.setTimeout(() => tryScan(attempt + 1), 260));
          }
        };
        timers.current.push(window.setTimeout(() => tryScan(0), 420));
      }, outMs),
    );

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduce]);

  const building = phase === "in" || phase === "morph" || phase === "reveal";
  const color = building ? newColor : oldColor;
  const rects = building ? toRects : fromRects;
  const mode = building ? "in" : "out";
  const stamp = building ? `${toId} · ${toName}` : `${fromId} · ${fromName}`;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          data-tt-overlay
          className="fixed inset-0 z-[300] overflow-hidden"
          style={{ background: "#05060a", fontFamily: "var(--font-main, ui-monospace, monospace)" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "reveal" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {phase !== "idle" && <Ruler color={color} vw={vp.w} vh={vp.h} />}

          {rects.map((r, i) => (
            <Block key={`${mode}-${i}-${r.label}`} r={r} i={i} total={rects.length} mode={mode} color={color} filled={phase === "morph" || phase === "reveal"} />
          ))}

          {/* technical readout */}
          <div className="absolute bottom-6 left-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em]" style={{ color }}>
            <span style={{ opacity: 0.6 }}>{building ? "▸ Constructing" : "▸ Disassembling"}</span>
            <span className="font-bold" style={{ opacity: 0.95 }}>
              {stamp}
            </span>
          </div>
          <div className="absolute bottom-6 right-6 text-[10px] tabular-nums tracking-[0.2em]" style={{ color, opacity: 0.55 }}>
            {fromId} → {toId} · {rects.length} blocks
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---- curated per-era fallbacks (used only when a live scan is too sparse) ---
 * Authored in frame coords (0–100) that mirror each era's real structure, then
 * mapped into a centered viewport frame. */
type FC = [number, number, number, number, string];
const WIRE: Record<string, FC[]> = {
  "1970": [[0, 0, 100, 7, "TTY1"], [0, 11, 64, 6, "PROMPT"], [0, 21, 100, 50, "OUTPUT"], [0, 75, 12, 8, "CURSOR"]],
  "1981": [[0, 0, 100, 9, "TITLE BAR"], [0, 11, 100, 7, "MENU"], [0, 21, 30, 63, "ICONS"], [33, 21, 67, 63, "WINDOW"]],
  "1991": [[0, 0, 78, 11, "H1"], [0, 15, 96, 5, "SUBTITLE"], [0, 23, 100, 2, "HR"], [0, 30, 38, 6, "H2"], [0, 39, 100, 17, "BODY"], [0, 60, 52, 24, "INDEX"]],
  "1993": [[0, 0, 100, 8, "MENUBAR"], [0, 10, 100, 8, "URL BAR"], [0, 21, 100, 59, "PAGE"], [0, 90, 100, 8, "STATUS"]],
  "1995": [[0, 0, 100, 11, "BANNER"], [0, 13, 100, 6, "MARQUEE"], [0, 22, 22, 52, "LINKS"], [25, 22, 50, 40, "CONTENT"], [78, 22, 22, 24, "COUNTER"], [78, 49, 22, 25, "WEBRING"], [25, 64, 50, 10, "GUESTBOOK"]],
  "1997": [[0, 0, 100, 9, "TOP FRAME"], [0, 12, 26, 72, "NAV FRAME"], [29, 12, 71, 72, "CONTENT FRAME"]],
  "2000": [[0, 0, 100, 9, "HEADER"], [0, 12, 100, 6, "NAV"], [0, 21, 100, 28, "HERO"], [0, 52, 48, 32, "COLUMN"], [52, 52, 48, 32, "COLUMN"]],
  "2003": [[0, 0, 100, 8, "TOP NAV"], [0, 11, 30, 38, "PROFILE"], [0, 51, 30, 33, "CONTACT"], [33, 11, 67, 28, "BLURBS"], [33, 42, 67, 42, "FEED"]],
  "2006": [[0, 0, 100, 8, "NAV"], [0, 12, 100, 34, "HERO"], [0, 50, 32, 34, "CARD"], [34, 50, 32, 34, "CARD"], [68, 50, 32, 34, "CARD"]],
  "2009": [[30, 1, 40, 6, "STATUS"], [30, 10, 40, 60, "SPRINGBOARD"], [30, 73, 40, 11, "DOCK"]],
  "2013": [[0, 0, 100, 7, "NAV"], [0, 11, 32, 27, "TILE"], [34, 11, 32, 27, "TILE"], [68, 11, 32, 27, "TILE"], [0, 41, 32, 27, "TILE"], [34, 41, 32, 27, "TILE"], [68, 41, 32, 27, "TILE"], [0, 76, 100, 8, "TAB BAR"]],
  "2018": [[0, 0, 22, 100, "SIDEBAR"], [26, 0, 74, 8, "TOPBAR"], [26, 12, 60, 8, "TITLE"], [26, 24, 74, 11, "BLOCK"], [26, 38, 74, 11, "BLOCK"], [26, 52, 74, 11, "BLOCK"]],
  "2021": [[0, 0, 20, 100, "SIDEBAR"], [23, 0, 77, 8, "TOPBAR"], [23, 11, 24, 73, "TODO"], [49, 11, 24, 73, "DOING"], [75, 11, 25, 73, "DONE"]],
  "2023": [[0, 0, 24, 100, "THREADS"], [27, 0, 73, 8, "HEADER"], [31, 13, 54, 12, "MESSAGE"], [40, 29, 50, 16, "MESSAGE"], [31, 49, 54, 13, "MESSAGE"], [27, 78, 73, 10, "PROMPT"]],
  "2026": [[0, 0, 100, 10, "PROMPT BAR"], [0, 15, 48, 39, "PANEL"], [50, 15, 50, 39, "PANEL"], [0, 58, 100, 26, "GENERATED"]],
};
const GENERIC: FC[] = [[0, 0, 100, 9, "HEADER"], [0, 12, 62, 40, "MAIN"], [66, 12, 34, 40, "ASIDE"], [0, 56, 100, 28, "CONTENT"]];

/** map frame-coords (0–100) into a centered viewport frame, with narrow stacking */
function fallbackFor(id: string): Rect[] {
  const comps = WIRE[id] ?? GENERIC;
  const narrow = typeof window !== "undefined" && window.innerWidth < 760;
  const fx = 6, fy = 9, fw = 88, fh = 82; // viewport frame inset
  let list = comps.map(([x, y, w, h, label]) => ({ x, y, w, h, label }));
  if (narrow) {
    // stack everything into a single column in build order
    let cy = 0;
    list = list.map((c) => {
      const h = Math.max(7, Math.min(22, c.h));
      const r = { x: 0, y: cy, w: 100, h, label: c.label };
      cy += h + 2;
      return r;
    });
    const scale = cy > 100 ? 100 / cy : 1;
    list = list.map((c) => ({ ...c, y: c.y * scale, h: c.h * scale }));
  }
  return list.map((c) => ({ x: fx + (c.x / 100) * fw, y: fy + (c.y / 100) * fh, w: (c.w / 100) * fw, h: (c.h / 100) * fh, label: c.label }));
}

export default TimeTravelOverlay;
