"use client";

/**
 * WorkProjectShowcase — the WORK module: fullscreen project deck (Figma
 * slides). Matches the /portfolio route and the hero “See My Work” CTA.
 */

import React from "react";
import { FigmaEmbed } from "@/app/portfolio/FigmaEmbed";
import { useModules } from "@/contexts/ModuleContext";

export function WorkProjectShowcase() {
  const { open } = useModules();

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ fontFamily: "var(--font-main)" }}>
      <div
        className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-5 py-3 sm:px-8"
        style={{ borderColor: "var(--border-color)" }}
      >
        <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
          Card sort · selected projects
        </p>
        <button
          type="button"
          onClick={() => open("case-studies")}
          className="text-[11px] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
          style={{ color: "var(--accent-color)" }}
        >
          Deep dives →
        </button>
      </div>

      <div className="min-h-0 flex-1 p-4 sm:p-6">
        <div
          className="h-full min-h-[280px] border-2"
          style={{ borderColor: "var(--border-color)" }}
        >
          <FigmaEmbed fill />
        </div>
      </div>
    </div>
  );
}

export default WorkProjectShowcase;
