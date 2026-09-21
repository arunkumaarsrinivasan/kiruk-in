/**
 * Web 2.0-era home blueprints (2000–2013) — authored from each archetype's
 * home component (above-the-fold measurements). Structure gains chrome:
 * desktops with floating windows, profile columns, story rivers, device
 * frames, masonry boards.
 */

import type { BlueprintSpec } from "../blueprint-types";

/** 2000 · Flash splash / Aqua — a desktop, not a document: header bar, two
 *  overlapping floating windows at absolute offsets, and the fixed status
 *  bar at the screen's foot. (There is no dock in the JSX.) */
export const FLASH_SPLASH_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.04, w: 0.92, mobileX: 0.02, mobileW: 0.96 },
  regions: [
    { id: "aqua-header", kind: "chrome", x: 0, w: 1, y: 0.08, h: 0.09, label: "KIRUK.COM" },
    { id: "window-intro", kind: "panel", x: 0.034, w: 0.39, y: 0.2, h: 0.34, label: "INTRO", mobile: { x: 0.04, w: 0.92, y: 0.19, h: 0.26 } },
    { id: "window-profile", kind: "panel", x: 0.44, w: 0.3, y: 0.24, h: 0.3, label: "PROFILE", mobile: { x: 0.04, w: 0.92, y: 0.48, h: 0.26 } },
    { id: "status-bar", kind: "chrome", space: "viewport", x: 0, w: 1, y: 0.965, h: 0.03, label: "STATUS" },
  ],
};

/** 2003 · Web 2.0 candy / MySpace (maxWidth 980) — sticky nav + bulletins
 *  ticker, the profile name bar, then the classic 240px | 1fr split:
 *  photo + contact box left, blurbs and blog grid right. */
export const WEB2_CANDY_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.117, w: 0.766, mobileX: 0.03, mobileW: 0.94 },
  regions: [
    { id: "top-nav", kind: "chrome", space: "viewport", x: 0, w: 1, y: 0.07, h: 0.035, label: "MYKIRUK NAV" },
    { id: "ticker", kind: "chrome", space: "viewport", x: 0, w: 1, y: 0.105, h: 0.03, label: "BULLETINS" },
    { id: "name-bar", kind: "text", x: 0, w: 1, y: 0.15, h: 0.06, label: "PROFILE NAME" },
    { id: "photo-block", kind: "media", x: 0, w: 0.245, y: 0.23, h: 0.35, label: "PHOTO", mobile: { w: 1, h: 0.22 } },
    { id: "contact-box", kind: "panel", x: 0, w: 0.245, y: 0.6, h: 0.2, label: "CONTACT BOX", mobile: { w: 1, y: 0.82, h: 0.12 } },
    { id: "blurbs", kind: "text", x: 0.265, w: 0.735, y: 0.23, h: 0.2, label: "BLURBS", mobile: { x: 0, w: 1, y: 0.47, h: 0.14 } },
    { id: "blog-grid", kind: "grid", x: 0.265, w: 0.735, y: 0.45, h: 0.35, label: "BLOG POSTS", mobile: { x: 0, w: 1, y: 0.63, h: 0.17 } },
  ],
};

/** 2006 · Microblog / Digg (maxWidth 980) — orange header + category strip,
 *  sort tabs over the story river, 240px sidebar of cards on the right. */
export const MICROBLOG_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.117, w: 0.766, mobileX: 0.03, mobileW: 0.94 },
  regions: [
    { id: "digg-header", kind: "chrome", space: "viewport", x: 0, w: 1, y: 0.005, h: 0.055, label: "DIGG" },
    { id: "category-nav", kind: "chrome", space: "viewport", x: 0, w: 1, y: 0.06, h: 0.035, label: "TOPICS" },
    { id: "sort-tabs", kind: "chrome", x: 0, w: 0.72, y: 0.12, h: 0.04, label: "SORT" },
    { id: "story-a", kind: "list", x: 0, w: 0.72, y: 0.17, h: 0.15, label: "STORY", mobile: { w: 1, h: 0.13 } },
    { id: "story-b", kind: "list", x: 0, w: 0.72, y: 0.33, h: 0.15, label: "STORY", mobile: { w: 1, y: 0.31, h: 0.13 } },
    { id: "sidebar", kind: "panel", x: 0.74, w: 0.26, y: 0.12, h: 0.5, label: "SIDEBAR", mobile: { x: 0, w: 1, y: 0.46, h: 0.3 } },
  ],
};

/** 2009 · iPhone skeuomorphism — a desk scene (maxWidth 1180): mode chips
 *  on top, desk widgets flanking the centered 344px device frame, which
 *  opens on the lock screen. */
export const IPHONE_SKEU_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.04, w: 0.92, mobileX: 0.02, mobileW: 0.96 },
  regions: [
    { id: "mode-controls", kind: "chrome", x: 0.3, w: 0.4, y: 0.09, h: 0.04, label: "CONTROLS", mobile: { x: 0.2, w: 0.6 } },
    { id: "left-desk", kind: "panel", x: 0.02, w: 0.32, y: 0.16, h: 0.55, label: "DESK", mobile: { hidden: true } },
    { id: "device", kind: "media", x: 0.355, w: 0.29, y: 0.14, h: 0.81, label: "IPHONE · LOCK", mobile: { x: 0.25, w: 0.5, y: 0.15, h: 0.78 } },
    { id: "right-desk", kind: "panel", x: 0.66, w: 0.32, y: 0.16, h: 0.55, label: "DESK", mobile: { hidden: true } },
  ],
};

/** 2013 · Pinboard (maxWidth 1180) — frosted sticky header, a featured
 *  strip, then the board split: 3-column height-balanced masonry + a 240px
 *  pinned sidebar, with the stats bar fixed at the screen's foot. */
export const PINBOARD_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.04, w: 0.92, mobileX: 0.03, mobileW: 0.94 },
  regions: [
    { id: "pin-header", kind: "chrome", space: "viewport", x: 0, w: 1, y: 0.07, h: 0.065, label: "PINBOARD" },
    { id: "featured-strip", kind: "hero", x: 0, w: 1, y: 0.16, h: 0.1, label: "FEATURED" },
    { id: "col-a", kind: "grid", x: 0, w: 0.24, y: 0.29, h: 0.26, label: "PINS", mobile: { w: 0.485 } },
    { id: "col-b", kind: "grid", x: 0.26, w: 0.24, y: 0.29, h: 0.33, label: "PINS", mobile: { x: 0.515, w: 0.485 } },
    { id: "col-c", kind: "grid", x: 0.52, w: 0.24, y: 0.29, h: 0.21, label: "PINS", mobile: { x: 0, w: 0.485, y: 0.59, h: 0.24 } },
    { id: "pinned-sidebar", kind: "panel", x: 0.79, w: 0.21, y: 0.29, h: 0.31, label: "PINNED", mobile: { hidden: true } },
    { id: "stats-bar", kind: "chrome", space: "viewport", x: 0, w: 1, y: 0.95, h: 0.04, label: "STATS" },
  ],
};
