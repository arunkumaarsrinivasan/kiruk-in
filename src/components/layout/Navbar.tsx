"use client";

/**
 * Navbar — the eye. There is no bar: every page is seen through an eye opening.
 *
 * The upper and lower lids are parabolas, deepest at the screen edges and
 * thinnest in the middle. The corner space they leave holds the nav, and every
 * item rides its lid — offset and tilted to follow the curve:
 *   upper-left   brand + page trail
 *   upper-right  Work / Read / About / Contact (menu button below FULL_NAV)
 *   lower lid    every era year, like a ruler
 *   lower-left   name of the era under the pointer (or the current one)
 *   lower-right  ‹ › one-era hops
 *
 * Scrolling down widens the eye for reading (lids retract, labels fade);
 * scrolling up, pointing at a lid, or tabbing in brings them back. Route
 * changes blink. Publishes --simple-game-nav-bottom (upper-lid depth at the
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

/** Lid thickness at x: `mid` at the centre, `edge` at both screen edges. */
const depthAt = (lid: Lid, x: number, w: number) => {
  const u = (x - w / 2) / (w / 2);
  return lid.mid + (lid.edge - lid.mid) * u * u;
};
const slopeAt = (lid: Lid, x: number, w: number) => {
  const half = w / 2;
  return (2 * (lid.edge - lid.mid) * (x - half)) / (half * half);
};

// A quadratic with its control point at x = w/2 traces exactly the parabola above.
const ctrl = (lid: Lid) => 2 * lid.mid - lid.edge;
const topFill = (l: Lid, w: number) => `M0 0H${w}V${l.edge}Q${w / 2} ${ctrl(l)} 0 ${l.edge}Z`;
/** Upper lash line: a crescent, ~3px at the centre tapering to a hairline at the edges. */
const topLine = (l: Lid, w: number) => {
  const inner: Lid = { edge: l.edge - 0.75, mid: l.mid - 3 };
  return `M0 ${l.edge}Q${w / 2} ${ctrl(l)} ${w} ${l.edge}L${w} ${inner.edge}Q${w / 2} ${ctrl(inner)} 0 ${inner.edge}Z`;
};
const bottomFill = (l: Lid, w: number, h: number) => `M0 ${h}H${w}V${h - l.edge}Q${w / 2} ${h - ctrl(l)} 0 ${h - l.edge}Z`;
const bottomLine = (l: Lid, w: number, h: number) => `M0 ${h - l.edge}Q${w / 2} ${h - ctrl(l)} ${w} ${h - l.edge}`;

/**
 * Place every `[data-ride]` child of `rowRef` on its lid: shift it so it sits
 * just inside the lid edge at its own x, and tilt it to the curve's tangent
 * (`data-ride="upright"` skips the tilt). Rows must be positioned so they are
 * their items' offsetParent.
 */
function useRide(
  rowRef: React.RefObject<HTMLDivElement | null>,
  side: "top" | "bottom",
  lid: Lid,
  vw: number,
  layoutKey: string,
) {
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || !vw) return;
    const place = () => {
      const left = row.getBoundingClientRect().left;
      row.querySelectorAll<HTMLElement>("[data-ride]").forEach((el) => {
        const cx = left + el.offsetLeft + el.offsetWidth / 2;
        const h = el.offsetHeight;
        const d = depthAt(lid, cx, vw);
        const gap = Number(el.dataset.gap ?? 4);
        const tilt = el.dataset.ride === "upright" ? 0 : (Math.atan(slopeAt(lid, cx, vw)) * 180) / Math.PI;
        el.style.transform =
          side === "top"
            ? `translateY(${Math.max(d - gap - h, 2)}px) rotate(${tilt}deg)`
            : `translateY(${Math.min(h + gap - d, -2)}px) rotate(${-tilt}deg)`;
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(row);
    document.fonts?.ready.then(place).catch(() => {});
    return () => ro.disconnect();
  }, [rowRef, side, lid.edge, lid.mid, vw, layoutKey]);
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
  const workOpen = !!pathname && (pathname === "/work" || pathname.startsWith("/work/"));
  const contactOpen = pathname === "/contact";
  const { eras, currentEraId } = useDesignEra();
  const travel = useEraTravelOptional();
  const notebook = useNotebookEraOptional();
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
  useLayoutEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--simple-game-nav-bottom", `${rest.top.edge}px`);
    root.setProperty("--eye-lid-bottom", `${rest.bottom.edge}px`);
  }, [rest.top.edge, rest.bottom.edge]);

  const draw = useCallback(() => {
    const { w, h } = size;
    if (!w || !h) return;
    const closed: Eye = { top: { edge: h * 0.56, mid: h * 0.56 }, bottom: { edge: h * 0.46, mid: h * 0.46 } };
    const g = mixEye(mixEye(rest, WIDE, wideMV.get()), closed, blink.get());
    topFillRef.current?.setAttribute("d", topFill(g.top, w));
    topLineRef.current?.setAttribute("d", topLine(g.top, w));
    bottomFillRef.current?.setAttribute("d", bottomFill(g.bottom, w, h));
    bottomLineRef.current?.setAttribute("d", bottomLine(g.bottom, w, h));
  }, [size, rest, wideMV, blink]);

  useEffect(() => {
    draw();
    const a = wideMV.on("change", draw);
    const b = blink.on("change", draw);
    return () => {
      a();
      b();
    };
  }, [draw, wideMV, blink]);

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
    const onPointer = (e: PointerEvent) => {
      if (e.clientY < 90 || e.clientY > window.innerHeight - 80) setWide(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

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
    const ctl = animate(blink, [0, 1, 1, 0], { duration: 0.42, times: [0, 0.28, 0.4, 1], ease: [0.4, 0, 0.2, 1] });
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
    if (menuOpen) setWide(false);
  }, [menuOpen]);

  const trailKey = trail?.map((t) => t.label).join("/") ?? "";
  useRide(brandRowRef, "top", rest.top, size.w, `${trailKey}|${full}`);
  useRide(linksRowRef, "top", rest.top, size.w, `${full}|${menuOpen}`);
  useRide(yearsRowRef, "bottom", rest.bottom, size.w, `${eraId}|${full}|${eras.length}`);
  useRide(captionRowRef, "bottom", rest.bottom, size.w, `${shown?.id}|${full}`);
  useRide(stepRowRef, "bottom", rest.bottom, size.w, `${eraId}|${full}`);

  const yearsInset = full ? Math.round(size.w * 0.22) : 10;
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
      onFocusCapture={() => setWide(false)}
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
        {trail?.map((item, i) => {
          const last = i === trail.length - 1;
          return (
            <span key={`${item.label}-${i}`} data-ride className="eye-fade pointer-events-auto flex h-6 items-center gap-1.5 pl-1.5 text-[12px]">
              <span aria-hidden style={{ color: "var(--nav-text-muted)", opacity: 0.6 }}>
                /
              </span>
              {item.href && !last ? (
                <Link href={item.href} className="site-trail-link">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="block max-w-[14ch] truncate" style={{ color: "var(--nav-text)" }}>
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* upper-right: page links, or the menu button on narrow screens */}
      <div ref={linksRowRef} className="pointer-events-none absolute right-3 top-0 flex items-start gap-1 sm:right-5">
        {full ? (
          <nav aria-label="Primary" className="contents">
            <NavHref label="Work" href="/work" active={workOpen} title="Work — selected projects" />
            <NavHref label="Read" href="/notebook" active={notebookOpen} title="Read — notebook and essays" />
            <NavHref label="About" href="/#about" active={false} title="About — story and background" />
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
        {eras.map((era, i) => {
          const active = era.id === eraId;
          const tick =
            i > 0 ? (
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
                data-gap="4"
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
                className="eye-year pointer-events-auto flex h-[22px] items-center rounded-full px-1.5 text-[11px] tabular-nums leading-none outline-none"
                style={{
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
              { dir: "›", target: next, label: "Next era" },
            ].map(({ dir, target, label }) => (
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
            ))}
          </div>
        </>
      ) : null}

      <EraNavOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

export default Navbar;
