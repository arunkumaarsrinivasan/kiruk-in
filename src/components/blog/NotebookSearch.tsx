"use client";

import { DEFAULT_NOTEBOOK_ERA, withNotebookEraHref } from "@/lib/notebook";
import { useNotebookEraOptional } from "@/components/notebook/NotebookEraContext";
import { NotebookLink } from "@/components/notebook/NotebookLink";

export function NotebookSearch({
  query,
  terminal = false,
  prompt = "grep",
}: {
  query: string;
  terminal?: boolean;
  prompt?: "grep" | "find";
}) {
  const eraId = useNotebookEraOptional()?.eraId ?? DEFAULT_NOTEBOOK_ERA;

  return (
    <form
      action="/notebook"
      method="get"
      className={prompt === "find" ? "mb-4 mt-1" : "mt-8"}
      role="search"
    >
      <input type="hidden" name="era" value={eraId} />
      <label htmlFor="notebook-q" className="sr-only">
        Search the notebook
      </label>
      {terminal ? (
        <p className={`flex items-baseline gap-2 ${prompt === "find" ? "" : "mt-10"}`}>
          <span style={{ color: "var(--text-muted)" }}>
            {prompt === "find" ? "FIND" : "$ grep -i"}
          </span>
          <input
            id="notebook-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={prompt === "find" ? "a word in this file" : "pattern"}
            className="min-w-0 flex-1 bg-transparent py-1 text-lg outline-none"
            style={{
              color: "var(--text-main)",
              fontFamily: "inherit",
              caretColor: "var(--accent-color)",
              borderBottom:
                prompt === "find"
                  ? "1px solid color-mix(in srgb, var(--border-color) 28%, transparent)"
                  : undefined,
            }}
          />
        </p>
      ) : (
        <input
          id="notebook-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Find a page…"
          className="w-full border-b bg-transparent py-2 text-lg outline-none"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--text-main)",
            fontFamily: "inherit",
          }}
        />
      )}
      {query ? (
        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
          {terminal ? `showing matches for ${JSON.stringify(query)} · ` : `Showing matches for “${query}” `}
          <NotebookLink
            href={withNotebookEraHref("/notebook", eraId)}
            className="underline decoration-dotted underline-offset-4"
          >
            {terminal ? "clear" : "clear"}
          </NotebookLink>
        </p>
      ) : null}
    </form>
  );
}
