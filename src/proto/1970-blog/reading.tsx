"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { ProtoPost } from "./data";

export function useListNav(
  list: ProtoPost[],
  open: string | null,
  setOpen: (slug: string | null) => void,
  focus: number,
  setFocus: (n: number | ((i: number) => number)) => void,
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === "Escape") {
        setOpen(null);
        return;
      }
      if (open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocus((i) => Math.min(list.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocus((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        const item = list[focus];
        if (item) setOpen(item.slug);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list, open, focus, setOpen, setFocus]);
}

export function ManLabel({ children }: { children: string }) {
  return <p className="era-label">{children}</p>;
}

export function ArticleView({
  post,
  onBack,
  backLabel,
  showCover,
}: {
  post: ProtoPost;
  onBack: () => void;
  backLabel: string;
  showCover?: boolean;
}) {
  return (
    <article>
      <button type="button" className="era-back" onClick={onBack}>
        {backLabel}
      </button>
      <p className="era-man-edge">
        <span>NOTEBOOK(1)</span>
        <span>KIRUKULAM · 1970</span>
        <span className="hidden sm:inline">NOTEBOOK(1)</span>
      </p>
      {post.kind === "seed" ? <ManLabel>SEEDLING</ManLabel> : null}
      <ManLabel>NAME</ManLabel>
      <h1 className="era-blog-title era-h1">{post.title}</h1>
      <ManLabel>SYNOPSIS</ManLabel>
      <p className="era-dim">
        cat ~/notebook/{post.slug}.md · {post.lsDate} · {post.minutes}
      </p>
      {showCover && post.cover ? (
        <>
          <ManLabel>FIGURE</ManLabel>
          <div className="era-cover">
            <Image src={post.cover} alt="" fill sizes="672px" />
          </div>
        </>
      ) : null}
      <ManLabel>DESCRIPTION</ManLabel>
      {post.excerpt ? <p className="era-lede">{post.excerpt}</p> : null}
      <div className="era-prose">
        {post.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  );
}
