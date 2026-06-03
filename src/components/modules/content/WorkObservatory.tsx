"use client";

/**
 * WorkObservatory — the WORK module's full-screen experience: the real
 * ObservatoryView telescope (skill/experience star map with timeline + journey
 * log). Opening the landing WORK.scope box expands straight into this; the
 * module overlay's Close/Esc dismisses it. No stub list, no extra "open full
 * experience" step.
 */

import React from "react";
import dynamic from "next/dynamic";

const ObservatoryView = dynamic(
  () =>
    import("@/app/work/components/ObservatoryView").then((m) => ({
      default: m.ObservatoryView,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center text-sm"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
      >
        ☉ calibrating telescope…
      </div>
    ),
  },
);

export function WorkObservatory() {
  return (
    <div className="h-full w-full overflow-hidden">
      <ObservatoryView />
    </div>
  );
}

export default WorkObservatory;
