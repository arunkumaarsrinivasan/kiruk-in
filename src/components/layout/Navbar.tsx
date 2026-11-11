"use client";

/**
 * Navbar — the eye. There is no bar: every page is seen through an eye opening.
 *
 * The upper and lower lids are parabolas, deepest at the screen edges and
 * thinnest in the middle. The corner space they leave holds the nav, and every
 * item rides its lid — offset and tilted to follow the curve:
 *   upper-left   brand + the way up (one step: the parent, then this page)
 *   upper-right  Home / Work / Read / Contact (menu button below FULL_NAV)
 *   lower lid    a ruler of time: a tick for every year, a key for every era
 *   lower-left   name of the era under the pointer (or the current one)
 *   lower-right  ‹ › one-era hops, and between them the eye: all eras (the era network)
 *
 * The lids are alive. They rest a little open while the pointer is out on the
 * page and close to their full depth on the side it comes to; a press on
 * anything in them squeezes them, a route change blinks them, and now and
 * then, at rest, they blink by themselves. The ruler's ticks rise under the
 * pointer. Scrolling down widens the eye for reading (lids retract, labels
 * fade); scrolling up, pointing at a lid, or tabbing in brings them back.
 * Everything on a lid rides it as it moves. The lids never go deeper than
 * their rest, so a page is never covered. Publishes --simple-game-nav-bottom (upper-lid depth at the
 * edges, fixed so pages never jump) and --eye-lid-bottom (lower-lid depth).
 * On /notebook, era picks route through notebook travel (`?era=`).
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { animate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { SiteHomeLink } from "@/components/layout/SiteHomeLink";
import { usePublishedTrail, type NavTrailItem } from "@/components/layout/NavTrail";
import { isNotebookPath } from "@/lib/paper-surface";
import { useEraTravelOptional } from "@/components/era-travel/EraTravelContext";
import { EraNavOverlay } from "@/components/era-nav-game/EraNavOverlay";
import { useNotebookEraOptional } from "@/components/notebook/NotebookEraContext";
import { prefetchEraArchetype } from "@/components/era-shell/registry";
import { useModules } from "@/contexts/ModuleContext";

/** Below this width the links move into the menu and the trail hides. */
const FULL_NAV = 1100;

type Lid = { edge: number; mid: number };
type Eye = { top: Lid; bottom: Lid };

const REST_FULL: Eye = { top: { edge: 72, mid: 12 }, bottom: { edge: 60, mid: 30 } };
const REST_COMPACT: Eye = { top: { edge: 68, mid: 10 }, bottom: { edge: 58, mid: 32 } };
/** Reading: the eye opens wide. */
const WIDE: Eye = { top: { edge: 34, mid: 4 }, bottom: { edge: 24, mid: 4 } };

const PHASE: Record<string, string> = {
  "1970": "Pre-Web",
  "1981": "Pre-Web",
  "1991": "Web 1.0",
  "1995": "Web 1.0",
  "1997": "Web 1.0",
  "2000": "Web 2.0",
  "2003": "Web 2.0",
  "2009": "Mobile",
  "2013": "Mobile",
  "2026": "Now",
};

const SECTIONS: Record<string, NavTrailItem> = {
  work: { label: "Work", href: "/work" },
  notebook: { label: "Read", href: "/notebook" },
};

const prettify = (seg: string) =>
  decodeURIComponent(seg)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Fallback trail from the URL, for deep pages that don't publish their own. */
function trailFromPath(pathname: string | null): NavTrailItem[] | null {
  const segs = (pathname ?? "").split("/").filter(Boolean);
  if (segs.length < 2) return null;
  const section = SECTIONS[segs[0]] ?? { label: prettify(segs[0]), href: `/${segs[0]}` };
  return [section, { label: prettify(segs[segs.length - 1]) }];
}

const eraLabel = (name: string) => {
  const [, ...rest] = name.split(":");
  return rest.join(":").trim() || name;
};

/* ── lid geometry ─────────────────────────────────────────────────────────── */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixLid = (a: Lid, b: Lid, t: number): Lid => ({ edge: lerp(a.edge, b.edge, t), mid: lerp(a.mid, b.mid, t) });
const mixEye = (a: Eye, b: Eye, t: number): Eye => ({ top: mixLid(a.top, b.top, t), bottom: mixLid(a.bottom, b.bottom, t) });

/**
 * A lid as it is drawn: two half parabolas that meet flat at the centre, so
 * its two corners can sit at different depths (the side the pointer is on
 * closes first).
 */
type Shape = { l: number; r: number; mid: number };
const mixShape = (a: Shape, to: number, t: number): Shape => ({ l: lerp(a.l, to, t), r: lerp(a.r, to, t), mid: lerp(a.mid, to, t) });

/** Lid thickness at x: `mid` at the centre, `l` and `r` at the screen edges. */
const depthAt = (s: Shape, x: number, w: number) => {
  const u = (x - w / 2) / (w / 2);
  return s.mid + ((u < 0 ? s.l : s.r) - s.mid) * u * u;
};
const slopeAt = (s: Shape, x: number, w: number) => {
  const half = w / 2;
  const u = (x - half) / half;
  return (2 * ((u < 0 ? s.l : s.r) - s.mid) * u) / half;
};

// Each half is a quadratic whose control point sits at the centre's depth, halfway along: exactly the parabola above.
type Y = (depth: number) => number;
const toRight = (s: Shape, w: number, y: Y) => `Q${w / 4} ${y(s.mid)} ${w / 2} ${y(s.mid)}Q${w * 0.75} ${y(s.mid)} ${w} ${y(s.r)}`;
const toLeft = (s: Shape, w: number, y: Y) => `Q${w * 0.75} ${y(s.mid)} ${w / 2} ${y(s.mid)}Q${w / 4} ${y(s.mid)} 0 ${y(s.l)}`;
const down: Y = (d) => d;
const topFill = (s: Shape, w: number) => `M0 0H${w}V${s.r}${toLeft(s, w, down)}Z`;
/** Upper lash line: a crescent, ~3px at the centre tapering to a hairline at the edges. */
const topLine = (s: Shape, w: number) => {
  const inner: Shape = { l: s.l - 0.75, r: s.r - 0.75, mid: s.mid - 3 };
  return `M0 ${s.l}${toRight(s, w, down)}L${w} ${inner.r}${toLeft(inner, w, down)}Z`;
};
const bottomFill = (s: Shape, w: number, h: number) => `M0 ${h}H${w}V${h - s.r}${toLeft(s, w, (d) => h - d)}Z`;
const bottomLine = (s: Shape, w: number, h: number) => `M0 ${h - s.l}${toRight(s, w, (d) => h - d)}`;

/** How far the lids rest open while the pointer is away from them, in pixels. */
const RELAX = { top: 10, topMid: 3, bottom: 8, bottomMid: 5 };
/** How far a press closes the lids, and how far they close when they blink by themselves (0 open, 1 shut). */
const SQUEEZE = 0.055;
const IDLE_BLINK = 0.09;

/** Something that rides a lid: where it is, and how it sits. */
type Rider = { el: HTMLElement; side: "top" | "bottom"; cx: number; h: number; gap: number; upright: boolean; sx: number; sy: number };

/** Sit every rider just inside its lid's edge at its own x, tilted to the curve (`upright` riders are not tilted). */
function seat(riders: Rider[], top: Shape, bottom: Shape, w: number) {
  for (const r of riders) {
    const s = r.side === "top" ? top : bottom;
    const d = depthAt(s, r.cx, w);
    const tilt = r.upright ? 0 : (Math.atan(slopeAt(s, r.cx, w)) * 180) / Math.PI;
    // the swell is part of the same transform, after the seat, so a taller tick still stands on its lid
    const swell = r.sx === 1 && r.sy === 1 ? "" : ` scale(${r.sx.toFixed(3)}, ${r.sy.toFixed(3)})`;
    r.el.style.transform =
      r.side === "top"
        ? `translateY(${Math.max(d - r.gap - r.h, 2)}px) rotate(${tilt}deg)${swell}`
        : `translateY(${Math.min(r.h + r.gap - d, -2)}px) rotate(${-tilt}deg)${swell}`;
  }
}

/**
 * Where each era sits along the ruler, 0 to 1: halfway between even spacing
 * and true time, so a long gap reads as long and close eras still have room.
 */
function rulerStops(ids: string[]): number[] {
  const n = ids.length;
  const years = ids.map(Number);
  const span = years[n - 1] - years[0];
  const real = n > 1 && span > 0 && years.every((y) => Number.isFinite(y));
  return ids.map((_, i) => {
    const even = n > 1 ? i / (n - 1) : 0.5;
    return real ? (even + (years[i] - years[0]) / span) / 2 : even;
  });
}

/* ── pieces ───────────────────────────────────────────────────────────────── */

function NavHref({ label, href, active, title }: Readonly<{ label: string; href: string; active: boolean; title: string }>) {
  return (
    <Link
      data-ride
      href={href}
      title={title}
      aria-current={active ? "page" : undefined}
      className="site-nav-link eye-fade pointer-events-auto relative inline-flex h-6 items-center px-2 text-[11px] uppercase tracking-[0.14em] outline-none"
      style={{ color: active ? "var(--accent-color)" : "var(--nav-text)" }}
    >
      <span className="leading-none">{label}</span>
      <span
        aria-hidden
        className="site-nav-link-line absolute -bottom-px left-2 right-2 h-px origin-left transition-transform duration-200 ease-out"
        style={{ background: "var(--accent-color)" }}
      />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const notebookOpen = isNotebookPath(pathname);
  // The making-of is a section of the notebook, so Read stays lit there.
  const readOpen = notebookOpen || (!!pathname && (pathname === "/making" || pathname.startsWith("/making/")));
  const workOpen = !!pathname && (pathname === "/work" || pathname.startsWith("/work/"));
  const contactOpen = pathname === "/contact";
  const homeOpen = pathname === "/";
  const { eras, currentEraId } = useDesignEra();
  const travel = useEraTravelOptional();
  const notebook = useNotebookEraOptional();
  const modules = useModules();
  const published = usePublishedTrail();
  const reduce = !!useReducedMotion();

  const frameRef = useRef<HTMLDivElement>(null);
  const topFillRef = useRef<SVGPathElement>(null);
  const topLineRef = useRef<SVGPathElement>(null);
  const bottomFillRef = useRef<SVGPathElement>(null);
  const bottomLineRef = useRef<SVGPathElement>(null);
  const brandRowRef = useRef<HTMLDivElement>(null);
  const linksRowRef = useRef<HTMLDivElement>(null);
  const yearsRowRef = useRef<HTMLDivElement>(null);
  const captionRowRef = useRef<HTMLDivElement>(null);
  const stepRowRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [wide, setWide] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const full = size.w >= FULL_NAV;
  const rest = full ? REST_FULL : REST_COMPACT;
  const trail = full ? (published ?? trailFromPath(pathname)) : null;
  // One step up, then this page: a deep page never strings its whole path along the lid.
  const here = trail?.[trail.length - 1];
  const up = trail && trail.length > 1 ? trail[trail.length - 2] : null;

  const eraId = notebook?.eraId ?? currentEraId;
  const curIdx = Math.max(0, eras.findIndex((e) => e.id === eraId));
  const shown = eras.find((e) => e.id === (hoverId ?? eraId)) ?? eras[curIdx];
  const onPickEra = (id: string) => {
    if (id === eraId) return;
    if (notebook) notebook.pickEra(id);
    else travel?.travelTo(id);
  };

  // 0 = resting lids, 1 = wide open for reading; `blink` closes them over everything.
  const wideMV = useSpring(0, { stiffness: 260, damping: 34 });
  const blink = useMotionValue(0);
  // 0 = a lid at its full depth, 1 = resting open: the two upper corners and the lower lid.
  const easeL = useSpring(0, { stiffness: 150, damping: 17 });
  const easeR = useSpring(0, { stiffness: 150, damping: 17 });
  const easeB = useSpring(0, { stiffness: 150, damping: 17 });
  const riders = useRef<Rider[]>([]);
  const drawNow = useRef<() => void>(() => {});
  const fishOn = useRef(false);
  const lastMove = useRef(0);
  const wideNow = useRef(false);
  wideNow.current = wide;

  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pages pad against the resting lids; the values never change with scroll.
  // --eye-mid and --eye-vw let a centred column follow the curve (see eye-clear.ts).
  useLayoutEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--simple-game-nav-bottom", `${rest.top.edge}px`);
    root.setProperty("--eye-mid", `${rest.top.mid}px`);
    root.setProperty("--eye-lid-bottom", `${rest.bottom.edge}px`);
    root.setProperty("--eye-lid-bottom-mid", `${rest.bottom.mid}px`);
    if (size.w) root.setProperty("--eye-vw", String(size.w));
  }, [rest.top.edge, rest.top.mid, rest.bottom.edge, rest.bottom.mid, size.w]);

  const draw = useCallback(() => {
    const { w, h } = size;
    if (!w || !h) return;
    const k = wideMV.get();
    const base = mixEye(rest, WIDE, k);
    // resting open is a retreat from the rest shape, never past it, and it gives way as the eye widens to read
    const l = easeL.get() * (1 - k);
    const r = easeR.get() * (1 - k);
    const b = easeB.get() * (1 - k);
    const top: Shape = { l: base.top.edge - RELAX.top * l, r: base.top.edge - RELAX.top * r, mid: Math.max(2, base.top.mid - (RELAX.topMid * (l + r)) / 2) };
    const bottom: Shape = { l: base.bottom.edge - RELAX.bottom * b, r: base.bottom.edge - RELAX.bottom * b, mid: Math.max(2, base.bottom.mid - RELAX.bottomMid * b) };
    seat(riders.current, top, bottom, w);
    const shut = blink.get();
    const t = mixShape(top, h * 0.56, shut);
    const u = mixShape(bottom, h * 0.46, shut);
    topFillRef.current?.setAttribute("d", topFill(t, w));
    topLineRef.current?.setAttribute("d", topLine(t, w));
    bottomFillRef.current?.setAttribute("d", bottomFill(u, w, h));
    bottomLineRef.current?.setAttribute("d", bottomLine(u, w, h));
  }, [size, rest, wideMV, blink, easeL, easeR, easeB]);

  useEffect(() => {
    drawNow.current = draw;
    draw();
    const offs = [wideMV, blink, easeL, easeR, easeB].map((v) => v.on("change", draw));
    return () => offs.forEach((off) => off());
  }, [draw, wideMV, blink, easeL, easeR, easeB]);

  useEffect(() => {
    if (reduce) wideMV.jump(wide ? 1 : 0);
    else wideMV.set(wide ? 1 : 0);
  }, [wide, reduce, wideMV]);

  // Widen while scrolling down; scrolling up or pointing at a lid restores.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (y < 120) setWide(false);
      else if (dy > 6) setWide(true);
      else if (dy < -6) setWide(false);
    };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    /** The ruler's ticks and years rise under the pointer. */
    const swell = (x: number | null) => {
      if (x === null && !fishOn.current) return;
      fishOn.current = x !== null;
      for (const r of riders.current) {
        const kind = r.el.dataset.fish;
        if (!kind) continue;
        const g = x === null ? 0 : Math.exp(-(((x - r.cx) / 64) ** 2));
        r.sx = kind === "tick" ? 1 : 1 + 0.3 * g;
        r.sy = kind === "tick" ? 1 + 2.4 * g : 1 + 0.3 * g;
      }
      drawNow.current();
    };
    const onPointer = (e: PointerEvent) => {
      const w = window.innerWidth;
      const nearTop = e.clientY < 90;
      const nearBottom = e.clientY > window.innerHeight - 80;
      if (nearTop || nearBottom) setWide(false);
      lastMove.current = Date.now();
      if (reduce || !fine.matches || e.pointerType === "touch") return;
      // each lid closes to its full depth on the side the pointer comes to, and rests open elsewhere
      easeL.set(nearTop && e.clientX < w * 0.6 ? 0 : 1);
      easeR.set(nearTop && e.clientX > w * 0.4 ? 0 : 1);
      easeB.set(nearBottom ? 0 : 1);
      swell(nearBottom ? e.clientX : null);
    };
    const onLeave = () => swell(null);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, easeL, easeR, easeB]);

  /** Tabbing into a lid, or opening the menu, brings every lid to its full depth. */
  const closeIn = useCallback(() => {
    setWide(false);
    easeL.set(0);
    easeR.set(0);
    easeB.set(0);
  }, [easeL, easeR, easeB]);

  // A press on anything in the lids squeezes them; a route change then carries the squeeze into its blink.
  const squeeze = useRef(0);
  const onPress = useCallback(
    (e: React.PointerEvent) => {
      if (reduce || !(e.target as HTMLElement).closest("a[href], button")) return;
      window.clearTimeout(squeeze.current);
      animate(blink, SQUEEZE, { duration: 0.09, ease: "easeOut" });
      squeeze.current = window.setTimeout(() => {
        if (blink.get() <= SQUEEZE + 0.01) animate(blink, 0, { duration: 0.22, ease: [0.23, 1, 0.32, 1] });
      }, 260);
    },
    [reduce, blink],
  );

  // At rest, with the pointer still and nothing being typed, the lids blink a little by themselves.
  useEffect(() => {
    if (reduce) return;
    let timer = 0;
    const plan = () => {
      timer = window.setTimeout(
        () => {
          const el = document.activeElement as HTMLElement | null;
          const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
          const still = Date.now() - lastMove.current > 2500;
          if (!document.hidden && !typing && still && !wideNow.current && blink.get() === 0) {
            animate(blink, [0, IDLE_BLINK, 0], { duration: 0.3, times: [0, 0.38, 1], ease: "easeOut" });
          }
          plan();
        },
        12_000 + Math.random() * 14_000,
      );
    };
    plan();
    return () => window.clearTimeout(timer);
  }, [reduce, blink]);

  // Blink on every route change after the first.
  const firstPath = useRef(true);
  useEffect(() => {
    setMenuOpen(false);
    setWide(false);
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    if (reduce) return;
    window.clearTimeout(squeeze.current);
    const ctl = animate(blink, [blink.get(), 1, 1, 0], { duration: 0.42, times: [0, 0.28, 0.4, 1], ease: [0.4, 0, 0.2, 1] });
    return () => ctl.stop();
  }, [pathname, reduce, blink]);

  // The 2026 pupil asks the lids to blink while it thinks: the navbar is that eye's lids.
  useEffect(() => {
    if (reduce) return;
    const onBlink = () => {
      animate(blink, [0, 1, 1, 0], { duration: 0.34, times: [0, 0.3, 0.42, 1], ease: [0.4, 0, 0.2, 1] });
    };
    window.addEventListener("kiruk:blink", onBlink);
    return () => window.removeEventListener("kiruk:blink", onBlink);
  }, [reduce, blink]);

  useEffect(() => {
    if (menuOpen) closeIn();
  }, [menuOpen, closeIn]);

  // Find everything that rides a lid, and where it sits; `draw` then seats it on the lids as they move.
  const trailKey = `${up?.label ?? ""}/${here?.label ?? ""}`;
  const rideKey = `${trailKey}|${full}|${menuOpen}|${eraId}|${eras.length}|${shown?.id}`;
  useLayoutEffect(() => {
    if (!size.w) return;
    const rows: [React.RefObject<HTMLDivElement | null>, "top" | "bottom"][] = [
      [brandRowRef, "top"],
      [linksRowRef, "top"],
      [yearsRowRef, "bottom"],
      [captionRowRef, "bottom"],
      [stepRowRef, "bottom"],
    ];
    const find = () => {
      const out: Rider[] = [];
      for (const [ref, side] of rows) {
        const row = ref.current;
        if (!row) continue;
        const left = row.getBoundingClientRect().left;
        row.querySelectorAll<HTMLElement>("[data-ride]").forEach((el) => {
          // an item placed by its centre (`data-anchor`) is already at its x; the rest are measured from their left
          const cx = left + el.offsetLeft + (el.dataset.anchor ? 0 : el.offsetWidth / 2);
          out.push({ el, side, cx, h: el.offsetHeight, gap: Number(el.dataset.gap ?? 4), upright: el.dataset.ride === "upright", sx: 1, sy: 1 });
        });
      }
      riders.current = out;
      draw();
    };
    find();
    const ro = new ResizeObserver(find);
    for (const [ref] of rows) if (ref.current) ro.observe(ref.current);
    document.fonts?.ready.then(find).catch(() => {});
    return () => ro.disconnect();
  }, [size.w, rideKey, draw]);

  const yearsInset = full ? Math.round(size.w * 0.2) : 10;
  const stops = rulerStops(eras.map((e) => e.id));
  // a tick for every year between the eras, the decades taller
  const ticks: { at: number; decade: boolean; year: number }[] = [];
  if (full) {
    for (let i = 0; i < eras.length - 1; i += 1) {
      const a = Number(eras[i].id);
      const b = Number(eras[i + 1].id);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      for (let y = a + 1; y < b; y += 1) ticks.push({ at: stops[i] + ((stops[i + 1] - stops[i]) * (y - a)) / (b - a), decade: y % 10 === 0, year: y });
    }
  }
  const prev = eras[curIdx - 1];
  const next = eras[curIdx + 1];

  return (
    <header
      id="site-header"
      ref={frameRef}
      role="banner"
      data-wide={wide ? "1" : "0"}
      className="site-chrome eye-nav pointer-events-none fixed inset-0 z-[95]"
      style={{ fontFamily: "var(--font-main, ui-sans-serif, system-ui)", color: "var(--nav-text)" }}
      onFocusCapture={closeIn}
      onPointerDownCapture={onPress}
    >
      {/* the lids */}
      <svg
        aria-hidden
        className="eye-lids absolute inset-0 h-full w-full"
        width={size.w || undefined}
        height={size.h || undefined}
        viewBox={size.w ? `0 0 ${size.w} ${size.h}` : undefined}
        preserveAspectRatio="none"
      >
        <path ref={topFillRef} style={{ fill: "var(--nav-surface)", pointerEvents: "auto" }} />
        <path ref={bottomFillRef} style={{ fill: "var(--nav-surface)", pointerEvents: "auto" }} />
        <path ref={topLineRef} style={{ fill: "color-mix(in srgb, var(--nav-text) 78%, transparent)" }} />
        <path ref={bottomLineRef} fill="none" strokeWidth={1} style={{ stroke: "color-mix(in srgb, var(--nav-text) 26%, transparent)" }} />
      </svg>

      {/* upper-left: brand + trail */}
      <div ref={brandRowRef} className="pointer-events-none absolute left-3 top-0 flex items-start gap-1 sm:left-5">
        <span data-ride="upright" data-gap="2" className="eye-fade pointer-events-auto">
          <SiteHomeLink />
        </span>
        {here ? (
          <span data-ride className="eye-fade pointer-events-auto flex h-6 items-center gap-2 pl-2 text-[12px]">
            {up?.href ? (
              <Link href={up.href} title={`Up to ${up.label}`} className="site-trail-link inline-flex items-center gap-1">
                <span aria-hidden className="site-trail-up">
                  ‹
                </span>
                {up.label}
              </Link>
            ) : up ? (
              <span style={{ color: "var(--nav-text-muted)" }}>{up.label}</span>
            ) : null}
            {up ? (
              <span aria-hidden className="block h-3 w-px" style={{ background: "color-mix(in srgb, var(--nav-text) 30%, transparent)" }} />
            ) : null}
            <span aria-current="page" className="block max-w-[24ch] truncate" style={{ color: "var(--nav-text)" }}>
              {here.label}
            </span>
          </span>
        ) : null}
      </div>

      {/* upper-right: page links, or the menu button on narrow screens */}
      <div ref={linksRowRef} className="pointer-events-none absolute right-3 top-0 flex items-start gap-1 sm:right-5">
        {full ? (
          <nav aria-label="Primary" className="contents">
            <NavHref label="Home" href="/" active={homeOpen} title="Home — who Arun is, and the way in to everything" />
            <NavHref label="Work" href="/work" active={workOpen} title="Work — selected projects" />
            <NavHref label="Read" href="/notebook" active={readOpen} title="Read — notebook and essays" />
            <NavHref label="Contact" href="/contact" active={contactOpen} title="Contact" />
          </nav>
        ) : (
          <button
            data-ride="upright"
            data-gap="2"
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            className="eye-fade pointer-events-auto flex h-10 w-10 items-center justify-center"
            style={{ color: "var(--nav-text)" }}
          >
            <span className="relative block h-3 w-5">
              <span className="absolute left-0 block h-px w-full transition-[top,transform] duration-200 ease-out" style={{ background: "currentColor", top: menuOpen ? "6px" : "1px", transform: menuOpen ? "rotate(45deg)" : "none" }} />
              <span className="absolute left-0 top-[6px] block h-px w-full transition-opacity duration-150" style={{ background: "currentColor", opacity: menuOpen ? 0 : 1 }} />
              <span className="absolute left-0 block h-px w-full transition-[top,transform] duration-200 ease-out" style={{ background: "currentColor", top: menuOpen ? "6px" : "11px", transform: menuOpen ? "rotate(-45deg)" : "none" }} />
            </span>
          </button>
        )}
      </div>

      {/* lower lid: every era year */}
      <div
        ref={yearsRowRef}
        role="group"
        aria-label="Design era"
        className="eye-fade pointer-events-none absolute bottom-0 flex items-end justify-between"
        style={{ left: yearsInset, right: yearsInset }}
        onPointerLeave={() => setHoverId(null)}
      >
        {ticks.map((t) => (
          <span
            key={`y-${t.year}`}
            data-ride
            data-anchor="center"
            data-gap="2"
            data-fish="tick"
            aria-hidden
            className="eye-tick absolute bottom-0 block w-px"
            style={{
              left: `${t.at * 100}%`,
              height: t.decade ? 7 : 4,
              background: `color-mix(in srgb, var(--nav-text) ${t.decade ? 46 : 26}%, transparent)`,
            }}
          />
        ))}
        {eras.map((era, i) => {
          const active = era.id === eraId;
          const tick =
            i > 0 && !full ? (
              <span
                key={`t-${era.id}`}
                data-ride
                data-gap="2"
                aria-hidden
                className="block h-1.5 w-px"
                style={{ background: "color-mix(in srgb, var(--nav-text) 30%, transparent)" }}
              />
            ) : null;
          return (
            <React.Fragment key={era.id}>
              {tick}
              <button
                data-ride
                data-gap={full ? "7" : "4"}
                data-anchor={full ? "center" : undefined}
                data-fish="year"
                type="button"
                aria-pressed={active}
                aria-label={`${era.id} — ${eraLabel(era.name)}`}
                onClick={() => onPickEra(era.id)}
                onPointerEnter={() => {
                  setHoverId(era.id);
                  prefetchEraArchetype(era.id);
                }}
                onFocus={() => {
                  setHoverId(era.id);
                  prefetchEraArchetype(era.id);
                }}
                onBlur={() => setHoverId(null)}
                className={`eye-year pointer-events-auto flex h-[22px] items-center rounded-full px-1.5 text-[11px] tabular-nums leading-none outline-none ${full ? "absolute bottom-0" : ""}`}
                style={{
                  left: full ? `${stops[i] * 100}%` : undefined,
                  translate: full ? "-50% 0" : undefined,
                  background: active ? "var(--accent-color)" : undefined,
                  color: active ? "var(--nav-surface)" : "var(--nav-text-muted)",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {active ? era.id : `’${era.id.slice(2)}`}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {full ? (
        <>
          {/* lower-left: what the pointed-at year is */}
          <div ref={captionRowRef} aria-live="polite" className="eye-fade pointer-events-none absolute bottom-0 left-5 flex items-end">
            <span data-ride="upright" data-gap="10" className="block leading-tight" style={{ maxWidth: Math.max(yearsInset - 44, 120) }}>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent-color)" }}>
                {shown && PHASE[shown.id]}
                {hoverId && hoverId !== eraId ? " · click to travel" : ""}
              </span>
              <span className="block truncate text-[12px]" style={{ color: "var(--nav-text)" }}>
                <span className="font-bold tabular-nums">{shown?.id}</span> {shown ? eraLabel(shown.name) : ""}
              </span>
            </span>
          </div>

          {/* lower-right: one-era hops */}
          <div ref={stepRowRef} className="eye-fade pointer-events-none absolute bottom-0 right-5 flex items-end gap-1">
            {[
              { dir: "‹", target: prev, label: "Previous era" },
              { dir: "◉", target: undefined, label: "All eras" },
              { dir: "›", target: next, label: "Next era" },
            ].map(({ dir, target, label }) =>
              dir === "◉" ? (
                // between the hops, the eye: every era, through the eye that draws it (EraEyePicker)
                <button
                  key={dir}
                  data-ride="upright"
                  data-gap="8"
                  type="button"
                  aria-label="All eras: open the era network"
                  title="All eras"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    modules.open("eras", { x: r.left + r.width / 2, y: r.top + r.height / 2 });
                  }}
                  className="time-stepper-step pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border outline-none"
                  style={{ borderColor: "var(--accent-color)", color: "var(--accent-color)" }}
                >
                  <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 8 Q8 2.2 14.5 8 Q8 13.8 1.5 8 Z" />
                    <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
                  </svg>
                </button>
              ) : (
              <button
                key={dir}
                data-ride="upright"
                data-gap="8"
                type="button"
                disabled={!target}
                aria-label={target ? `${label}: ${target.id} ${eraLabel(target.name)}` : `No ${label.toLowerCase()}`}
                onClick={() => target && onPickEra(target.id)}
                onPointerEnter={() => target && setHoverId(target.id)}
                onPointerLeave={() => setHoverId(null)}
                className="time-stepper-step pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border text-[15px] leading-none outline-none disabled:cursor-default disabled:opacity-30"
                style={{ borderColor: "color-mix(in srgb, var(--nav-text) 22%, transparent)", color: "var(--nav-text)" }}
              >
                <span aria-hidden>{dir}</span>
              </button>
              ),
            )}
          </div>
        </>
      ) : null}

      <EraNavOverlay open={menuOpen} onClose={() => setMenuOpen(false)} onPickEra={onPickEra} eraId={eraId} />
    </header>
  );
}

export default Navbar;
