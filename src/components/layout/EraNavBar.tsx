"use client";

/**
 * EraNavBar — persistent, interactive era navigator. Shows the era's CHARACTER
 * (the gazing EraEye + year + label) and, on hover/focus, reveals the CONCEPT
 * behind it (the era's design lesson + signature traits). Steps eras with ◂ / ▸
 * and opens the full EraTimeMachine via the eye or ◷. Era-token themed, fixed
 * top-center.
 */

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { useModules } from "@/contexts/ModuleContext";
import { EraEye } from "./EraEye";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function EraNavBar() {
  const { eras, currentEra, currentEraId, setEra } = useDesignEra();
  const { open } = useModules();
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  const { idx, prev, next } = useMemo(() => {
    const i = eras.findIndex((e) => e.id === currentEraId);
    return {
      idx: i,
      prev: i > 0 ? eras[i - 1] : null,
      next: i >= 0 && i < eras.length - 1 ? eras[i + 1] : null,
    };
  }, [eras, currentEraId]);

  const stepBtn =
    "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[15px] leading-none transition-transform focus-visible:outline-none disabled:opacity-25 disabled:cursor-default";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-2 z-[95] flex justify-center px-2"
      role="navigation"
      aria-label="Era navigator"
    >
      <motion.div
        id="era-nav"
        layout
        onHoverStart={() => setExpanded(true)}
        onHoverEnd={() => setExpanded(false)}
        onFocusCapture={() => setExpanded(true)}
        onBlurCapture={() => setExpanded(false)}
        className="pointer-events-auto flex max-w-[94vw] flex-col overflow-hidden border backdrop-blur-md"
        style={{
          borderColor: "var(--border-color)",
          background: "color-mix(in srgb, var(--bg-card) 88%, transparent)",
          color: "var(--text-main)",
          fontFamily: "var(--font-main)",
          borderRadius: "var(--era-radius-lg, 18px)",
          boxShadow:
            "0 8px 26px color-mix(in srgb, var(--text-main) 16%, transparent)",
        }}
        transition={{ duration: reduce ? 0.15 : 0.34, ease: EASE_OUT }}
      >
        {/* ── main row ── */}
        <div className="flex items-center gap-2 px-2 py-1.5">
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

          {/* era identity (character) — opens the time machine */}
          <button
            type="button"
            onClick={() => open("eras")}
            aria-label={`Era ${currentEra.name} — travel all eras`}
            className="flex min-w-0 items-center gap-2.5 rounded-full px-2 py-1 transition-colors focus-visible:outline-none"
          >
            <span className="shrink-0">
              <EraEye era={currentEra} height={26} gaze />
            </span>
            <span className="flex min-w-0 flex-col items-start leading-none">
              <span className="flex items-baseline gap-1.5">
                <span
                  className="text-[17px] font-bold tabular-nums leading-none"
                  style={{ color: "var(--accent-color)" }}
                >
                  {currentEraId}
                </span>
                <span
                  className="text-[8px] tabular-nums opacity-50"
                  style={{ color: "var(--text-muted)" }}
                >
                  {idx + 1}/{eras.length}
                </span>
              </span>
              <span
                className="mt-1 max-w-[42vw] truncate text-[10px] font-semibold uppercase tracking-[0.16em] sm:max-w-[240px]"
                style={{ color: "var(--text-muted)" }}
              >
                {currentEra.era}
              </span>
            </span>
          </button>

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

          <span
            className="mx-0.5 h-6 w-px shrink-0"
            style={{ background: "var(--border-color)", opacity: 0.5 }}
            aria-hidden
          />

          <button
            type="button"
            onClick={() => open("eras")}
            aria-label="Travel all eras — open the time machine"
            title="Travel all eras"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[15px] leading-none transition-transform hover:-translate-y-0.5 focus-visible:outline-none"
            style={{
              borderColor: "var(--border-color)",
              background: "color-mix(in srgb, var(--accent-color) 14%, transparent)",
              color: "var(--accent-color)",
            }}
          >
            ◷
          </button>
        </div>

        {/* ── concept reveal (character + concept behind this era) ── */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="concept"
              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0.12 : 0.3, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div
                className="mx-2 mb-2 flex flex-col gap-2 border-t px-2 pt-2"
                style={{ borderColor: "var(--border-color)" }}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-[9px] font-semibold uppercase tracking-[0.28em]"
                    style={{ color: "var(--accent-color)" }}
                  >
                    The concept
                  </span>
                  <span
                    className="truncate text-[11px] font-semibold"
                    style={{ color: "var(--text-main)" }}
                  >
                    {currentEra.name}
                  </span>
                </div>
                <p
                  className="max-w-[min(86vw,420px)] text-[12px] leading-snug"
                  style={{ color: "var(--text-muted)" }}
                >
                  {currentEra.lesson}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentEra.keyElements?.slice(0, 4).map((k) => (
                    <span
                      key={k}
                      className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.1em]"
                      style={{
                        borderColor: "var(--border-color)",
                        color: "var(--text-main)",
                        background:
                          "color-mix(in srgb, var(--accent-color) 8%, transparent)",
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => open("era-story")}
                  className="w-fit text-[10px] uppercase tracking-[0.14em] underline-offset-2 hover:underline focus-visible:outline-none"
                  style={{ color: "var(--accent-color)" }}
                >
                  ▸ why this screen — full story
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default EraNavBar;
