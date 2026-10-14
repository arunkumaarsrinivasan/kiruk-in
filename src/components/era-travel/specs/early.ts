/**
 * Early-era home blueprints (1981–1997) — authored from each archetype's
 * home component (above-the-fold measurements). Coarse structure: desktop
 * bars, single document columns, browser chrome. The wireframe should feel
 * like the era's drawing tools.
 */

import type { BlueprintSpec } from "../blueprint-types";

/** 1981 · Xerox Star — gray bevel desktop, max-w-4xl column on a dotted
 *  desktop: the boot trace, a row of desktop icons (two rows on phones),
 *  then the KIRUK-DE.DOC hero window running past the fold. The function
 *  keys (OPEN · PROPS · COPY · HELP) and status line sit in a bar fixed to
 *  the foot of the viewport. */
export const XEROX_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.15, w: 0.7, mobileX: 0.03, mobileW: 0.94 },
  grid: { size: 6, opacity: 0.06 }, // bitmap dither, not a layout grid
  regions: [
    { id: "boot-trace", kind: "panel", x: 0, w: 1, y: 0.1, h: 0.17, label: "BOOT TRACE", mobile: { h: 0.16 } },
    { id: "desktop-icons", kind: "grid", x: 0, w: 1, y: 0.29, h: 0.1, label: "ICONS", mobile: { y: 0.28, h: 0.2 } },
    { id: "hero-window", kind: "hero", x: 0, w: 1, y: 0.41, h: 0.49, label: "KIRUK-DE.DOC", mobile: { y: 0.5, h: 0.38 } },
    { id: "function-keys", kind: "chrome", space: "viewport", x: 0, w: 1, y: 0.925, h: 0.075, label: "OPEN · PROPS · COPY · HELP", mobile: { y: 0.875, h: 0.125 } },
  ],
};

/** 1991 · First web page — one centered 720px document column, framed by
 *  the fixed hypertext console above and the NCSA status bar below. */
export const DOC_HTML_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.22, w: 0.56, mobileX: 0.06, mobileW: 0.88 },
  regions: [
    { id: "hypertext-console", kind: "chrome", space: "viewport", x: 0, w: 1, y: 0.07, h: 0.035, label: "CONSOLE" },
    { id: "doc-header", kind: "hero", x: 0, w: 1, y: 0.13, h: 0.19, label: "TITLE · BYLINE" },
    { id: "doc-abstract", kind: "text", x: 0, w: 1, y: 0.34, h: 0.14, label: "ABSTRACT" },
    { id: "doc-toc", kind: "list", x: 0, w: 0.75, y: 0.5, h: 0.28, label: "ON THIS PAGE" },
    { id: "doc-section", kind: "text", x: 0, w: 1, y: 0.8, h: 0.17, label: "1. WHY" },
    { id: "status-bar", kind: "chrome", space: "viewport", x: 0, w: 1, y: 0.965, h: 0.03, label: "STATUS" },
  ],
};

/** 1995 · GeoCities — maxWidth 920 personal homepage: marquee, then one
 *  tall welcome hero (rainbow title, globe/mail/counter row, star rating,
 *  badge), a rainbow rule, and the about section peeking in. */
export const GEOCITIES_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.14, w: 0.72, mobileX: 0.04, mobileW: 0.92 },
  regions: [
    { id: "marquee", kind: "chrome", x: 0, w: 1, y: 0.09, h: 0.05, label: "MARQUEE" },
    { id: "hero-welcome", kind: "hero", x: 0.08, w: 0.84, y: 0.16, h: 0.24, label: "WELCOME", mobile: { x: 0.02, w: 0.96 } },
    { id: "badge-row", kind: "media", x: 0.2, w: 0.6, y: 0.43, h: 0.13, label: "GLOBE · MAIL · COUNTER", mobile: { x: 0.1, w: 0.8 } },
    { id: "star-rating", kind: "panel", x: 0.3, w: 0.4, y: 0.59, h: 0.07, label: "RATE MY SITE", mobile: { x: 0.2, w: 0.6 } },
    { id: "rainbow-rule", kind: "chrome", x: 0, w: 1, y: 0.72, h: 0.02, label: "———" },
    { id: "about-peek", kind: "text", x: 0, w: 1, y: 0.78, h: 0.18, label: "ABOUT ME" },
  ],
};

/** 1997 · Frameset / CD-ROM — a beveled application window (maxWidth 1080):
 *  title bar, toolbar, then the two-pane body (240px TOC tree + chapter)
 *  running to the status bar at the window's foot. */
export const FRAMESET_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.078, w: 0.844, mobileX: 0.02, mobileW: 0.96 },
  regions: [
    { id: "disc-titlebar", kind: "chrome", x: 0, w: 1, y: 0.09, h: 0.06, label: "TITLE BAR" },
    { id: "disc-toolbar", kind: "chrome", x: 0, w: 1, y: 0.15, h: 0.05, label: "TOOLBAR" },
    { id: "toc-pane", kind: "list", x: 0, w: 0.222, y: 0.21, h: 0.69, label: "TABLE OF CONTENTS", mobile: { x: 0, w: 1, h: 0.22 } },
    { id: "content-pane", kind: "text", x: 0.232, w: 0.768, y: 0.21, h: 0.69, label: "CHAPTER", mobile: { x: 0, w: 1, y: 0.45, h: 0.42 } },
    { id: "status-bar", kind: "chrome", x: 0, w: 1, y: 0.91, h: 0.035, label: "STATUS" },
  ],
};
