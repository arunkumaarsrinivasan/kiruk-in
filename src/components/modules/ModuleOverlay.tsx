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
import dynamic from "next/dynamic";
import Link from "next/link";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useModules } from "@/contexts/ModuleContext";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { useEraTravel } from "@/components/era-travel/EraTravelContext";
import type { ModuleId } from "@/contexts/ModuleContext";
import { MODULE_CONTENT, getModuleMeta } from "./content";
import { useModuleA11y } from "./useModuleA11y";

const EraTimeMachine = dynamic(
  () =>
    import("@/components/era-time-machine/EraTimeMachine").then((m) => ({
      default: m.EraTimeMachine,
    })),
  {
    loading: () => (
      <div
        className="fixed inset-0 z-[130]"
        style={{ background: "var(--bg-main)" }}
        role="status"
        aria-label="Opening the time machine"
      />
    ),
  },
);

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function ModuleOverlayHost() {
  const { openId, origin, close } = useModules();
  const { currentEraId } = useDesignEra();
  const { travelTo } = useEraTravel();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const erasOpen = openId === "eras";
  const active = !!openId && !erasOpen;
  // Stay unmounted until the first open, so the era archetypes are not in
  // the first JS graph. After that, keep it mounted so the close animation runs.
  const [machineMounted, setMachineMounted] = useState(false);

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

  useEffect(() => {
    if (!erasOpen && !renderId) return;
    document.documentElement.setAttribute("data-module-open", "");
    return () => document.documentElement.removeAttribute("data-module-open");
  }, [erasOpen, renderId]);

  if (erasOpen && !machineMounted) setMachineMounted(true);

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
      {machineMounted ? (
        <EraTimeMachine
          isOpen={erasOpen}
          onClose={close}
          currentEraId={currentEraId}
          onEraSelect={(id) => {
            close();
            travelTo(id);
          }}
        />
      ) : null}

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
              <span className="flex items-center gap-2">
                <Link
                  href="/"
                  onClick={close}
                  className="site-chrome-link inline-flex min-h-11 items-center rounded-[var(--era-radius-sm,4px)] px-2.5 text-xs font-medium"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
                >
                  Home
                </Link>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close (Esc)"
                  className="inline-flex min-h-11 items-center rounded-[var(--era-radius-sm,4px)] px-2.5 text-xs font-medium transition-colors hover:bg-[color-mix(in_srgb,var(--text-main)_6%,transparent)]"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
                >
                  Close
                </button>
              </span>
            </div>

            {/* body — full height scroll (work module is self-contained) */}
            <div
              className={`min-h-0 flex-1 ${
                renderId === "work" || renderId === "observatory"
                  ? "overflow-hidden"
                  : "overflow-y-auto"
              }`}
            >
              {Content ? <Content /> : null}
            </div>
          </motion.div>
        </div>
      )}
    </>,
    document.body,
  );
}
