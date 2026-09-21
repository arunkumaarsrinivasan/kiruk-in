"use client";

/**
 * Warp is how you return to a year you lived in — not a theme picker.
 * 1970: a teletype select. Later years keep the shared Time Machine until
 * those reading rooms are designed.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { TimeMachine } from "@/components/layout/TimeMachine";
import { NOTEBOOK_ERA_LITES, notebookEraLabel } from "@/lib/notebook";

export function NotebookWarp({
  currentId,
  onPick,
  reduce,
  terminal,
}: {
  currentId: string;
  onPick: (id: string) => void;
  reduce: boolean;
  terminal: boolean;
}) {
  if (!terminal) {
    return (
      <TimeMachine
        eras={NOTEBOOK_ERA_LITES}
        currentId={currentId}
        onPick={onPick}
        reduce={reduce}
      />
    );
  }
  return <TerminalWarp currentId={currentId} onPick={onPick} />;
}

function TerminalWarp({
  currentId,
  onPick,
}: {
  currentId: string;
  onPick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const idx = Math.max(0, NOTEBOOK_ERA_LITES.findIndex((era) => era.id === currentId));
  const prev = NOTEBOOK_ERA_LITES[idx - 1];
  const next = NOTEBOOK_ERA_LITES[idx + 1];

  const onDoc = useCallback((e: MouseEvent) => {
    if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onDoc]);

  return (
    <div ref={rootRef} className="relative" data-gaze-ignore>
      <div className="flex items-center gap-2 font-mono text-sm tabular-nums">
        <button
          type="button"
          disabled={!prev}
          onClick={() => prev && onPick(prev.id)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 opacity-80 hover:opacity-100 disabled:opacity-25"
          aria-label={prev ? `Warp to ${prev.id}` : "No earlier era"}
        >
          &lt;
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="inline-flex min-h-11 items-center border px-2 py-0.5 tracking-[0.12em]"
          style={{ borderColor: "var(--border-color)", color: "var(--accent-color)" }}
        >
          warp {currentId}
        </button>
        <button
          type="button"
          disabled={!next}
          onClick={() => next && onPick(next.id)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center px-1 opacity-80 hover:opacity-100 disabled:opacity-25"
          aria-label={next ? `Warp to ${next.id}` : "No later era"}
        >
          &gt;
        </button>
      </div>

      {open ? (
        <ul
          role="listbox"
          aria-label="Return to a year"
          className="absolute right-0 top-full z-[110] mt-2 max-h-[min(52vh,22rem)] w-[16.5rem] overflow-y-auto border py-2 text-left"
          style={{
            background: "var(--bg-main)",
            borderColor: "var(--border-color)",
            color: "var(--text-main)",
          }}
        >
          <li
            className="px-3 pb-2 text-[10px] uppercase tracking-[0.16em]"
            style={{ color: "var(--text-muted)" }}
          >
            return to a year you lived
          </li>
          {NOTEBOOK_ERA_LITES.map((era) => {
            const active = era.id === currentId;
            return (
              <li key={era.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className="flex min-h-11 w-full items-baseline gap-2 px-3 py-1 text-left text-sm hover:opacity-100"
                  style={{
                    color: active ? "var(--accent-color)" : "var(--text-main)",
                    opacity: active ? 1 : 0.75,
                  }}
                  onClick={() => {
                    setOpen(false);
                    if (!active) onPick(era.id);
                  }}
                >
                  <span className="w-10 shrink-0 tabular-nums">{era.id}</span>
                  <span className="min-w-0 truncate uppercase tracking-[0.04em]">
                    {notebookEraLabel(era.name)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
