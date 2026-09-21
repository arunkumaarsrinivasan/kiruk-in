"use client";

import { useMemo, useState } from "react";
import { EraGlass } from "./EraGlass";
import { PhosphorCursor } from "./PhosphorCursor";
import { filterPosts, type ProtoPost } from "./data";
import { ArticleView, useListNav } from "./reading";

const BANNER = [
  " ██╗  ██╗██╗██████╗ ██╗   ██╗██╗  ██╗",
  " ██║ ██╔╝██║██╔══██╗██║   ██║██║ ██╔╝",
  " █████╔╝ ██║██████╔╝██║   ██║█████╔╝ ",
  " ██╔═██╗ ██║██╔══██╗██║   ██║██╔═██╗ ",
  " ██║  ██╗██║██║  ██║╚██████╔╝██║  ██╗",
  " ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝",
];

const RULE = "─".repeat(62);

function pad(n: number) {
  return String(n).padStart(4, "0");
}

export function Log({ posts }: { posts: ProtoPost[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [focus, setFocus] = useState(0);
  const list = useMemo(() => filterPosts(posts, query), [posts, query]);
  const post = posts.find((item) => item.slug === open) ?? null;
  useListNav(list, open, setOpen, focus, setFocus);

  return (
    <div className="skin-log">
      <PhosphorCursor />
      <EraGlass>
        <header className="era-tty">
          <span>tty1 · kiruk@1970 · bangalore</span>
          <span className="hidden sm:inline">era 1970 — phosphor & ascii</span>
          <span>notebook log</span>
        </header>
        <div className="era-col era-col-vt">
          {post ? (
            <ArticleView post={post} onBack={() => setOpen(null)} backLabel="← records" showCover />
          ) : (
            <>
              <pre className="era-rule" aria-hidden>
                {"═".repeat(62)}
              </pre>
              <p className="era-dim era-caps">UX RESEARCH FILE / KIRUK.IN · NOTEBOOK</p>
              <p className="era-dim">SUBJECT: public writing · CLASSIFICATION: PUBLIC</p>
              <pre className="era-rule" aria-hidden>
                {"═".repeat(62)}
              </pre>
              <pre className="era-banner" aria-label="KIRUK">
                {BANNER.join("\n")}
              </pre>
              <p className="era-kicker">▌ notebook records ▐</p>
              <form className="era-search" role="search" onSubmit={(e) => e.preventDefault()}>
                <span className="era-dim">FIND</span>
                <label htmlFor="log-q" className="sr-only">
                  Filter records
                </label>
                <input
                  id="log-q"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setFocus(0);
                  }}
                  placeholder="a word in this file"
                  autoComplete="off"
                />
              </form>
              {list.length === 0 ? (
                <p className="era-dim era-gap">No record carries that word.</p>
              ) : (
                <ol className="era-records">
                  {list.map((item, i) => (
                    <li key={item.slug}>
                      <button
                        type="button"
                        className="era-record"
                        data-mark={i === focus ? "true" : undefined}
                        onClick={() => setOpen(item.slug)}
                        onMouseEnter={() => setFocus(i)}
                        onFocus={() => setFocus(i)}
                      >
                        <span className="era-record-stamp">
                          <span className="era-log-field">RECORD {pad(i + 1)}</span>
                          <span aria-hidden>▸</span>
                          <span className="era-file">{item.slug}.md</span>
                          <span className="era-faint">· {item.kind}</span>
                        </span>
                        <span className="era-record-title">{item.title}</span>
                        {item.excerpt ? <span className="era-dim era-excerpt">{item.excerpt}</span> : null}
                        <span className="era-faint era-rule-inline">{RULE}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      </EraGlass>
    </div>
  );
}
