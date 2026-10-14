"use client";

/**
 * The conversation: each turn is the visitor's question (right, in a dark
 * bubble) and the pupil's answer (left, composed from the catalog). While
 * the pupil thinks, three dots breathe in its place. Older answers fold into
 * a one-line summary that opens again on click.
 */

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SurfaceView } from "./surface/SurfaceView";
import type { Turn } from "./usePupil";

const EASE = [0.23, 1, 0.32, 1] as const;

function Thinking({ reduce }: { reduce: boolean }) {
  return (
    <div className="r26-thinking" role="status" aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <span key={i} style={reduce ? undefined : { animationDelay: `${i * 140}ms` }} />
      ))}
    </div>
  );
}

function TurnView({
  turn,
  open,
  onToggle,
  onAsk,
  onHoverRef,
  reduce,
  latest,
}: {
  turn: Turn;
  open: boolean;
  onToggle: () => void;
  onAsk: (q: string) => void;
  onHoverRef: (id: string | null) => void;
  reduce: boolean;
  latest: boolean;
}) {
  const s = turn.surface;
  return (
    <motion.article
      className="r26-turn"
      data-turn={turn.id}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE }}
      layout={reduce ? false : "position"}
    >
      <p className="r26-q">
        <span className="r26-sr">You asked: </span>
        {turn.asked}
      </p>
      {!s ? (
        <Thinking reduce={reduce} />
      ) : (
        <AnimatePresence initial={false} mode="wait">
          {open ? (
            <motion.div
              key="open"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ overflow: "hidden" }}
            >
              <SurfaceView surface={s} onAsk={onAsk} reduce={reduce} hideNext={latest} autoFocus={false} onHoverRef={onHoverRef} />
              {!latest ? (
                <button type="button" className="r26-fold" onClick={onToggle} aria-expanded="true">
                  Fold this answer
                </button>
              ) : null}
            </motion.div>
          ) : (
            <motion.button
              key="folded"
              type="button"
              className="r26-summary"
              onClick={onToggle}
              aria-expanded="false"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span className="r26-summary-dot" aria-hidden="true" />
              <span className="r26-summary-title">{s.title.text}</span>
              <span className="r26-summary-open" aria-hidden="true">
                open
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </motion.article>
  );
}

export function Thread({
  turns,
  open,
  onToggle,
  onAsk,
  onHoverRef,
  reduce,
}: {
  turns: Turn[];
  open: Set<number>;
  onToggle: (id: number) => void;
  onAsk: (q: string) => void;
  onHoverRef: (id: string | null) => void;
  reduce: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const last = turns[turns.length - 1];
  const lastId = last?.id;
  const answered = !!last?.surface;

  // A new question (and again once it's answered): bring it to the top of the
  // view, so the answer composes below it. Wait for the previous answer to
  // finish folding, or the view would land past it.
  useEffect(() => {
    if (lastId === undefined) return;
    const go = () => {
      const box = scroller.current;
      const el = box?.querySelector<HTMLElement>(`[data-turn="${lastId}"]`);
      if (box && el) box.scrollTo({ top: Math.max(0, el.offsetTop - 8), behavior: reduce ? "auto" : "smooth" });
    };
    const t = window.setTimeout(go, reduce ? 0 : 320);
    return () => window.clearTimeout(t);
  }, [lastId, answered, reduce]);

  return (
    <div className="r26-thread" ref={scroller} onClick={(e) => e.stopPropagation()}>
      {turns.map((t, i) => (
        <TurnView
          key={t.id}
          turn={t}
          open={open.has(t.id) || i === turns.length - 1}
          onToggle={() => onToggle(t.id)}
          onAsk={onAsk}
          onHoverRef={onHoverRef}
          reduce={reduce}
          latest={i === turns.length - 1}
        />
      ))}
    </div>
  );
}
