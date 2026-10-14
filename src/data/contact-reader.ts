/**
 * Reading what a visitor typed: keywords and weights, not a model.
 *
 * Shared by the 2026 pupil (home) and the Device2026 contact skin. read()
 * says who they probably are, what they want, the words it went by, and how
 * sure it is (score: strong cues count 2, hints 1).
 */

import { WHO, type ContactWhoId, type Intent, type IntentId } from "@/data/contact";

type Cue = [RegExp, number];

export const GREETING = /\b(hi|hey|hello|hiya|howdy|friends?)\b/;

/** What they want. Strong cues count 2, hints count 1. Highest score wins; ties go to the earlier intent. */
export const WANTS: [IntentId, Cue[]][] = [
  [
    "hire",
    [
      [/\b(hir(?:e|es|ed|ing)|recruit\w*|roles?|jobs?|positions?|openings?|vacanc(?:y|ies)|headcount|join (?:us|our team))\b/g, 2],
      [/\b(team|company|full[- ]?time|contract|interview\w*|salary|looking for an?|need an?)\b/g, 1],
    ],
  ],
  [
    "build",
    [
      [/\b(build\w*|built|mvp|startups?|co-?found\w*|founders?|prototyp\w*|freelanc\w*|consult\w*)\b/g, 2],
      [/\b(products?|apps?|launch\w*|ship\w*|idea|together|collab\w*|partner\w*|projects?|website)\b/g, 1],
    ],
  ],
  [
    "advice",
    [
      [/\b(advice|advise|mentor\w*|careers?|students?|guidance|stuck)\b/g, 2],
      [/\b(learn\w*|tips?|questions?|how (?:do|did|can|should) (?:i|you)|getting started|break into|junior|college|universit(?:y|ies)|fresher|beginner)\b/g, 1],
    ],
  ],
  [
    "talk-design",
    [
      [/\b(feedback|critiqu\w*|portfolio|review)\b/g, 2],
      [/\b(design\w*|ux|ui|figma|typography|fonts?|thoughts on|your work|sketch\w*)\b/g, 1],
    ],
  ],
  [
    "hello",
    [
      [new RegExp(GREETING.source, "g"), 2],
      [/\b(thanks|thank you|lov(?:e|ed|ing)|cool|nice|wave|yo)\b/g, 1],
    ],
  ],
];

/** Who they are, when they say so outright. First match wins. */
export const NAMES: [ContactWhoId, RegExp][] = [
  ["hiring", /\b(recruit\w*|hiring|talent|hr|headhunt\w*)\b/],
  ["founder", /\b(founders?|co-?found\w*|ceo|cto|my startup|our startup)\b/],
  ["student", /\b(students?|college|universit(?:y|ies)|intern|fresher|bootcamp|graduat\w*)\b/],
  ["designer", /\b(designers?|i design)\b/],
  ["friend", /\b(friends?|buddy|we met|long time)\b/],
];

/** When they don't say who they are, guess from what they want. */
export const USUAL: Record<IntentId, ContactWhoId> = { hire: "hiring", build: "founder", "talk-design": "designer", advice: "student", hello: "curious" };

export interface Reading {
  who: ContactWhoId;
  intent: IntentId;
  /** The words the reading went by, for the honest line under it. */
  heard: string[];
  /** How strongly the words point at the intent: 0 = nothing matched. */
  score: number;
}

export function read(text: string): Reading {
  const s = text.toLowerCase().replace(/[‘’]/g, "'");
  let best: { id: IntentId; score: number; heard: string[] } | null = null;
  for (const [id, cues] of WANTS) {
    let score = 0;
    const heard: string[] = [];
    for (const [re, weight] of cues) {
      for (const m of s.matchAll(re)) {
        score += weight;
        heard.push(m[0]);
      }
    }
    if (score > (best?.score ?? 0)) best = { id, score, heard };
  }
  const named = NAMES.find(([, re]) => re.test(s));
  const intent = best?.id ?? (named ? usualIntent(named[0]) : "hello");
  const who = named?.[0] ?? (best && best.id !== "hello" ? USUAL[best.id] : GREETING.test(s) ? "friend" : "curious");
  const self = named ? [s.match(named[1])![0]] : [];
  return { who, intent, heard: [...new Set([...self, ...(best?.heard ?? [])])].slice(0, 3), score: best?.score ?? 0 };
}

/** Their words as the note's opening line: greeting dropped (the draft already says hi), capitalised, ended. */
export function sentence(text: string): string {
  const s = text
    .trim()
    .replace(/^(?:hi|hey|hello|hiya)\b[\s,!.]*(?:there\b|arun\b)?[\s,!.]*/i, "")
    .trim();
  if (!s) return "";
  const t = s.charAt(0).toUpperCase() + s.slice(1);
  return /[.!?)]$/.test(t) ? t : `${t}.`;
}

/** The intent's template with their sentence as the first line after "Hi Arun,". */
export function draftFrom(intent: Intent, said: string): string {
  const [hello, opener, ...rest] = intent.body.split("\n\n");
  return [hello, said || opener, ...rest].join("\n\n");
}

export const usualIntent = (who: ContactWhoId) => WHO.find((w) => w.id === who)!.intent;
