/**
 * 1970 — Terminal home blueprint.
 *
 * Authored from home/home-views.ts: the home is one picture tube that fills
 * the eye. A head row under the upper lid, the SUBJECT pane on the left, the
 * seven records and "All work" as a grid of cells on the right with the
 * dossier under them, and the status line above the lower lid. The tube is a
 * canvas, so there are no DOM markers to snap to: these fractions are the
 * geometry the build-up draws.
 */

import type { BlueprintSpec } from "../blueprint-types";

export const TERMINAL_HOME_SPEC: BlueprintSpec = {
  // The tube runs edge to edge under the lids.
  column: { x: 0.02, w: 0.96, mobileX: 0.03, mobileW: 0.94 },
  // Character cells, 10 × 20 at the tube's own scale.
  grid: { size: 20, opacity: 0.08 },
  regions: [
    {
      id: "tube-head",
      kind: "chrome",
      x: 0,
      w: 1,
      y: 0.08,
      h: 0.035,
      label: "KIRUK STATION",
    },
    {
      id: "subject",
      kind: "hero",
      x: 0,
      w: 0.4,
      y: 0.14,
      h: 0.7,
      label: "SUBJECT",
      mobile: { w: 1, h: 0.2 },
    },
    {
      id: "records",
      kind: "grid",
      x: 0.42,
      w: 0.58,
      y: 0.14,
      h: 0.48,
      label: "7 RECORDS · ALL WORK",
      mobile: { x: 0, w: 1, y: 0.36, h: 0.42 },
    },
    {
      id: "dossier",
      kind: "panel",
      x: 0.42,
      w: 0.58,
      y: 0.64,
      h: 0.2,
      label: "DOSSIER",
      mobile: { hidden: true },
    },
    {
      id: "status",
      kind: "footer",
      x: 0,
      w: 1,
      y: 0.86,
      h: 0.035,
      label: "> POINT AT A RECORD",
      mobile: { y: 0.8 },
    },
  ],
};
