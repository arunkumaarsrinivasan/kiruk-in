"use client";

/**
 * PromptUIHomePage — 2026: The Pupil.
 *
 * The navbar draws an eye; this page is its pupil. There is no interface
 * beyond one eye in a dark room. Type anywhere (or tap the eye) and it listens; press
 * Enter and it narrows for a beat, then dilates into a lens holding the
 * answer, told in my own words from the site's data (pupil/reader.ts). Esc or
 * a click outside closes it back into the pupil.
 *
 * /work, /contact and /#about in 2026 land here with the question already
 * asked (?ask=work|contact|about).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { BEATS } from "@/data/about-story";
import { CHANNELS } from "@/data/contact";
import { portfolioData } from "@/data/portfolio-data";
import { getProjectCoverLabel } from "@/data/project-media";
import { CSS } from "./styles";
import { FONT_STYLE_2026, FONT_VARS_2026 } from "./fonts";
import { Lens } from "./pupil/Lens";
import { Pupil } from "./pupil/Pupil";
import { SUGGESTIONS } from "./pupil/reader";
import { usePupil, useReducedMotion } from "./pupil/usePupil";

/** Stillness before the dot offers something to ask. */
const IDLE_MS = 4000;

const isField = (el: Element | null) =>
  !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || (el as HTMLElement).isContentEditable);

/** Everything the dot can say, as plain links, for screen readers and no-JS readers. */
function Index() {
  return (
    <nav className="r26-sr" aria-label="Everything the dot knows">
      <h2>My story</h2>
      <ol>
        {BEATS.map((b) => (
          <li key={b.id}>
            {b.period}, {b.place}: {b.skim}
          </li>
        ))}
      </ol>
      <h2>My work</h2>
      <ul>
        {portfolioData.projects.map((p) => (
          <li key={p.id}>
            <Link href={`/work/${p.id}`}>{getProjectCoverLabel(p.id, p.title)}</Link>: {p.description}
          </li>
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
  const { mode, draft, setDraft, current, asked, ask, close } = usePupil(reduce);
  const pupilRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [touch, setTouch] = useState(false);
  const [idle, setIdle] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setTouch(!window.matchMedia("(pointer: fine)").matches);
  }, []);

  const shut = useCallback(() => {
    close();
    requestAnimationFrame(() => pupilRef.current?.focus({ preventScroll: true }));
  }, [close]);

  // Type anywhere: a printable key outside a field starts the question.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mode === "speaking") {
          e.preventDefault();
          shut();
        }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || isField(document.activeElement)) return;
      if (e.key === " " && document.activeElement instanceof HTMLButtonElement) return;
      e.preventDefault();
      if (mode === "speaking") close();
      setDraft(e.key);
      inputRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, close, shut, setDraft]);

  // After a few still seconds, offer three things to ask. Any input resets it.
  useEffect(() => {
    setIdle(false);
    if (mode !== "resting" || draft) return;
    if (reduce) {
      setIdle(true);
      return;
    }
    const t = window.setTimeout(() => setIdle(true), IDLE_MS);
    return () => window.clearTimeout(t);
  }, [mode, draft, reduce]);

  const speaking = mode === "speaking" && !!current;
  const hint = touch ? "tap the eye to ask" : "type to ask";
  // A focused, empty question line already counts as listening.
  const shown = mode === "resting" && focused ? "listening" : mode;
  const stateWord =
    shown === "listening" ? (draft ? "listening · enter to ask" : "listening") : shown === "thinking" ? "thinking" : shown === "speaking" ? "" : hint;

  const announcement = current ? `${current.title}. ${current.say.join(" ")}`.slice(0, 600) : "";

  return (
    <div id="kiruk-noscreen" className={`r26 ${FONT_VARS_2026}`} style={FONT_STYLE_2026}>
      <style>{CSS}</style>
      <section className="r26-stage" aria-label="Kiruk, 2026" onClick={() => speaking && shut()}>
        <h1 className="r26-sr">Arun Kumaar Sreenivasan. Ask the dot anything about my work, my story, or how to reach me.</h1>

        <div className="r26-field">
          <Pupil ref={pupilRef} mode={shown} reduce={reduce} onPress={() => inputRef.current?.focus()} />

          <div className="r26-under" data-hidden={speaking || undefined}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
            >
              <input
                ref={inputRef}
                className="r26-ask"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    setDraft("");
                    pupilRef.current?.focus({ preventScroll: true });
                  }
                }}
                aria-label="Ask Kiruk"
                placeholder="Ask anything"
                autoComplete="off"
                autoCapitalize="sentences"
                enterKeyHint="send"
                maxLength={200}
                tabIndex={speaking ? -1 : 0}
              />
            </form>
            <p className="r26-state" data-mode={shown}>
              {stateWord}
            </p>
            {!draft && mode === "resting" ? (
              <div className="r26-suggest" data-show={idle || undefined} aria-hidden={!idle || undefined}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" tabIndex={idle ? 0 : -1} onClick={() => ask(s)}>
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <AnimatePresence>
            {speaking ? <Lens key={current.title + current.depth} answer={current} asked={asked} reduce={reduce} onAsk={ask} onClose={shut} /> : null}
          </AnimatePresence>
        </div>

        <div className="r26-sr" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
      </section>
      <Index />
    </div>
  );
}

export default PromptUIHomePage;
