"use client";

/**
 * EraNavOverlay — the mobile menu.
 *
 * Plain first: the five places as big rows, then every era as a year to tap.
 * Visitors on phones read the era's game as a puzzle standing between them
 * and the Work page, so the game is folded away at the foot as an optional
 * toy ("Play the 1995 menu"), still the era's own way to get around.
 *
 * Owns the chrome every era shares: the dialog container, focus trap, Esc to
 * close, scroll-lock and the era-labeled header. Games read era tokens from
 * CSS vars and fill the space they're given.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { usePathname, useRouter } from "next/navigation";
import { DESTINATIONS, type EraNavGame } from "./types";
import { getEraNavGame } from "./registry";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export interface EraNavOverlayProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (href: string) => void;
  /** Travel to another era (the navbar's own handler, which knows about the notebook). */
  onPickEra?: (eraId: string) => void;
  /** The era on screen, if it isn't the site's (the notebook keeps its own). */
  eraId?: string;
}

const eraLabel = (name: string) => name.replace(/^\d{4}:\s*/, "");

export function EraNavOverlay({ open, onClose, onNavigate, onPickEra, eraId: eraIdProp }: EraNavOverlayProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { eras, currentEra } = useDesignEra();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const eraId = eraIdProp ?? currentEra.id;
  const era = eras.find((e) => e.id === eraId) ?? currentEra;
  const Game: EraNavGame = getEraNavGame(eraId);
  const eraName = eraLabel(era.name);
  const here = pathname ?? "/";

  const handleNavigate = useCallback(
    (href: string) => {
      if (onNavigate) onNavigate(href);
      else router.push(href);
      onClose();
    },
    [onNavigate, onClose, router],
  );

  const pickEra = (id: string) => {
    if (id !== eraId) onPickEra?.(id);
    onClose();
  };

  // A menu opens plain; the game waits to be asked for each time.
  useEffect(() => {
    if (!open) setPlaying(false);
  }, [open]);

  // Focus trap + scroll lock + Esc.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const body = document.body;
    const main = document.getElementById("main-content");
    const prevOverflow = body.style.overflow;
    main?.setAttribute("inert", "");
    body.style.overflow = "hidden";

    const focusFirst = () => {
      const first = ref.current?.querySelector<HTMLElement>("a, button, [tabindex]:not([tabindex='-1'])");
      first?.focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const el = ref.current;
      if (!el) return;
      // The bar's menu toggle (now showing ✕) is the close control, so it joins the loop.
      const toggle = document.querySelector<HTMLElement>('[aria-controls="site-mobile-menu"]');
      const nodes = [
        ...(toggle ? [toggle] : []),
        ...Array.from(el.querySelectorAll<HTMLElement>("a, button, [href], [tabindex]:not([tabindex='-1'])")),
      ].filter((n) => !n.hasAttribute("disabled") && n.offsetParent !== null);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      main?.removeAttribute("inert");
      (previouslyFocused.current ?? document.body).focus?.();
    };
  }, [open, onClose]);

  const rule = "color-mix(in srgb, var(--nav-text) 14%, transparent)";
  const muted = "var(--nav-text-muted, var(--text-muted))";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="era-nav-overlay"
          ref={ref}
          id="site-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={`${eraName} navigation`}
          className="pointer-events-auto fixed inset-x-0 bottom-0 z-[94] flex flex-col min-[1100px]:hidden"
          style={{
            top: "var(--simple-game-nav-bottom, 64px)",
            // some eras' nav surface is translucent; the page must not read through a menu
            backgroundColor: "var(--bg-main, #0b0b0b)",
            backgroundImage: "linear-gradient(var(--nav-surface), var(--nav-surface))",
            fontFamily: "var(--font-main, ui-sans-serif, system-ui)",
            color: "var(--nav-text)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE_OUT }}
        >
          {/* Era label. Closing lives on the bar's toggle (✕) and Esc — one close control, not two. */}
          <div className="flex shrink-0 items-center border-b px-5 py-2.5" style={{ borderColor: rule }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: muted }}>
              {eraId} · {eraName}
            </span>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            {/* The places, plainly. */}
            <nav aria-label="Site">
              <ul>
                {DESTINATIONS.map((d) => {
                  const active = here === d.href || (d.href !== "/" && !d.href.includes("#") && here.startsWith(d.href));
                  return (
                    <li key={d.href} className="border-b" style={{ borderColor: rule }}>
                      <Link
                        href={d.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className="flex min-h-14 items-center justify-between gap-3 text-[22px] leading-none tracking-[0.02em] outline-none focus-visible:underline"
                        style={{ color: active ? "var(--accent-color)" : "var(--nav-text)" }}
                      >
                        <span>{d.label}</span>
                        <span aria-hidden className="text-[16px]" style={{ color: active ? "var(--accent-color)" : muted }}>
                          {active ? "●" : "→"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Every era, one tap away. */}
            <section aria-labelledby="menu-era-heading" className="mt-6">
              <h2 id="menu-era-heading" className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: muted }}>
                Era
              </h2>
              <div className="mt-2.5 grid grid-cols-5 gap-1.5">
                {eras.map((e) => {
                  const active = e.id === eraId;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => pickEra(e.id)}
                      aria-pressed={active}
                      aria-label={`${e.id} — ${eraLabel(e.name)}`}
                      className="flex min-h-11 items-center justify-center rounded-full border text-[13px] tabular-nums outline-none focus-visible:ring-2"
                      style={{
                        borderColor: active ? "var(--accent-color)" : rule,
                        background: active ? "var(--accent-color)" : "transparent",
                        color: active ? "var(--nav-surface)" : "var(--nav-text)",
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {e.id}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* The era's own way round, for anyone who wants to play. */}
            <section className="mt-6 border-t pt-2" style={{ borderColor: rule }}>
              <button
                type="button"
                onClick={() => setPlaying((v) => !v)}
                aria-expanded={playing}
                aria-controls="menu-era-game"
                className="flex min-h-11 w-full items-center justify-between text-left text-[13px] outline-none focus-visible:underline"
                style={{ color: muted }}
              >
                <span>Play the {eraId} menu</span>
                <span aria-hidden className="transition-transform duration-200" style={{ transform: playing ? "rotate(180deg)" : "none" }}>
                  ↓
                </span>
              </button>
              {playing && (
                <div
                  id="menu-era-game"
                  className="mt-2 h-[min(30rem,62dvh)] overflow-hidden rounded-lg border"
                  style={{ borderColor: rule }}
                >
                  <Game dests={DESTINATIONS} activeHref={here} onNavigate={handleNavigate} reduce={!!reduce} />
                </div>
              )}
            </section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
