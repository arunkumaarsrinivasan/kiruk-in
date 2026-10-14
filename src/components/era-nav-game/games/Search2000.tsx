"use client";

/**
 * 2000 · The Search Box
 * Navigation method: search. A single box over a results list of the site's
 * destinations; typing filters instantly, Enter opens the top result, a tap
 * on any result opens it. The rows are plain links, so it works untouched.
 */

import React, { useRef, useState } from "react";
import Link from "next/link";
import type { EraNavGameProps } from "../types";

const BLURB: Record<string, string> = {
  "/": "The search page.",
  "/work": "Selected projects.",
  "/notebook": "Notebook and essays.",
  "/#about": "Story and background.",
  "/contact": "Ways to get in touch.",
};

const LETTERS: [string, string][] = [
  ["K", "#1637F2"],
  ["i", "#F2055C"],
  ["r", "#F2A71B"],
  ["u", "#1637F2"],
  ["k", "#BF0B80"],
];

export const Search2000: React.FC<EraNavGameProps> = ({ dests, activeHref, onNavigate }) => {
  const [q, setQ] = useState("");
  const firstRef = useRef<HTMLAnchorElement>(null);
  const needle = q.trim().toLowerCase();
  const rows = dests.filter(
    (d) =>
      !needle ||
      d.label.toLowerCase().includes(needle) ||
      d.href.includes(needle) ||
      (BLURB[d.href] ?? "").toLowerCase().includes(needle),
  );
  const isActive = (href: string) => activeHref === href || (href !== "/" && activeHref.startsWith(href));

  return (
    <div
      className="flex h-full flex-col gap-4 px-5 py-5"
      style={{ background: "#fff", color: "#000", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13 }}
    >
      <form
        role="search"
        className="flex items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          firstRef.current?.click();
        }}
      >
        <span
          aria-hidden
          style={{ fontFamily: '"Times New Roman", Times, Georgia, serif', fontWeight: 700, fontSize: 26, lineHeight: 1 }}
        >
          {LETTERS.map(([ch, color], i) => (
            <span key={i} style={{ color }}>
              {ch}
            </span>
          ))}
        </span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search the site menu"
          enterKeyHint="go"
          autoComplete="off"
          spellCheck={false}
          className="h-11 min-w-0 flex-1 px-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-0"
          style={{
            fontSize: 16,
            border: "1px solid #a8a8a8",
            borderTopColor: "#7a7a7a",
            borderLeftColor: "#7a7a7a",
            borderRadius: 0,
            outlineColor: "#0000cc",
          }}
        />
      </form>

      <p className="px-2 py-1" style={{ background: "#eef3fb", borderTop: "1px solid #c9d7f1" }} aria-live="polite">
        {rows.length > 0 ? `${rows.length} of ${dests.length} pages` : `No pages match ${q.trim()}`}
      </p>

      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {rows.map((d, i) => (
          <li key={d.href}>
            <Link
              ref={i === 0 ? firstRef : undefined}
              href={d.href}
              aria-current={isActive(d.href) ? "page" : undefined}
              onClick={() => onNavigate(d.href)}
              className="block py-2.5 no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: "#0000cc", touchAction: "manipulation" }}
            >
              <span className="block underline" style={{ color: "#0000cc", fontSize: 16 }}>
                {d.label}
              </span>
              <span className="block" style={{ color: "#000" }}>
                {BLURB[d.href] ?? ""}
              </span>
              <span className="block" style={{ color: "#008000" }}>
                kiruk.in{d.href === "/" ? "/" : d.href}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
