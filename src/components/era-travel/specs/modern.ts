/**
 * Modern-era home blueprints (2018–2026) — authored from each archetype's
 * home component (above-the-fold measurements). Peak structure (workspace
 * chrome, boards, rails) that then dissolves into a single intent surface
 * by 2026.
 */

import type { BlueprintSpec } from "../blueprint-types";

/** 2018 · Block editor — workspace topbar, 240px page sidebar and 260px
 *  properties rail; the document opens with a gradient cover, then title,
 *  tag chips, and the block stack in the centered 740px article column. */
export const BLOCK_EDITOR_HOME_SPEC: BlueprintSpec = {
  column: { x: 0, w: 1, mobileX: 0, mobileW: 1 },
  regions: [
    { id: "top-chrome", kind: "chrome", x: 0, w: 1, y: 0.07, h: 0.045, label: "WORKSPACE BAR" },
    { id: "sidebar", kind: "list", x: 0, w: 0.1875, y: 0.115, h: 0.79, label: "PAGES", mobile: { hidden: true } },
    { id: "props-rail", kind: "panel", x: 0.8125, w: 0.1875, y: 0.115, h: 0.79, label: "PROPERTIES", mobile: { hidden: true } },
    { id: "page-cover", kind: "media", x: 0.19, w: 0.62, y: 0.12, h: 0.16, label: "COVER", mobile: { x: 0, w: 1 } },
    { id: "page-title", kind: "hero", x: 0.21, w: 0.57, y: 0.31, h: 0.09, label: "PAGE TITLE", mobile: { x: 0.06, w: 0.88, y: 0.3 } },
    { id: "tag-chips", kind: "chrome", x: 0.21, w: 0.4, y: 0.41, h: 0.04, label: "TAGS", mobile: { x: 0.06, w: 0.7 } },
    { id: "block-stack", kind: "text", x: 0.21, w: 0.57, y: 0.47, h: 0.35, label: "BLOCKS", mobile: { x: 0.06, w: 0.88, y: 0.47 } },
  ],
};

/** 2021 · Issue tracker — full application chrome: workspace bar, cycle
 *  progress strip, 220px nav sidebar, FOUR board columns (Backlog / Todo /
 *  In Progress / Done), and the 320px issue detail rail. */
export const ISSUE_TRACKER_HOME_SPEC: BlueprintSpec = {
  column: { x: 0, w: 1, mobileX: 0, mobileW: 1 },
  regions: [
    { id: "top-chrome", kind: "chrome", x: 0, w: 1, y: 0.07, h: 0.04, label: "KIRUK · CYCLE 14" },
    { id: "cycle-bar", kind: "chrome", x: 0, w: 1, y: 0.11, h: 0.04, label: "CYCLE PROGRESS" },
    { id: "sidebar", kind: "list", x: 0, w: 0.172, y: 0.15, h: 0.8, label: "WORKSPACE", mobile: { hidden: true } },
    { id: "board-a", kind: "list", x: 0.175, w: 0.135, y: 0.16, h: 0.6, label: "BACKLOG", mobile: { x: 0.04, w: 0.6 } },
    { id: "board-b", kind: "list", x: 0.317, w: 0.135, y: 0.16, h: 0.6, label: "TODO", mobile: { x: 0.66, w: 0.6 } },
    { id: "board-c", kind: "list", x: 0.459, w: 0.135, y: 0.16, h: 0.6, label: "IN PROGRESS", mobile: { hidden: true } },
    { id: "board-d", kind: "list", x: 0.601, w: 0.135, y: 0.16, h: 0.6, label: "DONE", mobile: { hidden: true } },
    { id: "rail", kind: "panel", x: 0.758, w: 0.242, y: 0.15, h: 0.8, label: "DETAIL RAIL", mobile: { hidden: true } },
  ],
};

/** 2023 · AI-native — a 248px history rail beside the conversation: chat
 *  topbar, centered 720px welcome hero + greeting bubble, and the composer
 *  dock (chips + input) pinned to the bottom. */
export const AI_NATIVE_HOME_SPEC: BlueprintSpec = {
  column: { x: 0, w: 1, mobileX: 0, mobileW: 1 },
  regions: [
    { id: "history-rail", kind: "list", x: 0, w: 0.19, y: 0, h: 1, label: "HISTORY", mobile: { hidden: true } },
    { id: "chat-chrome", kind: "chrome", x: 0.19, w: 0.81, y: 0, h: 0.06, label: "CHAT BAR", mobile: { x: 0, w: 1 } },
    { id: "welcome-hero", kind: "hero", x: 0.24, w: 0.5, y: 0.08, h: 0.22, label: "WELCOME", mobile: { x: 0.06, w: 0.88 } },
    { id: "greeting-bubble", kind: "text", x: 0.24, w: 0.45, y: 0.33, h: 0.12, label: "GREETING", mobile: { x: 0.06, w: 0.8 } },
    { id: "composer", kind: "chrome", x: 0.24, w: 0.55, y: 0.82, h: 0.15, label: "COMPOSER", mobile: { x: 0.04, w: 0.92 } },
  ],
};

/** 2026 · Prompt UI — the interface has dissolved into intent: an empty
 *  canvas with a centered hero (540px), the auto-build CTA, suggestion
 *  chips, and the floating command HUD at the bottom. Near-invisible fine
 *  mesh instead of a visible grid. */
export const PROMPT_UI_HOME_SPEC: BlueprintSpec = {
  column: { x: 0, w: 1, mobileX: 0, mobileW: 1 },
  grid: { size: 12, opacity: 0.05 },
  regions: [
    { id: "canvas-hero", kind: "hero", x: 0.29, w: 0.42, y: 0.18, h: 0.34, label: "DESCRIBE IT", mobile: { x: 0.08, w: 0.84 } },
    { id: "auto-build-cta", kind: "chrome", x: 0.42, w: 0.16, y: 0.56, h: 0.06, label: "AUTO-BUILD", mobile: { x: 0.3, w: 0.4 } },
    { id: "prompt-suggestions", kind: "list", x: 0.29, w: 0.42, y: 0.64, h: 0.07, label: "SUGGESTIONS", mobile: { x: 0.1, w: 0.8 } },
    { id: "command-hud", kind: "chrome", x: 0.235, w: 0.53, y: 0.8, h: 0.16, label: "COMMAND BAR", mobile: { x: 0.06, w: 0.88 } },
  ],
};
