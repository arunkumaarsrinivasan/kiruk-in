/**
 * The pupil's own words: the only lines it says that don't come from the
 * data. Short, first person, plain, no em dashes, no claims about Arun.
 * Each is a template; its src (`voice:key|arg|arg`) re-renders to the same
 * text, which is how the eval checks them.
 */

import type { Txt } from "./surface";

const T = {
  greeting: () => "Hi, I'm Arun. Ask me anything about my work, my story, or how to reach me.",
  browse: () => "Ask me about a project, a company, a year, a trek, or how to reach me. A few to start:",
  unknown: () => "I didn't catch that. Did you mean one of these?",
  nothing: () => "I don't have anything written down for that yet.",
  noOpinion: () => "I haven't written my answer to that down yet. Ask me in person: it's a good question.",
  decline: () => "That's one I keep to myself here. Happy to talk about my work, my story, or how to reach me.",
  deepest: () => "That's everything I've written down about it.",
  none: (kind: string) => `Nothing in my ${kind} matches that.`,
  count: (n: string, kind: string) => `${n} ${kind}`,
  work: (n: string) => `${n} things I've worked on.`,
  usedIn: (n: string, tech: string) => `${n} ${Number(n) === 1 ? "project uses" : "projects use"} ${tech}.`,
  years: (from: string, to: string) => `${from} to ${to}`,
  reach: () => "Ways to reach me",
  writing: () => "I write in a notebook. Here's what's in it.",
  compare: (a: string, b: string) => `${a} and ${b}`,
  timeline: (year: string) => (year ? `What I was doing in ${year}` : "How I got here"),
  timelineEmpty: (year: string) => `Nothing on my timeline for ${year}.`,
  /** about-story question labels are written to the visitor ("what you were like…"); the pupil answers as me. */
  story: (label: string) => {
    const t = label.replace(/\byou were\b/g, "I was").replace(/\byou're\b/g, "I'm").replace(/\byour\b/g, "my").replace(/\byou\b/g, "I");
    return t.charAt(0).toUpperCase() + t.slice(1);
  },
  contactTo: (label: string) => `To ${label}`,
  more: () => "Tell me more",
  evidence: () => "Here's what I can show you. You decide.",
  yes: (label: string) => `Yes: ${label}. Here's where it shows up.`,
  noRecord: (word: string) => `I don't have ${word} written down anywhere. Here's what I do work with.`,
  before: (name: string) => `Before ${name}`,
  after: (name: string) => `After ${name}`,
} as const;

export type VoiceKey = keyof typeof T;

export function voice<K extends VoiceKey>(key: K, ...args: Parameters<(typeof T)[K]>): Txt {
  const fn = T[key] as (...a: string[]) => string;
  return { text: fn(...(args as string[])), src: `voice:${key}${args.length ? `|${(args as string[]).join("|")}` : ""}` };
}

/** Re-render a voice src, or null if it isn't one. */
export function renderVoice(src: string): string | null {
  if (!src.startsWith("voice:")) return null;
  const [key, ...args] = src.slice(6).split("|");
  const fn = T[key as VoiceKey] as ((...a: string[]) => string) | undefined;
  return fn ? fn(...args) : null;
}

/** UI labels for facts (chrome, not claims). */
export const LABEL: Record<string, string> = {
  when: "When",
  role: "Role",
  stack: "Stack",
  status: "Status",
  category: "Kind",
  where: "Where",
  impact: "Impact",
  value: "Grade",
  level: "Using it for",
  elevation: "Elevation",
  distance: "Distance",
  difficulty: "Difficulty",
  region: "Region",
  author: "Author",
  genre: "Genre",
  platform: "Platform",
  handle: "Handle",
  summary: "About",
  years: "Years",
};
