/**
 * Messy questions, round 2: frozen 2026-10-15, before the parser learned
 * any of it. Visitors talk about Arun in the third person ("is he good"),
 * ask yes/no about abilities, ask for firsts and lasts, and follow up with
 * "it" and "that". Do not edit to make the parser pass; append instead.
 *
 * [question, expected intent, expected top ref ("" = any), also-safe intents]
 */

import type { MessyCase } from "./messy";

export type Messy2Intent = MessyCase[1] | "evaluate" | "capability";
export type Messy2Case = [string, Messy2Intent, string, Messy2Intent[]?];

export const MESSY2: Messy2Case[] = [
  // judging him
  ["is he good", "evaluate", ""],
  ["is he any good", "evaluate", ""],
  ["is arun good", "evaluate", ""],
  ["is he talented", "evaluate", ""],
  ["is he worth hiring", "evaluate", "", ["opinion"]],
  ["would he be a good hire", "evaluate", "", ["opinion"]],
  ["is he experienced", "evaluate", ""],
  ["how experienced is arun", "evaluate", "", ["timeline"]],
  ["is he senior", "evaluate", ""],
  ["is he legit", "evaluate", ""],
  ["why is he good", "evaluate", "", ["opinion"]],
  ["convince me to hire him", "evaluate", "", ["opinion", "contact"]],

  // can he / does he / has he
  ["can he code", "capability", ""],
  ["does he know react", "capability", "skill:react"],
  ["has he used flutter", "capability", "tech:flutter", ["list"]],
  ["does he know figma", "capability", "skill:figma"],
  ["is he good at design", "capability", "", ["evaluate"]],
  ["is he good at ai ux", "capability", "", ["evaluate"]],
  ["can he do frontend", "capability", ""],
  ["does he do user research", "capability", ""],
  ["can he lead a team", "capability", ""],
  ["has he managed people", "capability", ""],
  ["has he mentored anyone", "capability", ""],
  ["has he worked at a startup", "capability", ""],
  ["has he worked at a big company", "capability", ""],
  ["does he know rust", "capability", ""],
  ["is he good at backend", "capability", ""],
  ["does he know three js", "capability", "", ["describe"]],
  ["can he build design systems", "capability", ""],

  // third person, plain asks
  ["who is he", "describe", "me:arun"],
  ["tell me about him", "describe", "me:arun"],
  ["what does he do", "describe", "", ["facet", "timeline"]],
  ["where does he work", "facet", "", ["describe"]],
  ["what has he built", "list", "kind:project"],
  ["his projects", "list", "kind:project"],
  ["his skills", "list", "kind:skill"],
  ["where did he study", "describe", "education:engineering", ["facet"]],
  ["how can i contact him", "contact", ""],
  ["whats his email", "contact", ""],
  ["is he open to remote work", "facet", "me:arun", ["contact"]],
  ["is he available", "facet", "me:arun", ["contact"]],
  ["what's he working on", "opinion", "", ["describe"]],
  ["what is his biggest achievement", "opinion", "", ["facet"]],
  ["what did he do at hp", "facet", "role:hp-ux-designer"],
  ["arun's role at spera", "facet", ""],

  // firsts, lasts, before, after
  ["what was his first job", "describe", "role:freelance-general", ["timeline"]],
  ["latest project", "describe", "project:spera-platform", ["list"]],
  ["most recent work", "describe", "", ["list"]],
  ["his current job", "describe", "role:spera-design-lead", ["facet"]],
  ["what did he do before spera", "timeline", ""],
  ["what did he do after college", "timeline", ""],
  ["first project", "describe", "", ["list"]],
  ["biggest impact", "list", "", ["opinion", "facet"]],

  // two at once
  ["what did he do at hp and what tech did he use", "facet", "role:hp-ux-designer"],
  ["tell me about spera and how to reach him", "describe", "", ["contact", "facet"]],
];

/** Follow-ups: [previous question, follow-up, expected intent, expected top ref]. */
export const FOLLOWUPS: [string, string, Messy2Intent, string][] = [
  ["tell me about spera", "what tech did it use", "facet", "project:spera-platform"],
  ["tell me about hp print ai", "what was hard about it", "facet", "project:hp-print-ai"],
  ["what did you do at hp", "when did you leave there", "facet", "role:hp-ux-designer"],
  ["kudremukh trek", "how high is it", "facet", "trek:trek-3"],
  ["tell me about mudra", "who was it for", "describe", "project:mudra-ai-stack", ],
  ["foodies buddies", "what did you learn from that", "facet", "project:foodies-buddies"],
];
