"use client";

/**
 * RegionSkeleton — content-aware placeholder content for a wireframe region.
 *
 * The blueprint's region model already declares a `kind` per region (hero,
 * text, panel, grid, list, media, chrome, footer). EraBlueprint draws the
 * box; RegionSkeleton fills it with placeholder content that *reads as* the
 * thing the region stands in for — a hero shows a title block, a list shows
 * rows, media shows a hatched image block — so the wireframe stops looking
 * like identical empty boxes and starts reading as the page it is becoming.
 *
 * Everything is drawn in the era's own tokens (--accent-color, --text-muted,
 * --border-color) so it wears the destination era's palette without
 * hard-coding any color. The content is static; the box around it carries
 * the era's entrance grammar, and the dissolve at reveal reads as "the real
 * page was already there, under the sketch".
 */

import React from "react";
import type { BlueprintGrammar, RegionKind } from "./blueprint-types";

export interface RegionSkeletonProps {
  kind: RegionKind;
  /** Reserved for future per-grammar content texture; the box already
   *  carries the era material, so content stays grammar-agnostic. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  grammar: BlueprintGrammar;
  reduce: boolean;
  label?: string;
}

const PAD = 7;

function Line({
  w,
  h = 2,
  muted = false,
}: {
  w: number;
  h?: number;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        width: `${Math.min(Math.max(w, 0), 1) * 100}%`,
        height: h,
        background: muted ? "var(--text-muted)" : "var(--accent-color)",
        opacity: muted ? 0.22 : 0.32,
        borderRadius: 1,
        flexShrink: 0,
      }}
    />
  );
}

function Dot({ size = 5, muted = false }: { size?: number; muted?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: muted ? "var(--text-muted)" : "var(--accent-color)",
        opacity: muted ? 0.25 : 0.4,
        borderRadius: 1,
        flexShrink: 0,
      }}
    />
  );
}

function MiniCard() {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 4,
        border: "1px solid var(--border-color)",
        opacity: 0.7,
      }}
    >
      <div
        style={{
          height: 14,
          background: "color-mix(in srgb, var(--accent-color) 10%, transparent)",
          borderRadius: 1,
          flexShrink: 0,
        }}
      />
      <Line w={1} h={2} />
      <Line w={0.7} h={2} muted />
    </div>
  );
}

export function RegionSkeleton({
  kind,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  grammar: _grammar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reduce: _reduce,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  label: _label,
}: RegionSkeletonProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: PAD,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {(() => {
        switch (kind) {
          case "hero":
            return (
              <>
                <Line w={0.32} h={3} muted />
                <Line w={0.78} h={9} />
                <div style={{ height: 2 }} />
                <Line w={0.5} h={3} muted />
                <Line w={0.34} h={3} muted />
              </>
            );
          case "text":
            return (
              <>
                <Line w={1} />
                <Line w={0.96} />
                <Line w={1} />
                <Line w={0.92} />
                <Line w={0.66} />
              </>
            );
          case "panel":
            return (
              <>
                <Line w={0.42} h={3} />
                <div style={{ height: 3 }} />
                <Line w={1} />
                <Line w={0.94} />
                <Line w={0.88} muted />
                <Line w={0.6} muted />
              </>
            );
          case "grid":
            return (
              <div style={{ display: "flex", gap: 5, flex: "1 1 auto", minHeight: 0 }}>
                <MiniCard />
                <MiniCard />
              </div>
            );
          case "list":
            return (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
                  >
                    <Dot size={5} />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Line w={0.7} h={2} />
                      <Line w={0.4} h={2} muted />
                    </div>
                  </div>
                ))}
              </>
            );
          case "media":
            return (
              <div
                style={{
                  position: "absolute",
                  inset: PAD,
                  backgroundImage:
                    "repeating-linear-gradient(135deg, var(--accent-color) 0 1px, transparent 1px 7px)",
                  opacity: 0.16,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "9px solid var(--accent-color)",
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    opacity: 0.5,
                  }}
                  aria-hidden
                />
              </div>
            );
          case "chrome":
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <Dot size={4} />
                <Dot size={4} />
                <Dot size={4} />
                <div style={{ width: 8 }} />
                <Line w={0.18} h={2} muted />
                <Line w={0.12} h={2} muted />
              </div>
            );
          case "footer":
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                  flexShrink: 0,
                }}
              >
                {[0.12, 0.1, 0.14, 0.08, 0.1].map((w, i) => (
                  <Line key={i} w={w} h={2} muted />
                ))}
              </div>
            );
          default:
            return (
              <>
                <Line w={1} />
                <Line w={0.9} />
                <Line w={0.7} muted />
              </>
            );
        }
      })()}
    </div>
  );
}

export default RegionSkeleton;
