"use client";

import { notebookEraLabel, NOTEBOOK_ERA_LITES } from "@/lib/notebook";

/** The beat after warp: you did not pick a theme. You arrived in a year. */
export function NotebookDwell({ eraId, active }: { eraId: string; active: boolean }) {
  if (!active) return null;
  const era = NOTEBOOK_ERA_LITES.find((item) => item.id === eraId);
  const name = era ? notebookEraLabel(era.name) : eraId;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-[90] flex justify-center px-4 pb-6"
    >
      <p
        className="w-full max-w-[42rem] border px-4 py-3 text-sm leading-relaxed"
        style={{
          background: "var(--bg-main)",
          borderColor: "var(--accent-color)",
          color: "var(--text-main)",
          fontFamily: "var(--font-main)",
          boxShadow: "0 0 28px color-mix(in srgb, var(--accent-color) 28%, transparent)",
        }}
      >
        <span className="block text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
          login · {eraId}
        </span>
        You are reading from {name}. This is the machine that year had.
      </p>
    </div>
  );
}
