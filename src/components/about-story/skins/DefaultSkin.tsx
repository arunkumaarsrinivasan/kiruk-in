"use client";

/**
 * DefaultSkin — the about story with era tokens only. Used by eras that
 * don't have their own costume yet and by custom eras. Plain on purpose:
 * a sentence to pick, a page to read, two buttons to move.
 */

import type { CSSProperties, ReactNode } from "react";
import { DEPTHS } from "@/data/about-story";
import type { StorySkinProps } from "../types";
import { DepthSelect, ReadAsText, WhatSelect, WhoSelect, depthName, pathSummary } from "../story-ui";
import { beatParagraphs, END_LINKS } from "../use-story";

const surface = "color-mix(in srgb, var(--text-main) 6%, var(--bg-main))";
const blank: CSSProperties = {
  color: "var(--accent-color)",
  borderBottom: "2px solid color-mix(in srgb, var(--accent-color) 55%, transparent)",
  paddingRight: "0.9em",
  backgroundImage:
    "linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)",
  backgroundPosition: "right 0.3em center, right 0.05em center",
  backgroundSize: "0.25em 0.25em, 0.25em 0.25em",
  backgroundRepeat: "no-repeat",
};

function Button({ children, onClick, primary, disabled }: { children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 px-5 text-sm font-medium transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-35"
      style={{
        borderRadius: "var(--era-radius, 6px)",
        border: "1px solid var(--border-color)",
        background: primary ? "var(--accent-color)" : "transparent",
        color: primary ? "var(--bg-main)" : "var(--text-main)",
        outlineColor: "var(--accent-color)",
      }}
    >
      {children}
    </button>
  );
}

export function DefaultSkin({ story }: StorySkinProps) {
  const { stage, beat, index, beats, sel } = story;

  return (
    <div
      className="relative min-h-[420px] w-full p-5 md:p-8"
      style={{
        background: surface,
        color: "var(--text-main)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--era-radius, 8px)",
        fontFamily: "var(--font-main)",
      }}
      onKeyDown={story.onKeyDown}
    >
      {story.textMode ? (
        <ReadAsText story={story} onBack={() => story.setTextMode(false)} />
      ) : stage === "pick" ? (
        <div className="flex min-h-[360px] flex-col justify-center gap-6">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--accent-color)" }}>
            About
          </p>
          <h2 className="text-3xl md:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Who is Arun?
          </h2>
          <p className="max-w-2xl text-xl leading-relaxed md:text-2xl">
            I&rsquo;m <WhoSelect story={story} style={blank} />. Tell me about <WhatSelect story={story} style={blank} />.
            Keep it <DepthSelect story={story} style={blank} />.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button primary onClick={story.start}>
              Start →
            </Button>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {pathSummary(story)}
            </span>
            <button type="button" onClick={() => story.setTextMode(true)} className="ml-auto min-h-11 text-sm underline underline-offset-4">
              Read as text
            </button>
          </div>
        </div>
      ) : stage === "play" ? (
        <div className="flex min-h-[360px] flex-col gap-5">
          <div className="flex items-center gap-3 text-sm">
            <button type="button" onClick={story.pick} className="min-h-11 underline underline-offset-4" style={{ color: "var(--text-muted)" }}>
              ← Change what you see
            </button>
            <div className="ml-auto flex gap-1" aria-hidden>
              {beats.map((b, i) => (
                <span
                  key={b.id}
                  className="h-1 w-4 md:w-6"
                  style={{ background: i <= index ? "var(--accent-color)" : "color-mix(in srgb, var(--text-main) 18%, transparent)" }}
                />
              ))}
            </div>
            <span className="tabular-nums" style={{ color: "var(--text-muted)" }}>
              {index + 1} / {beats.length}
            </span>
          </div>

          <article key={beat.id} aria-live="polite" className="flex flex-1 flex-col gap-3">
            <p className="text-sm tabular-nums" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent-color)" }}>{beat.period}</span> · {beat.place}
            </p>
            <h3 className="text-2xl md:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
              {beat.title}
            </h3>
            {beatParagraphs(beat, sel.depth).map((p, i) => (
              <p key={i} className="max-w-2xl text-base leading-relaxed md:text-lg">
                {p}
              </p>
            ))}
            {sel.depth === "deep" && (
              <p className="max-w-2xl border-l-2 pl-3 italic" style={{ borderColor: "var(--accent-color)" }}>
                What stuck: {beat.stuck}
              </p>
            )}
          </article>

          <div className="flex items-center justify-between gap-3">
            <Button onClick={story.prev} disabled={index === 0}>
              ← Back
            </Button>
            <Button primary onClick={story.next}>
              {index === beats.length - 1 ? "Finish" : "Next →"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[360px] flex-col justify-center gap-5">
          <h3 className="text-2xl md:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
            That&rsquo;s {depthName(story)}.
          </h3>
          <p style={{ color: "var(--text-muted)" }}>
            {beats.length} moments about {story.whatLabel}.
          </p>
          <div className="flex flex-wrap gap-3">
            {story.deeper && (
              <Button primary onClick={story.deeper}>
                Go deeper: {DEPTHS[DEPTHS.findIndex((d) => d.id === sel.depth) + 1].label}
              </Button>
            )}
            <Button onClick={story.pick}>Pick something else</Button>
          </div>
          <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {END_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="underline underline-offset-4">
                {l.label}
              </a>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
