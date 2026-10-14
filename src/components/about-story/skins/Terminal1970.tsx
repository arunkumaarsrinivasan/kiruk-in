"use client";

/**
 * 1970 · about.walk — the story as a teletype session.
 *
 * Pick: a command line whose flags are the three blanks
 *   $ about --as curious --topic everything --depth skim
 * Play: a little walker crosses the timeline to the next year, then the
 * memory types out. NEXT is the only verb. No holding keys, no failing.
 */

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import { DEPTHS, type Beat, type Depth } from "@/data/about-story";
import type { StorySkinProps } from "../types";
import { DepthSelect, ReadAsText, WhatSelect, WhoSelect, depthName, pathSummary } from "../story-ui";
import { useCanvasFit, useGameLoop } from "../use-game-loop";
import { beatParagraphs, END_LINKS, type Story } from "../use-story";

const G = "#00ff41";
const BRIGHT = "#39ff14";
const DIM = "rgba(0,255,65,0.62)";
const FAINT = "rgba(0,255,65,0.35)";
const TYPE_CPS = 900;

const flag: CSSProperties = {
  fontFamily: "inherit",
  color: "#000",
  background: G,
  padding: "0 0.35em",
  textShadow: "none",
};

function Key({ children, onClick, disabled, strong }: { children: ReactNode; onClick: () => void; disabled?: boolean; strong?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 px-3 text-[18px] uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-30"
      style={{
        fontFamily: "inherit",
        border: `1px solid ${strong ? BRIGHT : DIM}`,
        color: strong ? "#000" : BRIGHT,
        background: strong ? BRIGHT : "transparent",
        textShadow: strong ? "none" : undefined,
        outlineColor: BRIGHT,
      }}
    >
      {children}
    </button>
  );
}

function fileName(b: Beat) {
  return `${b.year}-${b.id}.txt`;
}

function linesFor(b: Beat, depth: Depth): { text: string; tone: "head" | "title" | "body" | "stuck" }[] {
  const out: { text: string; tone: "head" | "title" | "body" | "stuck" }[] = [
    { text: `── ${b.period} · ${b.place} ──`, tone: "head" },
    { text: b.title.toUpperCase(), tone: "title" },
    ...beatParagraphs(b, depth).map((t) => ({ text: t, tone: "body" as const })),
  ];
  if (depth === "deep") out.push({ text: `# what stuck: ${b.stuck}`, tone: "stuck" });
  return out;
}

/** Walker strip: evenly spaced year ticks, the character walks to the current one. */
function Walker({ story }: { story: Story }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const S = useRef({ w: 600, h: 96, x: -1, target: 0, leg: 0, dirty: true, font: "monospace" });
  const { beats, index, reduce } = story;

  const xs = (w: number) => {
    const pad = 28;
    if (beats.length === 1) return [w / 2];
    return beats.map((_, i) => pad + (i * (w - pad * 2)) / (beats.length - 1));
  };

  useCanvasFit(wrapRef, cvRef, (w, h) => {
    S.current.w = w;
    S.current.h = h;
    S.current.dirty = true;
    // The home loads VT323 through next/font under a hashed family name; borrow it.
    if (wrapRef.current) S.current.font = getComputedStyle(wrapRef.current).fontFamily;
  });

  useEffect(() => {
    const s = S.current;
    s.target = index;
    if (s.x < 0 || reduce) s.x = xs(s.w)[index];
    s.dirty = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduce, beats]);

  useGameLoop(wrapRef, (dt) => {
    const s = S.current;
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!ctx) return;
    const pts = xs(s.w);
    const tx = pts[Math.min(s.target, pts.length - 1)] ?? s.w / 2;
    if (s.x < 0) s.x = tx;
    const moving = Math.abs(tx - s.x) > 0.5;
    if (moving) {
      const step = Math.sign(tx - s.x) * Math.min(Math.abs(tx - s.x), 260 * dt);
      s.x += step;
      s.leg += dt * 14;
    }
    if (!moving && !s.dirty) return;
    s.dirty = false;

    const { w, h } = s;
    const gy = h - 22;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = FAINT;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(0, gy + 2);
    ctx.lineTo(w, gy + 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = DIM;
    ctx.beginPath();
    ctx.moveTo(pts[0], gy + 2);
    ctx.lineTo(s.x, gy + 2);
    ctx.stroke();

    const spacing = pts.length > 1 ? pts[1] - pts[0] : w;
    ctx.font = `15px ${s.font}`;
    ctx.textAlign = "center";
    pts.forEach((x, i) => {
      const on = i === s.target;
      const passed = x <= s.x + 1;
      ctx.fillStyle = on ? BRIGHT : passed ? G : FAINT;
      ctx.fillRect(Math.round(x), gy - (on ? 26 : 14), 1, on ? 26 : 14);
      const showLabel = on || i === 0 || i === pts.length - 1 || spacing >= 40 || i % 2 === 0;
      if (showLabel && !(spacing < 26 && !on)) {
        ctx.fillText(String(beats[i].year), x, gy - (on ? 32 : 20));
      }
    });

    // the walker
    const x = Math.round(s.x);
    ctx.fillStyle = BRIGHT;
    ctx.fillRect(x - 5, gy - 16, 10, 12);
    ctx.fillRect(x - 3, gy - 24, 8, 8);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 2, gy - 22, 2, 2);
    ctx.fillStyle = BRIGHT;
    const sw = moving && !reduce ? Math.sin(s.leg) * 4 : 0;
    ctx.fillRect(x - 4, gy - 4, 3, 6 + sw);
    ctx.fillRect(x + 1, gy - 4, 3, 6 - sw);
  });

  return (
    <div ref={wrapRef} className="relative h-24 w-full" aria-hidden>
      <canvas ref={cvRef} className="block" />
    </div>
  );
}

/** The memory, typed out. Click the text (or press Space) to finish typing. */
function Typed({ story }: { story: Story }) {
  const { beat, sel, reduce } = story;
  const lines = useMemo(() => linesFor(beat, sel.depth), [beat, sel.depth]);
  const total = useMemo(() => lines.reduce((n, l) => n + l.text.length, 0), [lines]);
  const refs = useRef<(HTMLParagraphElement | null)[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const shown = useRef(0);

  const paint = (n: number) => {
    let left = n;
    lines.forEach((l, i) => {
      const el = refs.current[i];
      if (!el) return;
      el.textContent = l.text.slice(0, Math.max(0, left));
      left -= l.text.length;
    });
  };

  useEffect(() => {
    shown.current = reduce ? total : 0;
    paint(shown.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, reduce, total]);

  useGameLoop(boxRef, (dt) => {
    if (shown.current >= total) return;
    shown.current = Math.min(total, shown.current + dt * TYPE_CPS);
    paint(Math.floor(shown.current));
  });

  const finish = () => {
    shown.current = total;
    paint(total);
  };

  const color = { head: DIM, title: BRIGHT, body: G, stuck: DIM } as const;

  return (
    <div ref={boxRef} onClick={finish} className="flex min-h-[220px] cursor-text flex-col gap-2">
      <p style={{ color: DIM }}>
        kiruk@1970:~$ cat {fileName(beat)}
      </p>
      <div aria-hidden className="flex flex-col gap-2">
        {lines.map((l, i) => (
          <p
            key={`${beat.id}-${i}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={l.tone === "title" ? "text-[26px] leading-tight" : "max-w-[62ch] text-[19px] leading-snug"}
            style={{ color: color[l.tone], minHeight: "1em" }}
          />
        ))}
      </div>
      <div className="sr-only" aria-live="polite">
        {lines.map((l) => l.text).join(" ")}
      </div>
    </div>
  );
}

export function Terminal1970({ story }: StorySkinProps) {
  const { stage, index, beats, sel } = story;

  return (
    <div
      className="relative w-full select-text"
      style={{ background: "#000", border: `2px solid ${DIM}`, color: G }}
      onKeyDown={story.onKeyDown}
    >
      <div
        className="flex items-center justify-between gap-3 px-3 py-1.5 text-[14px] uppercase tracking-[0.16em]"
        style={{ color: DIM, borderBottom: `1px solid ${DIM}` }}
      >
        <span style={{ color: BRIGHT }}>⊳ ABOUT.walk</span>
        <span className="truncate">
          {stage === "play" ? `${index + 1}/${beats.length} · ← → or NEXT` : "the subject, in his own words"}
        </span>
      </div>

      <div className="min-h-[460px] px-4 py-4 text-[19px] leading-snug sm:px-5">
        {story.textMode ? (
          <ReadAsText story={story} onBack={() => story.setTextMode(false)} backLabel="[ back to the walk ]" />
        ) : stage === "pick" ? (
          <div className="flex min-h-[420px] flex-col justify-center gap-4">
            <p style={{ color: DIM }}># who is arun? tell the terminal who&rsquo;s asking.</p>
            <p className="text-[21px] leading-relaxed sm:text-[23px]">
              <span style={{ color: DIM }}>kiruk@1970:~$ </span>
              about <span className="whitespace-nowrap">--as <WhoSelect story={story} style={flag} /></span>{" "}
              <span className="whitespace-nowrap">--topic <WhatSelect story={story} style={flag} /></span>{" "}
              <span className="whitespace-nowrap">--depth <DepthSelect story={story} style={flag} /></span>
              <span className="ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] animate-pulse" style={{ background: BRIGHT }} aria-hidden />
            </p>
            <p style={{ color: DIM }}># {pathSummary(story)}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Key strong onClick={story.start}>
                Run ⏎
              </Key>
              <Key onClick={() => story.setTextMode(true)}>Print as text</Key>
            </div>
          </div>
        ) : stage === "play" ? (
          <div className="flex flex-col gap-3">
            <Walker story={story} />
            <Typed story={story} />
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2" style={{ borderTop: `1px dashed ${FAINT}` }}>
              <button type="button" onClick={story.pick} className="min-h-11 text-[17px] uppercase" style={{ color: DIM, fontFamily: "inherit" }}>
                [esc] new query
              </button>
              <div className="flex gap-3">
                <Key onClick={story.prev} disabled={index === 0}>
                  ← Prev
                </Key>
                <Key strong onClick={story.next}>
                  {index === beats.length - 1 ? "End ⏎" : "Next →"}
                </Key>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[420px] flex-col justify-center gap-4">
            <p style={{ color: DIM }}>kiruk@1970:~$ echo $?</p>
            <p className="text-[26px]" style={{ color: BRIGHT }}>
              0 · that was {depthName(story)}, {beats.length} moments about {story.whatLabel}.
            </p>
            <div className="flex flex-wrap gap-3">
              {story.deeper && (
                <Key strong onClick={story.deeper}>
                  Go deeper: {DEPTHS[DEPTHS.findIndex((d) => d.id === sel.depth) + 1].label}
                </Key>
              )}
              <Key onClick={story.pick}>New query</Key>
            </div>
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-[18px]" style={{ color: DIM }}>
              {END_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="underline underline-offset-4" style={{ color: G }}>
                  {l.label}
                </a>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
