"use client";

/**
 * The pupil's state: what it is doing, what the visitor has typed so far, and
 * the answer it is holding open.
 *
 *   resting   → nothing typed, nothing open (the cursor may be watched: "looking")
 *   listening → the visitor is typing
 *   thinking  → a beat after Enter, so the narrowing reads as "heard you"
 *   speaking  → the lens is open with an answer
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { answer as read, ASK_ALIASES, type NotebookItem } from "./reader";
import type { Answer } from "./types";

export type PupilMode = "resting" | "listening" | "thinking" | "speaking";

/** Long enough to see the pupil narrow, short enough not to feel like waiting. */
const THINK_MS = 320;

export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduce;
}

function track(kind: Answer["kind"]) {
  // Only the kind of answer, never what was typed.
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "pupil_ask", path: "/era/2026", kind }),
  }).catch(() => {});
}

export function usePupil(reduce: boolean) {
  const [mode, setMode] = useState<PupilMode>("resting");
  const [draft, setDraftState] = useState("");
  const [current, setCurrent] = useState<Answer | null>(null);
  /** The words that produced `current`, for the contact draft's first line. */
  const [asked, setAsked] = useState("");
  const notebook = useRef<NotebookItem[] | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const currentRef = useRef<Answer | null>(null);
  currentRef.current = current;

  // The notebook lives on the server; fetch its titles once, quietly.
  useEffect(() => {
    let alive = true;
    fetch("/api/blog")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { entries?: { title: string; href: string; excerpt?: string }[] } | null) => {
        if (alive && d?.entries) notebook.current = d.entries.map((e) => ({ title: e.title, href: e.href, excerpt: e.excerpt }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const setDraft = useCallback((text: string) => {
    setDraftState(text);
    setMode((m) => (m === "thinking" ? m : text ? "listening" : m === "listening" ? "resting" : m));
  }, []);

  const ask = useCallback(
    (text: string) => {
      const a = read(text, { prev: currentRef.current, notebook: notebook.current });
      window.clearTimeout(timer.current);
      setDraftState("");
      setAsked(a.kind === "contact" ? text : "");
      setMode("thinking");
      track(a.kind);
      timer.current = window.setTimeout(
        () => {
          setCurrent(a);
          setMode("speaking");
        },
        reduce ? 0 : THINK_MS,
      );
    },
    [reduce],
  );

  const close = useCallback(() => {
    window.clearTimeout(timer.current);
    setCurrent(null);
    setDraftState("");
    setMode("resting");
    // A deep link has been answered; don't reopen it on reload.
    const url = new URL(window.location.href);
    if (url.searchParams.has("ask") || url.hash === "#about") {
      url.searchParams.delete("ask");
      url.hash = "";
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);

  // ?ask=work | contact | about | notebook | free text, and /#about.
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("ask") ?? (url.hash === "#about" ? "about" : null);
    if (q) ask(ASK_ALIASES[q] ?? q);
    // The navbar's About link points at /#about. Already here, Next only
    // pushes the hash (no hashchange), so catch the click and ask instead.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href="/#about"], a[href="#about"]');
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      ask(ASK_ALIASES.about);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // Run once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { mode, draft, setDraft, current, asked, ask, close };
}
