"use client";

/**
 * TimeMachine — the era control for the navbar.
 *
 * 1180px and up: every era sits in the bar as a year ('70 '81 … 2026). Click one to
 * travel; the current year wears a pill that slides between years. Hover or
 * focus a year to see its name.
 * Narrower: a ‹ year › stepper, since ten years don't fit next to the links.
 */

import React, { useRef } from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { getEraEye } from "@/components/brand/eyes";
import { prefetchEraArchetype } from "@/components/era-shell/registry";

const PHASE: Record<string, string> = {
  "1970": "Pre-Web",
  "1981": "Pre-Web",
  "1991": "Web 1.0",
  "1995": "Web 1.0",
  "1997": "Web 1.0",
  "2000": "Web 2.0",
  "2003": "Web 2.0",
  "2009": "Mobile",
  "2013": "Mobile",
  "2026": "Now",
};
const phaseOf = (id: string) => PHASE[id] ?? "";

const eraLabel = (name: string) => {
  const [, ...rest] = name.split(":");
  return rest.join(":").trim() || name;
};

export type EraLite = { id: string; name: string; description?: string; colors: { accent: string } };

function MiniEye({ eraId, size = 24 }: Readonly<{ eraId: string; size?: number }>) {
  const z = useMotionValue(0);
  const Eye = getEraEye(eraId);
  return (
    <div className="shrink-0" style={{ width: size, height: size * 0.66 }}>
      <Eye gx={z} gy={z} reduce live={false} hovered={false} />
    </div>
  );
}

/** All eras inline. Arrow keys move focus along the row; Enter/click travels. */
function EraRail({
  eras,
  currentId,
  onPick,
  reduce,
}: Readonly<{ eras: EraLite[]; currentId: string; onPick: (id: string) => void; reduce: boolean }>) {
  const rowRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const buttons = Array.from(rowRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    const to: Record<string, number> = {
      ArrowRight: Math.min(at + 1, buttons.length - 1),
      ArrowLeft: Math.max(at - 1, 0),
      Home: 0,
      End: buttons.length - 1,
    };
    if (e.key in to) {
      e.preventDefault();
      buttons[to[e.key]].focus();
    }
  };

  return (
    <div
      ref={rowRef}
      role="group"
      aria-label="Design era"
      onKeyDown={onKeyDown}
      className="era-rail pointer-events-auto hidden h-11 items-center rounded-full border px-1 min-[1180px]:flex"
      style={{
        borderColor: "color-mix(in srgb, var(--nav-text) 18%, transparent)",
        background: "color-mix(in srgb, var(--nav-text) 5%, transparent)",
      }}
    >
      {eras.map((era, i) => {
        const active = era.id === currentId;
        const newPhase = i > 0 && phaseOf(era.id) !== phaseOf(eras[i - 1].id);
        let tipAlign = "left-1/2 -translate-x-1/2";
        if (i < 2) tipAlign = "left-0";
        else if (i >= eras.length - 2) tipAlign = "right-0";
        return (
          <button
            key={era.id}
            type="button"
            tabIndex={active ? 0 : -1}
            aria-pressed={active}
            aria-label={`${era.id} — ${eraLabel(era.name)}`}
            onClick={() => !active && onPick(era.id)}
            onPointerEnter={() => prefetchEraArchetype(era.id)}
            onFocus={() => prefetchEraArchetype(era.id)}
            className={`era-rail-year relative flex h-8 items-center justify-center rounded-full px-[7px] text-[12px] tabular-nums leading-none outline-none ${newPhase ? "ml-1" : ""}`}
            style={{
              color: active ? "var(--nav-surface, var(--bg-main))" : "var(--nav-text-muted)",
              fontWeight: active ? 700 : 500,
            }}
          >
            {active ? (
              <motion.span
                layoutId="era-rail-pill"
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--accent-color)" }}
                transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.35, bounce: 0.15 }}
              />
            ) : null}
            <span className="relative">{active ? era.id : `’${era.id.slice(2)}`}</span>
            <span
              role="tooltip"
              className={`era-rail-tip pointer-events-none absolute top-full z-10 mt-2 whitespace-nowrap rounded-md border px-2 py-1 text-left text-[11px] font-medium leading-tight ${tipAlign}`}
              style={{
                background: "var(--nav-surface, var(--bg-main))",
                borderColor: "color-mix(in srgb, var(--nav-text) 18%, transparent)",
                color: "var(--nav-text)",
              }}
            >
              <span className="font-bold tabular-nums">{era.id}</span> · {eraLabel(era.name)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** One-step era hop. Disabled (not hidden) at the ends so the capsule never changes width. */
function StepButton({
  dir,
  target,
  onStep,
}: Readonly<{ dir: "prev" | "next"; target?: EraLite; onStep: (id: string) => void }>) {
  let label = dir === "prev" ? "No earlier era" : "No later era";
  if (target) label = `${dir === "prev" ? "Previous" : "Next"} era: ${target.id} ${eraLabel(target.name)}`;
  return (
    <button
      type="button"
      disabled={!target}
      aria-label={label}
      onClick={() => target && onStep(target.id)}
      onPointerEnter={() => target && prefetchEraArchetype(target.id)}
      className={`time-stepper-step flex w-9 shrink-0 items-center justify-center text-[15px] leading-none outline-none disabled:cursor-default disabled:opacity-30 ${dir === "prev" ? "rounded-l-full pl-1" : "rounded-r-full pr-1"}`}
      style={{ color: "var(--nav-text)" }}
    >
      <span aria-hidden>{dir === "prev" ? "‹" : "›"}</span>
    </button>
  );
}

/** Compact ‹ year › for narrow screens. */
function EraStepper({
  eras,
  currentId,
  onPick,
}: Readonly<{ eras: EraLite[]; currentId: string; onPick: (id: string) => void }>) {
  const idx = Math.max(0, eras.findIndex((e) => e.id === currentId));
  const current = eras[idx];
  return (
    <div
      className="time-stepper pointer-events-auto flex min-h-11 items-stretch rounded-full border min-[1180px]:hidden"
      style={{
        borderColor: "color-mix(in srgb, var(--nav-text) 18%, transparent)",
        background: "color-mix(in srgb, var(--nav-text) 5%, transparent)",
        color: "var(--nav-text)",
      }}
    >
      <StepButton dir="prev" target={eras[idx - 1]} onStep={onPick} />
      <span aria-live="polite" className="flex items-center gap-1.5 px-1" title={eraLabel(current?.name ?? "")}>
        <MiniEye eraId={current?.id ?? eras[0].id} />
        <span className="text-[14px] font-bold tabular-nums leading-none">{current?.id}</span>
      </span>
      <StepButton dir="next" target={eras[idx + 1]} onStep={onPick} />
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
  return (
    <>
      <EraRail eras={eras} currentId={currentId} onPick={onPick} reduce={reduce} />
      <EraStepper eras={eras} currentId={currentId} onPick={onPick} />
    </>
  );
}

export default TimeMachine;
