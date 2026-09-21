/**
 * Fallback blueprint — a generic modern page (nav, hero + media, card row,
 * list, footer). Used for eras whose home spec is not authored yet and for
 * shared routes until per-route specs land. Deliberately mid-density: it sits
 * in the middle of the timeline's complexity curve.
 */

import type { BlueprintSpec } from "../blueprint-types";

export const FALLBACK_SPEC: BlueprintSpec = {
  column: { x: 0.12, w: 0.76, mobileX: 0.05, mobileW: 0.9 },
  regions: [
    {
      id: "nav",
      kind: "chrome",
      space: "viewport",
      x: 0.04,
      w: 0.92,
      y: 0.02,
      h: 0.05,
      label: "NAV",
    },
    { id: "hero", kind: "hero", x: 0, w: 0.6, y: 0.14, h: 0.22, label: "HERO" },
    {
      id: "hero-media",
      kind: "media",
      x: 0.64,
      w: 0.36,
      y: 0.14,
      h: 0.22,
      label: "MEDIA",
    },
    { id: "card-a", kind: "grid", x: 0, w: 0.31, y: 0.42, h: 0.2, label: "CARD" },
    { id: "card-b", kind: "grid", x: 0.345, w: 0.31, y: 0.42, h: 0.2, label: "CARD" },
    { id: "card-c", kind: "grid", x: 0.69, w: 0.31, y: 0.42, h: 0.2, label: "CARD" },
    { id: "list", kind: "list", x: 0, w: 1, y: 0.68, h: 0.18, label: "LIST" },
    { id: "footer", kind: "footer", x: 0, w: 1, y: 0.9, h: 0.06, label: "FOOTER" },
  ],
};
