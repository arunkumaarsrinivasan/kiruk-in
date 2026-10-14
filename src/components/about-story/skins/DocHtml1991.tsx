"use client";

/**
 * 1991 · About the Author — the story as a hypertext document.
 *
 * Pick: three lines of links; the current choice is bold plain text, the
 * others are blue links, exactly like the first web pages.
 * Play: one page per moment, with Previous / Contents / Next links at the
 * foot. Followed links turn purple. Reading is navigating.
 */

import { useState, type CSSProperties, type ReactNode } from "react";
import { DEPTHS, VISITORS, WHAT_OPTIONS, formatDuration, readingMinutes, resolvePath } from "@/data/about-story";
import type { StorySkinProps } from "../types";
import { ReadAsText, depthName, pathSummary } from "../story-ui";
import { beatParagraphs, END_LINKS } from "../use-story";

const TEXT = "#000";
const MUTED = "#444";
const SOFT = "#777";
const LINK = "#0000ee";
const VISITED = "#551a8b";
const MONO = "'Courier New', Courier, monospace";

function A({ children, onClick, visited, label }: { children: ReactNode; onClick: () => void; visited?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline p-0 text-left underline underline-offset-2 focus-visible:outline focus-visible:outline-2"
      style={{ color: visited ? VISITED : LINK, font: "inherit", background: "none", border: "none", outlineColor: LINK }}
    >
      {children}
    </button>
  );
}

/** "a · b · c" where the chosen one is bold text and the rest are links. */
function Choice<T extends string>({ items, value, onPick }: { items: { id: T; label: ReactNode }[]; value: T; onPick: (id: T) => void }) {
  return (
    <>
      {items.map((it, i) => (
        <span key={it.id}>
          {i > 0 && <span style={{ color: SOFT }}> · </span>}
          {it.id === value ? <strong aria-current="true">{it.label}</strong> : <A onClick={() => onPick(it.id)}>{it.label}</A>}
        </span>
      ))}
    </>
  );
}

const h3: CSSProperties = { fontSize: 19, fontWeight: 700, margin: "0 0 4px" };
const dim: CSSProperties = { fontFamily: MONO, fontSize: 12, color: SOFT };

export function DocHtml1991({ story }: StorySkinProps) {
  const { stage, beat, index, beats, sel } = story;
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [showContents, setShowContents] = useState(false);
  const pathBeats = resolvePath(sel);

  const goTo = (i: number) => {
    setVisited((v) => new Set(v).add(beats[i].id));
    setShowContents(false);
    story.go(i);
  };
  const following = (fn: () => void) => () => {
    setVisited((v) => new Set(v).add(beat.id));
    fn();
  };

  const groups = [
    { name: "The whole thing", keys: WHAT_OPTIONS.filter((w) => w.group === "all") },
    { name: "A part of my life", keys: WHAT_OPTIONS.filter((w) => w.group === "phase") },
    { name: "A thread", keys: WHAT_OPTIONS.filter((w) => w.group === "thread") },
    { name: "A question", keys: WHAT_OPTIONS.filter((w) => w.group === "question") },
  ];

  return (
    <div className="min-h-[240px]" style={{ color: TEXT, lineHeight: 1.6 }} onKeyDown={story.onKeyDown}>
      {story.textMode ? (
        <ReadAsText story={story} onBack={() => story.setTextMode(false)} backLabel="Back to the hypertext" />
      ) : stage === "pick" ? (
        <div className="flex flex-col gap-3 text-[16px]">
          <p style={{ margin: 0 }}>
            This section is the author, told in his own words. Choose how you want to read it; the current choice is in{" "}
            <strong>bold</strong>, everything else is a link.
          </p>
          <dl className="flex flex-col gap-2" style={{ margin: 0 }}>
            <dt style={{ fontWeight: 700 }}>I am reading as</dt>
            <dd style={{ marginLeft: 24 }}>
              <Choice items={VISITORS.map((v) => ({ id: v.id, label: v.label }))} value={sel.who} onPick={story.setWho} />
            </dd>
            <dt style={{ fontWeight: 700 }}>Tell me about</dt>
            <dd style={{ marginLeft: 24 }}>
              {groups.map((g) => (
                <div key={g.name}>
                  <span style={{ fontStyle: "italic", color: MUTED }}>{g.name}: </span>
                  <Choice items={g.keys.map((w) => ({ id: w.key, label: w.label }))} value={sel.what} onPick={story.setWhat} />
                </div>
              ))}
            </dd>
            <dt style={{ fontWeight: 700 }}>Length</dt>
            <dd style={{ marginLeft: 24 }}>
              <Choice
                items={DEPTHS.map((d) => ({ id: d.id, label: `${d.label} (${formatDuration(readingMinutes(pathBeats, d.id))})` }))}
                value={sel.depth}
                onPick={story.setDepth}
              />
            </dd>
          </dl>
          <p style={{ margin: "8px 0 0", fontSize: 18 }}>
            <A onClick={story.start}>Begin reading →</A>
            <span style={dim}> {pathSummary(story)} · </span>
            <A onClick={() => story.setTextMode(true)}>one page, no links</A>
          </p>
        </div>
      ) : stage === "play" ? (
        <div className="flex flex-col gap-3">
          <p style={{ ...dim, margin: 0 }}>
            kiruk-research.cern.ch/about/{beat.year}-{beat.id}.html · page {index + 1} of {beats.length}
          </p>
          <article aria-live="polite">
            <h3 style={h3}>
              2.{index + 1} {beat.title}
            </h3>
            <p style={{ fontStyle: "italic", color: MUTED, margin: "0 0 10px" }}>
              {beat.period}, {beat.place}.
            </p>
            {beatParagraphs(beat, sel.depth).map((p, i) => (
              <p key={i} style={{ margin: "0 0 10px", maxWidth: "64ch" }}>
                {p}
              </p>
            ))}
            {sel.depth === "deep" && (
              <blockquote style={{ margin: "4px 0 10px 24px", fontStyle: "italic" }}>What stuck: {beat.stuck}</blockquote>
            )}
          </article>

          <hr style={{ border: "none", borderTop: `1px solid ${SOFT}`, margin: 0 }} />
          <nav aria-label="Page navigation" className="flex flex-col gap-1 text-[16px]">
            {index > 0 && (
              <span>
                Previous: <A onClick={following(story.prev)} visited={visited.has(beats[index - 1].id)}>{beats[index - 1].title}</A>
              </span>
            )}
            <span>
              {index < beats.length - 1 ? (
                <>
                  <strong>Next:</strong>{" "}
                  <A onClick={following(story.next)} visited={visited.has(beats[index + 1].id)}>
                    {beats[index + 1].title} →
                  </A>
                </>
              ) : (
                <A onClick={following(story.next)}>End of document →</A>
              )}
            </span>
            <span style={dim}>
              <A onClick={() => setShowContents((v) => !v)}>{showContents ? "hide contents" : "contents"}</A>
              {" · "}
              <A onClick={story.pick}>change what you read</A>
            </span>
          </nav>
          {showContents && (
            <ol style={{ margin: 0, paddingLeft: 24 }}>
              {beats.map((b, i) => (
                <li key={b.id}>
                  {i === index ? (
                    <strong>{b.title}</strong>
                  ) : (
                    <A onClick={() => goTo(i)} visited={visited.has(b.id)}>
                      {b.title}
                    </A>
                  )}{" "}
                  <span style={dim}>{b.year}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 text-[16px]">
          <h3 style={h3}>End of document</h3>
          <p style={{ margin: 0 }}>
            That was {depthName(story)}: {beats.length} pages about {story.whatLabel}.
          </p>
          <ul style={{ margin: 0, paddingLeft: 24 }}>
            {story.deeper && (
              <li>
                <A onClick={story.deeper}>Go deeper: {DEPTHS[DEPTHS.findIndex((d) => d.id === sel.depth) + 1].label}</A>
              </li>
            )}
            <li>
              <A onClick={story.pick}>Choose another subject</A>
            </li>
            {END_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} style={{ color: LINK }} className="underline underline-offset-2">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
