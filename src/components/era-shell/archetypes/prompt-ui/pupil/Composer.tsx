"use client";

/**
 * The one place to ask. At rest it sits under the pupil, a plain pill with
 * three things to try beneath it. Once a conversation starts it glides to
 * the bottom of the eye and stays there, with the newest answer's
 * follow-ups just above it and a way to end the chat.
 */

import { forwardRef, useEffect, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.23, 1, 0.32, 1] as const;

interface Props {
  draft: string;
  onType: (text: string) => void;
  onAsk: (text: string) => void;
  /** Things to ask next: starters at rest, follow-ups in a chat. */
  chips: string[];
  docked: boolean;
  thinking: boolean;
  reduce: boolean;
  onEnd: () => void;
  onFocus: () => void;
  /** Esc in an empty box: leave the box (and, in a chat, end it). */
  onEscape: () => void;
}

export const Composer = forwardRef<HTMLInputElement, Props>(function Composer({ draft, onType, onAsk, chips, docked, thinking, reduce, onEnd, onFocus, onEscape }, ref) {
  const ready = draft.trim().length > 0 && !thinking;
  // Phones get a placeholder that fits the box.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    if (draft) onType("");
    else onEscape();
  };

  return (
    <motion.div className="r26-composer" data-docked={docked || undefined} layout={reduce ? false : true} transition={{ layout: { duration: 0.5, ease: EASE } }} onClick={(e) => e.stopPropagation()}>
      <form
        className="r26-askbar"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onAsk(draft);
        }}
      >
        <span className="r26-askbar-mark" aria-hidden="true" />
        <input
          ref={ref}
          className="r26-ask"
          value={draft}
          onChange={(e) => onType(e.target.value)}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          aria-label="Ask Arun"
          aria-describedby="r26-ask-hint"
          placeholder={docked ? "Ask a follow-up" : narrow ? "Ask about my work or story" : "Ask about my work, my story, or how to reach me"}
          autoComplete="off"
          autoCapitalize="sentences"
          enterKeyHint="send"
          maxLength={200}
        />
        <span id="r26-ask-hint" className="r26-sr">
          Type a question and press Enter. Escape clears it.
        </span>
        <AnimatePresence>
          {ready ? (
            <motion.button
              key="send"
              type="submit"
              className="r26-send-btn"
              aria-label="Ask"
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </form>

      <div className="r26-chiprow">
        <div className="r26-suggest" aria-label={docked ? "Ask next" : "Try asking"}>
          <AnimatePresence mode="popLayout" initial={!reduce}>
            {chips.map((c, i) => (
              <motion.button
                key={c}
                type="button"
                onClick={() => onAsk(c)}
                disabled={thinking}
                layout={reduce ? false : "position"}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE, delay: reduce ? 0 : 0.06 * i } }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, transition: { duration: 0.14 } }}
              >
                {c}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        {docked ? (
          <button type="button" className="r26-end" onClick={onEnd}>
            End chat
          </button>
        ) : null}
      </div>
    </motion.div>
  );
});
