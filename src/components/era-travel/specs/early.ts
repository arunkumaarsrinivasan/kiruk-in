/**
 * Early-era home blueprints (1981–1997) — authored from each archetype's
 * home component (above-the-fold measurements). Coarse structure: desktop
 * bars, single document columns, browser chrome. The wireframe should feel
 * like the era's drawing tools.
 */

import type { BlueprintSpec } from "../blueprint-types";

/** 1981 · Xerox Star — max-w-4xl stack of beveled windows on a dithered
 *  desktop: desktop bar, boot trace, then the hero file window which runs
 *  past the fold; the next window only peeks in. */
export const XEROX_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.15, w: 0.7, mobileX: 0.03, mobileW: 0.94 },
  grid: { size: 6, opacity: 0.06 }, // bitmap dither, not a layout grid
  regions: [
    { id: "desktop-bar", kind: "chrome", x: 0, w: 1, y: 0.1, h: 0.04, label: "DESKTOP BAR" },
    { id: "boot-trace", kind: "panel", x: 0, w: 1, y: 0.16, h: 0.12, label: "BOOT TRACE" },
    { id: "hero-window", kind: "hero", x: 0, w: 1, y: 0.3, h: 0.52, label: "KIRUK-DE.DOC" },
    { id: "window-why", kind: "panel", x: 0, w: 1, y: 0.86, h: 0.14, label: "WHY-KIRUK.TXT" },
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

/** 1993 · Mosaic — the page is inside the browser: title bar, menu bar,
 *  toolbar, location bar; then the directory document — marquee strip,
 *  KIRUK.NET brand block, and the auto-fit category grid. */
export const MOSAIC_HOME_SPEC: BlueprintSpec = {
  column: { x: 0.078, w: 0.844, mobileX: 0.02, mobileW: 0.96 },
  regions: [
    { id: "title-bar", kind: "chrome", x: 0, w: 1, y: 0.085, h: 0.03, label: "NCSA MOSAIC" },
    { id: "menu-bar", kind: "chrome", x: 0, w: 1, y: 0.115, h: 0.026, label: "MENUS" },
    { id: "toolbar", kind: "chrome", x: 0, w: 1, y: 0.141, h: 0.045, label: "TOOLBAR" },
    { id: "location-bar", kind: "chrome", x: 0, w: 1, y: 0.186, h: 0.032, label: "DOCUMENT URL" },
    { id: "news-marquee", kind: "chrome", x: 0, w: 1, y: 0.24, h: 0.04, label: "WHAT'S NEW" },
    { id: "dir-brand", kind: "hero", x: 0.15, w: 0.7, y: 0.3, h: 0.13, label: "KIRUK.NET", mobile: { x: 0.05, w: 0.9 } },
    { id: "category-grid", kind: "grid", x: 0, w: 1, y: 0.46, h: 0.44, label: "CATEGORIES" },
    { id: "status-bar", kind: "chrome", x: 0, w: 1, y: 0.93, h: 0.03, label: "STATUS" },
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
