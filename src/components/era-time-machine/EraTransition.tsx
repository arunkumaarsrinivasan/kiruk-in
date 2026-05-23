"use client";

/**
 * EraTransition — orchestrates a shutdown → boot beat when switching eras.
 *
 * The dispatcher renders one archetype at a time. When the era id changes,
 * EraTransition keeps the *outgoing* archetype mounted with phase="exiting"
 * for `exitMs`, then swaps to the *incoming* archetype with phase="entering"
 * for `enterMs`, then settles to phase="active".
 *
 * Each archetype reads `phase` and plays its own exit/enter frames — there
 * is no chrome imposed by this engine. A neutral veil flashes briefly at
 * the swap point so the screen never reads as a half-rendered frame.
 *
 * Reduced motion: collapses to a 1-frame crossfade.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ThemeConfig } from "@/data/portfolio-data";
import type { EraPhase } from "./shared/EraSurface";

interface RenderFn {
  (era: ThemeConfig, phase: EraPhase): React.ReactNode;
}

interface EraTransitionProps {
  era: ThemeConfig;
  render: RenderFn;
  reduceMotion: boolean;
  exitMs?: number;
  enterMs?: number;
}

export function EraTransition({
  era,
  render,
  reduceMotion,
  exitMs = 360,
  enterMs = 260,
}: EraTransitionProps) {
  const [outgoing, setOutgoing] = useState<ThemeConfig | null>(null);
  const [incoming, setIncoming] = useState<ThemeConfig>(era);
  const [phase, setPhase] = useState<EraPhase>("active");
  const lastEraId = useRef(era.id);
  const incomingRef = useRef(era);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    incomingRef.current = incoming;
  }, [incoming]);

  useEffect(() => {
    if (era.id === lastEraId.current) return;
    const fromEra = incomingRef.current;
    lastEraId.current = era.id;

    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    if (reduceMotion) {
      setOutgoing(null);
      setIncoming(era);
      setPhase("active");
      return;
    }

    // start exit on outgoing era
    setOutgoing(fromEra);
    setIncoming(era);
    setPhase("entering");

    timersRef.current.push(
      window.setTimeout(() => {
        setOutgoing(null);
      }, exitMs),
    );
    timersRef.current.push(
      window.setTimeout(() => {
        setPhase("active");
      }, exitMs + enterMs),
    );
  }, [era, exitMs, enterMs, reduceMotion]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {outgoing && (
          <motion.div
            key={`out-${outgoing.id}`}
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: exitMs / 1000, ease: "easeInOut" }}
          >
            {render(outgoing, "exiting")}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={`in-${incoming.id}`}
        className="absolute inset-0"
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: reduceMotion ? 0 : enterMs / 1000,
          delay: reduceMotion ? 0 : exitMs / 1000,
          ease: "easeOut",
        }}
      >
        {render(incoming, phase)}
      </motion.div>

      {/* neutral veil — covers the swap seam without imposing chrome */}
      {!reduceMotion && outgoing && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: "#000" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.18, 0] }}
          transition={{
            duration: (exitMs + enterMs) / 1000,
            times: [0, exitMs / (exitMs + enterMs), 1],
            ease: "easeInOut",
          }}
        />
      )}
    </>
  );
}
