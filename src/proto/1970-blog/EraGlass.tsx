"use client";

import type { ReactNode } from "react";

export function EraGlass({ children }: { children: ReactNode }) {
  return (
    <div className="era-glass">
      <div className="era-atm" aria-hidden>
        <div className="era-atm-scan" />
        <div className="era-atm-vignette" />
        <div className="era-atm-bloom" />
        <div className="era-atm-beam" />
        <div className="era-atm-flicker" />
      </div>
      {children}
    </div>
  );
}
