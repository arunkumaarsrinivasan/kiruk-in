"use client";

/**
 * MosaicShellLayer — global atmosphere for era=1993.
 *
 * Tiled background (classic gray with subtle dotted noise) + faint
 * scanline-style horizontal lines suggesting old CRT monitor. Multiply
 * blend so the rest of the page composites cleanly on top.
 */

import type { ShellLayerProps } from "../../registry";

export function MosaicShellLayer({ active }: ShellLayerProps) {
  if (!active) return null;
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "multiply",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='6' height='6'><circle cx='1' cy='1' r='0.5' fill='%23000' opacity='0.12'/><circle cx='4' cy='4' r='0.5' fill='%23000' opacity='0.10'/></svg>\")",
          backgroundSize: "6px 6px",
          mixBlendMode: "multiply",
          opacity: 0.5,
        }}
      />
    </>
  );
}

export default MosaicShellLayer;
