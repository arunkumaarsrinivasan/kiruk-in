"use client";

/**
 * XeroxBitmapShellLayer — global atmosphere for era=1981.
 *
 * Adds a bitmap-dither texture and a desktop crosshatch over whatever page
 * renders below. Multiply blend so it darkens the gray fill without
 * recoloring. No motion — Xerox Star did not animate.
 */

import type { ShellLayerProps } from "../../registry";

export function XeroxBitmapShellLayer({ active }: ShellLayerProps) {
  if (!active) return null;
  return (
    <>
      {/* Bitmap dither — 50% gray dots on 2px grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-conic-gradient(rgba(0,0,0,0.08) 0% 25%, transparent 25% 50%)",
          backgroundSize: "4px 4px",
          mixBlendMode: "multiply",
          opacity: 0.55,
        }}
      />

      {/* Diagonal crosshatch — implies CRT pixel grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px), " +
            "repeating-linear-gradient(-45deg, transparent 0, transparent 3px, rgba(255,255,255,0.10) 3px, rgba(255,255,255,0.10) 4px)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.18) 100%)",
        }}
      />
    </>
  );
}

export default XeroxBitmapShellLayer;
