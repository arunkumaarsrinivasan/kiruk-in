"use client";

/**
 * EraNavOverlay — the mobile menu shell.
 *
 * Owns the chrome every era shares: the dialog container, focus trap, Esc to
 * close, scroll-lock, the era-labeled header + close button, and a visually
 * hidden link list so the menu is usable without playing the era's game.
 *
 * The era-specific game is looked up in the registry and rendered inside,
 * filling the area below the header. Games read era tokens from CSS vars.
 */

import React, { useCallback, useEffect, useRef } from "react";
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
}

export function EraNavOverlay({ open, onClose, onNavigate }: EraNavOverlayProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentEra } = useDesignEra();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const Game: EraNavGame = getEraNavGame(currentEra.id);
  const eraId = currentEra.id;
  const eraName = currentEra.name.replace(/^\d{4}:\s*/, "");

  const handleNavigate = useCallback(
    (href: string) => {
      if (onNavigate) onNavigate(href);
      else router.push(href);
      onClose();
    },
    [onNavigate, onClose, router],
  );

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
            background: "color-mix(in srgb, var(--nav-surface) 96%, transparent)",
            fontFamily: "var(--font-main, ui-sans-serif, system-ui)",
            color: "var(--nav-text)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE_OUT }}
        >
          {/* Era label. Closing lives on the bar's toggle (✕) and Esc — one close control, not two. */}
          <div
            className="flex shrink-0 items-center border-b px-5 py-2.5"
            style={{ borderColor: "color-mix(in srgb, var(--nav-text) 18%, transparent)" }}
          >
            <span
              className="text-[10px] font-mono uppercase tracking-[0.18em]"
              style={{ color: "var(--nav-text-muted, var(--text-muted))" }}
            >
              {eraId} · {eraName}
            </span>
          </div>

          {/* Era game fills the rest. */}
          <div className="pointer-events-auto min-h-0 flex-1 overflow-auto">
            <Game
              dests={DESTINATIONS}
              activeHref={pathname ?? "/"}
              onNavigate={handleNavigate}
              reduce={!!reduce}
            />
          </div>

          {/* Visually hidden link list — the game is the spatial layer, not the only path. */}
          <nav className="sr-only" aria-label="Site">
            {DESTINATIONS.map((d) => (
              <a key={d.href} href={d.href}>
                {d.label}
              </a>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
