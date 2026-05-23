"use client";

/**
 * First-visit era picker — all eyes in one horizontal scroll, minimal copy.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AVAILABLE_THEMES, type ThemeConfig } from "@/data/portfolio-data";
import { EraEye } from "@/components/layout/EraEye";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const ERA_PICKER_ATTR = "data-era-picker-active";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = globalThis.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return coarse;
}

function nearestEyeIndex(
  container: HTMLElement,
  items: (HTMLButtonElement | null)[],
): number {
  const rect = container.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  let closest = 0;
  let minDist = Number.POSITIVE_INFINITY;
  items.forEach((btn, i) => {
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const dist = Math.abs(r.left + r.width / 2 - centerX);
    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  });
  return closest;
}

function eyeNeedsScroll(
  container: HTMLElement,
  btn: HTMLButtonElement,
  pad = 20,
): boolean {
  const cr = container.getBoundingClientRect();
  const br = btn.getBoundingClientRect();
  return br.left < cr.left + pad || br.right > cr.right - pad;
}

interface ImmersiveEraLoadingPageProps {
  onComplete: () => void;
}

export default function ImmersiveEraLoadingPage({
  onComplete,
}: ImmersiveEraLoadingPageProps) {
  const { setTheme } = useTheme();
  const reduce = useReducedMotion();
  const isCoarse = useCoarsePointer();
  const themes = AVAILABLE_THEMES;
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollRaf = useRef(0);
  const focusFromKeyboard = useRef(false);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  const focused = themes[focusedIndex] ?? themes[0];
  const accent = focused.colors.accent || focused.colors.primary;

  useEffect(() => {
    document.documentElement.setAttribute(ERA_PICKER_ATTR, "");
    return () => document.documentElement.removeAttribute(ERA_PICKER_ATTR);
  }, []);

  const scrollEyeIntoView = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const btn = itemRefs.current[index];
      const container = scrollRef.current;
      if (!btn || !container || !eyeNeedsScroll(container, btn)) return;
      btn.scrollIntoView({
        behavior: reduce ? "auto" : behavior,
        block: "nearest",
        inline: "center",
      });
    },
    [reduce],
  );

  const confirmEra = useCallback(
    (theme: ThemeConfig) => {
      if (exiting) return;
      setExiting(true);
      setTheme(theme.id);
      setTimeout(() => onComplete(), reduce ? 180 : 480);
    },
    [exiting, onComplete, reduce, setTheme],
  );

  useEffect(() => {
    if (focusFromKeyboard.current) {
      scrollEyeIntoView(focusedIndex);
      focusFromKeyboard.current = false;
    }
  }, [focusedIndex, scrollEyeIntoView]);

  useEffect(() => {
    if (!isCoarse || exiting) return;
    const el = scrollRef.current;
    if (!el) return;

    const syncFromScroll = () => {
      cancelAnimationFrame(scrollRaf.current);
      scrollRaf.current = requestAnimationFrame(() => {
        setFocusedIndex(nearestEyeIndex(el, itemRefs.current));
      });
    };

    el.addEventListener("scroll", syncFromScroll, { passive: true });
    syncFromScroll();
    return () => {
      el.removeEventListener("scroll", syncFromScroll);
      cancelAnimationFrame(scrollRaf.current);
    };
  }, [isCoarse, exiting]);

  useEffect(() => {
    if (exiting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        focusFromKeyboard.current = true;
        setFocusedIndex((i) => (i + 1) % themes.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusFromKeyboard.current = true;
        setFocusedIndex((i) => (i - 1 + themes.length) % themes.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const t = themes[focusedIndex];
        if (t) confirmEra(t);
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [exiting, focusedIndex, themes, confirmEra]);

  const handleEyePointer = useCallback(
    (index: number) => {
      if (isCoarse) return;
      setFocusedIndex(index);
    },
    [isCoarse],
  );

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex cursor-default flex-col justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: reduce ? 0.18 : 0.45, ease: EASE_OUT }}
      style={{
        background: `color-mix(in srgb, ${focused.colors.background} 92%, #050505)`,
        touchAction: "manipulation",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a design era"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 transition-[background] duration-500 ease-out"
        style={{
          background: `radial-gradient(ellipse 85% 55% at 50% 42%, color-mix(in srgb, ${accent} 32%, transparent), transparent)`,
        }}
      />

      <header
        className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-8 text-center"
        style={{ color: focused.colors.text }}
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.35em] opacity-50">
          kiruk
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-snug opacity-90">
          Design engineer portfolio by Arun Kumaar
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed opacity-55">
          {isCoarse
            ? "This site re-skins itself across web design history. Swipe the eyes, tap one to enter."
            : "This site re-skins itself across web design history. Scroll the eyes, tap one to enter."}
        </p>
      </header>

      <div
        ref={scrollRef}
        className={cn(
          "relative z-10 flex w-full items-center gap-1 px-[max(1rem,50vw-42rem)] py-16",
          "overflow-x-auto overflow-y-visible",
          "snap-x snap-mandatory scroll-smooth",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          isCoarse && "touch-pan-x",
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {themes.map((theme, i) => {
          const active = i === focusedIndex;
          return (
            <motion.button
              key={theme.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              disabled={exiting}
              className={cn(
                "relative flex shrink-0 snap-center flex-col items-center justify-center",
                "cursor-pointer rounded-3xl px-3 py-4 focus-visible:outline-none sm:px-4",
                "touch-manipulation select-none",
                active && "z-10",
              )}
              initial={reduce ? false : { opacity: 0, scale: 0.82 }}
              animate={{
                opacity: active ? 1 : 0.42,
                scale: active ? 1.08 : 0.92,
              }}
              transition={
                reduce
                  ? { duration: 0.1 }
                  : { duration: 0.35, ease: EASE_OUT }
              }
              onMouseEnter={() => handleEyePointer(i)}
              onFocus={() => {
                focusFromKeyboard.current = true;
                setFocusedIndex(i);
              }}
              onClick={() => confirmEra(theme)}
              aria-label={theme.name}
              aria-current={active ? "true" : undefined}
            >
              <EraEye
                era={theme}
                height={active ? 56 : 46}
                gaze={active && !isCoarse}
                highlighted={active}
                dimmed={!active}
              />
              <span
                className={cn(
                  "mt-2 font-mono text-[10px] tabular-nums tracking-widest transition-opacity",
                  active ? "opacity-90" : "opacity-0",
                )}
                style={{ color: theme.colors.text }}
              >
                {theme.id}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={focused.id}
          className="pointer-events-none relative z-10 mx-auto mt-6 max-w-md px-6 text-center"
          style={{ color: focused.colors.text }}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
        >
          <p className="text-sm font-medium opacity-95">{focused.name}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] opacity-50">
            {focused.era}
          </p>
          <p className="mt-2 text-xs leading-relaxed opacity-65">
            {truncate(focused.description, 110)}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3 px-6">
        {isCoarse && (
          <motion.button
            type="button"
            disabled={exiting}
            className="cursor-pointer touch-manipulation rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.14em] disabled:opacity-40"
            style={{
              background: accent,
              color: focused.colors.background,
            }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            onClick={() => confirmEra(focused)}
          >
            Enter {focused.id}
          </motion.button>
        )}
        <motion.p
          className="pointer-events-none text-[9px] uppercase tracking-[0.22em] opacity-30"
          style={{ color: focused.colors.text }}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {isCoarse ? "swipe · tap to enter" : "scroll · tap to enter"}
        </motion.p>
      </div>
    </motion.div>
  );
}
