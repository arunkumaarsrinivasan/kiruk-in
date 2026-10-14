/**
 * Era-travel blueprint — type model.
 *
 * A BlueprintSpec is a declarative wireframe of the page you are travelling
 * TO: which regions exist, where they sit, and in what drawing language
 * (grammar) they assemble. Specs are authored from each archetype's code and
 * are the fallback geometry until the live DOM snap (data-blueprint) refines
 * them to measured rects.
 *
 * Coordinates: a spec declares a content column in viewport fractions
 * (desktop + mobile), and each region's x/w are fractions of that column
 * while y/h are fractions of viewport height. That keeps one spec honest
 * across screen sizes.
 */

import type { EraPageKey } from "@/components/era-shell/registry";

/** Drawing language of the build-up — mirrors ARRIVALS in the era picker. */
export type BlueprintGrammar =
  | "blink" // 1970 — rows type themselves in, cursor blink
  | "snap" // 1981 / 1997 — 1-bit display: no interpolation, just appears
  | "glitch" // 1995 — tears sideways, then settles
  | "pulse" // 2003 / 2009 — springs in from 0.9
  | "float" // 1991 / 1993 / 2000 / 2006 — rises gently into place
  | "morph" // 2021+ — resolves out of a blur
  | "none"; // 2013 / 2018 — simply appears

/** Per-era grammar, aligned with ARRIVALS in immersive-era-loading-page. */
export const ERA_GRAMMAR: Record<string, BlueprintGrammar> = {
  "1970": "blink",
  "1981": "snap",
  "1991": "float",
  "1995": "glitch",
  "1997": "snap",
  "2000": "float",
  "2003": "pulse",
  "2009": "pulse",
  "2013": "none",
  "2026": "morph",
};

export const grammarForEra = (eraId: string): BlueprintGrammar =>
  ERA_GRAMMAR[eraId] ?? "float";

export type RegionKind =
  | "chrome" // status bars, browser chrome, nav
  | "hero" // banner / masthead / title
  | "text" // paragraphs, log lines, document body
  | "panel" // boxed panel / card
  | "grid" // multi-up card grid
  | "list" // rows / stream / feed
  | "media" // image / interactive canvas
  | "footer";

export interface BlueprintRegion {
  /** Stable id — matches data-blueprint attributes for the live snap. */
  id: string;
  kind: RegionKind;
  /** Coordinate space: fractions of the content column, or of the viewport. */
  space?: "column" | "viewport";
  /** Fraction of the coordinate space (0..1). */
  x: number;
  w: number;
  /** Fraction of viewport height (0..1). */
  y: number;
  h: number;
  /** Mobile reflow — real pages stack or drop regions under 768px; the
   *  wireframe follows. Omitted fields inherit the desktop values. */
  mobile?: {
    x?: number;
    w?: number;
    y?: number;
    h?: number;
    hidden?: boolean;
  };
  /** Short measurement label shown in skeleton phase (e.g. "RECORD 001"). */
  label?: string;
}

export interface BlueprintSpec {
  /** Content column in viewport fractions, desktop and mobile. */
  column: { x: number; w: number; mobileX: number; mobileW: number };
  /** Grid overrides; omit to inherit the era's --era-grid-* tokens. */
  grid?: { size?: number; opacity?: number };
  regions: BlueprintRegion[];
}

export interface ResolvedSpec {
  spec: BlueprintSpec;
  grammar: BlueprintGrammar;
}

/** Map the current route to the page key used by the era registry. */
export function pageKeyForPath(pathname: string | null): EraPageKey {
  if (!pathname || pathname === "/") return "home";
  if (pathname.startsWith("/work")) return "work";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/contact")) return "contact";
  if (pathname.startsWith("/notebook")) return "blog";
  if (pathname.startsWith("/progress")) return "progress";
  if (pathname.startsWith("/case-studies")) return "case-studies";
  if (pathname.startsWith("/portfolio")) return "portfolio";
  return "home";
}
