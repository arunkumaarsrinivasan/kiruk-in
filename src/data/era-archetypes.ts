/**
 * Era Archetype Registry
 *
 * Maps each era id (1970..2025) to an "archetype" — a full UI shell that
 * renders the era data inside an authentic visual language for that era.
 *
 * An archetype is not just a token bundle: it owns its own layout, controls,
 * content vessel, motion grammar and transition frames. Two eras can share
 * the same archetype with per-era tweaks (e.g. 2003 + 2006 → web2-candy with
 * different gloss intensity).
 *
 * Eras without a registered archetype fall back to the legacy
 * EyeTimelineOverlay automatically, so the UI never breaks while archetypes
 * roll out one era at a time.
 */

export type EraArchetypeId =
  | "terminal"        // CRT + man-page (1970)
  | "xerox-bitmap"    // beveled gray window, 1-bit dither (1981)
  | "doc-html"        // Times New Roman document (1991)
  | "mosaic"          // Mosaic/Netscape browser chrome (1993)
  | "geocities"       // neon chaos, marquee, GIF (1995)
  | "frameset"        // sidebar frame + content frame (1997)
  | "flash-splash"    // Macromedia Flash splash + scene timeline (2000)
  | "zen-garden"      // centered semantic document (2000 — unused, replaced by flash-splash)
  | "web2-candy"      // MySpace social profile (2003)
  | "microblog"       // twttr-era status stream (2006)
  | "iphone-skeu"     // phone bezel, felt/leather, list view (2009)
  | "pinboard"        // iOS 7 flat masonry board + flip cards + swipe deck (2013)
  | "block-editor"    // Notion-style workspace + blocks + a11y toolbar (2018)
  | "issue-tracker"   // Linear-style sprint board + Cmd-K + keyboard (2021)
  | "ai-native"       // ChatGPT-era conversational assistant + streaming (2023)
  | "metro"           // bold colored tiles (2010 — unused)
  | "material"        // elevated cards, FAB, ripple (2014 — unused)
  | "flat-card"       // clean cards, system sans (2016, 2018)
  | "glass"           // frosted blur, gradient mesh (2020, 2021, 2022)
  | "ide"             // VS Code-ish tabs + file tree (2023 — unused)
  | "stage"           // Stage Manager clusters (2024)
  | "spatial"         // floating depth panels, parallax (2025 — unused)
  | "prompt-ui";      // generative-UI: prompt → live-built interface (2026)

/**
 * Mapping from era id to archetype.
 *
 * Unmapped era ids fall back to the legacy overlay automatically — do NOT
 * add an entry until the archetype component is actually implemented and
 * registered in ARCHETYPE_COMPONENTS.
 */
export const ERA_ARCHETYPE_MAP: Record<string, EraArchetypeId> = {
  "1970": "terminal",
  "1981": "xerox-bitmap",
  "1991": "doc-html",
  "1993": "mosaic",
  "1995": "geocities",
  "1997": "frameset",
  "2000": "flash-splash",
  "2003": "web2-candy",
  "2006": "microblog",
  "2009": "iphone-skeu",
  "2013": "pinboard",
  "2018": "block-editor",
  "2021": "issue-tracker",
  "2023": "ai-native",
  "2026": "prompt-ui",
};

/**
 * Per-era archetype overrides. Lets two eras share an archetype while
 * shifting parameters (gloss intensity, scanline density, parallax depth).
 *
 * Keep this loose by design — archetypes read whichever keys they understand
 * and ignore the rest.
 */
export type EraArchetypeOverrides = Record<string, number | string | boolean>;

export const ERA_ARCHETYPE_OVERRIDES: Record<string, EraArchetypeOverrides> = {
  // example: '2003': { glossIntensity: 1, betaBadge: true },
};

export function getArchetypeForEra(eraId: string): EraArchetypeId | null {
  return ERA_ARCHETYPE_MAP[eraId] ?? null;
}

export function getArchetypeOverrides(eraId: string): EraArchetypeOverrides {
  return ERA_ARCHETYPE_OVERRIDES[eraId] ?? {};
}
