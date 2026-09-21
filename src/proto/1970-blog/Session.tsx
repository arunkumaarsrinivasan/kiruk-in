"use client";

import { useMemo, useState } from "react";
import { EraGlass } from "./EraGlass";
import { PhosphorCursor } from "./PhosphorCursor";
import { filterPosts, type ProtoPost } from "./data";
import { ArticleView, useListNav } from "./reading";

export function Session({ posts }: { posts: ProtoPost[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [focus, setFocus] = useState(0);
  const list = useMemo(() => filterPosts(posts, query), [posts, query]);
  const post = posts.find((item) => item.slug === open) ?? null;
  useListNav(list, open, setOpen, focus, setFocus);

  return (
    <div className="skin-session">
      <PhosphorCursor />
      <EraGlass>
        <header className="era-tty">
          <span>tty1 · kiruk@1970 · notebook</span>
          <span className="hidden sm:inline">phosphor & ascii</span>
          <button type="button" onClick={() => setOpen(null)}>
            {post ? "ls ~/notebook" : "logged in"}
          </button>
        </header>
        <div className="era-col">
          {post ? (
            <ArticleView post={post} onBack={() => setOpen(null)} backLabel="$ ls ~/notebook" showCover />
          ) : (
            <>
              <p className="era-dim">last login: on tty1 · kiruk@1970</p>
              <p>kiruk@1970:~/notebook</p>
              <p className="era-dim era-gap">These files were written later. You are reading them on this machine.</p>
              <p className="era-dim era-gap">
                {query ? `$ grep -i ${JSON.stringify(query)} ~/notebook` : "$ ls -lt ~/notebook"}
              </p>
              {list.length === 0 ? (
                <p className="era-dim">grep: no matches. Try a shorter pattern, or clear.</p>
              ) : (
                <>
                  <p className="era-dim era-total">total {list.length}</p>
                  <ol className="era-ls">
                    {list.map((item, i) => (
                      <li key={item.slug}>
                        <button
                          type="button"
                          className="era-ls-row"
                          data-mark={i === focus ? "true" : undefined}
                          onClick={() => setOpen(item.slug)}
                          onMouseEnter={() => setFocus(i)}
                          onFocus={() => setFocus(i)}
                        >
                          <span className="era-dim">-rw-</span>
                          <span className="era-dim">{item.kind === "essay" ? "essay" : "seed"}</span>
                          <span className="era-dim era-num">{item.lsDate}</span>
                          <span>
                            <span className="era-file">
                              {item.title}
                              {i === focus ? <span className="era-caret" aria-hidden /> : null}
                            </span>
                            <span className="era-dim era-excerpt">
                              {item.slug}.md{item.excerpt ? ` — ${item.excerpt}` : ""}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </>
              )}
              <form className="era-search" role="search" onSubmit={(e) => e.preventDefault()}>
                <span className="era-dim">$ grep -i</span>
                <label htmlFor="sess-q" className="sr-only">
                  Search the notebook
                </label>
                <input
                  id="sess-q"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setFocus(0);
                  }}
                  placeholder="pattern"
                  autoComplete="off"
                />
              </form>
            </>
          )}
        </div>
      </EraGlass>
    </div>
  );
}
