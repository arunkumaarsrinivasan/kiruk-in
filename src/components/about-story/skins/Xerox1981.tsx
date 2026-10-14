"use client";

/**
 * 1981 · ABOUT.DOC — the story as documents on a Xerox Star desktop.
 *
 * Pick: a Property Sheet with option buttons (the Star's own way of asking).
 * Play: a row of document icons, one per moment. The open one is inverted;
 * OPEN NEXT is the verb, or click any icon to jump. Sits inside the home's
 * PERSONA window frame, so no title bar here.
 */

import type { ReactNode } from "react";
import { DEPTHS, VISITORS, formatDuration, readingMinutes, resolvePath } from "@/data/about-story";
import type { StorySkinProps } from "../types";
import { ReadAsText, WhatSelect, depthName, pathSummary } from "../story-ui";
import { beatParagraphs, END_LINKS } from "../use-story";

const BLACK = "#000";
const WHITE = "#fff";
const GRAY = "#c0c0c0";
const GRAY_LIGHT = "#dcdcdc";
const SHADOW = "#808080";
const NAVY = "#000080";
const MONO = "'IBM Plex Mono', 'Courier New', monospace";

const bevel = `inset -1px -1px 0 ${SHADOW}, inset 1px 1px 0 ${WHITE}, 1px 1px 0 ${BLACK}`;

function StarButton({ children, onClick, on, disabled, wide }: { children: ReactNode; onClick: () => void; on?: boolean; disabled?: boolean; wide?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`min-h-11 px-3 text-[13px] uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 ${wide ? "px-5" : ""}`}
      style={{
        background: on ? BLACK : GRAY,
        color: on ? WHITE : BLACK,
        boxShadow: on ? "none" : bevel,
        border: `1px solid ${BLACK}`,
        outlineColor: NAVY,
      }}
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[110px_1fr]">
      <span className="text-[12px] font-bold uppercase tracking-widest" style={{ fontFamily: MONO }}>
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Dog-eared page glyph. */
function DocIcon({ on }: { on: boolean }) {
  return (
    <svg width="26" height="32" viewBox="0 0 26 32" aria-hidden>
      <path d="M1 1h17l7 7v23H1z" fill={on ? BLACK : WHITE} stroke={BLACK} strokeWidth="1.5" />
      <path d="M18 1v7h7" fill="none" stroke={on ? WHITE : BLACK} strokeWidth="1.5" />
      {[12, 16, 20, 24].map((y) => (
        <path key={y} d={`M5 ${y}h14`} stroke={on ? WHITE : BLACK} strokeWidth="1" />
      ))}
    </svg>
  );
}

export function Xerox1981({ story }: StorySkinProps) {
  const { stage, beat, index, beats, sel } = story;
  const pathBeats = resolvePath(sel);

  return (
    <div className="min-h-[420px] p-4" style={{ background: WHITE, color: BLACK, fontVariantLigatures: "none" }} onKeyDown={story.onKeyDown}>
      {story.textMode ? (
        <ReadAsText story={story} onBack={() => story.setTextMode(false)} backLabel="CLOSE PRINTOUT" />
      ) : stage === "pick" ? (
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center justify-between px-2 py-1 text-[11px] tracking-widest"
            style={{ background: NAVY, color: WHITE, fontFamily: MONO, border: `1px solid ${BLACK}` }}
          >
            <span>PROPERTY SHEET · ABOUT.DOC</span>
            <span>SET, THEN OPEN</span>
          </div>
          <p className="text-[15px] leading-relaxed">
            Who is Arun? Tell the file who&rsquo;s reading and how much you want.
          </p>
          <div className="flex flex-col gap-3 p-3" style={{ background: GRAY_LIGHT, border: `1px solid ${BLACK}` }}>
            <Row label="Reader">
              {VISITORS.map((v) => (
                <StarButton key={v.id} on={sel.who === v.id} onClick={() => story.setWho(v.id)}>
                  {v.label}
                </StarButton>
              ))}
            </Row>
            <Row label="Subject">
              <span className="inline-flex min-h-11 items-center px-3" style={{ background: WHITE, border: `1px solid ${BLACK}`, boxShadow: `inset 1px 1px 0 ${SHADOW}` }}>
                <WhatSelect story={story} className="min-h-10 text-[14px] uppercase" />
                <span aria-hidden className="ml-2 text-[10px]">▼</span>
              </span>
            </Row>
            <Row label="Length">
              {DEPTHS.map((d) => (
                <StarButton key={d.id} on={sel.depth === d.id} onClick={() => story.setDepth(d.id)}>
                  {d.label.replace(/^a /, "")} · {formatDuration(readingMinutes(pathBeats, d.id))}
                </StarButton>
              ))}
            </Row>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StarButton wide onClick={story.start}>
              Open ►
            </StarButton>
            <span className="text-[12px] uppercase" style={{ fontFamily: MONO, color: SHADOW }}>
              {pathSummary(story)}
            </span>
            <button type="button" onClick={() => story.setTextMode(true)} className="ml-auto min-h-11 text-[12px] uppercase underline" style={{ fontFamily: MONO }}>
              Print as text
            </button>
          </div>
        </div>
      ) : stage === "play" ? (
        <div className="flex flex-col gap-3">
          {/* the desktop: one document per moment */}
          <ol
            className="flex gap-1 overflow-x-auto p-2"
            style={{
              border: `1px solid ${BLACK}`,
              backgroundColor: GRAY_LIGHT,
              backgroundImage: `radial-gradient(${SHADOW} 1px, transparent 1px)`,
              backgroundSize: "6px 6px",
            }}
            aria-label="Documents"
          >
            {beats.map((b, i) => (
              <li key={b.id}>
              <button
                type="button"
                onClick={() => story.go(i)}
                aria-current={i === index}
                className="flex min-h-11 w-[58px] shrink-0 flex-col items-center gap-1 px-1 py-1 focus-visible:outline focus-visible:outline-2"
                style={{ outlineColor: NAVY }}
              >
                <DocIcon on={i === index} />
                <span
                  className="px-0.5 text-[11px] leading-none"
                  style={{ fontFamily: MONO, background: i === index ? BLACK : "transparent", color: i === index ? WHITE : BLACK }}
                >
                  {b.year}
                </span>
              </button>
              </li>
            ))}
          </ol>

          {/* the open document */}
          <article className="flex flex-col" style={{ border: `1px solid ${BLACK}`, boxShadow: `3px 3px 0 ${BLACK}` }} aria-live="polite">
            <div
              className="flex items-center gap-2 px-2 py-1 text-[12px]"
              style={{
                fontFamily: MONO,
                backgroundImage: `repeating-linear-gradient(0deg, ${BLACK} 0 1px, ${WHITE} 1px 3px)`,
              }}
            >
              <span className="px-2" style={{ background: WHITE }}>
                {`${beat.year}-${beat.id}.doc`.toUpperCase()}
              </span>
              <span className="ml-auto px-2" style={{ background: WHITE }}>
                {index + 1} OF {beats.length}
              </span>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-[1fr_190px]">
              <div className="flex flex-col gap-3">
                <h3 className="text-[22px] leading-tight">{beat.title}</h3>
                {beatParagraphs(beat, sel.depth).map((p, i) => (
                  <p key={i} className="max-w-[60ch] text-[15px] leading-relaxed">
                    {p}
                  </p>
                ))}
                {sel.depth === "deep" && (
                  <p className="text-[14px]" style={{ borderLeft: `4px solid ${NAVY}`, paddingLeft: 8, fontFamily: MONO }}>
                    WHAT STUCK: {beat.stuck}
                  </p>
                )}
              </div>
              <dl className="h-fit p-2 text-[12px] leading-6" style={{ fontFamily: MONO, background: GRAY_LIGHT, border: `1px solid ${BLACK}` }}>
                <div className="flex justify-between gap-2"><dt>WHEN</dt><dd className="text-right">{beat.period}</dd></div>
                <div className="flex justify-between gap-2"><dt>WHERE</dt><dd className="text-right">{beat.place}</dd></div>
                {beat.skills && sel.depth !== "skim" && (
                  <div className="mt-1 border-t pt-1" style={{ borderColor: BLACK }}>
                    <dt>SKILLS</dt>
                    <dd>{beat.skills.join(" · ")}</dd>
                  </div>
                )}
              </dl>
            </div>
          </article>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <StarButton onClick={story.pick}>◄ Properties</StarButton>
            <div className="flex gap-2">
              <StarButton onClick={story.prev} disabled={index === 0}>
                ◄ Prev
              </StarButton>
              <StarButton wide onClick={story.next}>
                {index === beats.length - 1 ? "Close ■" : "Open next ►"}
              </StarButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[380px] flex-col justify-center gap-4">
          <div className="px-2 py-1 text-[11px] tracking-widest" style={{ background: NAVY, color: WHITE, fontFamily: MONO }}>
            ALL DOCUMENTS FILED
          </div>
          <p className="text-[20px]">
            That was {depthName(story)}: {beats.length} documents about {story.whatLabel}.
          </p>
          <div className="flex flex-wrap gap-2">
            {story.deeper && (
              <StarButton wide onClick={story.deeper}>
                Go deeper: {DEPTHS[DEPTHS.findIndex((d) => d.id === sel.depth) + 1].label}
              </StarButton>
            )}
            <StarButton onClick={story.pick}>New properties</StarButton>
          </div>
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] uppercase" style={{ fontFamily: MONO }}>
            {END_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="underline">
                {l.label}
              </a>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
