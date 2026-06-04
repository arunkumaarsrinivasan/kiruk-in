"use client";

/** Case studies module — deep dives & platform links (same body as /case-studies). */

import React from "react";
import dynamic from "next/dynamic";

const CaseStudiesContent = dynamic(
  () =>
    import("@/app/case-studies/components/case-studies-content").then((m) => ({
      default: m.CaseStudiesContent,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center text-sm"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
      >
        ▦ loading work…
      </div>
    ),
  },
);

export function CaseStudiesExperience() {
  return (
    <div className="relative h-full min-h-0 overflow-y-auto">
      <CaseStudiesContent />
    </div>
  );
}

export default CaseStudiesExperience;
