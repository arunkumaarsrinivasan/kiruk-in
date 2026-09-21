/**
 * 1970 — Terminal home blueprint.
 *
 * Authored from TerminalHomePage.tsx: a fixed tty status bar under the nav,
 * then a single centered max-w-3xl column of teletype records — file header,
 * ASCII banner, framing line, meta nav, RECORD 001 pairs, the persona panel
 * split, and the journey table. Coarse, full-width rows: the least structured
 * interface on the timeline, and the spec says so.
 */

import type { BlueprintSpec } from "../blueprint-types";

export const TERMINAL_HOME_SPEC: BlueprintSpec = {
  // max-w-3xl (768px) centered → ~60% at 1280px; near-full-bleed on mobile.
  column: { x: 0.2, w: 0.6, mobileX: 0.04, mobileW: 0.92 },
  // Character-cell mesh instead of a pixel grid; phosphor on black.
  grid: { size: 18, opacity: 0.08 },
  regions: [
    {
      id: "tty-status",
      kind: "chrome",
      space: "viewport",
      x: 0,
      w: 1,
      y: 0.07,
      h: 0.032,
      label: "TTY STATUS",
    },
    {
      id: "file-header",
      kind: "text",
      x: 0,
      w: 1,
      y: 0.13,
      h: 0.1,
      label: "RESEARCH FILE HEADER",
    },
    {
      id: "ascii-banner",
      kind: "hero",
      x: 0,
      w: 0.9,
      y: 0.245,
      h: 0.09,
      label: "ASCII BANNER",
    },
    {
      id: "framing",
      kind: "text",
      x: 0,
      w: 0.75,
      y: 0.35,
      h: 0.055,
      label: "FRAMING",
    },
    {
      id: "meta-nav",
      kind: "chrome",
      x: 0,
      w: 0.5,
      y: 0.42,
      h: 0.03,
      label: "NAV",
    },
    {
      id: "record-001",
      kind: "text",
      x: 0,
      w: 1,
      y: 0.475,
      h: 0.13,
      label: "RECORD 001 · WHY-KIRUK",
    },
    {
      id: "persona-goals",
      kind: "panel",
      x: 0,
      w: 0.485,
      y: 0.64,
      h: 0.15,
      label: "GOALS",
    },
    {
      id: "persona-frustrations",
      kind: "panel",
      x: 0.515,
      w: 0.485,
      y: 0.64,
      h: 0.15,
      label: "FRUSTRATIONS",
    },
    {
      id: "journey",
      kind: "list",
      x: 0,
      w: 1,
      y: 0.83,
      h: 0.15,
      label: "RECORD 004 · JOURNEY",
    },
  ],
};
