"use client";

/**
 * TimeMachine — the era control for the navbar.
 *
 * Trigger: a segmented ‹ [ERA · year ▾] › capsule. ‹ › step to the adjacent
 * era; the center opens a "time-machine" console.
 *
 * Console: a vertical timeline (spine + nodes) of all eras, grouped by web-history
 * phase, with a single live eye-preview header for the focused era. Hover or
 * arrow-key to focus a row, Enter/click to travel. Monochrome — only the active
 * era's accent carries color, so it stays consistent with the rest of the bar.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { getEraEye } from "@/components/brand/eyes";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const PHASE: Record<string, string> = {
  "1970": "Pre-Web",
  "1981": "Pre-Web",
  "1991": "Web 1.0",
  "1993": "Web 1.0",
  "1995": "Web 1.0",
  "1997": "Web 1.0",
  "2000": "Web 2.0",
  "2003": "Web 2.0",
  "2006": "Web 2.0",
  "2009": "Mobile",
  "2013": "Mobile",
  "2018": "Modern",
  "2021": "Modern",
  "2023": "AI Native",
  "2026": "AI Native",
};
const phaseOf = (id: string) => PHASE[id] ?? "";

const eraLabel = (name: string) => {
  const [, ...rest] = name.split(":");
  return rest.join(":").trim() || name;
};
const tagline = (desc?: string) => {
  if (!desc) return "";
  const first = desc.split(/[.–—]|--/)[0].trim();
  return first.length > 64 ? `${first.slice(0, 62).trim()}…` : first;
};

export type EraLite = { id: string; name: string; description?: string; colors: { accent: string } };

function MiniEye({ eraId, size = 46 }: Readonly<{ eraId: string; size?: number }>) {
  const z = useMotionValue(0);
  const Eye = getEraEye(eraId);
  return (
    <div className="shrink-0" style={{ width: size, height: size * 0.66 }}>
      <Eye gx={z} gy={z} reduce live={false} hovered={false} />
    </div>
  );
}

export function TimeMachine({
  eras,
  currentId,
  onPick,
  reduce: reduceProp,
}: Readonly<{
  eras: EraLite[];
  currentId: string;
  onPick: (id: string) => void;
  reduce: boolean;
}>) {
  const reduceMotion = useReducedMotion();
  const reduce = reduceProp || !!reduceMotion;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const curIdx = Math.max(0, eras.findIndex((e) => e.id === currentId));
  const current = eras[curIdx];
  const [focusIdx, setFocusIdx] = useState(curIdx);
  const focused = eras[focusIdx] ?? current;

  const pick = useCallback(
    (id: string) => {
      setOpen(false);
      if (id !== currentId) onPick(id);
    },
    [currentId, onPick],
  );

  // flat render list: phase dividers + era rows (in chronological order)
  const items = useMemo(() => {
    const out: ({ type: "phase"; label: string } | { type: "era"; idx: number })[] = [];
    let last = "";
    eras.forEach((e, idx) => {
      const ph = phaseOf(e.id);
      if (ph !== last) {
        out.push({ type: "phase", label: ph });
        last = ph;
      }
      out.push({ type: "era", idx });
    });
    return out;
  }, [eras]);

  // panel keyboard nav (scoped to the focused console, not document, so it
  // doesn't fight the site's other global arrow handlers)
  const onPanelKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, eras.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setFocusIdx(eras.length - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const t = eras[focusIdx];
        if (t) pick(t.id);
      }
    },
    [eras, focusIdx, pick],
  );

  // open: reset focus, autofocus the panel, wire outside-click
  useEffect(() => {
    if (!open) return;
    setFocusIdx(curIdx);
    const id = requestAnimationFrame(() => panelRef.current?.focus());
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open, curIdx]);

  // keep the focused row in view
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${focusIdx}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, focusIdx]);

  return (
    <div ref={rootRef} className="relative">
      {/* trigger chip — current era at a glance */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Era ${current?.id ?? ""} — ${eraLabel(current?.name ?? "")}. Open time machine`}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        className="pointer-events-auto flex items-center gap-2.5 rounded-full border py-1 pl-1.5 pr-3 outline-none transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--text-main)_26%,transparent)]"
        style={{
          borderColor: open ? "var(--accent-color)" : "color-mix(in srgb, var(--text-main) 14%, transparent)",
          background: open
            ? "color-mix(in srgb, var(--text-main) 9%, transparent)"
            : "color-mix(in srgb, var(--text-main) 4%, transparent)",
          color: "var(--text-main)",
        }}
      >
        <span
          className="flex items-center justify-center rounded-full"
          style={{ width: 30, height: 30, background: "color-mix(in srgb, var(--accent-color) 14%, transparent)" }}
        >
          <MiniEye eraId={current?.id ?? eras[0].id} size={26} />
        </span>
        <span className="flex flex-col items-start leading-none">
          <span className="text-[14px] font-bold tabular-nums leading-none" style={{ color: "var(--text-main)" }}>
            {current?.id}
          </span>
          <span className="mt-1 hidden max-w-[110px] truncate text-[8px] font-medium uppercase tracking-[0.14em] sm:block" style={{ color: "var(--text-muted)" }}>
            {eraLabel(current?.name ?? "")}
          </span>
        </span>
        <motion.span
          aria-hidden
          className="ml-0.5 text-[8px]"
          style={{ color: "var(--text-muted)" }}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          ▾
        </motion.span>
      </motion.button>

      {/* console */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            onKeyDown={onPanelKey}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            role="listbox"
            aria-label="Travel eras"
            className="absolute right-0 top-full z-[110] mt-2.5 w-[300px] overflow-hidden rounded-2xl border outline-none"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", boxShadow: "0 20px 50px rgba(0,0,0,0.34)" }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-3.5 pt-3" style={{ color: "var(--text-main)" }}>
              <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.22em]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "var(--accent-color)" }} />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-color)" }} />
                </span>
                Time Machine
              </span>
              <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                {eras.length} eras
              </span>
            </div>

            {/* live preview of the focused era */}
            <div className="mx-3.5 mt-2.5 flex items-center gap-3 rounded-xl border px-3 py-2.5" style={{ borderColor: "var(--border-color)", background: "color-mix(in srgb, var(--accent-color) 6%, transparent)" }}>
              <MiniEye eraId={focused.id} />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[16px] font-black tabular-nums leading-none" style={{ color: "var(--accent-color)" }}>
                    {focused.id}
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                    {phaseOf(focused.id)}
                  </span>
                </div>
                <div className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--text-main)" }}>
                  {eraLabel(focused.name)}
                </div>
                {tagline(focused.description) && (
                  <div className="mt-0.5 truncate text-[9px]" style={{ color: "var(--text-muted)" }}>
                    {tagline(focused.description)}
                  </div>
                )}
              </div>
            </div>

            {/* timeline list */}
            <div ref={listRef} className="mt-2 max-h-[min(46vh,300px)] overflow-y-auto overscroll-contain px-2 pb-1.5">
              {items.map((it, k) => {
                if (it.type === "phase") {
                  return (
                    <div key={`p-${it.label}-${k}`} className="flex items-center gap-2 px-1.5 pb-1 pt-2.5">
                      <span className="text-[8px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
                        {it.label}
                      </span>
                      <span className="h-px flex-1" style={{ background: "var(--border-color)" }} />
                    </div>
                  );
                }
                const e = eras[it.idx];
                const active = e.id === currentId;
                const isFocus = it.idx === focusIdx;
                return (
                  <button
                    key={e.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    data-idx={it.idx}
                    onClick={() => pick(e.id)}
                    onMouseEnter={() => setFocusIdx(it.idx)}
                    className="flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2 text-left outline-none transition-colors duration-150"
                    style={{ background: isFocus ? "color-mix(in srgb, var(--accent-color) 12%, transparent)" : "transparent" }}
                  >
                    {/* spine + node */}
                    <span className="relative flex w-3 shrink-0 justify-center self-stretch">
                      <span className="absolute inset-y-0 w-px" style={{ background: "var(--border-color)", opacity: 0.7 }} />
                      <span
                        className="relative z-10 mt-[5px] h-2 w-2 shrink-0 rounded-full transition-all duration-150"
                        style={{
                          background: active ? "var(--accent-color)" : isFocus ? "var(--accent-color)" : "var(--bg-card)",
                          border: `1.5px solid ${active || isFocus ? "var(--accent-color)" : "var(--border-color)"}`,
                          boxShadow: active ? "0 0 8px var(--accent-color)" : "none",
                        }}
                      />
                    </span>

                    <span className="w-[42px] shrink-0 text-[13px] font-bold tabular-nums leading-none" style={{ color: active ? "var(--accent-color)" : "var(--text-main)" }}>
                      {e.id}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[10px] uppercase tracking-[0.04em] leading-none" style={{ color: active ? "var(--text-main)" : "var(--text-muted)" }}>
                      {eraLabel(e.name)}
                    </span>
                    {active ? (
                      <span className="shrink-0 text-[7px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent-color)" }}>
                        Now
                      </span>
                    ) : (
                      <span aria-hidden className="shrink-0 text-[9px] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ color: "var(--accent-color)", opacity: isFocus ? 1 : 0 }}>
                        →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* footer hint */}
            <div className="flex items-center justify-between border-t px-3.5 py-2 text-[8px] uppercase tracking-[0.14em]" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
              <span>↑↓ Select</span>
              <span>↵ Travel</span>
              <span>Esc Close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TimeMachine;
