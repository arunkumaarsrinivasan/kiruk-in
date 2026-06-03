"use client";

/**
 * Module registry — meta for the dock cards + the content component each
 * module expands into. `eras` has no content component here: it renders the
 * existing fullscreen EraTimeMachine directly (handled in ModuleOverlayHost).
 */

import type React from "react";
import type { ModuleId } from "@/contexts/ModuleContext";
import EraStoryContent from "./EraStoryContent";
import { WorkObservatory } from "./WorkObservatory";
import { AboutExperience } from "./AboutExperience";
import { ProgressExperience } from "./ProgressExperience";
import { BlogExperience } from "./BlogExperience";
import { ContactExperience } from "./ContactExperience";

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
  { id: "work", label: "Work", icon: "▦", blurb: "Selected projects" },
  { id: "about", label: "About", icon: "☺", blurb: "Who is Arun" },
  { id: "progress", label: "Progress", icon: "▲", blurb: "The long game" },
  { id: "blog", label: "Blog", icon: "✎", blurb: "Process journal" },
  { id: "contact", label: "Contact", icon: "✉", blurb: "Start a session" },
];

/** Content bodies. `eras` is intentionally absent (special-cased overlay). */
export const MODULE_CONTENT: Partial<
  Record<ModuleId, React.ComponentType>
> = {
  "era-story": EraStoryContent,
  work: WorkObservatory,
  about: AboutExperience,
  progress: ProgressExperience,
  blog: BlogExperience,
  contact: ContactExperience,
};

export function getModuleMeta(id: ModuleId): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id);
}
