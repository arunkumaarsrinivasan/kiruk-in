"use client";

/**
 * DocHtmlShellLayer — global atmosphere for era=1991.
 *
 * Whisper-soft paper grain + a faint top horizontal rule to anchor the page
 * as a document. No motion. The era was about typography on white, not
 * decoration — so this layer is almost nothing on purpose.
 */

import type { ShellLayerProps } from "../../registry";

export function DocHtmlShellLayer({ active }: ShellLayerProps) {
  if (!active) return null;
  return (
    <>
      {/* Paper grain */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
          mixBlendMode: "multiply",
          opacity: 0.05,
        }}
      />
    </>
  );
}

export default DocHtmlShellLayer;
