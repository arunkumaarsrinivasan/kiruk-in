"use client";

/**
 * Module registry — meta for the dock cards + the content component each
 * module expands into. `eras` has no content component here: it renders the
 * existing fullscreen EraTimeMachine directly (handled in ModuleOverlayHost).
 *
 * Bodies are separate chunks. The dock labels stay in this file; a body
 * downloads when that module actually opens.
 */

import dynamic from "next/dynamic";
import type React from "react";
import type { ModuleId } from "@/contexts/ModuleContext";

function body(load: () => Promise<{ default: React.ComponentType }>) {
  return dynamic(load, { loading: () => null });
}

export interface ModuleMeta {
  id: ModuleId;
  label: string;
  /** Single-glyph mark shown on the collapsed card. */
  icon: string;
  /** One-line teaser on the card. */
  blurb: string;
}

/** Dock order. `eras` + `era-story` lead — the site is about the eras. */
export const MODULES: ModuleMeta[] = [
  { id: "era-story", label: "This Era", icon: "❖", blurb: "Why this screen" },
  { id: "eras", label: "Eras", icon: "◉", blurb: "Travel the timeline" },
  { id: "work", label: "Work", icon: "▦", blurb: "Deep dives & platforms" },
  { id: "observatory", label: "Observatory", icon: "🔭", blurb: "Skills telescope" },
  { id: "about", label: "About", icon: "☺", blurb: "Who is Arun" },
  { id: "progress", label: "Progress", icon: "▲", blurb: "The long game" },
  { id: "blog", label: "Notebook", icon: "✎", blurb: "Read the notebook" },
  { id: "contact", label: "Contact", icon: "✉", blurb: "Start a session" },
  { id: "footer-game", label: "Arcade", icon: "▣", blurb: "Era mini-game" },
];

/** Content bodies. `eras` is intentionally absent (special-cased overlay). */
export const MODULE_CONTENT: Partial<
  Record<ModuleId, React.ComponentType>
> = {
  "era-story": body(() => import("./EraStoryContent")),
  work: body(() => import("../work-os/WorkOS")),
  /** @deprecated URL alias — original slider deep-dive body */
  "case-studies": body(() => import("./CaseStudiesExperience")),
  observatory: body(() => import("./WorkObservatory")),
  about: body(() => import("./AboutExperience")),
  progress: body(() => import("./ProgressExperience")),
  blog: body(() => import("./BlogExperience")),
  contact: body(() => import("./ContactExperience")),
  "footer-game": body(() => import("./FooterGameFull")),
};

export function getModuleMeta(id: ModuleId): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id);
}
