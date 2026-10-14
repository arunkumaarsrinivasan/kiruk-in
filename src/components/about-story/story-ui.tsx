"use client";

/**
 * Shared, unstyled building blocks for about-story skins.
 *
 * The three picker blanks are native <select>s so they work with a keyboard,
 * a screen reader, and a phone's own picker without any work per era. Skins
 * restyle them with className/style (inherit font, underline, bevel…).
 * ReadAsText is the plain-HTML escape hatch every skin offers.
 */

import type { CSSProperties } from "react";
import { DEPTHS, VISITORS, WHAT_OPTIONS, formatDuration, readingMinutes, resolvePath } from "@/data/about-story";
import { beatParagraphs, END_LINKS, type Story } from "./use-story";

interface SelectProps {
  story: Story;
  className?: string;
  style?: CSSProperties;
}

const GROUP_LABEL = { phase: "A part of my life", thread: "A thread", question: "A question" } as const;

/** Resets native select chrome so skins can dress it as inline text. */
export const bareSelect = {
  appearance: "none",
  WebkitAppearance: "none",
  background: "transparent",
  border: "none",
  borderRadius: 0,
  font: "inherit",
  color: "inherit",
  padding: 0,
  margin: 0,
  cursor: "pointer",
  minHeight: 0,
  boxShadow: "none",
  // Size to the chosen option, not the longest one (Chromium/Firefox; Safari keeps the old width).
  fieldSizing: "content",
} as CSSProperties;

export function WhoSelect({ story, className, style }: SelectProps) {
  return (
    <select
      aria-label="Who you are"
      className={className}
      style={{ ...bareSelect, ...style }}
      value={story.sel.who}
      onChange={(e) => story.setWho(e.target.value as Story["sel"]["who"])}
    >
      {VISITORS.map((v) => (
        <option key={v.id} value={v.id}>
          {v.label}
        </option>
      ))}
    </select>
  );
}

export function WhatSelect({ story, className, style }: SelectProps) {
  return (
    <select
      aria-label="What you want to know"
      className={className}
      style={{ ...bareSelect, ...style }}
      value={story.sel.what}
      onChange={(e) => story.setWhat(e.target.value)}
    >
      <option value="all">everything</option>
      {(["phase", "thread", "question"] as const).map((g) => (
        <optgroup key={g} label={GROUP_LABEL[g]}>
          {WHAT_OPTIONS.filter((w) => w.group === g).map((w) => (
            <option key={w.key} value={w.key}>
              {w.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export function DepthSelect({ story, className, style }: SelectProps) {
  const beats = resolvePath(story.sel);
  return (
    <select
      aria-label="How long you have"
      className={className}
      style={{ ...bareSelect, ...style }}
      value={story.sel.depth}
      onChange={(e) => story.setDepth(e.target.value as Story["sel"]["depth"])}
    >
      {DEPTHS.map((d) => (
        <option key={d.id} value={d.id}>
          {d.label} · {formatDuration(readingMinutes(beats, d.id))}
        </option>
      ))}
    </select>
  );
}

/** "3 beats · about 40 sec" */
export function pathSummary(story: Story): string {
  const n = story.beats.length;
  return `${n} ${n === 1 ? "moment" : "moments"} · about ${formatDuration(story.minutes)}`;
}

export const depthName = (story: Story) => DEPTHS.find((d) => d.id === story.sel.depth)?.label ?? "a skim";

/** The whole resolved path as plain semantic HTML. Inherits the host's colours and font. */
export function ReadAsText({ story, onBack, backLabel = "Back to the interactive version" }: {
  story: Story;
  onBack: () => void;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm opacity-80">
          {story.whatLabel === "everything" ? "Everything" : `About ${story.whatLabel}`}, as {depthName(story)}.
        </p>
        <button type="button" onClick={onBack} className="min-h-11 underline underline-offset-4">
          {backLabel}
        </button>
      </div>
      <ol className="flex flex-col gap-6">
        {story.beats.map((b) => (
          <li key={b.id}>
            <h3 className="text-lg font-bold">
              {b.title} <span className="font-normal opacity-70">· {b.period}</span>
            </h3>
            <p className="text-sm opacity-70">{b.place}</p>
            {beatParagraphs(b, story.sel.depth).map((p, i) => (
              <p key={i} className="mt-2 leading-relaxed">
                {p}
              </p>
            ))}
            {story.sel.depth === "deep" && <p className="mt-2 italic">What stuck: {b.stuck}</p>}
          </li>
        ))}
      </ol>
      <p className="flex flex-wrap gap-x-5 gap-y-2">
        {END_LINKS.map((l) => (
          <a key={l.href} href={l.href} className="underline underline-offset-4">
            {l.label}
          </a>
        ))}
      </p>
    </div>
  );
}
