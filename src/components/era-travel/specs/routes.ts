/**
 * Standard route blueprints — the shared (non-home) pages render the same
 * content in every era's tokens, so one spec per route serves all eras.
 * Geometry is authored from each route's page component; the live snap
 * refines it where landmarks carry data-blueprint.
 */

import type { EraPageKey } from "@/components/era-shell/registry";
import type { BlueprintSpec } from "../blueprint-types";

/** /work — max-w-6xl column: crumbs, split-character header, showcase
 *  slider, platforms section. (The Figma deck sits below the fold.) */
const WORK_SPEC: BlueprintSpec = {
  column: { x: 0.05, w: 0.9, mobileX: 0.04, mobileW: 0.92 },
  regions: [
    { id: "crumbs", kind: "chrome", x: 0, w: 0.3, y: 0.09, h: 0.025, label: "CRUMBS" },
    { id: "cases-header", kind: "hero", x: 0, w: 1, y: 0.14, h: 0.3, label: "HEADER" },
    { id: "case-row-a", kind: "media", x: 0, w: 1, y: 0.48, h: 0.24, label: "SHOWCASE" },
    { id: "case-row-b", kind: "panel", x: 0, w: 1, y: 0.76, h: 0.2, label: "PLATFORMS" },
  ],
};

/** /about — the time-travel walk opens as a centered intro (max-w-2xl). */
const ABOUT_SPEC: BlueprintSpec = {
  column: { x: 0.24, w: 0.52, mobileX: 0.06, mobileW: 0.88 },
  regions: [
    { id: "intro-title", kind: "hero", x: 0.1, w: 0.8, y: 0.18, h: 0.12, label: "TIME TRAVEL" },
    { id: "intro-copy", kind: "text", x: 0.05, w: 0.9, y: 0.33, h: 0.12, label: "BRIEF" },
    { id: "intro-actions", kind: "chrome", x: 0.2, w: 0.6, y: 0.49, h: 0.06, label: "CONTROLS" },
    { id: "intro-extra", kind: "panel", x: 0, w: 1, y: 0.6, h: 0.24, label: "MOMENTS" },
  ],
};

/** /contact — max-w-4xl: crumbs, centered header, telephone + channels. */
const CONTACT_SPEC: BlueprintSpec = {
  column: { x: 0.15, w: 0.7, mobileX: 0.04, mobileW: 0.92 },
  regions: [
    { id: "crumbs", kind: "chrome", x: 0, w: 0.3, y: 0.09, h: 0.025, label: "CRUMBS" },
    { id: "header", kind: "hero", x: 0.15, w: 0.7, y: 0.14, h: 0.1, label: "HEADER" },
    { id: "phone", kind: "panel", x: 0, w: 0.485, y: 0.29, h: 0.42, label: "TELEPHONE" },
    { id: "channels", kind: "panel", x: 0.515, w: 0.485, y: 0.29, h: 0.42, label: "CHANNELS" },
  ],
};

/** /notebook — single centered index column (max-w-3xl / 72ch): title
 *  block, search, entry records. Both the terminal and token variants
 *  share this shape. */
const BLOG_SPEC: BlueprintSpec = {
  column: { x: 0.2, w: 0.6, mobileX: 0.05, mobileW: 0.9 },
  regions: [
    { id: "header", kind: "hero", x: 0, w: 0.7, y: 0.1, h: 0.14, label: "NOTEBOOK" },
    { id: "search", kind: "chrome", x: 0, w: 0.5, y: 0.26, h: 0.05, label: "SEARCH" },
    { id: "entries", kind: "list", x: 0, w: 1, y: 0.34, h: 0.5, label: "ENTRIES" },
  ],
};

/** /progress — max-w-7xl: header, section tabs, stat grid, section body. */
const PROGRESS_SPEC: BlueprintSpec = {
  column: { x: 0.03, w: 0.94, mobileX: 0.04, mobileW: 0.92 },
  regions: [
    { id: "crumbs", kind: "chrome", x: 0, w: 0.3, y: 0.07, h: 0.025, label: "CRUMBS" },
    { id: "header", kind: "hero", x: 0, w: 0.6, y: 0.11, h: 0.1, label: "THE LONG GAME" },
    { id: "tabs", kind: "chrome", x: 0, w: 0.8, y: 0.24, h: 0.05, label: "SECTIONS" },
    { id: "stats", kind: "grid", x: 0, w: 1, y: 0.32, h: 0.12, label: "STATS" },
    { id: "section-body", kind: "panel", x: 0, w: 1, y: 0.48, h: 0.4, label: "SECTION" },
  ],
};

export const PAGE_SPECS: Partial<Record<EraPageKey, BlueprintSpec>> = {
  work: WORK_SPEC,
  about: ABOUT_SPEC,
  contact: CONTACT_SPEC,
  blog: BLOG_SPEC,
  progress: PROGRESS_SPEC,
};
