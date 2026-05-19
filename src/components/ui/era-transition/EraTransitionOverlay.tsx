"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface EraTransitionOverlayProps {
  /** Triggered any time this changes — the overlay plays once. Pass era id. */
  signal: string | number;
  /** Color sampled from the incoming era's accent; tints the grain layer */
  accentColor?: string;
  /** Total duration of the transition in ms (default 300) */
  durationMs?: number;
}

/**
 * Subtle era transition: 300ms crossfade veil + film grain.
 * Mounts once at the layout root and animates whenever `signal` changes.
 * Decoupled from theme state so it never blocks switching.
 */
export function EraTransitionOverlay({
  signal,
  accentColor = "#ffffff",
  durationMs = 300,
}: EraTransitionOverlayProps) {
  const [phase, setPhase] = useState<"idle" | "playing">("idle");
  const lastSignalRef = useRef<string | number>(signal);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (signal === lastSignalRef.current) return;
    lastSignalRef.current = signal;

    setPhase("playing");
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setPhase("idle");
      timerRef.current = null;
    }, durationMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [signal, durationMs]);

  return (
    <AnimatePresence>
      {phase === "playing" && (
        <motion.div
          key={signal}
          className="pointer-events-none fixed inset-0 z-[300] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: durationMs / 1000 / 2, ease: "easeInOut" }}
          aria-hidden="true"
        >
          {/* Veil — gentle accent-tinted wash */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${accentColor}1a 0%, transparent 70%)`,
              mixBlendMode: "screen",
            }}
          />
          {/* Film grain */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")",
              backgroundSize: "160px 160px",
              opacity: 0.18,
              mixBlendMode: "overlay",
            }}
          />
          {/* Crossfade veil */}
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: accentColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.08, 0] }}
            transition={{ duration: durationMs / 1000, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EraTransitionOverlay;
