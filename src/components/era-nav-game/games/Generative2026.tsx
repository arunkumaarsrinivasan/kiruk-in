"use client";

/**
 * 2026 · No Screen
 * Navigation method: the pocket device. Roll its wheel (drag, swipe, mouse
 * wheel or ↑/↓) to pick a destination on the tiny dot-matrix screen, then
 * press the orange button to go. The rows above and below the current one
 * are tappable too, so any destination is at most two taps away.
 */

import React, { useEffect, useRef, useState } from "react";
import { DOTS_2026, FONT_VARS_2026, SANS_2026 } from "@/components/era-shell/archetypes/prompt-ui/fonts";
import type { EraNavGameProps } from "../types";

const DRAG_PITCH = 26;
const WHEEL_PITCH = 40;

const CSS = `
.g26 { display: flex; height: 100%; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 20px 16px; background: var(--bg-main, #e8e6e1); color: var(--text-main, #161513); font-family: ${SANS_2026}; }
.g26-dev {
  --w: min(320px, 86vw); width: var(--w); font-size: calc(var(--w) / 32);
  display: grid; grid-template-columns: minmax(0, 1fr) 5em; gap: 1.4em;
  padding: 1.8em; border-radius: 3.6em; background: #ff4f00;
  box-shadow: inset 0 0.25em 0 rgba(255,255,255,0.16), inset 0 -0.3em 0 rgba(0,0,0,0.08), 0 2.4em 3em -2.2em rgba(22,21,19,0.5);
  outline: none; touch-action: none; user-select: none; -webkit-user-select: none;
}
.g26-dev:focus-visible { outline: 2px solid var(--text-main, #161513); outline-offset: 6px; }
.g26-screen { grid-row: 1; border-radius: 1.8em; background: #121110; box-shadow: inset 0 0 0 0.1em rgba(255,255,255,0.06), inset 0 0.25em 0.6em rgba(0,0,0,0.6); padding: 0.8em 1em; display: grid; font-family: ${DOTS_2026}; }
.g26-row { display: flex; align-items: center; justify-content: space-between; gap: 0.6em; min-height: 44px; padding: 0 0.4em; border: 0; border-radius: 0.6em; background: none; color: #6f6a61; font: 700 1.6em/1 ${DOTS_2026}; text-align: left; cursor: pointer; }
.g26-row[data-current="true"] { color: #f2efe8; font-size: 2.6em; font-weight: 800; cursor: default; }
.g26-row small { font-size: 0.5em; color: #8d877c; }
.g26-row[data-here="true"] small { color: #ff4f00; }
.g26-slot { grid-row: 1; border-radius: 2.5em; background: #c93c00; box-shadow: inset 0 0.3em 0.6em rgba(0,0,0,0.28); padding: 0.6em 0.7em; cursor: ns-resize; }
.g26-wheel { position: relative; height: 100%; border-radius: 2em; background: #ff5d14; overflow: hidden; }
.g26-wheel i { position: absolute; left: 0; right: 0; height: 0.16em; background: #c23a00; }
.g26-go {
  grid-column: 1 / 3; min-height: 56px; border: 0; border-radius: 1.8em; background: #e94800; color: #161513;
  box-shadow: inset 0 0.2em 0 rgba(255,255,255,0.18), inset 0 -0.25em 0 rgba(0,0,0,0.1);
  font: 500 17px/1 ${SANS_2026}; cursor: pointer; transition: transform 90ms ease-out;
}
.g26-go:active { transform: translateY(2px); }
.g26-go:focus-visible { outline: 2px solid #161513; outline-offset: 3px; }
.g26-hint { font-size: 14px; color: var(--text-muted, #77736b); }
@media (prefers-reduced-motion: reduce) { .g26-go { transition: none; } }
`;

const RIDGES = 10;

export const Generative2026: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate }) => {
  const isActive = (href: string) =>
    activeHref === href || (href !== "/" && !href.includes("#") && activeHref.startsWith(href));
  const startAt = Math.max(0, dests.findIndex((d) => isActive(d.href)));
  const [sel, setSel] = useState(startAt);
  const [turn, setTurn] = useState(0);
  const devRef = useRef<HTMLDivElement>(null);
  const n = dests.length;
  const at = (i: number) => dests[(i + n) % n];

  const step = (dir: 1 | -1) => {
    setSel((s) => (s + dir + n) % n);
    setTurn((t) => t + dir);
  };
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const el = devRef.current;
    if (!el) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      acc += e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      while (Math.abs(acc) >= WHEEL_PITCH) {
        const dir = acc > 0 ? 1 : -1;
        acc -= dir * WHEEL_PITCH;
        stepRef.current(dir);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Swipe or drag anywhere on the device rolls the wheel.
  const drag = useRef<{ id: number; y: number } | null>(null);
  const rolled = useRef(false);
  const onDown = (e: React.PointerEvent) => {
    drag.current = { id: e.pointerId, y: e.clientY };
    rolled.current = false;
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    let dy = e.clientY - d.y;
    while (Math.abs(dy) >= DRAG_PITCH) {
      const dir = dy > 0 ? 1 : -1;
      dy -= dir * DRAG_PITCH;
      d.y += dir * DRAG_PITCH;
      rolled.current = true;
      stepRef.current(dir);
    }
  };
  const onUp = () => {
    drag.current = null;
  };
  // A drag that rolled the wheel shouldn't also count as a tap on a row.
  const tapped = (fn: () => void) => () => {
    if (rolled.current) return;
    fn();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      step(e.key === "ArrowDown" ? 1 : -1);
    }
  };

  const current = at(sel);
  const row = (offset: -1 | 0 | 1) => {
    const d = at(sel + offset);
    const here = isActive(d.href);
    return (
      <button
        key={offset}
        type="button"
        className="g26-row"
        data-current={offset === 0 ? "true" : undefined}
        data-here={here ? "true" : undefined}
        tabIndex={offset === 0 ? -1 : 0}
        aria-hidden={offset === 0 ? true : undefined}
        aria-label={offset === 0 ? undefined : `Select ${d.label}`}
        onClick={offset === 0 ? undefined : tapped(() => step(offset))}
      >
        <span>{d.label.toLowerCase()}</span>
        <small>{here ? "here" : d.href}</small>
      </button>
    );
  };

  return (
    <div className={`g26 ${FONT_VARS_2026}`}>
      <style>{CSS}</style>
      <div
        ref={devRef}
        className="g26-dev"
        role="group"
        aria-roledescription="pocket device"
        aria-label={`Destination: ${current.label}. Roll to change, press Go.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="g26-screen">
          {row(-1)}
          {row(0)}
          {row(1)}
        </div>
        <div className="g26-slot" aria-hidden>
          <div className="g26-wheel">
            {Array.from({ length: RIDGES }, (_, i) => {
              const y = (((i + turn * 0.5) % RIDGES) + RIDGES) % RIDGES;
              const depth = Math.sin((Math.PI * (y + 0.5)) / RIDGES);
              return <i key={i} style={{ top: `${(y / RIDGES) * 100}%`, opacity: 0.2 + depth * 0.8 }} />;
            })}
          </div>
        </div>
        <button type="button" className="g26-go" onClick={tapped(() => onNavigate(current.href))}>
          Go to {current.label}
        </button>
      </div>
      <p className="g26-hint">
        Roll, then press go.
      </p>
    </div>
  );
};
