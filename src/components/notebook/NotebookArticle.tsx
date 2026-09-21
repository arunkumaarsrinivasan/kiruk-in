"use client";

import { useEffect, type ReactNode } from "react";
import Image from "next/image";
import type { NotebookSummary } from "@/lib/content/notebook";
import type { RelatedHit } from "@/lib/content/related";
import { notebookReadingGrammar } from "@/lib/notebook";
import { RelatedLinks } from "@/components/blog/RelatedLinks";
import { SiteCrumbs } from "@/components/layout/SiteCrumbs";
import { releaseGaze } from "./gaze/field";
import { GazeHit, GazeTitle } from "./gaze/GazeTitle";
import { dateYear, markFor } from "./gaze/marks";
import { useNotebookEraOptional } from "./NotebookEraContext";
import { NotebookHeadingScroll } from "./NotebookHeadingScroll";
import { NotebookLink } from "./NotebookLink";
import { NotebookProgress } from "./NotebookProgress";

export function NotebookArticle({
  summary,
  minutes,
  wide,
  prev,
  next,
  related,
  tags: _tags,
  agentMarkdown,
  children,
}: {
  summary: NotebookSummary;
  minutes: string;
  wide: boolean;
  prev: NotebookSummary | null;
  next: NotebookSummary | null;
  related: RelatedHit[];
  tags: string[];
  agentMarkdown: string;
  children: ReactNode;
}) {
  void _tags;
  const eraId = useNotebookEraOptional()?.eraId ?? "1970";
  const terminal = notebookReadingGrammar(eraId) === "terminal";
  const eraReady = eraId === "1970";

  useEffect(() => {
    if (terminal) releaseGaze();
  }, [terminal, summary.slug]);

  return (
    <div
      className={
        terminal
          ? "notebook-page era-read-shell"
          : "notebook-page era-read-shell px-[clamp(1.25rem,4vw,3rem)] py-8 md:py-12"
      }
      style={{ color: "var(--text-main)" }}
    >
      <NotebookProgress agentMarkdown={agentMarkdown} />
      <NotebookHeadingScroll />
      <article
        className={
          terminal
            ? "gaze-col"
            : `relative z-10 era-read ${wide ? "px-1 md:px-2" : ""}`
        }
      >
        {terminal ? null : (
          <SiteCrumbs
            className="mb-8"
            items={[
              { href: "/notebook", label: "Notebook" },
              { label: summary.title },
            ]}
            link={NotebookLink}
          />
        )}

        {eraReady ? null : (
          <p
            className="era-era-note mb-6 max-w-[40rem] text-[0.78rem] leading-snug tracking-[0.02em]"
            style={{ color: "var(--text-muted)" }}
            data-gaze-ignore
          >
            Best experience in 1970. Other eras are still under development — explore them, but expect some bugs.
          </p>
        )}

        {terminal ? (
          <TerminalArticleHeader summary={summary} />
        ) : (
          <TokensArticleHeader summary={summary} minutes={minutes} />
        )}

        {terminal ? <div className="gaze-prose">{children}</div> : children}

        <footer className="mt-12 pt-2">
          {terminal && related.length > 0 ? (
            <p
              className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--accent-color)" }}
            >
              SEE ALSO
            </p>
          ) : null}
          <RelatedLinks items={related} />

          {(prev || next) && (
            <nav
              className="mt-10 flex flex-wrap justify-between gap-6"
              aria-label="Notebook pages"
            >
              {prev ? (
                <NotebookLink
                  href={prev.href}
                  className="max-w-[45%] text-base transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-main)" }}
                >
                  <span className="mb-1 block text-sm" style={{ color: "var(--text-muted)" }}>
                    {terminal ? `$ more ${prev.slug}.md` : "earlier"}
                  </span>
                  {prev.title}
                </NotebookLink>
              ) : (
                <span />
              )}
              {next ? (
                <NotebookLink
                  href={next.href}
                  className="ml-auto max-w-[45%] text-right text-base transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-main)" }}
                >
                  <span className="mb-1 block text-sm" style={{ color: "var(--text-muted)" }}>
                    {terminal ? `$ more ${next.slug}.md` : "later"}
                  </span>
                  {next.title}
                </NotebookLink>
              ) : null}
            </nav>
          )}
        </footer>
      </article>
    </div>
  );
}

function TerminalArticleHeader({ summary }: { summary: NotebookSummary }) {
  const mark = markFor(summary);

  return (
    <header>
      <div className="era-article-head">
        <GazeHit as="div" className="gaze-h1-hit" regular={mark.regular} solid={mark.solid}>
          <div className="era-record-copy">
            <h1 className="era-blog-title era-h1">
              <GazeTitle className="gaze-h1">{summary.title}</GazeTitle>
            </h1>
            {summary.excerpt ? <p className="era-lede">{summary.excerpt}</p> : null}
          </div>
        </GazeHit>
        <p className="era-record-meta">
          {summary.date ? <time dateTime={summary.date}>{dateYear(summary.date)}</time> : null}
        </p>
      </div>
      {summary.coverImage ? (
        <div className="era-cover">
          <Image
            src={summary.coverImage}
            alt={summary.title}
            fill
            priority
            className="object-contain object-top"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : null}
    </header>
  );
}

function TokensArticleHeader({
  summary,
  minutes,
}: {
  summary: NotebookSummary;
  minutes: string;
}) {
  return (
    <header className="mb-10">
      <h1
        className="era-blog-title mb-4 text-4xl leading-[1.08] md:text-6xl"
        style={{ color: "var(--text-main)", fontFamily: "var(--font-heading)" }}
      >
        {summary.title}
      </h1>

      <div className="mb-6 flex flex-wrap gap-3 text-base" style={{ color: "var(--text-muted)" }}>
        {summary.date ? <time>{formatDate(summary.date)}</time> : null}
        <span>{minutes}</span>
      </div>

      {summary.coverImage ? (
        <div
          className="relative mb-8 aspect-[16/9] w-full overflow-hidden border"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}
        >
          <Image
            src={summary.coverImage}
            alt={summary.title}
            fill
            priority
            className="object-contain object-top"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : null}

      {summary.excerpt ? (
        <p
          className="era-lede border-l pl-4 text-lg leading-relaxed text-pretty md:text-xl"
          style={{
            borderColor: "var(--text-main)",
            color: "var(--text-muted)",
          }}
        >
          {summary.excerpt}
        </p>
      ) : null}
    </header>
  );
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
