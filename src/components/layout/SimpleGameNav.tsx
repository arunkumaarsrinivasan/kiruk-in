"use client";

/**
 * SimpleGameNav — full-width top bar: KIRUK.IN, ERA (left); Works + Menu (right, wide menu).
 * Game menu also: Shift+M.
 */

import React, { useState, useMemo, useRef, useLayoutEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import { GRID_SIZE, cn } from "@/lib/utils";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { useGameMode } from "@/contexts/GameModeContext";
import { GameMenuOverlay } from "./GameMenuOverlay";
import { EyeTimelineOverlay } from "./EraTimelineOverlay";

const fontPixelBrand = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

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
  const navRef = useRef<HTMLDivElement>(null);

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

  const seg =
    "flex h-full shrink-0 touch-manipulation items-center justify-center border-r border-[var(--border-color)] px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-main)] transition-colors duration-200 ease-out hover:bg-[color-mix(in_srgb,var(--text-main)_5%,var(--bg-card))] sm:px-3 sm:text-[11px] sm:tracking-[0.14em] [font-family:var(--font-main,ui-sans-serif,system-ui)]";
  const segFocus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-inset";

  const onPortfolioPath =
    pathname === "/portfolio" || pathname.startsWith("/portfolio/");

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
          className="pointer-events-auto box-border flex min-h-0 w-full min-w-0 items-stretch overflow-visible border border-[var(--border-color)] bg-[var(--bg-card)]/90 text-[var(--text-main)] backdrop-blur-md"
          style={{ boxShadow: navShadow, height: SIMPLE_GAME_NAV_BAR_HEIGHT_PX, marginTop: SIMPLE_GAME_NAV_FLOAT_TOP_PX }}
          animate={{ borderRadius: borderRadiusPx }}
          transition={navTransition}
        >
          <motion.button
            type="button"
            className={cn(seg, "normal-case tracking-normal", segFocus)}
            transition={tapTransition}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => {
              navHaptic("tap");
              router.push("/");
            }}
            aria-label="Home — KIRUK.IN"
          >
            <span
              className={cn(
                fontPixelBrand.className,
                "inline-block whitespace-nowrap leading-none tracking-tight [-webkit-font-smoothing:none] text-[8px] sm:text-[9px]",
              )}
            >
              KIRUK.IN
            </span>
          </motion.button>

          <div className="flex min-h-0 min-w-0 flex-1 items-stretch">
            <motion.button
              type="button"
              className={cn(
                seg,
                "min-w-[3.75rem] flex-col gap-0.5 py-1 sm:min-w-[4.75rem]",
                segFocus,
              )}
              transition={tapTransition}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              onClick={() => {
                navHaptic("tap");
                setIsTimelineOpen(true);
              }}
              aria-label={`ERA ${currentEraId}, ${currentEra.name}. Open era timeline.`}
            >
              <span className="text-[8px] tracking-[0.2em] text-[var(--text-muted)] sm:text-[9px]">
                ERA
              </span>
              <span className="text-[11px] font-semibold tabular-nums text-[var(--accent-color)] sm:text-xs">
                {currentEraId}
              </span>
            </motion.button>

            <div className="flex min-h-0 min-w-0 flex-1 items-stretch justify-end">
              <motion.button
                type="button"
                className={cn(
                  seg,
                  "border-l border-[var(--border-color)]",
                  onPortfolioPath &&
                    "bg-[color-mix(in_srgb,var(--accent-color)_10%,var(--bg-card))] text-[var(--accent-color)]",
                  segFocus,
                )}
                transition={tapTransition}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                onClick={() => {
                  navHaptic("tap");
                  router.push("/portfolio");
                }}
                aria-label="WORKS, portfolio"
              >
                WORKS
              </motion.button>

              <motion.button
                type="button"
                className={cn(
                  seg,
                  "min-w-[6rem] px-3 sm:min-w-[7rem] sm:px-4",
                  segFocus,
                )}
                transition={tapTransition}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                onClick={() => {
                  navHaptic("confirm");
                  toggleMenu();
                }}
                aria-label="MENU, open navigation"
              >
                MENU
              </motion.button>
            </div>
          </div>
        </motion.div>
      </header>

      <GameMenuOverlay />

      <EyeTimelineOverlay
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        currentEraId={currentEraId}
        onEraSelect={handleEraSelect}
      />
    </>
  );
};

export default SimpleGameNav;
