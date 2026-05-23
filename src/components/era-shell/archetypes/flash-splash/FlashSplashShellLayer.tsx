"use client";

/**
 * FlashSplashShellLayer — global atmosphere for era=2000.
 *
 * Y2K chrome backdrop: deep navy gradient mesh + soft starfield haze +
 * subtle CRT scanlines. The lens flare lives inside the home page so it
 * can track the mouse; the shell only paints the cosmic backdrop behind
 * everything.
 */

import type { ShellLayerProps } from "../../registry";

export function FlashSplashShellLayer({ active }: ShellLayerProps) {
  if (!active) return null;
  return (
    <>
      {/* Cosmic gradient mesh — Y2K navy → midnight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 20% 0%, rgba(43,216,255,0.18) 0%, transparent 55%)," +
            "radial-gradient(ellipse 80% 70% at 85% 90%, rgba(255,77,138,0.16) 0%, transparent 60%)," +
            "radial-gradient(ellipse 100% 100% at 50% 50%, #0e1a36 0%, #06081a 75%)",
        }}
      />
      {/* Starfield dust */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='2.4' numOctaves='1'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 6 -3'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          opacity: 0.55,
          mixBlendMode: "screen",
        }}
      />
      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.18) 2px 3px)",
          mixBlendMode: "multiply",
          opacity: 0.55,
        }}
      />
    </>
  );
}

export default FlashSplashShellLayer;
