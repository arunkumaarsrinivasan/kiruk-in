"use client";

/**
 * PromptUIHomePage — 2026: The Pupil.
 *
 * The whole screen is one eye: the navbar is its black lids, the page is the
 * white, and in the middle a round pupil drawn as a halftone (big black dots
 * easing to specks). The outer specks map everything on the site (roles,
 * projects, story, skills and life; one dot per real thing). The pupil looks
 * toward you, flattening as it turns.
 *
 * Ask in the box under the pupil, type anywhere, tap a suggestion, or click
 * a dot. The lids blink, the pupil narrows, the sources grow and travel into
 * the middle, and the conversation begins: the ask box glides to the bottom,
 * the pupil rises to watch, and each answer composes beneath it from a small
 * catalog of parts (src/lib/pupil). Every word comes from the site's own data.
 * Older answers fold away; End chat (or Esc) returns to the resting pupil.
 *
 * /work, /contact and /#about in 2026 land here with the question already
 * asked (?ask=work|contact|about).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { BEATS } from "@/data/about-story";
import { CHANNELS } from "@/data/contact";
import { books, games, travelLocations, treks } from "@/data/life-progress-data";
import { portfolioData } from "@/data/portfolio-data";
import { getProjectCoverLabel } from "@/data/project-media";
import { CSS } from "./styles";
import { FONT_STYLE_2026, FONT_VARS_2026 } from "./fonts";
import { HalftonePupil, type HalftonePupilHandle } from "./pupil/HalftonePupil";
import { halftoneSize } from "./pupil/halftone-scene";
import { PUPIL } from "./pupil/rings";
import { Composer } from "./pupil/Composer";
import { Thread } from "./pupil/Thread";
import { loadEngine, usePupil, useReducedMotion } from "./pupil/usePupil";

const EYE = halftoneSize(PUPIL);
const SUGGESTIONS = ["Show me your work", "Is he good?", "How do I reach you?"];

const isField = (el: Element | null) =>
  !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || (el as HTMLElement).isContentEditable);

/** Everything the pupil knows, as plain text and links, for screen readers and no-JS readers. */
function Index() {
  return (
    <nav className="r26-sr" aria-label="Everything the pupil knows">
      <h2>Where I've worked</h2>
      <ul>
        {portfolioData.experience.map((e) => (
          <li key={e.id}>
            {e.position}, {e.company}: {e.description}
          </li>
        ))}
      </ul>
      <h2>My work</h2>
      <ul>
        {portfolioData.projects.map((p) => (
          <li key={p.id}>
            <Link href={`/work/${p.id}`}>{getProjectCoverLabel(p.id, p.title)}</Link>: {p.description}
          </li>
        ))}
      </ul>
      <h2>My story</h2>
      <ol>
        {BEATS.map((b) => (
          <li key={b.id}>
            {b.period}, {b.place}: {b.skim}
          </li>
        ))}
      </ol>
      <h2>Skills</h2>
      <ul>
        {portfolioData.skills.map((s) => (
          <li key={s.id}>
            {s.name}: {s.description}
          </li>
        ))}
      </ul>
      <h2>Life</h2>
      <ul>
        {treks.map((t) => (
          <li key={t.id}>Trek: {t.name}</li>
        ))}
        {travelLocations.map((t) => (
          <li key={t.id}>Place: {t.name}</li>
        ))}
        {games.map((g) => (
          <li key={g.id}>Game: {g.title}</li>
        ))}
        {books.map((b) => (
          <li key={b.id}>Book: {b.title}</li>
        ))}
      </ul>
      <h2>Reach me</h2>
      <ul>
        {CHANNELS.map((c) => (
          <li key={c.id}>
            <a href={c.href}>{c.label}</a>: {c.use}
          </li>
        ))}
      </ul>
      <p>
        <Link href="/notebook">My notebook</Link>
      </p>
    </nav>
  );
}

export function PromptUIHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", path: "/era/2026" }),
    }).catch(() => {});
  }, []);

  const reduce = useReducedMotion();
  const { mode, draft, setDraft, turns, latest, lit, ask, askEntity, end, chatting } = usePupil(reduce);
  const pupilRef = useRef<HTMLButtonElement>(null);
  const dotsRef = useRef<HalftonePupilHandle>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Older answers the visitor opened again (the newest is always open). */
  const [open, setOpen] = useState<Set<number>>(new Set());
  /** A thing pointed at in an answer: its dot swells in the pupil. */
  const [highlight, setHighlight] = useState<string | null>(null);

  const finish = useCallback(() => {
    end();
    setOpen(new Set());
    setHighlight(null);
    requestAnimationFrame(() => pupilRef.current?.focus({ preventScroll: true }));
  }, [end]);

  /** Typing: keep the words, and ripple the pupil once per new letter. */
  const type = useCallback(
    (text: string) => {
      if (text.length > draft.length) dotsRef.current?.ripple();
      setDraft(text);
    },
    [draft, setDraft],
  );

  const send = useCallback(
    (q: string) => {
      setHighlight(null);
      void ask(q);
      inputRef.current?.focus({ preventScroll: true });
    },
    [ask],
  );

  // Type anywhere: a printable key outside a field goes to the ask box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (chatting && !isField(document.activeElement)) {
          e.preventDefault();
          finish();
        }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || isField(document.activeElement)) return;
      if (e.key === " " && document.activeElement instanceof HTMLButtonElement) return;
      e.preventDefault();
      dotsRef.current?.ripple();
      setDraft(draft + e.key);
      inputRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatting, draft, finish, setDraft]);

  const followUps = latest?.nodes.find((n) => n.type === "next");
  const chips = chatting ? (followUps && followUps.type === "next" ? followUps.asks : []) : SUGGESTIONS;
  const firstText = latest?.nodes.find((n) => n.type === "text");
  const announcement = latest ? `${latest.title.text}. ${firstText && firstText.type === "text" ? firstText.text.text : ""}`.slice(0, 500) : "";

  return (
    <div id="kiruk-noscreen" className={`r26 ${FONT_VARS_2026}`} style={{ ...FONT_STYLE_2026, ["--eye-w" as string]: `${EYE.width}px`, ["--eye-h" as string]: `${EYE.height}px` }}>
      <style>{CSS}</style>
      <section className="r26-stage" aria-label="Kiruk, 2026">
        <h1 className="r26-sr">Arun Kumaar Sreenivasan. Ask the pupil anything about my work, my story, or how to reach me.</h1>

        <div className="r26-field" data-chatting={chatting || undefined}>
          <div className="r26-eye">
            <HalftonePupil
              ref={dotsRef}
              options={PUPIL}
              mode={mode}
              lit={lit}
              highlight={highlight}
              reduce={reduce}
              onPick={(id) => {
                const name = PUPIL.entities.find((e) => e.id === id)?.name ?? id;
                void askEntity(id, name);
              }}
            />
            <button
              ref={pupilRef}
              type="button"
              className="r26-pupil-hit"
              aria-label="Ask Arun a question"
              onClick={() => {
                void loadEngine();
                inputRef.current?.focus();
              }}
            />
          </div>

          {chatting ? <Thread turns={turns} open={open} onToggle={(id) => setOpen((s) => new Set(s.has(id) ? [...s].filter((x) => x !== id) : [...s, id]))} onAsk={send} onHoverRef={setHighlight} reduce={reduce} /> : null}

          <Composer
            ref={inputRef}
            draft={draft}
            onType={type}
            onAsk={send}
            chips={chips}
            docked={chatting}
            thinking={mode === "thinking"}
            reduce={reduce}
            onEnd={finish}
            onFocus={() => void loadEngine()}
            onEscape={() => (chatting ? finish() : pupilRef.current?.focus({ preventScroll: true }))}
          />
        </div>

        <div className="r26-sr" aria-live="polite" aria-atomic="true">
          {mode === "thinking" ? "Thinking" : announcement}
        </div>
      </section>
      <Index />
    </div>
  );
}

export default PromptUIHomePage;
