"use client";

/**
 * Eye-door + ME token — the Kiruk eye grammar rendered as diamonds.
 * Pure presentational pieces used by MazeNav. No state of their own.
 */

import React from "react";
import { motion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import type { Dest } from "./types";

const DIAMOND = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";

export function EyeDoor({
  dest,
  tileSize,
  highlighted,
  glow,
  labelScale,
}: {
  dest: Dest;
  tileSize: number;
  highlighted: boolean;
  glow: number;
  labelScale: number;
}) {
  const inner = tileSize - 4;
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center transition-transform duration-200",
        highlighted && "scale-110",
      )}
      style={{ filter: highlighted ? `drop-shadow(0 0 ${glow}px var(--accent-color))` : "none" }}
    >
      <div
        className="relative flex items-center justify-center border-2"
        style={{
          width: inner,
          height: inner,
          background: "var(--bg-card)",
          borderColor: "var(--accent-color)",
          clipPath: DIAMOND,
          boxShadow: highlighted ? `0 0 0 2px var(--accent-color)` : "none",
        }}
      >
        <motion.div
          animate={highlighted ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, repeat: highlighted ? Infinity : 0 }}
          style={{ width: tileSize * 0.42, height: tileSize * 0.42 }}
        >
          <PixelIcon name={dest.icon} size={Math.round(tileSize * 0.42)} className="text-[var(--accent-color)]" />
        </motion.div>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap border px-1 py-0.5 text-[8px] font-bold font-mono uppercase"
        style={{
          bottom: -Math.max(14, tileSize * 0.34) * labelScale,
          fontSize: Math.max(8, Math.round(tileSize * 0.34 * labelScale)),
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
          color: "var(--accent-color)",
          boxShadow: "2px 2px 0 0 var(--border-color)",
        }}
      >
        {dest.label}
      </div>
    </div>
  );
}

export function PlayerCharacter({
  tileSize,
  direction,
  scale,
}: {
  tileSize: number;
  direction: "up" | "down" | "left" | "right";
  scale: number;
}) {
  const body = tileSize * scale;
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap border px-1 text-[6px] font-bold font-mono"
        style={{
          background: "var(--accent-color)",
          color: "var(--bg-main)",
          borderColor: "var(--bg-main)",
        }}
      >
        ME
      </div>
      <div
        className="relative border-2"
        style={{
          width: body,
          height: body,
          background: "var(--accent-color)",
          borderColor: "var(--bg-main)",
          clipPath: DIAMOND,
          boxShadow: `0 0 10px var(--accent-color), 0 0 18px var(--accent-color)`,
        }}
      >
        <motion.div
          className="absolute"
          style={{
            width: body * 0.18,
            height: body * 0.18,
            borderRadius: "50%",
            background: "var(--bg-main)",
          }}
          animate={{
            top: direction === "up" ? "16%" : direction === "down" ? "56%" : "38%",
            left: direction === "left" ? "16%" : direction === "right" ? "56%" : "38%",
          }}
          transition={{ type: "tween", duration: 0.08 }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle, var(--accent-color) 0%, transparent 70%)",
          opacity: 0.28,
        }}
      />
    </div>
  );
}
