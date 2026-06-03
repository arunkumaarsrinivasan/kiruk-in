"use client";

/** Progress module → the real /progress experience (character sheet, skill
 * tree, travel map). Opens fullscreen from the Progress trigger; Close/Esc
 * dismisses. */

import React from "react";
import dynamic from "next/dynamic";

const ProgressPage = dynamic(() => import("@/app/progress/page"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center text-sm"
      style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
    >
      ▲ tallying progress…
    </div>
  ),
});

export function ProgressExperience() {
  return (
    <div className="relative h-full w-full overflow-y-auto">
      <ProgressPage />
    </div>
  );
}

export default ProgressExperience;
