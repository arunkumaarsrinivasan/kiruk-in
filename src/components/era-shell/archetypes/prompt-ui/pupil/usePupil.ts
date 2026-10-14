"use client";

/**
 * The conversation with the pupil: a thread of turns (what was asked, what
 * the pupil answered) and what the pupil is doing.
 *
 *   resting    nothing asked yet (or the chat was ended)
 *   listening  the visitor is typing (only keystroke ripples show it)
 *   thinking   a beat after asking: the lids blink, the sources light up
 *   presenting the newest answer is composed in the thread
 *
 * The engine (src/lib/pupil) is loaded on the first focus, keystroke or
 * deep link, so the first paint is just the dots.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { NotebookItem, Surface } from "@/lib/pupil/engine";
import type { SceneMode } from "./dot-scene";

/** Long enough to see the pupil narrow and the lids blink; never fake waiting. */
const THINK_MS = 420;

/** What `?ask=` deep links and the 2026 /work, /contact, #about handoffs mean. */
export const ASK_ALIASES: Record<string, string> = {
  work: "Show me your work",
  contact: "How do I reach you?",
  about: "Tell me about yourself",
  notebook: "What do you write?",
};

type Engine = typeof import("@/lib/pupil/engine");
let enginePromise: Promise<Engine> | null = null;
export const loadEngine = () => (enginePromise ??= import("@/lib/pupil/engine"));

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

function track(intent: string) {
  // Only the kind of answer, never what was typed.
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "pupil_ask", path: "/era/2026", kind: intent }),
  }).catch(() => {});
}

export interface Turn {
  id: number;
  /** What the visitor asked, as they typed it (or the dot they clicked). */
  asked: string;
  /** Null while the pupil is still thinking. */
  surface: Surface | null;
}

let turnSeq = 0;

export function usePupil(reduce: boolean) {
  const [mode, setMode] = useState<SceneMode>("resting");
  const [draft, setDraftState] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  /** Sources lit for the newest answer. */
  const [lit, setLit] = useState<string[]>([]);
  const notebook = useRef<NotebookItem[] | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const turnsRef = useRef<Turn[]>([]);
  turnsRef.current = turns;

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
    void loadEngine();
    setDraftState(text);
    setMode((m) => (m === "resting" || m === "listening" ? (text ? "listening" : "resting") : m));
  }, []);

  /** Add a turn now (the question shows at once), answer it after a beat. */
  const run = useCallback(
    (asked: string, answer: (prev: Surface | null) => Surface | null) => {
      window.clearTimeout(timer.current);
      const prev = [...turnsRef.current].reverse().find((t) => t.surface)?.surface ?? null;
      const s = answer(prev);
      if (!s) return;
      const id = ++turnSeq;
      setDraftState("");
      setTurns((ts) => [...ts, { id, asked, surface: null }]);
      setLit(s.sources);
      setMode("thinking");
      track(s.intent);
      timer.current = window.setTimeout(
        () => {
          setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, surface: s } : t)));
          setMode("presenting");
        },
        reduce ? 0 : THINK_MS,
      );
    },
    [reduce],
  );

  const ask = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q) return;
      const engine = await loadEngine();
      run(q, (prev) => engine.ask(q, { prev, notebook: notebook.current }));
    },
    [run],
  );

  /** A dot in the pupil (or a source chip) was clicked. */
  const askEntity = useCallback(
    async (id: string, label: string) => {
      const engine = await loadEngine();
      run(label, () => engine.askEntity(id));
    },
    [run],
  );

  /** End the conversation: back to the resting pupil. */
  const end = useCallback(() => {
    window.clearTimeout(timer.current);
    setTurns([]);
    setLit([]);
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
    if (q) void ask(ASK_ALIASES[q] ?? q);
    // The navbar's About link points at /#about. Already here, Next only
    // pushes the hash (no hashchange), so catch the click and ask instead.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href="/#about"], a[href="#about"]');
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      void ask(ASK_ALIASES.about);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // Run once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latest = turns[turns.length - 1]?.surface ?? null;
  return { mode, draft, setDraft, turns, latest, lit, ask, askEntity, end, chatting: turns.length > 0 };
}
