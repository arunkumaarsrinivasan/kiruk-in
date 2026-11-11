"use client";

/**
 * TerminalShellLayer — global atmosphere mounted by <EraShell> when the
 * active era resolves to the terminal archetype.
 *
 * Sits behind page content as a fixed pointer-events-none overlay. Adds:
 *  - fine CRT scanlines (multiply blend)
 *  - travelling beam every ~9s
 *  - subtle screen flicker
 *  - vignette to imply curvature
 *
 * Phones keep the static glass (scanlines, vignette, bloom) and drop the
 * beam and flicker — see useCalmMotion.
 *
 * Does NOT recolor pages — that's the era's CSS variables. This layer is
 * purely atmospheric so it composites cleanly over any underlying UI.
 */

import { motion, useReducedMotion } from "framer-motion";
import { useCalmMotion } from "@/hooks/useCalmMotion";
import type { ShellLayerProps } from "../../registry";

export function TerminalShellLayer({ active }: ShellLayerProps) {
  const reduced = useReducedMotion();
  const still = useCalmMotion() || reduced;
  if (!active) return null;

  return (
    // A page that draws its own glass (the vector home) hides this by the attribute.
    <div data-terminal-shell className="absolute inset-0">
      {/* Fine scanlines — multiply blend so it darkens pixels without recoloring */}
      {/* `era-shell-scan`: a page that shows real pictures can switch these lines off (read.css) */}
      <div
        className="era-shell-scan absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Vignette — implies CRT curvature without distorting hit-testing */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Phosphor bloom — soft green wash near top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 30%, rgba(0,255,65,0.04) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Travelling horizontal beam */}
      {!still && (
        <motion.div
          className="absolute inset-x-0"
          style={{
            height: 140,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,255,65,0.04) 40%, rgba(0,255,65,0.07) 50%, rgba(0,255,65,0.04) 60%, transparent 100%)",
            mixBlendMode: "screen",
          }}
          initial={{ y: "-20%" }}
          animate={{ y: "120%" }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Random flicker */}
      {!still && (
        <motion.div
          className="absolute inset-0 mix-blend-screen"
          style={{ backgroundColor: "rgba(0,255,65,1)", opacity: 0.02 }}
          animate={{ opacity: [0.02, 0.05, 0.02, 0.03, 0.02] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.18, 0.22, 0.6, 1],
          }}
        />
      )}
    </div>
  );
}
