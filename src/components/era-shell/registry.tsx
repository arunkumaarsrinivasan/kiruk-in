"use client";

/**
 * Era Shell Registry — single source of truth for which era archetypes
 * provide which slots (global atmosphere, page variants, future nav/footer).
 *
 * Adding a new archetype = create the components + register here.
 * Adding a new page variant = create the component + register here.
 *
 * Eras with no archetype registered render the default (existing) UI
 * everywhere. Eras with an archetype registered render the archetype's
 * components ONLY for slots they implement; missing slots fall back to
 * default. Zero breakage by construction.
 */

import type { ComponentType } from "react";
import type { EraArchetypeId } from "@/data/era-archetypes";
import {
  TerminalShellLayer,
  TerminalHomePage,
} from "./archetypes/terminal";
import {
  SpatialHomePage,
} from "./archetypes/spatial";
import {
  XeroxBitmapShellLayer,
  XeroxBitmapHomePage,
} from "./archetypes/xerox-bitmap";
import {
  DocHtmlShellLayer,
  DocHtmlHomePage,
} from "./archetypes/doc-html";
import {
  MosaicShellLayer,
  MosaicHomePage,
} from "./archetypes/mosaic";
import {
  GeocitiesShellLayer,
  GeocitiesHomePage,
} from "./archetypes/geocities";
import {
  FramesetShellLayer,
  FramesetHomePage,
} from "./archetypes/frameset";
import { FlashSplashHomePage } from "./archetypes/flash-splash";
import { Web2CandyHomePage } from "./archetypes/web2-candy";
import { MicroblogHomePage } from "./archetypes/microblog";
import { IphoneSkeuHomePage } from "./archetypes/iphone-skeu";
import { PinboardHomePage } from "./archetypes/pinboard";
import { BlockEditorHomePage } from "./archetypes/block-editor";
import { IssueTrackerHomePage } from "./archetypes/issue-tracker";
import { AiNativeHomePage } from "./archetypes/ai-native";
import { PromptUIHomePage } from "./archetypes/prompt-ui";

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
  /**
   * Page-level UI variants. When mounted via <EraPageArchetype>, the
   * matching component fully replaces the page's default content.
   */
  pages?: Partial<Record<EraPageKey, ComponentType>>;
  /**
   * Site-wide overlay always mounted by <EraShell>. Use for atmospheric
   * effects (scanlines, glass blur, parallax field, neon glow).
   */
  shellLayer?: ComponentType<ShellLayerProps>;
}

export const ARCHETYPE_SHELLS: Partial<Record<EraArchetypeId, ArchetypeShell>> =
  {
    terminal: {
      shellLayer: TerminalShellLayer,
      pages: {
        home: TerminalHomePage,
      },
    },
    spatial: {
      // Spatial atmosphere is rendered inside SpatialHomePage so glass
      // panels can sit above the volumetric mesh (backdrop-blur requires
      // the atmosphere underneath, not above the panel z-stack).
      pages: {
        home: SpatialHomePage,
      },
    },
    "xerox-bitmap": {
      shellLayer: XeroxBitmapShellLayer,
      pages: {
        home: XeroxBitmapHomePage,
      },
    },
    "doc-html": {
      shellLayer: DocHtmlShellLayer,
      pages: {
        home: DocHtmlHomePage,
      },
    },
    mosaic: {
      shellLayer: MosaicShellLayer,
      pages: {
        home: MosaicHomePage,
      },
    },
    geocities: {
      shellLayer: GeocitiesShellLayer,
      pages: {
        home: GeocitiesHomePage,
      },
    },
    frameset: {
      shellLayer: FramesetShellLayer,
      pages: {
        home: FramesetHomePage,
      },
    },
    "flash-splash": {
      // Atmosphere lives inside FlashSplashHomePage so the splash gate +
      // chrome stage can sit above the starfield instead of underneath it.
      pages: {
        home: FlashSplashHomePage,
      },
    },
    "web2-candy": {
      pages: {
        home: Web2CandyHomePage,
      },
    },
    microblog: {
      pages: {
        home: MicroblogHomePage,
      },
    },
    "iphone-skeu": {
      pages: {
        home: IphoneSkeuHomePage,
      },
    },
    pinboard: {
      pages: {
        home: PinboardHomePage,
      },
    },
    "block-editor": {
      pages: {
        home: BlockEditorHomePage,
      },
    },
    "issue-tracker": {
      pages: {
        home: IssueTrackerHomePage,
      },
    },
    "ai-native": {
      // Aurora atmosphere lives inside AiNativeHomePage so chat panels can
      // sit above the gradient blobs (backdrop-blur needs them underneath).
      pages: {
        home: AiNativeHomePage,
      },
    },
    "prompt-ui": {
      // Split build studio — atmosphere lives inside the home page.
      pages: {
        home: PromptUIHomePage,
      },
    },
  };
