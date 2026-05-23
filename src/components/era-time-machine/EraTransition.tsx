"use client";

/**
 * EraTransition — directional slide between era landing pages.
 *
 * Outgoing and incoming archetypes stay visible during the swap so each era's
 * full preview reads clearly. Reduced motion falls back to a short crossfade.
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
  direction: number;
  render: RenderFn;
  reduceMotion: boolean;
  exitMs?: number;
  enterMs?: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function EraTransition({
  era,
  direction,
  render,
  reduceMotion,
  exitMs = 320,
  enterMs = 360,
}: EraTransitionProps) {
  const [outgoing, setOutgoing] = useState<ThemeConfig | null>(null);
  const [incoming, setIncoming] = useState<ThemeConfig>(era);
  const [phase, setPhase] = useState<EraPhase>("active");
  const lastEraId = useRef(era.id);
  const incomingRef = useRef(era);
  const timersRef = useRef<number[]>([]);
  const slideDir = direction >= 0 ? 1 : -1;

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

  const exitOffset = slideDir * -28;
  const enterFrom = slideDir * 28;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence initial={false}>
        {outgoing && !reduceMotion && (
          <motion.div
            key={`out-${outgoing.id}`}
            className="absolute inset-0 z-[1]"
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 0, x: `${exitOffset}%` }}
            transition={{ duration: exitMs / 1000, ease: EASE }}
          >
            {render(outgoing, "exiting")}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={`in-${incoming.id}`}
        className="absolute inset-0 z-[2]"
        initial={
          reduceMotion
            ? { opacity: 1 }
            : { opacity: 0, x: `${enterFrom}%` }
        }
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: reduceMotion ? 0.12 : enterMs / 1000,
          delay: reduceMotion ? 0 : exitMs / 1000,
          ease: EASE,
        }}
      >
        {render(incoming, phase)}
      </motion.div>
    </div>
  );
}
