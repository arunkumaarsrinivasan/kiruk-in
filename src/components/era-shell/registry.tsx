"use client";

/**
 * Era Shell Registry — which archetype owns which slots.
 *
 * Home pages and shell layers load on demand (`next/dynamic`). Visiting /about
 * must not download GeocitiesHomePage just because 1995 is active; hovering an era
 * in the time machine prefetches that era's chunks during the travel wipe.
 *
 * Archetype home copy: `@/data/era-page-content`.
 */

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import type { EraArchetypeId } from "@/data/era-archetypes";
import { getArchetypeForEra } from "@/data/era-archetypes";

export type EraPageKey =
  | "home"
  | "about"
  | "work"
  | "contact"
  | "blog"
  | "progress"
  | "case-studies"
  | "portfolio";

export interface ShellLayerProps {
  /** Whether the archetype is currently the active era's archetype. */
  active: boolean;
}

export interface ArchetypeShell {
  pages?: Partial<Record<EraPageKey, ComponentType>>;
  shellLayer?: ComponentType<ShellLayerProps>;
}

function PageChunkFallback() {
  return (
    <div
      className="min-h-dvh"
      style={{ background: "var(--bg-main)" }}
      aria-hidden
    />
  );
}

export const ARCHETYPE_SHELLS: Partial<Record<EraArchetypeId, ArchetypeShell>> =
  {
    terminal: {
      shellLayer: dynamic(
        () =>
          import("./archetypes/terminal/TerminalShellLayer").then((m) => ({
            default: m.TerminalShellLayer,
          })),
      ),
      pages: {
        home: dynamic(
          () =>
            import("./archetypes/terminal/TerminalHomePage").then((m) => ({
              default: m.TerminalHomePage,
            })),
          { loading: PageChunkFallback },
        ),
      },
    },
    "xerox-bitmap": {
      shellLayer: dynamic(
        () =>
          import("./archetypes/xerox-bitmap/XeroxBitmapShellLayer").then(
            (m) => ({ default: m.XeroxBitmapShellLayer }),
          ),
      ),
      pages: {
        home: dynamic(
          () =>
            import("./archetypes/xerox-bitmap/XeroxBitmapHomePage").then(
              (m) => ({ default: m.XeroxBitmapHomePage }),
            ),
          { loading: PageChunkFallback },
        ),
      },
    },
    "doc-html": {
      shellLayer: dynamic(
        () =>
          import("./archetypes/doc-html/DocHtmlShellLayer").then((m) => ({
            default: m.DocHtmlShellLayer,
          })),
      ),
      pages: {
        home: dynamic(
          () =>
            import("./archetypes/doc-html/DocHtmlHomePage").then((m) => ({
              default: m.DocHtmlHomePage,
            })),
          { loading: PageChunkFallback },
        ),
      },
    },
    geocities: {
      shellLayer: dynamic(
        () =>
          import("./archetypes/geocities/GeocitiesShellLayer").then((m) => ({
            default: m.GeocitiesShellLayer,
          })),
      ),
      pages: {
        home: dynamic(
          () =>
            import("./archetypes/geocities/GeocitiesHomePage").then((m) => ({
              default: m.GeocitiesHomePage,
            })),
          { loading: PageChunkFallback },
        ),
      },
    },
    frameset: {
      shellLayer: dynamic(
        () =>
          import("./archetypes/frameset/FramesetShellLayer").then((m) => ({
            default: m.FramesetShellLayer,
          })),
      ),
      pages: {
        home: dynamic(
          () =>
            import("./archetypes/frameset/FramesetHomePage").then((m) => ({
              default: m.FramesetHomePage,
            })),
          { loading: PageChunkFallback },
        ),
      },
    },
    "flash-splash": {
      pages: {
        home: dynamic(
          () =>
            import("./archetypes/flash-splash/FlashSplashHomePage").then(
              (m) => ({ default: m.FlashSplashHomePage }),
            ),
          { loading: PageChunkFallback },
        ),
      },
    },
    "web2-candy": {
      pages: {
        home: dynamic(
          () =>
            import("./archetypes/web2-candy/Web2CandyHomePage").then((m) => ({
              default: m.Web2CandyHomePage,
            })),
          { loading: PageChunkFallback },
        ),
      },
    },
    "iphone-skeu": {
      pages: {
        home: dynamic(
          () =>
            import("./archetypes/iphone-skeu/IphoneSkeuHomePage").then((m) => ({
              default: m.IphoneSkeuHomePage,
            })),
          { loading: PageChunkFallback },
        ),
      },
    },
    pinboard: {
      pages: {
        home: dynamic(
          () =>
            import("./archetypes/pinboard/PinboardHomePage").then((m) => ({
              default: m.PinboardHomePage,
            })),
          { loading: PageChunkFallback },
        ),
      },
    },
    "prompt-ui": {
      pages: {
        home: dynamic(
          () =>
            import("./archetypes/prompt-ui/PromptUIHomePage").then((m) => ({
              default: m.PromptUIHomePage,
            })),
          { loading: PageChunkFallback },
        ),
      },
    },
  };

const ARCHETYPE_PREFETCH: Partial<Record<EraArchetypeId, () => void>> = {
  terminal: () => {
    void import("./archetypes/terminal/TerminalHomePage");
    void import("./archetypes/terminal/TerminalShellLayer");
  },
  "xerox-bitmap": () => {
    void import("./archetypes/xerox-bitmap/XeroxBitmapHomePage");
    void import("./archetypes/xerox-bitmap/XeroxBitmapShellLayer");
  },
  "doc-html": () => {
    void import("./archetypes/doc-html/DocHtmlHomePage");
    void import("./archetypes/doc-html/DocHtmlShellLayer");
  },
  geocities: () => {
    void import("./archetypes/geocities/GeocitiesHomePage");
    void import("./archetypes/geocities/GeocitiesShellLayer");
  },
  frameset: () => {
    void import("./archetypes/frameset/FramesetHomePage");
    void import("./archetypes/frameset/FramesetShellLayer");
  },
  "flash-splash": () => {
    void import("./archetypes/flash-splash/FlashSplashHomePage");
  },
  "web2-candy": () => {
    void import("./archetypes/web2-candy/Web2CandyHomePage");
  },
  "iphone-skeu": () => {
    void import("./archetypes/iphone-skeu/IphoneSkeuHomePage");
  },
  pinboard: () => {
    void import("./archetypes/pinboard/PinboardHomePage");
  },
  "prompt-ui": () => {
    void import("./archetypes/prompt-ui/PromptUIHomePage");
  },
};

/** Warm the destination era's chunks while the travel overlay covers the swap. */
export function prefetchEraArchetype(eraId: string) {
  const id = getArchetypeForEra(eraId);
  if (!id) return;
  ARCHETYPE_PREFETCH[id]?.();
}
