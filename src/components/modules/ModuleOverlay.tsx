"use client";

/**
 * ModuleOverlayHost — renders the single open module as a fullscreen dialog
 * that grows from its dock card's screen position and shrinks back on close.
 * The `eras` module is special-cased to the existing EraTimeMachine overlay.
 *
 * Unmount is controlled by a timeout (not AnimatePresence) — AnimatePresence
 * exit does not reliably unmount portaled children here, so we keep the panel
 * mounted through the shrink animation and drop it after it settles.
 */

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useModules } from "@/contexts/ModuleContext";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { EraTimeMachine } from "@/components/era-time-machine/EraTimeMachine";
import type { ModuleId } from "@/contexts/ModuleContext";
import { MODULE_CONTENT, getModuleMeta } from "./content";
import { useModuleA11y } from "./useModuleA11y";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function ModuleOverlayHost() {
  const { openId, origin, close } = useModules();
  const { currentEraId, setEra } = useDesignEra();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const erasOpen = openId === "eras";
  const active = !!openId && !erasOpen;

  // Keep the last panel module mounted through the shrink-out animation.
  const [renderId, setRenderId] = useState<ModuleId | null>(null);
  useEffect(() => {
    if (active && openId) {
      setRenderId(openId);
      return;
    }
    if (!active && renderId) {
      const t = window.setTimeout(
        () => setRenderId(null),
        reduce ? 170 : 470,
      );
      return () => window.clearTimeout(t);
    }
  }, [active, openId, renderId, reduce]);

  useModuleA11y(active, panelRef, close);

  if (typeof document === "undefined") return null;

  const meta = renderId ? getModuleMeta(renderId) : undefined;
  const Content = renderId ? MODULE_CONTENT[renderId] : undefined;
  const showPanel = !!renderId && !!Content && !!meta;

  // Grow/shrink from the triggering card's screen position (viewport-centered panel).
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  const dx = origin ? origin.x - vw / 2 : 0;
  const dy = origin ? origin.y - vh / 2 : 0;
  const collapsed = { opacity: 0, scale: 0.16, x: dx, y: dy };
  const expanded = { opacity: 1, scale: 1, x: 0, y: 0 };

  return createPortal(
    <>
      <EraTimeMachine
        isOpen={erasOpen}
        onClose={close}
        currentEraId={currentEraId}
        onEraSelect={setEra}
      />

      {showPanel && (
        <div className="pointer-events-none fixed inset-0 z-[120]">
          {/* fullscreen morphing panel — the full experience, not a windowed popup */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={meta!.label}
            data-module-overlay={renderId}
            tabIndex={-1}
            className="pointer-events-auto absolute inset-0 flex flex-col overflow-hidden focus-visible:outline-none"
            style={{
              background: "var(--bg-main)",
              color: "var(--text-main)",
              transformOrigin: "center center",
            }}
            initial={reduce ? { opacity: 0 } : collapsed}
            animate={
              reduce ? { opacity: active ? 1 : 0 } : active ? expanded : collapsed
            }
            transition={{ duration: reduce ? 0.16 : 0.42, ease: EASE_OUT }}
          >
            {/* slim top bar — module label + a big, obvious close.
                z-[60] keeps Close above full-bleed module content (e.g. the
                About game's fixed inset-0 layers). */}
            <div
              className="relative z-[60] flex shrink-0 items-center justify-between border-b px-5 py-3 sm:px-8"
              style={{
                borderColor: "var(--border-color)",
                background:
                  "color-mix(in srgb, var(--bg-card) 70%, transparent)",
                backdropFilter: "blur(6px)",
              }}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="text-[18px] leading-none"
                  style={{ color: "var(--accent-color)" }}
                >
                  {meta!.icon}
                </span>
                <span
                  className="text-sm font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-main)" }}
                >
                  {meta!.label}
                </span>
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="group/close inline-flex items-center gap-2 rounded-[var(--era-radius-full,999px)] border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5 focus-visible:outline-none"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-main)",
                }}
              >
                <span
                  className="hidden opacity-60 sm:inline"
                  style={{ fontSize: 10 }}
                >
                  Esc
                </span>
                <span aria-hidden className="text-base leading-none">
                  ✕
                </span>
                Close
              </button>
            </div>

            {/* body — full height scroll */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {Content ? <Content /> : null}
            </div>
          </motion.div>
        </div>
      )}
    </>,
    document.body,
  );
}
