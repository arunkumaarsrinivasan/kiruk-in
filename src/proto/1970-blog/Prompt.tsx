"use client";

import { useMemo, useState } from "react";
import { EraGlass } from "./EraGlass";
import { PhosphorCursor } from "./PhosphorCursor";
import { filterPosts, type ProtoPost } from "./data";
import { ArticleView, useListNav } from "./reading";

const BANNER = [
  "  __     _______  ______     ______ ",
  " /_ |   / ____ \\ |____  |   / __  / ",
  "  | |   | (__) |     / /   / / / /  ",
  "  | |   |  __  |    / /   / / / /   ",
  "  | |   | |  | |   / /   / /_/ /    ",
  "  |_|   |_|  |_|  /_/   /_____/     ",
];

export function Prompt({ posts }: { posts: ProtoPost[] }) {
  const [cmd, setCmd] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [focus, setFocus] = useState(0);
  const [echo, setEcho] = useState<string[]>([]);
  const list = useMemo(() => filterPosts(posts, query), [posts, query]);
  const post = posts.find((item) => item.slug === open) ?? null;
  useListNav(list, open, setOpen, focus, setFocus);

  const run = (rawLine?: string) => {
    const raw = (rawLine ?? cmd).trim();
    const upper = raw.toUpperCase();
    if (!raw || upper === "LS" || upper === "LIST") {
      setOpen(null);
      setQuery("");
      setEcho((h) => [...h, `$ ${raw || "ls"}`, `${posts.length} files`]);
      setCmd("");
      return;
    }
    if (upper === "BACK" || upper === "CD ..") {
      setOpen(null);
      setEcho((h) => [...h, `$ ${raw}`]);
      setCmd("");
      return;
    }
    if (upper === "HELP") {
      setEcho((h) => [...h, `$ help`, "ls · open 3 · grep phosphor · back"]);
      setCmd("");
      return;
    }
    const find = raw.match(/^(GREP|FIND)\s+(.+)/i);
    if (find) {
      setQuery(find[2]);
      setOpen(null);
      setEcho((h) => [...h, `$ grep -i ${find[2]}`]);
      setCmd("");
      return;
    }
    const openMatch = raw.match(/^(OPEN|CAT|MORE|MAN)?\s*(\d+)$/i);
    if (openMatch) {
      const n = parseInt(openMatch[2], 10);
      const item = list[n - 1];
      if (item) {
        setOpen(item.slug);
        setEcho((h) => [...h, `$ man ${item.slug}`]);
      } else {
        setEcho((h) => [...h, `$ ${raw}`, `notebook: no file ${n}`]);
      }
      setCmd("");
    }
  };

  return (
    <div className="skin-prompt">
      <PhosphorCursor />
      <EraGlass>
        <header className="era-tty">
          <span>tty1 · era-machine</span>
          <span style={{ color: "var(--accent-color)" }}>1970</span>
          <span>notebook</span>
        </header>
        <div className="era-col era-col-vt era-col-prompt">
          {post ? (
            <ArticleView post={post} onBack={() => setOpen(null)} backLabel="$ ls" />
          ) : (
            <>
              <pre className="era-banner era-banner-sm" aria-hidden>
                {BANNER.join("\n")}
              </pre>
              <p className="era-dim">
                KIRUK NOTEBOOK(1) · 80 COL · type a command, or point at a file
              </p>
              <p className="era-dim era-gap">
                {query ? `$ grep -i ${JSON.stringify(query)}` : "$ ls ~/notebook"} · {list.length} files
              </p>
              {list.length === 0 ? (
                <p className="era-dim">grep: no matches. try ls</p>
              ) : (
                <ol className="era-prompt-ls">
                  {list.map((item, i) => (
                    <li key={item.slug}>
                      <button
                        type="button"
                        className="era-prompt-row"
                        data-mark={i === focus ? "true" : undefined}
                        onClick={() => setOpen(item.slug)}
                        onMouseEnter={() => setFocus(i)}
                        onFocus={() => setFocus(i)}
                      >
                        <span className="era-dim era-num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="era-file">
                          {item.title}
                          {i === focus ? <span className="era-caret" aria-hidden /> : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
              {echo.length > 0 ? (
                <div className="era-echo" aria-live="polite">
                  {echo.slice(-6).map((line, i) => (
                    <p key={`${line}-${i}`} className="era-dim">
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
        <form
          className="era-prompt"
          onSubmit={(e) => {
            e.preventDefault();
            const field = e.currentTarget.querySelector("input");
            run(field?.value ?? cmd);
          }}
        >
          <label htmlFor="prompt-cmd" className="era-prompt-ps">
            era@1970:<span>~/notebook</span>$
          </label>
          <input
            id="prompt-cmd"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              run(e.currentTarget.value);
            }}
            autoComplete="off"
            spellCheck={false}
            placeholder="open 3"
          />
        </form>
      </EraGlass>
    </div>
  );
}
