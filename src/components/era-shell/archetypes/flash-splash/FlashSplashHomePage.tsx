"use client";

/**
 * FlashSplashHomePage — 2000: The Search Box.
 * (Archetype id and export name are historical; the era is the clean web of
 * 1999–2000 that won by being a white page with one box.)
 *
 * Two states on one page, driven by the URL:
 *   /            home — wordmark, one box, two buttons, a line of links
 *   /?q=term     results — a period results page over a client-side index
 * "Cached" opens a result's full text inline with the query terms highlighted.
 * The About result's cached view is the EraStoryBox, so /#about lands on
 * results for "about" with that view open.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { EraStoryBox } from "@/components/about-story/EraStoryBox";
import { portfolioData } from "@/data/portfolio-data";
import { ABOUT_DOC_ID, DOCS, queryTerms, search, sizeK, snippetFor, suggest, type SearchDoc } from "./search-index";
import { Highlight, PagerMark, SEARCH_CSS, Wordmark } from "./ui";

const PER_PAGE = 10;
const TRY = ["design engineer", "HP Print AI", "fintech", "contact"];

interface View {
  /** null = home state. "" = results for everything. */
  q: string | null;
  page: number;
}

function readView(): View {
  const params = new URLSearchParams(window.location.search);
  if (window.location.hash === "#about") return { q: "about", page: 1 };
  const q = params.get("q");
  const page = Math.max(1, Number(params.get("p")) || 1);
  return { q, page };
}

function urlFor(q: string | null, page = 1, hash = "") {
  if (q === null) return `/${hash}`;
  return `/?q=${encodeURIComponent(q)}${page > 1 ? `&p=${page}` : ""}${hash}`;
}

const sectionOf = (url: string) => (url.startsWith("/work/") ? "/work/" : url);

export function FlashSplashHomePage() {
  const { setLayoutMode } = useLayoutMode();
  useEffect(() => {
    setLayoutMode("full-digital");
  }, [setLayoutMode]);

  const router = useRouter();
  const [view, setView] = useState<View>({ q: null, page: 1 });
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const go = useCallback((next: View, opts: { hash?: string; replace?: boolean; openAbout?: boolean } = {}) => {
    const url = urlFor(next.q, next.page, opts.hash);
    try {
      if (opts.replace) window.history.replaceState(window.history.state, "", url);
      else window.history.pushState(window.history.state, "", url);
    } catch {
      // History writes can be throttled (Safari); the view still updates.
    }
    setView(next);
    setDraft(next.q ?? "");
    setOpen(opts.openAbout ? { [ABOUT_DOC_ID]: true } : {});
  }, []);

  /** Results for "about" with the story open, scrolled into view. */
  const showAbout = useCallback(
    (replace: boolean) => {
      go({ q: "about", page: 1 }, { hash: "#about", replace, openAbout: true });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => document.getElementById("about")?.scrollIntoView({ block: "start" })),
      );
    },
    [go],
  );

  // First paint from the URL; then follow back/forward and #about links.
  useEffect(() => {
    const sync = () => {
      const v = readView();
      setView(v);
      setDraft(v.q ?? "");
      setOpen(window.location.hash === "#about" ? { [ABOUT_DOC_ID]: true } : {});
    };
    sync();
    if (window.location.hash === "#about") showAbout(true);
    else if (readView().q === null && window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }

    const onHash = () => {
      if (window.location.hash === "#about") showAbout(true);
    };
    // Next's <Link> changes the hash without a hashchange event, so catch
    // same-page /#about links (navbar, menu, result titles) at click time.
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      if (url.hash !== "#about") return;
      e.preventDefault();
      showAbout(false);
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("click", onClick, true);
    };
  }, [showAbout]);

  const runSearch = (q: string) => go({ q: q.trim(), page: 1 });

  const feelingCurious = () => {
    const best = search(draft.trim())[0];
    if (!best || best.url === "/#about") showAbout(false);
    else router.push(best.url);
  };

  const searchForm = (placement: "home" | "results") => (
    <form
      className="ks-form"
      action="/"
      method="get"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        runSearch(draft);
      }}
    >
      <input
        ref={placement === "home" ? inputRef : undefined}
        className="ks-input"
        type="text"
        name="q"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="Search kiruk.in"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="search"
        data-blueprint={placement === "home" ? "search-box" : undefined}
      />
      <div className="ks-buttons" data-blueprint={placement === "home" ? "search-buttons" : undefined}>
        <button type="submit" className="ks-btn">
          Kiruk Search
        </button>
        {placement === "home" ? (
          <button type="button" className="ks-btn" onClick={feelingCurious}>
            I&rsquo;m Feeling Curious
          </button>
        ) : null}
      </div>
    </form>
  );

  return (
    <div className="ks-root">
      <style dangerouslySetInnerHTML={{ __html: SEARCH_CSS }} />
      {view.q === null ? (
        <main className="ks-home" data-blueprint="search-home">
          <h1 data-blueprint="search-wordmark">
            <Wordmark />
          </h1>
          {searchForm("home")}
          <p className="ks-try">
            Try:{" "}
            {TRY.map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 ? " · " : null}
                <button type="button" className="ks-textbtn" onClick={() => runSearch(t)}>
                  {t}
                </button>
              </React.Fragment>
            ))}
          </p>
          <ul className="ks-links" data-blueprint="search-links" aria-label="Pages">
            <li>
              <Link href="/work">Work</Link>
            </li>
            <li>
              <a href="/#about">About</a>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            {portfolioData.personal.resumeUrl ? (
              <li>
                <a href={portfolioData.personal.resumeUrl} target="_blank" rel="noopener noreferrer">
                  Résumé
                </a>
              </li>
            ) : null}
          </ul>
          <p className="ks-foot">©2000 Kiruk · Searching {DOCS.length} pages</p>
        </main>
      ) : (
        <Results
          view={view}
          open={open}
          setOpen={setOpen}
          onSearch={runSearch}
          onPage={(page) => {
            go({ q: view.q, page });
            window.scrollTo({ top: 0 });
          }}
          onHome={() => go({ q: null, page: 1 })}
          form={searchForm("results")}
        />
      )}
    </div>
  );
}

function Results({
  view,
  open,
  setOpen,
  onSearch,
  onPage,
  onHome,
  form,
}: {
  view: View;
  open: Record<string, boolean>;
  setOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSearch: (q: string) => void;
  onPage: (page: number) => void;
  onHome: () => void;
  form: React.ReactNode;
}) {
  const q = view.q ?? "";
  const { results, seconds } = useMemo(() => {
    const t0 = performance.now();
    const found = search(q);
    return { results: found, seconds: (performance.now() - t0) / 1000 };
  }, [q]);
  const terms = useMemo(() => queryTerms(q), [q]);
  const didYouMean = useMemo(() => (q ? suggest(q) : null), [q]);

  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const page = Math.min(view.page, pages);
  const shown = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const first = (page - 1) * PER_PAGE + 1;

  return (
    <div className="ks-results">
      <h1 className="sr-only">{q ? `Search results for ${q}` : "All pages on kiruk.in"}</h1>
      <div className="ks-head">
        <a
          href="/"
          className="ks-home-link"
          aria-label="Kiruk search home"
          onClick={(e) => {
            e.preventDefault();
            onHome();
          }}
        >
          <Wordmark size="small" />
        </a>
        {form}
      </div>

      <div className="ks-bar">
        <b>Web</b>
        <span>
          {results.length > 0 ? (
            <>
              Results <b>{first}</b> - <b>{first + shown.length - 1}</b> of <b>{results.length}</b>
              {q ? (
                <>
                  {" "}
                  for <b>{q}</b>
                </>
              ) : (
                " pages on kiruk.in"
              )}
              . ({seconds.toFixed(2)} seconds)
            </>
          ) : (
            <>No results ({seconds.toFixed(2)} seconds)</>
          )}
        </span>
      </div>

      <div className="ks-col">
        {didYouMean ? (
          <p className="ks-dym">
            Did you mean:{" "}
            <button type="button" className="ks-textbtn" onClick={() => onSearch(didYouMean)}>
              {didYouMean}
            </button>
          </p>
        ) : null}

        {results.length === 0 ? (
          <div className="ks-empty">
            <p>
              No pages on kiruk.in match <b>{q}</b>.
            </p>
            <p>
              Try:{" "}
              {TRY.map((t, i) => (
                <React.Fragment key={t}>
                  {i > 0 ? " · " : null}
                  <button type="button" className="ks-textbtn" onClick={() => onSearch(t)}>
                    {t}
                  </button>
                </React.Fragment>
              ))}
            </p>
          </div>
        ) : (
          <ol className="ks-list" start={first}>
            {shown.map((doc, i) => {
              const prev = shown[i - 1];
              const prevIndented = i > 1 && sectionOf(shown[i - 2].url) === sectionOf(prev.url);
              const indent = !!prev && sectionOf(prev.url) === sectionOf(doc.url) && !prevIndented;
              return (
                <Result
                  key={doc.id}
                  doc={doc}
                  terms={terms}
                  indent={indent}
                  open={!!open[doc.id]}
                  onToggle={() => setOpen((o) => ({ ...o, [doc.id]: !o[doc.id] }))}
                  onSimilar={() => onSearch(doc.similar)}
                />
              );
            })}
          </ol>
        )}

        {pages > 1 ? <PagerMark pages={pages} current={page} onPage={onPage} /> : null}
      </div>
    </div>
  );
}

function Result({
  doc,
  terms,
  indent,
  open,
  onToggle,
  onSimilar,
}: {
  doc: SearchDoc;
  terms: string[];
  indent: boolean;
  open: boolean;
  onToggle: () => void;
  onSimilar: () => void;
}) {
  const cacheId = `ks-cache-${doc.id}`;
  const shownUrl = `kiruk.in${doc.url}`;
  return (
    <li className={`ks-item${indent ? " ks-indent" : ""}`}>
      <h2 className="ks-title" style={{ fontWeight: 400 }}>
        <Link href={doc.url}>
          <Highlight text={doc.title} terms={terms} />
        </Link>
      </h2>
      <p className="ks-snippet">
        <Highlight text={snippetFor(doc, terms)} terms={terms} />
      </p>
      <p className="ks-url">
        {shownUrl} - {sizeK(doc)} -{" "}
        <button type="button" className="ks-textbtn" aria-expanded={open} aria-controls={cacheId} onClick={onToggle}>
          Cached
        </button>{" "}
        -{" "}
        <button type="button" className="ks-textbtn" onClick={onSimilar}>
          Similar pages
        </button>
      </p>
      {open ? (
        <section id={cacheId} className="ks-cache" aria-label={`Cached copy of ${doc.title}`}>
          <div className="ks-cache-head">
            <p>
              Kiruk&rsquo;s cached copy of <b>{shownUrl}</b>: the page text as indexed.{" "}
              <Link href={doc.url}>Open the live page</Link>
            </p>
            {terms.length ? (
              <p>
                Highlighted:{" "}
                {terms.map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 ? " " : null}
                    <mark>{t}</mark>
                  </React.Fragment>
                ))}
              </p>
            ) : null}
          </div>
          <div className="ks-cache-body">
            {doc.cached.map((block, i) => {
              if (block.kind === "story") return <EraStoryBox key={i} />;
              if (block.kind === "p")
                return (
                  <p key={i}>
                    <Highlight text={block.text} terms={terms} as="mark" />
                  </p>
                );
              if (block.kind === "links")
                return (
                  <div key={i} className="ks-cache-links">
                    {block.items.map((l) => {
                      const external = l.href.startsWith("http");
                      return (
                        <a
                          key={l.label}
                          href={l.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                        >
                          {l.label}: {l.value}
                        </a>
                      );
                    })}
                  </div>
                );
              return (
                <div key={i}>
                  {block.label ? <p className="ks-cache-label">{block.label}</p> : null}
                  <ul>
                    {block.items.map((item, j) => (
                      <li key={j}>
                        <Highlight text={item} terms={terms} as="mark" />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </li>
  );
}

export default FlashSplashHomePage;
