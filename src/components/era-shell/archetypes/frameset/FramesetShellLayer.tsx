"use client";

/**
 * FramesetShellLayer — global atmosphere for era=1997.
 *
 * Subtle wood-grain paper noise + edge vignette. Evokes a CD-ROM
 * interactive title's chrome desktop background.
 */

import type { ShellLayerProps } from "../../registry";

export function FramesetShellLayer({ active }: ShellLayerProps) {
  if (!active) return null;
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.4'/></svg>\")",
          opacity: 0.12,
          mixBlendMode: "overlay",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </>
  );
}

export default FramesetShellLayer;
