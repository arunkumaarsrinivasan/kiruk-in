"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { NotebookSummary } from "@/lib/content/notebook";
import type { RelatedHit } from "@/lib/content/related";
import { QuietTags } from "@/components/blog/QuietTags";
import { NotebookSearch } from "@/components/blog/NotebookSearch";
import { notebookReadingGrammar, withNotebookEraHref } from "@/lib/notebook";
import { useNotebookEraOptional } from "@/components/notebook/NotebookEraContext";
import { NotebookLink } from "@/components/notebook/NotebookLink";
import { bindHover } from "@/components/notebook/gaze/field";
import { GazeHit, GazeTitle } from "@/components/notebook/gaze/GazeTitle";
import { dateYear, markFor } from "@/components/notebook/gaze/marks";

/** ANSI Shadow — short names stay readable; long words use CRT type below. */
const BANNER_KIRUK = [
  " ██╗  ██╗██╗██████╗ ██╗   ██╗██╗  ██╗",
  " ██║ ██╔╝██║██╔══██╗██║   ██║██║ ██╔╝",
  " █████╔╝ ██║██████╔╝██║   ██║█████╔╝ ",
  " ██╔═██╗ ██║██╔══██╗██║   ██║██╔═██╗ ",
  " ██║  ██╗██║██║  ██║╚██████╔╝██║  ██╗",
  " ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝",
];

const BANNER_ARUN = [
  " █████╗ ██████╗ ██╗   ██╗███╗   ██╗",
  "██╔══██╗██╔══██╗██║   ██║████╗  ██║",
  "███████║██████╔╝██║   ██║██╔██╗ ██║",
  "██╔══██║██╔══██╗██║   ██║██║╚██╗██║",
  "██║  ██║██║  ██║╚██████╔╝██║ ╚████║",
  "╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝",
];

interface NotebookListProps {
  entries: Array<NotebookSummary & { work: RelatedHit[] }>;
  query: string;
}

function formatMarginDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Table of contents. 1970 is a research file on the machine you warped to.
 */
export function NotebookList({ entries, query }: NotebookListProps) {
  const eraId = useNotebookEraOptional()?.eraId ?? "1970";
  if (notebookReadingGrammar(eraId) === "terminal") {
    return <TerminalIndex entries={entries} query={query} eraId={eraId} />;
  }
  return <TokensIndex entries={entries} query={query} />;
}

function TerminalIndex({
  entries,
  query,
  eraId,
}: NotebookListProps & { eraId: string }) {
  const [focus, setFocus] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    setFocus(0);
  }, [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector("[data-mark]")
      ?.scrollIntoView({ block: "nearest" });
  }, [focus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocus((i) => {
          const n = Math.min(entries.length - 1, i + 1);
          queueMicrotask(() => bindHover(null, titleRefs.current[n]));
          return n;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocus((i) => {
          const n = Math.max(0, i - 1);
          queueMicrotask(() => bindHover(null, titleRefs.current[n]));
          return n;
        });
      } else if (e.key === "Enter") {
        const marked = listRef.current?.querySelector<HTMLAnchorElement>("[data-mark]");
        if (marked) {
          e.preventDefault();
          marked.click();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entries.length]);

  return (
    <div className="era-index">
      <form
        action="/notebook"
        method="get"
        className="era-index-find"
        role="search"
        data-blueprint="search"
      >
        <input type="hidden" name="era" value={eraId} />
        <label className="era-find" htmlFor="notebook-q">
          <span className="era-find-prompt" aria-hidden>
            find
          </span>
          <input
            id="notebook-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder=""
            autoComplete="off"
          />
        </label>
        {query ? (
          <p className="era-find-clear">
            <NotebookLink href={withNotebookEraHref("/notebook", eraId)}>clear</NotebookLink>
          </p>
        ) : null}
      </form>

      <div className="era-index-floor">
        <div className="era-index-brand" data-blueprint="header">
          <div
            className="era-banner-hit"
            data-zone="banner"
            aria-label="Kiruk Notebook — hover for Arun's Notebook"
          >
            <div className="era-banner-stack era-banner-kiruk">
              <pre className="era-banner">{BANNER_KIRUK.join("\n")}</pre>
              <h1 className="era-banner-word">NOTEBOOK</h1>
            </div>
            <div className="era-banner-stack era-banner-arun" aria-hidden>
              <pre className="era-banner">{BANNER_ARUN.join("\n")}</pre>
              <p className="era-banner-word">NOTEBOOK</p>
            </div>
          </div>
        </div>

        <div className="era-index-feed" data-blueprint="entries">
          <p className="era-index-count">
            {entries.length === 1 ? "1 blog" : `${entries.length} blogs`}
          </p>
          {entries.length === 0 ? (
            <p className="era-dim era-gap">
              {query ? "Nothing matches that word." : "The file is empty."}
            </p>
          ) : (
            <ol ref={listRef} className="era-records">
              {entries.map((entry, i) => {
                const mark = markFor(entry);
                return (
                  <li key={entry.slug}>
                    <NotebookLink
                      href={entry.href}
                      className="era-record"
                      data-mark={i === focus ? "true" : undefined}
                      aria-current={i === focus ? "true" : undefined}
                      onMouseEnter={() => setFocus(i)}
                      onFocus={() => {
                        setFocus(i);
                        bindHover(null, titleRefs.current[i]);
                      }}
                      onBlur={() => bindHover(null, null)}
                    >
                      <GazeHit regular={mark.regular} solid={mark.solid}>
                        <span className="era-record-copy">
                          <GazeTitle
                            className="era-record-title"
                            ref={(el) => {
                              titleRefs.current[i] = el;
                            }}
                          >
                            {entry.title}
                          </GazeTitle>
                          {entry.excerpt ? (
                            <span className="era-dim era-excerpt">{entry.excerpt}</span>
                          ) : null}
                        </span>
                      </GazeHit>
                      <span className="era-record-meta">
                        {entry.date ? (
                          <time dateTime={entry.date}>{dateYear(entry.date)}</time>
                        ) : null}
                      </span>
                    </NotebookLink>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

function TokensIndex({ entries, query }: NotebookListProps) {
  return (
    <div className="px-[clamp(1.25rem,4vw,3rem)] py-10 md:py-14">
      <div className="relative z-10 era-read">
        <header className="mb-12" data-blueprint="header">
          <p
            className="mb-2 text-sm uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-heading)" }}
          >
            Read
          </p>
          <h1
            className="era-blog-title mb-3 text-4xl leading-tight md:text-5xl"
            style={{ color: "var(--text-main)", fontFamily: "var(--font-heading)" }}
          >
            Notebook
          </h1>
          <p className="max-w-md text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Warp to a year you lived in, then read from that machine.
          </p>

          <div data-blueprint="search">
            <NotebookSearch query={query} />
          </div>
        </header>

        {entries.length === 0 ? (
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            {query ? "Nothing matches." : "The notebook is empty."}
          </p>
        ) : (
          <ol className="space-y-0" data-blueprint="entries">
            {entries.map((entry) => (
              <li
                key={entry.slug}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 border-b py-8 first:pt-0"
                style={{ borderColor: "var(--border-color)" }}
              >
                <time
                  className="pt-1 text-sm tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                  dateTime={entry.date || undefined}
                >
                  {formatMarginDate(entry.date) || "—"}
                </time>
                <div>
                  <NotebookLink href={entry.href} className="group block transition-opacity hover:opacity-70">
                    {entry.coverImage ? (
                      <div
                        className="relative mb-4 aspect-[2/1] w-full overflow-hidden border"
                        style={{
                          borderColor: "var(--border-color)",
                          backgroundColor: "var(--bg-card)",
                        }}
                      >
                        <Image
                          src={entry.coverImage}
                          alt=""
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 672px) 100vw, 672px"
                        />
                      </div>
                    ) : null}
                    <h2
                      className="mb-2 text-xl md:text-2xl group-hover:underline"
                      style={{ color: "var(--text-main)", fontFamily: "var(--font-heading)" }}
                    >
                      {entry.title}
                    </h2>
                    {entry.excerpt ? (
                      <p className="text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {entry.excerpt}
                      </p>
                    ) : null}
                  </NotebookLink>
                  <QuietTags tags={entry.domain} />
                  {entry.work.length > 0 ? (
                    <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
                      from the studio{" "}
                      {entry.work.map((hit, i) => (
                        <span key={hit.href}>
                          {i > 0 ? " · " : null}
                          <a
                            href={hit.href}
                            className="underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-70"
                            style={{ color: "var(--text-main)" }}
                          >
                            {hit.title}
                          </a>
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-12">
          <NotebookLink
            href="/"
            className="text-base opacity-55 transition-opacity hover:opacity-100"
            style={{ color: "var(--text-muted)" }}
          >
            ← Home
          </NotebookLink>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use NotebookList — kept so stray imports still typecheck. */
export const BlogListClient = NotebookList;
