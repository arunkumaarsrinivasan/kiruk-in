import type { IntentId } from "@/data/contact";

export type AnswerKind =
  | "about"
  | "story"
  | "now"
  | "work"
  | "project"
  | "role"
  | "skills"
  | "contact"
  | "writing"
  | "greeting"
  | "help"
  | "unknown";

export type AnswerDepth = "skim" | "read" | "deep";

export interface AnswerLink {
  label: string;
  href: string;
  /** A short line beside the label (a channel's handle, a project's role). */
  note?: string;
}

/**
 * One thing the pupil says. Every line in `say` comes from the site's data
 * (about-story, portfolio-data, contact); only the small connective lines in
 * reader.ts VOICE are written for the pupil itself.
 */
export interface Answer {
  kind: AnswerKind;
  title: string;
  say: string[];
  depth: AnswerDepth;
  links: AnswerLink[];
  /** Two or three follow-up asks, phrased the way a visitor would type them. */
  next: string[];
  /** The words it went by, shown so the visitor can see why it answered this. */
  heard: string[];
  /** Contact answers carry the intent their draft is built from. */
  contactIntent?: IntentId;
  /** What "tell me more" deepens: "what:<about-story key>" | "project:<id>" | "role:<id>". */
  ref?: string;
}
