"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SiteHomeLink } from "@/components/layout/SiteHomeLink";
import { isBlogReadyEra, notebookReadingGrammar } from "@/lib/notebook";
import { useNotebookEraOptional } from "./NotebookEraContext";
import { NotebookLink } from "./NotebookLink";
import { NotebookWarp } from "./NotebookWarp";

export type NotebookChromeVariant = "notebook" | "preview";

const STAMP_PLACEHOLDER = "---------- --:--:--";

function stamp(date: Date) {
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 19)}`;
}

const chromeLink =
  "site-chrome-link inline-flex min-h-11 shrink-0 items-center text-base";

export function NotebookChrome({
  variant = "notebook",
  onPickEra,
}: {
  variant?: NotebookChromeVariant;
  onPickEra?: (id: string) => void;
}) {
  const era = useNotebookEraOptional();
  const reduce = useReducedMotion();
  const eraId = era?.eraId ?? "1970";
  const ready = era?.ready ?? isBlogReadyEra(eraId);
  const pick = onPickEra ?? era?.pickEra;
  const grammar = notebookReadingGrammar(eraId);

  if (grammar === "terminal") {
    return (
      <TerminalChrome
        variant={variant}
        eraId={eraId}
        pick={pick}
        ready={ready}
      />
    );
  }

  return (
    <header
      className="site-chrome sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-1 md:px-6"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-main) 92%, transparent)",
        borderColor: "var(--border-color)",
        backdropFilter: "blur(10px)",
        color: "var(--text-main)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <SiteHomeLink showWordmark={false} wordmarkColor="var(--text-main)" />
        <NotebookLink
          href={variant === "preview" ? "/desk" : "/notebook"}
          className="flex min-h-11 min-w-0 items-center opacity-90"
          style={{ color: "var(--text-main)" }}
        >
          <span className="truncate text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            {variant === "preview" ? "Preview" : "Notebook"}
          </span>
        </NotebookLink>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        {pick ? (
          <div className="flex items-center gap-2">
            <NotebookWarp currentId={eraId} onPick={pick} reduce={!!reduce} terminal={false} />
            <span
              className="hidden max-w-[16rem] text-[10px] leading-snug tracking-[0.04em] sm:block"
              style={{ color: "var(--text-muted)" }}
              title={
                ready
                  ? "Best reading experience in 1970. Other eras are still being built."
                  : "Best reading experience in 1970. This era is still under development — explore, but expect bugs."
              }
            >
              {ready
                ? "best in 1970 · other eras WIP"
                : "best in 1970 · this era WIP · expect bugs"}
            </span>
          </div>
        ) : null}

        <a href="/" className={chromeLink} style={{ color: "var(--text-muted)" }}>
          Home
        </a>
        <a
          href={variant === "preview" ? "/desk" : "/work"}
          className={chromeLink}
          style={{ color: "var(--text-muted)" }}
        >
          {variant === "preview" ? "Desk" : "Work"}
        </a>
      </div>
    </header>
  );
}

function TerminalChrome({
  variant,
  eraId,
  pick,
  ready,
}: {
  variant: NotebookChromeVariant;
  eraId: string;
  pick?: (id: string) => void;
  ready: boolean;
}) {
  const [clock, setClock] = useState(STAMP_PLACEHOLDER);

  useEffect(() => {
    const tick = () => setClock(stamp(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const host = variant === "preview" ? "preview" : "notebook";

  return (
    <header
      className="era-tty-bar site-chrome sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-1 font-mono text-[13px] uppercase tracking-[0.14em] md:px-6"
      data-gaze-ignore
      style={{
        backgroundColor: "var(--bg-main)",
        borderColor: "color-mix(in srgb, var(--border-color) 35%, transparent)",
        color: "var(--text-muted)",
      }}
    >
      <NotebookLink
        href={variant === "preview" ? "/desk" : "/notebook"}
        className="inline-flex min-h-11 min-w-0 items-center truncate"
        style={{ color: "var(--text-main)" }}
      >
        <span data-zone="tty">tty1 · kiruk@{eraId} · {host}</span>
      </NotebookLink>

      <div className="flex min-w-0 items-center gap-3 normal-case tracking-normal">
        {pick ? (
          <div className="flex items-center gap-2">
            <NotebookWarp currentId={eraId} onPick={pick} reduce={false} terminal />
            <span
              className="hidden max-w-[18rem] text-[10px] leading-snug tracking-[0.08em] sm:block"
              style={{ color: "var(--text-muted)" }}
              title="Best reading experience in 1970. Other eras are still under development — explore, but expect bugs."
            >
              {ready
                ? "best in 1970 · other eras WIP"
                : "best in 1970 · other eras WIP · expect bugs"}
            </span>
          </div>
        ) : null}
        <span className="hidden tabular-nums md:inline" data-zone="tty">
          {clock} UTC
        </span>
        <a
          href="/"
          aria-label="Home"
          className="site-chrome-link inline-flex min-h-11 shrink-0 items-center uppercase tracking-[0.12em]"
          style={{ color: "var(--text-muted)" }}
        >
          <span data-zone="tty">Home</span>
        </a>
        <a
          href={variant === "preview" ? "/desk" : "/work"}
          className="site-chrome-link inline-flex min-h-11 shrink-0 items-center uppercase tracking-[0.12em]"
          style={{ color: "var(--text-muted)" }}
        >
          <span data-zone="tty">{variant === "preview" ? "Desk" : "Work"}</span>
        </a>
      </div>
    </header>
  );
}
