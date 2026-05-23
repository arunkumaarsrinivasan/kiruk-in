"use client";

/**
 * SimpleGameNav — full-width top bar: KIRUK.IN, ERA (left); Works + Menu (right, wide menu).
 * Game menu also: Shift+M.
 */

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { GRID_SIZE, cn } from "@/lib/utils";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { useGameMode } from "@/contexts/GameModeContext";
import { GameMenuOverlay } from "./GameMenuOverlay";
import { EraTimeMachine } from "@/components/era-time-machine/EraTimeMachine";
import { EraEye } from "./EraEye";

/** Top inset of the nav bar from the viewport (0 = flush with top). */
export const SIMPLE_GAME_NAV_FLOAT_TOP_PX = 0;
export const SIMPLE_GAME_NAV_BAR_HEIGHT_PX = GRID_SIZE * 3;
/** `DynamicContextBar` fixed `top` — directly under the nav bar box */
export const SIMPLE_GAME_NAV_CONTEXT_BAR_TOP_PX =
  SIMPLE_GAME_NAV_FLOAT_TOP_PX + SIMPLE_GAME_NAV_BAR_HEIGHT_PX;
/** `<main>` padding to clear nav + soft elevation + gap */
export const SIMPLE_GAME_NAV_CONTENT_OFFSET_PX =
  SIMPLE_GAME_NAV_FLOAT_TOP_PX + SIMPLE_GAME_NAV_BAR_HEIGHT_PX + 10;

/** Set on `document.documentElement` from SimpleGameNav (viewport px); fallback in consumers. */
export const SIMPLE_GAME_NAV_BOTTOM_CSS_VAR = "--simple-game-nav-bottom";

function navHaptic(kind: "tap" | "confirm" = "tap") {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function"
  )
    return;
  if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
    return;
  if (kind === "confirm") navigator.vibrate([10, 6, 14]);
  else navigator.vibrate(11);
}

/** Stepped 0→1 easing: discrete plateaus (pixel/CRT feel, no spring overshoot). */
function pixelStepEase(steps: number): (t: number) => number {
  const n = Math.max(2, Math.round(steps));
  return (t: number) => Math.min(1, Math.floor(t * n) / n);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN NAVIGATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface SimpleGameNavProps {
  isGameActive?: boolean;
  currentGameId?: string;
  currentGameName?: string;
  currentGameIcon?: string;
  onToggleGame?: () => void;
}

const SimpleGameNav: React.FC<SimpleGameNavProps> = ({
  isGameActive: _isGameActive = false,
  currentGameId: _currentGameId = "snake",
  currentGameName: _currentGameName = "SNAKE TRAIL",
  currentGameIcon: _currentGameIcon = "bolt",
  onToggleGame: _onToggleGame,
}) => {
  const { currentEra, currentEraId, setEra } = useDesignEra();
  const { toggleMenu } = useGameMode();
  const pathname = usePathname();
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Esc closes the expanded eye
  useEffect(() => {
    if (!hubOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setHubOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hubOpen]);

  const router = useRouter();
  const handleEraSelect = (eraId: string) => {
    setEra(eraId);
  };

  const reduceMotion = useReducedMotion();
  const step = pixelStepEase(reduceMotion ? 4 : 10);
  const navTransition = reduceMotion
    ? {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1] as const,
      }
    : {
        type: "tween" as const,
        duration: 0.48,
        ease: step,
      };
  const tapTransition = reduceMotion
    ? { duration: 0.12, ease: [0.25, 0.1, 0.25, 1] as const }
    : { type: "tween" as const, duration: 0.1, ease: pixelStepEase(5) };

  const navMeasureRaf = useRef(0);

  const publishNavBottom = useCallback(() => {
    if (typeof document === "undefined") return;
    cancelAnimationFrame(navMeasureRaf.current);
    navMeasureRaf.current = requestAnimationFrame(() => {
      navMeasureRaf.current = 0;
      const el = navRef.current;
      if (!el) return;
      const bottom = Math.ceil(el.getBoundingClientRect().bottom);
      document.documentElement.style.setProperty(
        SIMPLE_GAME_NAV_BOTTOM_CSS_VAR,
        `${bottom}px`,
      );
    });
  }, []);

  useLayoutEffect(() => {
    publishNavBottom();
    const el = navRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => publishNavBottom());
    ro.observe(el);
    globalThis.addEventListener("resize", publishNavBottom, { passive: true });
    return () => {
      ro.disconnect();
      globalThis.removeEventListener("resize", publishNavBottom);
      cancelAnimationFrame(navMeasureRaf.current);
    };
  }, [publishNavBottom]);

  const onPortfolioPath =
    pathname === "/portfolio" || pathname.startsWith("/portfolio/");

  const accentColor = currentEra.colors.accent || currentEra.colors.primary;

  // Eye expands into an inline capsule revealing these
  const hubItems: Array<{
    key: string;
    icon: string;
    label: string;
    primary?: boolean;
    active?: boolean;
    run: () => void;
  }> = [
    { key: "works", icon: "◳", label: "Works", active: onPortfolioPath, run: () => router.push("/portfolio") },
    { key: "eras", icon: "◷", label: "Eras", primary: true, run: () => setIsTimelineOpen(true) },
    { key: "menu", icon: "☰", label: "Menu", run: () => toggleMenu() },
  ];

  const runHub = (fn: () => void, confirm = false) => {
    navHaptic(confirm ? "confirm" : "tap");
    setHubOpen(false);
    fn();
  };

  const eyeH = 44;
  const eyeW = Math.round(eyeH * 1.62); // wide 1.6:1 mark
  const knobW = eyeW + 16;
  const capsuleH = eyeH + 14;
  const collapsedW = eyeW + 18;
  const expandedW = 340;

  const navShadow = useMemo(
    () =>
      `0 2px 14px color-mix(in srgb, var(--text-main) 7%, transparent), 0 1px 2px color-mix(in srgb, var(--text-main) 5%, transparent)`,
    [],
  );

  const borderRadiusPx = useMemo(() => {
    const t = currentEra.designTokens;
    return Math.min(t.borderRadius, 10);
  }, [currentEra]);

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
        role="banner"
      >
        <motion.div
          ref={navRef}
          id="navigation"
          className="pointer-events-auto relative box-border flex min-h-0 w-full min-w-0 items-stretch justify-between overflow-visible border border-[var(--border-color)] bg-[var(--bg-card)]/90 text-[var(--text-main)] backdrop-blur-md"
          style={{ boxShadow: navShadow, height: SIMPLE_GAME_NAV_BAR_HEIGHT_PX, marginTop: SIMPLE_GAME_NAV_FLOAT_TOP_PX }}
          animate={{ borderRadius: borderRadiusPx }}
          transition={navTransition}
        >
          {/* the all-seeing eye that EXPANDS into an inline capsule control */}
          <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center">
            <motion.div
              className="pointer-events-auto relative flex items-center overflow-hidden rounded-full border backdrop-blur-md"
              animate={{
                width: hubOpen ? expandedW : collapsedW,
                borderColor: hubOpen ? accentColor : "var(--border-color)",
              }}
              transition={reduceMotion ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 26 }}
              style={{
                height: capsuleH,
                borderWidth: 2,
                background: "color-mix(in srgb, var(--bg-card) 92%, transparent)",
                boxShadow: hubOpen
                  ? `0 0 30px color-mix(in srgb, ${accentColor} 40%, transparent), 0 8px 24px rgba(0,0,0,0.35)`
                  : `0 4px 14px rgba(0,0,0,0.25)`,
              }}
            >
              {/* eye knob — toggles expand */}
              <motion.button
                type="button"
                className="grid shrink-0 place-items-center focus-visible:outline-none"
                style={{ width: knobW, height: capsuleH }}
                whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                onClick={() => { navHaptic("tap"); setHubOpen((o) => !o); }}
                aria-label={hubOpen ? "Close menu" : `Era ${currentEraId} — open menu`}
                aria-expanded={hubOpen}
              >
                <EraEye era={currentEra} height={eyeH} />
              </motion.button>

              {/* inline options revealed as the capsule expands */}
              <AnimatePresence>
                {hubOpen && (
                  <motion.div
                    className="flex min-w-0 flex-1 items-center pr-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {hubItems.map((it, i) => (
                      <motion.button
                        key={it.key}
                        type="button"
                        className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1 focus-visible:outline-none"
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -14, scale: 0.7 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8, scale: 0.8 }}
                        transition={reduceMotion ? { duration: 0.12 } : { duration: 0.32, delay: 0.06 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={reduceMotion ? undefined : { y: -2 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                        onClick={() => runHub(it.run, it.primary)}
                        aria-label={it.label}
                        style={{ color: it.primary || it.active ? accentColor : "var(--text-main)" }}
                      >
                        <span className="text-[15px] leading-none">{it.icon}</span>
                        <span className="text-[8.5px] font-semibold uppercase tracking-[0.14em] [font-family:var(--font-main,ui-sans-serif,system-ui)]">
                          {it.label}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* scrim — dims page while the eye is open */}
      <AnimatePresence>
        {hubOpen && (
          <motion.div
            key="hub-scrim"
            className="fixed inset-0 z-[40]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: "color-mix(in srgb, var(--bg-main, #000) 50%, transparent)", backdropFilter: "blur(3px)" }}
            onClick={() => setHubOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <GameMenuOverlay />

      <EraTimeMachine
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        currentEraId={currentEraId}
        onEraSelect={handleEraSelect}
      />
    </>
  );
};

export default SimpleGameNav;
