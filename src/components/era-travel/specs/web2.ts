/**
 * Web 2.0-era home blueprints (2000–2013) — authored from each archetype's
 * home component (above-the-fold measurements). Structure gains chrome:
 * desktops with floating windows, profile columns, story rivers, device
 * frames, masonry boards.
 */

import type { BlueprintSpec } from "../blueprint-types";

/** 2000 · The Search Box — the home state: a 560px centered column holding
 *  the serif wordmark, one text box, two grey buttons and the line of links.
 *  Region ids match data-blueprint markers on the page. */
export const FLASH_SPLASH_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.306, w: 0.389, mobileX: 0.032, mobileW: 0.936 },
  regions: [
    { id: "search-wordmark", kind: "hero", x: 0.2, w: 0.6, y: 0.18, h: 0.11, label: "KIRUK", mobile: { x: 0.15, w: 0.7, y: 0.19, h: 0.085 } },
    { id: "search-box", kind: "panel", x: 0.071, w: 0.857, y: 0.31, h: 0.04, label: "SEARCH BOX", mobile: { x: 0, w: 1, y: 0.3, h: 0.054 } },
    { id: "search-buttons", kind: "chrome", x: 0.27, w: 0.46, y: 0.365, h: 0.036, label: "SEARCH · CURIOUS", mobile: { x: 0, w: 1, y: 0.37, h: 0.054 } },
    { id: "search-links", kind: "list", x: 0.25, w: 0.5, y: 0.47, h: 0.03, label: "WORK · ABOUT · CONTACT", mobile: { x: 0.1, w: 0.8, y: 0.53, h: 0.035 } },
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
