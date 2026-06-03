"use client";

/**
 * EraNavBar — a slim, persistent era-switcher bar. Steps through eras with
 * ◂ / ▸, shows the current era (eye + year + name), and opens the full
 * EraTimeMachine via the eye or "travel". Era-token themed so it reskins with
 * the page. Fixed top-center, out of the way; the rest of navigation lives in
 * each era's content.
 */

import React, { useMemo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { useModules } from "@/contexts/ModuleContext";
import { EraEye } from "./EraEye";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function EraNavBar() {
  const { eras, currentEra, currentEraId, setEra } = useDesignEra();
  const { open } = useModules();
  const reduce = useReducedMotion();

  const { prev, next } = useMemo(() => {
    const i = eras.findIndex((e) => e.id === currentEraId);
    return {
      prev: i > 0 ? eras[i - 1] : null,
      next: i >= 0 && i < eras.length - 1 ? eras[i + 1] : null,
    };
  }, [eras, currentEraId]);

  const stepBtn =
    "grid h-7 w-7 place-items-center rounded-full border text-[13px] transition-transform focus-visible:outline-none disabled:opacity-30 disabled:cursor-default";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-2 z-[95] flex justify-center px-2"
      role="navigation"
      aria-label="Era switcher"
    >
      <motion.div
        id="era-nav"
        className="pointer-events-auto flex max-w-[94vw] items-center gap-1.5 rounded-full border px-1.5 py-1 backdrop-blur-md"
        style={{
          borderColor: "var(--border-color)",
          background: "color-mix(in srgb, var(--bg-card) 86%, transparent)",
          color: "var(--text-main)",
          fontFamily: "var(--font-main)",
          boxShadow:
            "0 6px 22px color-mix(in srgb, var(--text-main) 14%, transparent)",
        }}
        initial={reduce ? false : { y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        {/* prev era */}
        <motion.button
          type="button"
          className={stepBtn}
          style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}
          onClick={() => prev && setEra(prev.id)}
          disabled={!prev}
          aria-label={prev ? `Previous era — ${prev.name}` : "Earliest era"}
          title={prev ? prev.name : undefined}
          whileHover={reduce || !prev ? undefined : { x: -2 }}
          whileTap={reduce || !prev ? undefined : { scale: 0.9 }}
        >
          ◂
        </motion.button>

        {/* current era — opens the time machine */}
        <button
          type="button"
          onClick={() => open("eras")}
          aria-label={`Era ${currentEra.name} — travel all eras`}
          className="flex items-center gap-2 rounded-full px-2 py-0.5 focus-visible:outline-none"
        >
          <EraEye era={currentEra} height={20} gaze={false} />
          <span className="flex flex-col items-start leading-none">
            <span
              className="text-[13px] font-bold tabular-nums"
              style={{ color: "var(--accent-color)" }}
            >
              {currentEraId}
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentEraId}
                className="hidden max-w-[170px] truncate text-[9px] uppercase tracking-[0.14em] sm:block"
                style={{ color: "var(--text-muted)" }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                {currentEra.era}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>

        {/* next era */}
        <motion.button
          type="button"
          className={stepBtn}
          style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}
          onClick={() => next && setEra(next.id)}
          disabled={!next}
          aria-label={next ? `Next era — ${next.name}` : "Latest era"}
          title={next ? next.name : undefined}
          whileHover={reduce || !next ? undefined : { x: 2 }}
          whileTap={reduce || !next ? undefined : { scale: 0.9 }}
        >
          ▸
        </motion.button>

        {/* travel — full time machine */}
        <button
          type="button"
          onClick={() => open("eras")}
          aria-label="Travel all eras — open the time machine"
          className="ml-0.5 grid h-7 w-7 place-items-center rounded-full border text-[13px] transition-transform hover:-translate-y-0.5 focus-visible:outline-none"
          style={{
            borderColor: "var(--border-color)",
            background: "color-mix(in srgb, var(--accent-color) 12%, transparent)",
            color: "var(--accent-color)",
          }}
          title="Travel all eras"
        >
          ◷
        </button>
      </motion.div>
    </div>
  );
}

export default EraNavBar;
