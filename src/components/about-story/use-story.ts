"use client";

/**
 * useStory — the headless about-story engine every era skin plays.
 *
 * Three stages: pick (who / what / how long) → play (one beat at a time) →
 * end. There is no way to fail and no timer: next() and prev() are the whole
 * game. Skins only decide how those verbs look in their era.
 */

import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";
import {
  DEFAULT_SELECTION,
  DEPTHS,
  VISITORS,
  WHAT_OPTIONS,
  readingMinutes,
  resolvePath,
  type Beat,
  type Depth,
  type Selection,
  type VisitorId,
} from "@/data/about-story";

export type Stage = "pick" | "play" | "end";

export interface Story {
  sel: Selection;
  setWho: (who: VisitorId) => void;
  setWhat: (key: string) => void;
  setDepth: (depth: Depth) => void;
  /** Label for the current "what" key. */
  whatLabel: string;
  beats: Beat[];
  /** Estimated reading time of the resolved path, in minutes. */
  minutes: number;
  stage: Stage;
  index: number;
  beat: Beat;
  start: () => void;
  next: () => void;
  prev: () => void;
  go: (i: number) => void;
  /** Back to the picker. */
  pick: () => void;
  /** Same path, next depth. Null when already at the deepest. */
  deeper: (() => void) | null;
  textMode: boolean;
  setTextMode: (on: boolean) => void;
  reduce: boolean;
  /** Attach to the skin root: ← → step through beats while playing, Esc goes back to the picker. */
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

const KEY = "kiruk-about-selection";

function readSaved(): Selection | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Selection;
    const ok =
      VISITORS.some((v) => v.id === s.who) &&
      WHAT_OPTIONS.some((w) => w.key === s.what) &&
      DEPTHS.some((d) => d.id === s.depth);
    return ok ? s : null;
  } catch {
    return null;
  }
}

export function useStory(): Story {
  const reduce = !!useReducedMotion();
  const [sel, setSel] = useState<Selection>(DEFAULT_SELECTION);
  const [stage, setStage] = useState<Stage>("pick");
  const [index, setIndex] = useState(0);
  const [textMode, setTextMode] = useState(false);

  useEffect(() => {
    const saved = readSaved();
    if (saved) setSel(saved);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(sel));
    } catch {
      /* private mode: the picker just starts from the default */
    }
  }, [sel]);

  const beats = useMemo(() => resolvePath(sel), [sel]);
  const minutes = useMemo(() => readingMinutes(beats, sel.depth), [beats, sel.depth]);
  const whatLabel = WHAT_OPTIONS.find((w) => w.key === sel.what)?.label ?? "everything";

  const setWho = useCallback((who: VisitorId) => {
    const v = VISITORS.find((x) => x.id === who);
    if (v) setSel({ who, what: v.what, depth: v.depth });
  }, []);
  const setWhat = useCallback((what: string) => setSel((s) => ({ ...s, what })), []);
  const setDepth = useCallback((depth: Depth) => setSel((s) => ({ ...s, depth })), []);

  const start = useCallback(() => {
    setIndex(0);
    setStage("play");
  }, []);
  const go = useCallback(
    (i: number) => {
      setIndex(Math.max(0, Math.min(beats.length - 1, i)));
      setStage("play");
    },
    [beats.length],
  );
  const next = useCallback(() => {
    if (index >= beats.length - 1) setStage("end");
    else setIndex(index + 1);
  }, [index, beats.length]);
  const prev = useCallback(() => {
    if (stage === "end") setStage("play");
    else setIndex((i) => Math.max(0, i - 1));
  }, [stage]);
  const pick = useCallback(() => setStage("pick"), []);

  const depthIdx = DEPTHS.findIndex((d) => d.id === sel.depth);
  const deeper =
    depthIdx < DEPTHS.length - 1
      ? () => {
          setSel((s) => ({ ...s, depth: DEPTHS[depthIdx + 1].id }));
          setIndex(0);
          setStage("play");
        }
      : null;

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (stage !== "play") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setStage("pick");
      }
    },
    [stage, next, prev],
  );

  return {
    sel,
    setWho,
    setWhat,
    setDepth,
    whatLabel,
    beats,
    minutes,
    stage,
    index: Math.min(index, beats.length - 1),
    beat: beats[Math.min(index, beats.length - 1)],
    start,
    next,
    prev,
    go,
    pick,
    deeper,
    textMode,
    setTextMode,
    reduce,
    onKeyDown,
  };
}

/** The text of a beat at a depth, as paragraphs. */
export function beatParagraphs(b: Beat, depth: Depth): string[] {
  if (depth === "skim") return [b.skim];
  if (depth === "read") return [b.read];
  return b.deep;
}

export const END_LINKS = [
  { label: "Say hello", href: "/contact" },
  { label: "@kirukism", href: "https://instagram.com/kirukism" },
  { label: "Trips & vlogs", href: "https://instagram.com/arunum.avan.seyalum" },
] as const;
