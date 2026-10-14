"use client";

/**
 * 2000 · The Search Box — wordmark, term highlighting and the page styles.
 * Period-plain on purpose: Arial, blue underlined links, green URLs, a pale
 * blue results bar, no motion, no shadows.
 */

import React from "react";

/** Kiruk brand colours, one per letter (from the brand eye). */
export const BRAND = { blue: "#1637F2", pink: "#F2055C", orange: "#F2A71B", plum: "#BF0B80" } as const;
const LETTERS: [string, string][] = [
  ["K", BRAND.blue],
  ["i", BRAND.pink],
  ["r", BRAND.orange],
  ["u", BRAND.blue],
  ["k", BRAND.plum],
];

export function Wordmark({ size = "large" }: { size?: "large" | "small" }) {
  return (
    <span className={`ks-mark ks-mark-${size}`}>
      <span className="sr-only">Kiruk</span>
      {LETTERS.map(([ch, color], i) => (
        <span key={i} aria-hidden style={{ color }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/** "Kiiiiruk ›" — one i per results page. */
export function PagerMark({
  pages,
  current,
  onPage,
}: {
  pages: number;
  current: number;
  onPage: (page: number) => void;
}) {
  return (
    <nav className="ks-pager" aria-label="Result pages">
      <div className="ks-pager-col">
        <span className="ks-pager-letter" style={{ color: BRAND.blue }} aria-hidden>
          K
        </span>
        {current > 1 ? (
          <button type="button" className="ks-pager-link" onClick={() => onPage(current - 1)}>
            ‹ Previous
          </button>
        ) : null}
      </div>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <div key={n} className="ks-pager-col">
          <span className="ks-pager-letter" style={{ color: BRAND.pink }} aria-hidden>
            i
          </span>
          {n === current ? (
            <span className="ks-pager-current" aria-current="page">
              {n}
            </span>
          ) : (
            <button type="button" className="ks-pager-link" onClick={() => onPage(n)} aria-label={`Page ${n}`}>
              {n}
            </button>
          )}
        </div>
      ))}
      <div className="ks-pager-col">
        <span className="ks-pager-letter" aria-hidden>
          <span style={{ color: BRAND.orange }}>r</span>
          <span style={{ color: BRAND.blue }}>u</span>
          <span style={{ color: BRAND.plum }}>k</span>
          {current < pages ? <span style={{ color: BRAND.blue }}> ›</span> : null}
        </span>
        {current < pages ? (
          <button type="button" className="ks-pager-link" onClick={() => onPage(current + 1)}>
            Next
          </button>
        ) : null}
      </div>
    </nav>
  );
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps words starting with a query term: <b> in results, <mark> in cached pages. */
export function Highlight({ text, terms, as = "b" }: { text: string; terms: string[]; as?: "b" | "mark" }) {
  if (terms.length === 0) return <>{text}</>;
  const re = new RegExp(`(\\b(?:${terms.map(escape).join("|")})[\\w.+#-]*)`, "gi");
  const parts = text.split(re);
  const Tag = as;
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <Tag key={i}>{part}</Tag> : <React.Fragment key={i}>{part}</React.Fragment>))}
    </>
  );
}

export const SEARCH_CSS = `
.ks-root{
  --ks-ink:var(--text-main,#000);
  --ks-muted:var(--text-muted,#676767);
  --ks-rule:var(--border-color,#c9d7f1);
  --ks-bar:#eef3fb;
  --ks-link:var(--accent-color,#0000cc);
  --ks-visited:#551a8b;
  --ks-url:#008000;
  --era-radius:0px;
  min-height:100dvh;overflow-x:clip;
  padding:calc(var(--simple-game-nav-bottom,56px) + 16px) 16px calc(var(--eye-lid-bottom,58px) + 32px);
  background:var(--bg-main,#fff);color:var(--ks-ink);
  font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;
}
.ks-root a{color:var(--ks-link)}
.ks-root a:visited{color:var(--ks-visited)}
.ks-root a,.ks-root button{touch-action:manipulation}
.ks-root :focus-visible{outline:2px solid var(--ks-link);outline-offset:2px}
:where(.ks-root) :is(p,h1,h2,h3,ul,ol){margin:0}
:where(.ks-root) :is(ul,ol){list-style:none;padding:0}
.ks-root b{font-weight:700}
.ks-root mark{background:#ffff66;color:inherit;padding:0 1px}

.ks-mark{display:inline-flex;font-family:"Times New Roman",Times,Georgia,serif;font-weight:700;line-height:1;letter-spacing:-.01em}
.ks-mark-large{font-size:clamp(64px,18vw,96px)}
.ks-mark-small{font-size:32px}

.ks-btn{min-height:32px;padding:0 12px;border:1px solid #a8a8a8;border-top-color:#d8d8d8;border-left-color:#d8d8d8;background:#efefef;color:#000;font:13px Arial,Helvetica,sans-serif;cursor:pointer}
.ks-btn:active{border-color:#a8a8a8;border-bottom-color:#d8d8d8;border-right-color:#d8d8d8;background:#e4e4e4}
.ks-input{width:100%;height:34px;padding:0 6px;border:1px solid #a8a8a8;border-top-color:#7a7a7a;border-left-color:#7a7a7a;border-radius:0;background:#fff;color:#000;font:16px Arial,Helvetica,sans-serif}
.ks-input:focus-visible{outline-offset:0}
.ks-textbtn{padding:12px 2px;margin:-12px 0;border:0;background:none;color:var(--ks-link);font:inherit;text-decoration:underline;cursor:pointer}
@media (pointer:coarse){.ks-btn{min-height:44px}.ks-input{height:44px}}

/* Home */
.ks-home{display:grid;justify-items:center;gap:22px;max-width:560px;margin:clamp(24px,10vh,96px) auto 0;text-align:center}
.ks-home h1{font-weight:400}
.ks-form{display:grid;gap:14px;width:100%;justify-items:center}
.ks-form .ks-input{max-width:480px}
.ks-buttons{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.ks-try{color:var(--ks-muted)}
.ks-try button{padding:12px 3px;margin:-12px 0}
.ks-links{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 0}
.ks-links li+li::before{content:"·";padding:0 8px;color:var(--ks-muted)}
.ks-links a{display:inline-block;padding:12px 2px;margin:-12px 0}
.ks-foot{margin-top:18px;font-size:11px;color:var(--ks-muted)}

/* Results */
.ks-results{max-width:1000px;margin:0 auto}
.ks-head{display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;padding-bottom:14px}
.ks-head a.ks-home-link{text-decoration:none}
.ks-head .ks-form{display:flex;flex-wrap:wrap;gap:8px;flex:1 1 360px;max-width:600px;justify-items:start}
.ks-head .ks-input{flex:1 1 220px;max-width:none}
.ks-bar{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;padding:4px 8px;border-top:1px solid var(--ks-rule);background:var(--ks-bar)}
.ks-bar b:first-child{font-size:15px}
.ks-col{max-width:600px;padding-top:12px}
.ks-dym{margin:6px 0 14px;color:#cc0000}
.ks-dym button{color:var(--ks-link);font-style:italic;font-weight:700}
.ks-list{display:grid;gap:18px}
.ks-item.ks-indent{margin-left:40px}
.ks-title{font-size:16px}
.ks-snippet{margin-top:2px;overflow-wrap:anywhere}
.ks-url{color:var(--ks-url);overflow-wrap:anywhere}
.ks-url .ks-textbtn{color:#7777cc}
.ks-cache{margin-top:10px;border:1px solid var(--ks-rule)}
.ks-cache-head{display:grid;gap:4px;padding:8px 10px;border-bottom:1px solid var(--ks-rule);background:var(--ks-bar);font-size:12px}
.ks-cache-body{display:grid;gap:12px;padding:12px 12px 14px}
.ks-cache-body ul{display:grid;gap:4px;padding-left:18px;list-style:square}
.ks-cache-label{font-weight:700}
.ks-cache-links{display:grid;gap:2px}
.ks-cache-links a{display:inline-block;padding:10px 0}
.ks-empty{display:grid;gap:10px;padding-top:6px}
.ks-pager{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:center;margin:34px 0 0;max-width:600px}
.ks-pager-col{display:grid;justify-items:center;gap:4px;min-width:22px}
.ks-pager-letter{font-family:"Times New Roman",Times,Georgia,serif;font-weight:700;font-size:30px;line-height:1}
.ks-pager-link{min-height:32px;padding:0 4px;border:0;background:none;color:var(--ks-link);font:13px Arial,Helvetica,sans-serif;text-decoration:underline;cursor:pointer}
.ks-pager-current{min-height:32px;display:inline-flex;align-items:center;padding:0 4px;font-weight:700;color:#cc0000}
@media (pointer:coarse){.ks-pager-link,.ks-pager-current{min-height:44px;min-width:36px}}

@media (max-width:640px){
  .ks-root{padding-left:12px;padding-right:12px}
  .ks-buttons{display:grid;grid-template-columns:1fr 1fr;width:100%}
  .ks-head{flex-direction:column;align-items:stretch}
  .ks-head .ks-form{flex-basis:auto}
  .ks-item.ks-indent{margin-left:16px}
}
`;
