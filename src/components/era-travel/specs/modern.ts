/**
 * Modern-era home blueprint (2026) — authored from the archetype's home
 * component (above-the-fold measurements at 1440×900 and 375×812).
 */

import type { BlueprintSpec } from "../blueprint-types";

/** 2026 · The Pupil — a dark room and one brown eye, centred between
 *  the navbar's lids: the pupil, the question line and state word under it,
 *  and the lens it dilates into (560px, 92vw on phones). No grid: there is
 *  no layout to draw. */
export const PROMPT_UI_HOME_SPEC: BlueprintSpec = {
  column: { x: 0, w: 1, mobileX: 0, mobileW: 1 },
  grid: { size: 12, opacity: 0 },
  regions: [
    { id: "eye", kind: "media", x: 0.43, w: 0.14, y: 0.3, h: 0.32, label: "EYE", mobile: { x: 0.27, w: 0.46, y: 0.36, h: 0.22 } },
    { id: "ask-line", kind: "text", x: 0.38, w: 0.24, y: 0.66, h: 0.04, label: "TYPE TO ASK", mobile: { x: 0.1, w: 0.8, y: 0.62 } },
    { id: "lens", kind: "text", x: 0.305, w: 0.39, y: 0.12, h: 0.76, label: "LENS", mobile: { x: 0.04, w: 0.92, y: 0.1, h: 0.8 } },
  ],
};
