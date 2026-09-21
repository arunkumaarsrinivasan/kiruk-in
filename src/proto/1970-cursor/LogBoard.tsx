"use client";

import { useEffect, useRef, useState } from "react";
import { EraGlass } from "@/proto/1970-blog/EraGlass";
import { filterPosts, type ProtoPost } from "@/proto/1970-blog/data";
import { bindHover, releaseGaze } from "./field";
import { GazeHit, GazeSync, GazeTitle, Pix } from "./GazeTitle";
import { markFor } from "./marks";
import { PixelField } from "./PixelField";

const BANNER = [
  " ██╗  ██╗██╗██████╗ ██╗   ██╗██╗  ██╗",
  " ██║ ██╔╝██║██╔══██╗██║   ██║██║ ██╔╝",
  " █████╔╝ ██║██████╔╝██║   ██║█████╔╝ ",
  " ██╔═██╗ ██║██╔══██╗██║   ██║██╔═██╗ ",
  " ██║  ██╗██║██║  ██║╚██████╔╝██║  ██╗",
  " ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝",
];

const ARUN = [
  " █████╗ ██████╗ ██╗   ██╗███╗   ██╗",
  "██╔══██╗██╔══██╗██║   ██║████╗  ██║",
  "███████║██████╔╝██║   ██║██╔██╗ ██║",
  "██╔══██║██╔══██╗██║   ██║██║╚██╗██║",
  "██║  ██║██║  ██║╚██████╔╝██║ ╚████║",
  "╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dateYear(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function LogBoard({ posts }: { posts: ProtoPost[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [focus, setFocus] = useState(0);
  const list = filterPosts(posts, query);
  const post = posts.find((item) => item.slug === open) ?? null;
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    setFocus(0);
  }, [query, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (e.key === "Escape") {
        setOpen(null);
        return;
      }
      if (open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocus((i) => {
          const n = Math.min(list.length - 1, i + 1);
          queueMicrotask(() => bindHover(rowRefs.current[n], titleRefs.current[n]));
          return n;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocus((i) => {
          const n = Math.max(0, i - 1);
          queueMicrotask(() => bindHover(rowRefs.current[n], titleRefs.current[n]));
          return n;
        });
      } else if (e.key === "Enter") {
        const item = list[focus];
        if (item) setOpen(item.slug);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list, open, focus]);

  useEffect(() => {
    if (open) releaseGaze();
  }, [open]);

  const openMark = post ? markFor(post) : null;

  return (
    <div className="skin-log skin-dock">
      <PixelField mode="dock" />
      <GazeSync mode="dock" />
      <EraGlass>
        <header className="era-tty">
          <span data-zone="tty">notebook</span>
          <span className="hidden sm:inline" data-zone="tty">
            bangalore
          </span>
          <span data-zone="tty">public writing</span>
        </header>
        <div className="era-col era-col-vt era-col-wide">
          {post && openMark ? (
            <article>
              <button type="button" className="era-back" data-zone="back" onClick={() => setOpen(null)}>
                ← all pages
              </button>
              <div className="era-article-head">
                <GazeHit as="div" className="gaze-h1-hit" regular={openMark.regular} solid={openMark.solid}>
                  <div className="era-record-copy">
                    <h1 className="era-blog-title era-h1">
                      <GazeTitle className="gaze-h1">{post.title}</GazeTitle>
                    </h1>
                    {post.excerpt ? <p className="era-lede">{post.excerpt}</p> : null}
                  </div>
                </GazeHit>
                <p className="era-record-meta">
                  <time dateTime={post.date}>{dateYear(post.date)}</time>
                </p>
              </div>
              <div className="era-prose">
                {post.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </article>
          ) : (
            <>
              <div className="era-banner-hit" data-zone="banner">
                <pre className="era-banner era-banner-kiruk" aria-label="KIRUK">
                  {BANNER.join("\n")}
                </pre>
                <pre className="era-banner era-banner-arun" aria-hidden>
                  {ARUN.join("\n")}
                </pre>
              </div>
              <div className="era-toolbar">
                <p className="era-kicker" data-zone="kicker">
                  Notebook
                </p>
                <form className="era-search era-search-row" role="search" onSubmit={(e) => e.preventDefault()}>
                  <div className="era-search-field">
                    <label htmlFor="cur-q">Search</label>
                    <div className="era-search-shell" data-zone="search">
                      <span className="era-search-mark" aria-hidden>
                        <Pix file="regular/search.svg" size={18} className="gaze-pix gaze-pix-lo" />
                        <Pix file="solid/search-solid.svg" size={18} className="gaze-pix gaze-pix-hi" />
                      </span>
                      <input
                        id="cur-q"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setFocus(0);
                        }}
                        placeholder="Find a word"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </form>
              </div>
              {list.length === 0 ? (
                <p className="era-dim era-gap">Nothing matches that word.</p>
              ) : (
                <ol className="era-records">
                  {list.map((item, i) => {
                    const mark = markFor(item);
                    return (
                      <li key={item.slug}>
                        <button
                          type="button"
                          className="era-record"
                          data-mark={i === focus ? "true" : undefined}
                          ref={(el) => {
                            rowRefs.current[i] = el;
                          }}
                          onClick={() => setOpen(item.slug)}
                          onFocus={(e) => {
                            setFocus(i);
                            bindHover(e.currentTarget, titleRefs.current[i]);
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
                                {item.title}
                              </GazeTitle>
                              {item.excerpt ? <span className="era-dim era-excerpt">{item.excerpt}</span> : null}
                            </span>
                          </GazeHit>
                          <span className="era-record-meta">
                            <time dateTime={item.date}>{dateYear(item.date)}</time>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </>
          )}
        </div>
      </EraGlass>
    </div>
  );
}
