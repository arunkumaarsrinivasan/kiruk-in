"use client";

/**
 * 2013 · Flat — contact as a deck you swipe.
 *
 * 2013 was the year of the swipe: one flat card at a time, a yes or a no
 * decided with a thumb. So the ways to reach me are a deck. Tell me who you
 * are and what you're after, then swipe: right means "yes, this works", left
 * shows the next one. A yes is a match, and the match screen hands you the
 * channel itself: the composer for email, the calendar for a call, a link for
 * the rest. Every card is honest about how it ranks for what you picked.
 *
 * iOS 7 flat: white, hairlines, thin type, one blue. Buttons and arrow keys
 * do everything the thumb does.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue, type PanInfo, type Variants } from "framer-motion";
import { EMAIL, FACTS, INTENTS, WHO, getChannel, type Channel, type ChannelId, type ContactWhoId, type IntentId } from "@/data/contact";
import type { Contact } from "../use-contact";
import type { ContactSkinProps } from "../types";
import { CalEmbed, external, statusLine } from "../contact-ui";

const ACCENT = "var(--accent-color, #007aff)";
const INK = "var(--text-main, #16181f)";
const MUTED = "var(--text-muted, #767b91)";
const HAIR = "var(--border-color, #d9dbe2)";
const CARD = "var(--bg-card, #ffffff)";
const GREEN = "#4cd964";
const RED = "#ff3b30";
const RING = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]";
const RING_IN = "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent-color)]";

/** Flat iOS 7 tints, one per channel. */
const TINT: Record<ChannelId, string> = {
  email: "#007aff",
  call: "#ff9500",
  linkedin: "#5856d6",
  github: "#2c2c34",
  studio: "#ff2d55",
  life: "#4cd964",
  x: "#5ac8fa",
};

const INITIALS = FACTS.name
  .split(" ")
  .slice(0, 2)
  .map((w) => w[0])
  .join("");

type Stage = "setup" | "deck" | "match" | "compose" | "end";

const CARD_EXIT: Variants = {
  out: (dir: number) => ({ x: dir * 560, opacity: 0, transition: { duration: 0.32, ease: [0.3, 0, 0.6, 1] } }),
  gone: { opacity: 0, transition: { duration: 0 } },
};

/* ── glyphs: thin white line art on a flat tile ─────────────────────── */

function Glyph({ id, size }: { id: ChannelId; size: number }) {
  const s = { fill: "none", stroke: "#fff", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const art: Record<ChannelId, ReactNode> = {
    email: (
      <>
        <rect x="4" y="8" width="24" height="16" rx="2" {...s} />
        <path d="M4.5 9l11.5 9 11.5-9" {...s} />
      </>
    ),
    call: (
      <>
        <rect x="5" y="7" width="22" height="20" rx="2" {...s} />
        <path d="M5 12h22M11 4.5v5M21 4.5v5" {...s} />
        <text x="16" y="23.5" textAnchor="middle" fontSize="8.5" fontWeight="300" fill="#fff">
          30
        </text>
      </>
    ),
    linkedin: (
      <>
        <rect x="4" y="11" width="24" height="15" rx="2" {...s} />
        <path d="M12 11V8.5c0-.8.7-1.5 1.5-1.5h5c.8 0 1.5.7 1.5 1.5V11M4 17h24" {...s} />
      </>
    ),
    github: <path d="M11 10l-6 6 6 6M21 10l6 6-6 6M18 7l-4 18" {...s} />,
    studio: (
      <>
        <path d="M7 25l1.5-5.5L21 7l4 4-12.5 12.5z" {...s} />
        <path d="M18.5 9.5l4 4M8.5 19.5l4 4" {...s} />
      </>
    ),
    life: <path d="M4 15l23-9-6 21-5-8zM16 19l11-13M16 19v7l3-4" {...s} />,
    x: <path d="M6 7h20a2.5 2.5 0 0 1 2.5 2.5v10A2.5 2.5 0 0 1 26 22H15l-6 5v-5H6a2.5 2.5 0 0 1-2.5-2.5v-10A2.5 2.5 0 0 1 6 7z" {...s} />,
  };
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      {art[id]}
    </svg>
  );
}

function Tile({ id, size }: { id: ChannelId; size: number }) {
  return (
    <span aria-hidden className="flex shrink-0 items-center justify-center" style={{ width: size, height: size, borderRadius: size * 0.24, background: TINT[id] }}>
      <Glyph id={id} size={size * 0.62} />
    </span>
  );
}

/* ── controls ───────────────────────────────────────────────────────── */

/** iOS 7 segmented control. Native radios underneath, so arrows and screen readers just work. */
function Segments<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  cols,
}: {
  legend: string;
  name: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  cols: 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] uppercase tracking-[0.08em]" style={{ color: MUTED }}>
        {legend}
      </legend>
      <div className={`grid gap-px overflow-hidden rounded-[6px] ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`} style={{ background: ACCENT, border: `1px solid ${ACCENT}` }}>
        {options.map((o, i) => {
          const on = o.id === value;
          const last = cols === 2 && options.length % 2 === 1 && i === options.length - 1;
          return (
            <label
              key={o.id}
              className={`flex min-h-11 cursor-pointer items-center justify-center px-2 py-1.5 text-center text-[14px] leading-tight has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-4 ${last ? "col-span-2" : ""}`}
              style={{ background: on ? ACCENT : CARD, color: on ? "#fff" : ACCENT, outlineColor: on ? "#fff" : ACCENT, transition: "background-color 150ms, color 150ms" }}
            >
              <input type="radio" name={name} value={o.id} checked={on} onChange={() => onChange(o.id)} className="sr-only" />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Primary({ children, onClick, href, disabled }: { children: ReactNode; onClick?: () => void; href?: string; disabled?: boolean }) {
  const cls = `flex min-h-11 w-full items-center justify-center rounded-full px-5 text-[16px] font-normal text-white disabled:opacity-40 ${RING}`;
  return href ? (
    <a href={href} {...external(href)} className={cls} style={{ background: ACCENT }}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} disabled={disabled} className={cls} style={{ background: ACCENT }}>
      {children}
    </button>
  );
}

function TextButton({ children, onClick, muted }: { children: ReactNode; onClick: () => void; muted?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-11 px-2 text-[15px] ${RING}`} style={{ color: muted ? MUTED : ACCENT }}>
      {children}
    </button>
  );
}

/** A heading the flow moves focus to when its screen appears (not on first load). */
function StageTitle({ children, focus, className, style }: { children: ReactNode; focus: boolean; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <h2 ref={ref} tabIndex={-1} className={`outline-none ${className ?? ""}`} style={style}>
      {children}
    </h2>
  );
}

function Badge({ rank, intent }: { rank: number; intent: string }) {
  return rank ? (
    <span className="inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[12px] text-white" style={{ background: ACCENT }}>
      <span className="font-semibold">#{rank}</span> Top pick for {intent}
    </span>
  ) : (
    <span className="self-start rounded-full px-2.5 py-1 text-[12px]" style={{ color: MUTED, border: `1px solid ${HAIR}` }}>
      Also an option
    </span>
  );
}

/* ── the deck ───────────────────────────────────────────────────────── */

function CardFace({ ch, rank, intent, yes, no }: { ch: Channel; rank: number; intent: string; yes: MotionValue<number> | number; no: MotionValue<number> | number }) {
  const stamp = "absolute top-5 rounded-[6px] border-[3px] bg-white/90 px-2 py-0.5 text-[22px] font-semibold tracking-[0.14em]";
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[16px]" style={{ background: CARD, border: `1px solid ${HAIR}`, boxShadow: "0 12px 30px rgba(22,24,31,0.1)" }}>
      <div className="relative flex h-[44%] shrink-0 items-center justify-center" style={{ background: TINT[ch.id] }}>
        <Glyph id={ch.id} size={96} />
        <motion.span aria-hidden className={`${stamp} left-4 -rotate-12`} style={{ opacity: yes, color: GREEN, borderColor: GREEN }}>
          YES
        </motion.span>
        <motion.span aria-hidden className={`${stamp} right-4 rotate-12`} style={{ opacity: no, color: RED, borderColor: RED }}>
          NOPE
        </motion.span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <Badge rank={rank} intent={intent} />
        <h3 className="text-[30px] font-extralight leading-none tracking-tight" style={{ color: INK }}>
          {ch.label}
        </h3>
        <p className="break-all text-[14px]" style={{ color: ACCENT }}>
          {ch.handle}
        </p>
        <p className="text-[15px] font-light leading-snug" style={{ color: INK }}>
          {ch.use}
        </p>
      </div>
    </div>
  );
}

function DeckCard({
  ch,
  depth,
  rank,
  intent,
  enterFrom,
  reduce,
  onDecide,
}: {
  ch: Channel;
  depth: number;
  rank: number;
  intent: string;
  enterFrom: number;
  reduce: boolean;
  onDecide: (yes: boolean) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], reduce ? [0, 0] : [-14, 14]);
  const yes = useTransform(x, [24, 110], [0, 1]);
  const no = useTransform(x, [-110, -24], [1, 0]);
  const top = depth === 0;
  const shown = Math.min(depth, 2);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const go = info.offset.x > 110 || info.velocity.x > 600 ? 1 : info.offset.x < -110 || info.velocity.x < -600 ? -1 : 0;
    if (go) onDecide(go === 1);
    else animate(x, 0, reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30 });
  };

  return (
    <motion.div
      aria-hidden={!top || undefined}
      variants={CARD_EXIT}
      initial={reduce ? false : enterFrom ? { x: enterFrom * 560, opacity: 0, scale: 1, y: 0 } : { scale: 0.86, y: 40, opacity: 0 }}
      animate={{ x: 0, scale: 1 - shown * 0.05, y: shown * 12, opacity: depth > 2 ? 0 : 1 }}
      exit={reduce ? "gone" : "out"}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
      drag={top ? "x" : false}
      dragMomentum={false}
      onDragEnd={top ? onDragEnd : undefined}
      className="absolute inset-0"
      style={{ x, rotate, zIndex: 10 - depth, cursor: top ? "grab" : "default", pointerEvents: top ? "auto" : "none", touchAction: "pan-y" }}
    >
      <CardFace ch={ch} rank={rank} intent={intent} yes={top ? yes : 0} no={top ? no : 0} />
    </motion.div>
  );
}

function RoundButton({ children, onClick, color, label, size = 64, disabled }: { children: ReactNode; onClick: () => void; color: string; label: string; size?: number; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-30 ${RING}`}
      style={{ width: size, height: size, color, background: CARD, border: `1.5px solid ${color}` }}
    >
      {children}
    </button>
  );
}

/* ── composer ───────────────────────────────────────────────────────── */

function Composer({ c, focus, onCancel, onDone }: { c: Contact; focus: boolean; onCancel: () => void; onDone: () => void }) {
  const sending = c.sendState === "sending";
  const missing = [
    !c.name.trim() && "your name",
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.from.trim()) && "an email I can reply to",
    (c.body.trim().length <= 10 || c.body.trim() === c.intent.body.trim()) && "a line of your own",
  ].filter(Boolean) as string[];
  const row = "flex min-h-11 items-center gap-2 px-4";
  const key = "shrink-0 text-[15px] font-light";
  const input = `min-h-11 min-w-0 flex-1 bg-transparent text-[16px] outline-none ${RING_IN}`;
  const first = c.name.trim().split(/\s+/)[0];

  if (c.sendState === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
          <circle cx="36" cy="36" r="34" fill="none" stroke={GREEN} strokeWidth="1.5" />
          <path d="M22 37l10 10 19-21" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <StageTitle focus className="text-[30px] font-extralight tracking-tight" style={{ color: INK }}>
          Sent
        </StageTitle>
        <p role="status" className="max-w-[320px] text-[15px] font-light leading-snug" style={{ color: INK }}>
          Thanks{first ? `, ${first}` : ""}. I&rsquo;ll reply to {c.from} {c.awake ? "soon" : "after sunrise in Bengaluru"}.
        </p>
        <div className="w-full max-w-[240px] pt-2">
          <Primary onClick={onDone}>Done</Primary>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void c.send();
      }}
      className="flex flex-col"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-2" style={{ borderBottom: `1px solid ${HAIR}` }}>
        <span className="justify-self-start">
          <TextButton onClick={onCancel}>Cancel</TextButton>
        </span>
        <StageTitle focus={focus} className="text-[17px] font-medium" style={{ color: INK }}>
          New Message
        </StageTitle>
        <button
          type="submit"
          disabled={!c.ready || sending}
          className={`min-h-11 justify-self-end px-2 text-[16px] font-semibold disabled:font-normal ${RING}`}
          style={{ color: c.ready && !sending ? ACCENT : MUTED }}
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
      <div className="[&>*]:border-b [&>*]:border-[var(--border-color)]">
        <div className={row}>
          <span className={key} style={{ color: MUTED }}>
            To:
          </span>
          <span className="text-[16px]" style={{ color: ACCENT }}>
            Arun Kumaar Sreenivasan
          </span>
        </div>
        <label className={row}>
          <span className={key} style={{ color: MUTED }}>
            From:
          </span>
          <input aria-label="Your name" placeholder="Your name" autoComplete="name" value={c.name} onChange={(e) => c.setName(e.target.value)} className={input} style={{ color: INK }} />
        </label>
        <label className={row}>
          <span className={key} style={{ color: MUTED }}>
            Email:
          </span>
          <input
            aria-label="Your email"
            type="email"
            inputMode="email"
            placeholder="you@email.com"
            autoComplete="email"
            value={c.from}
            onChange={(e) => c.setFrom(e.target.value)}
            className={input}
            style={{ color: INK }}
          />
        </label>
        <label className={row}>
          <span className={key} style={{ color: MUTED }}>
            Subject:
          </span>
          <input aria-label="Subject" value={c.subject} onChange={(e) => c.setSubject(e.target.value)} className={input} style={{ color: INK }} />
        </label>
        <textarea
          aria-label="Your message"
          rows={9}
          value={c.body}
          onChange={(e) => c.setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && c.ready) {
              e.preventDefault();
              void c.send();
            }
          }}
          className={`block w-full resize-y bg-transparent px-4 py-3 text-[16px] font-light leading-relaxed outline-none ${RING_IN}`}
          style={{ color: INK }}
        />
      </div>
      <div className="flex flex-col gap-1 px-4 py-3 text-[14px] font-light" style={{ color: MUTED }}>
        {c.sendState === "error" ? (
          <p role="alert" style={{ color: RED }}>
            {c.sendError} Your words are still here. Try again, or send it from your own mail app.
          </p>
        ) : (
          <p role="status">{missing.length ? `Send lights up once I have ${missing.join(", ")}.` : "Ready when you are."}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4">
          <a href={c.mailto} className={`flex min-h-11 items-center ${RING}`} style={{ color: ACCENT }}>
            Use my own mail app
          </a>
          <TextButton onClick={c.resetDraft} muted>
            Reset draft
          </TextButton>
        </div>
      </div>
    </form>
  );
}

/* ── skin ───────────────────────────────────────────────────────────── */

export function Flat2013({ contact: c }: ContactSkinProps) {
  const [stage, setStage] = useState<Stage>("setup");
  const [moved, setMoved] = useState(false);
  const [idx, setIdx] = useState(0);
  const [history, setHistory] = useState<{ id: ChannelId; yes: boolean }[]>([]);
  const [dir, setDir] = useState(1);
  const [restore, setRestore] = useState<{ id: ChannelId; from: number } | null>(null);
  const [matchId, setMatchId] = useState<ChannelId>("email");
  const [composeBack, setComposeBack] = useState<Stage>("setup");
  const rootRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLElement>(null);
  const timer = useRef(0);

  const deck = c.all;
  const done = idx >= deck.length;
  const matched = new Set(history.filter((h) => h.yes).map((h) => h.id));
  const rank = (id: ChannelId) => c.picks.findIndex((p) => p.id === id) + 1;

  const go = (s: Stage) => {
    window.clearTimeout(timer.current);
    setMoved(true);
    setStage(s);
  };
  const reveal = () => {
    const r = flowRef.current?.getBoundingClientRect();
    if (r && (r.top < 0 || r.top > window.innerHeight * 0.6)) flowRef.current?.scrollIntoView({ block: "start", behavior: c.reduce ? "auto" : "smooth" });
  };
  const restart = () => {
    setIdx(0);
    setHistory([]);
    setRestore(null);
    go("deck");
  };
  const showMatch = (id: ChannelId) => {
    setMatchId(id);
    go("match");
    reveal();
  };
  const compose = (from: Stage) => {
    if (from !== "compose") setComposeBack(from);
    go("compose");
    reveal();
  };

  const decide = (yes: boolean) => {
    const ch = deck[idx];
    if (!ch || stage !== "deck") return;
    setDir(yes ? 1 : -1);
    setRestore(null);
    setHistory((h) => [...h, { id: ch.id, yes }]);
    setIdx(idx + 1);
    if (yes) {
      setMatchId(ch.id);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => go("match"), c.reduce ? 0 : 340);
    }
  };
  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    window.clearTimeout(timer.current);
    setHistory((h) => h.slice(0, -1));
    setIdx((i) => Math.max(0, i - 1));
    setRestore({ id: last.id, from: last.yes ? 1 : -1 });
    if (stage !== "deck") go("deck");
  };

  // Arrow keys swipe while the deck is up, as long as focus is on this page and not in a field.
  const keys = useRef({ decide, undo });
  useEffect(() => {
    keys.current = { decide, undo };
  });
  useEffect(() => {
    if (stage !== "deck") return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (t !== document.body && !rootRef.current?.contains(t)) return;
      if (t.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.key === "ArrowRight") keys.current.decide(true);
      else if (e.key === "ArrowLeft") keys.current.decide(false);
      else if (e.key === "u" || e.key === "U") keys.current.undo();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* ── screens ── */

  const setup = (
    <div className="flex flex-col gap-6 p-5 md:p-7">
      <div>
        <StageTitle focus={moved} className="text-[30px] font-extralight leading-tight tracking-tight" style={{ color: INK }}>
          Find your way to me
        </StageTitle>
        <p className="mt-1.5 text-[15px] font-light leading-snug" style={{ color: MUTED }}>
          Two taps, then swipe through the ways to reach me. Right means it works for you.
        </p>
      </div>
      <Segments<ContactWhoId> legend="I'm…" name="flat13-who" options={WHO} value={c.who} onChange={c.setWho} cols={3} />
      <Segments<IntentId> legend="Looking to…" name="flat13-intent" options={INTENTS} value={c.intent.id} onChange={c.setIntent} cols={2} />
      <p className="text-[15px] font-light leading-snug" style={{ color: INK }}>
        {c.intent.why}
      </p>
      <div className="flex flex-col items-center gap-1">
        <Primary onClick={restart}>Start matching</Primary>
        <div className="flex flex-wrap justify-center gap-x-4">
          <TextButton onClick={() => compose("setup")}>Just write to me</TextButton>
          <TextButton onClick={() => go("end")}>See every channel</TextButton>
        </div>
      </div>
    </div>
  );

  const top = deck[idx];
  const deckScreen = done ? null : (
    <div className="flex flex-col items-center gap-4 p-5 md:p-7">
      <div className="flex w-full items-center justify-between text-[14px] font-light" style={{ color: MUTED }}>
        <TextButton onClick={() => go("setup")}>‹ My answers</TextButton>
        <span>
          {idx + 1} of {deck.length}
        </span>
      </div>
      <StageTitle focus={moved} className="sr-only">
        Ways to reach me, one card at a time
      </StageTitle>
      <div aria-hidden className="flex gap-1.5">
        {deck.map((ch, i) => (
          <span
            key={ch.id}
            className="h-1.5 rounded-full"
            style={{ width: i === idx ? 18 : 6, background: i < idx ? (matched.has(ch.id) ? GREEN : HAIR) : i === idx ? ACCENT : HAIR, transition: c.reduce ? "none" : "width 200ms" }}
          />
        ))}
      </div>
      <div className="relative w-full max-w-[340px]" style={{ height: 440 }}>
        <AnimatePresence initial={false} custom={dir}>
          {deck.slice(idx).map((ch, d) => (
            <DeckCard
              key={ch.id}
              ch={ch}
              depth={d}
              rank={rank(ch.id)}
              intent={c.intent.label}
              enterFrom={restore?.id === ch.id ? restore.from : 0}
              reduce={c.reduce}
              onDecide={decide}
            />
          ))}
        </AnimatePresence>
      </div>
      <p aria-live="polite" className="sr-only">
        {top ? `Card ${idx + 1} of ${deck.length}: ${top.label}, ${top.handle}. ${rank(top.id) ? `My number ${rank(top.id)} pick for ${c.intent.label}.` : "Also an option."} ${top.use}` : ""}
      </p>
      <div className="flex items-center gap-5">
        <RoundButton onClick={undo} color={MUTED} label="Undo the last card" size={44} disabled={!history.length}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path d="M6 4L2.5 7.5 6 11M3 7.5h7.5a4.5 4.5 0 0 1 0 9H8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </RoundButton>
        <RoundButton onClick={() => decide(false)} color={RED} label="Nope, show me the next one">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
            <path d="M4 4l14 14M18 4L4 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </RoundButton>
        <RoundButton onClick={() => decide(true)} color={GREEN} label="Yes, this works for me">
          <svg width="26" height="22" viewBox="0 0 26 22" aria-hidden>
            <path d="M3 11.5l7 7L23 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </RoundButton>
        <span aria-hidden className="w-11" />
      </div>
      <p className="text-center text-[13px] font-light" style={{ color: MUTED }}>
        Swipe right for yes, left for the next one. Or use ← and →, and U to undo.
      </p>
    </div>
  );

  const endScreen = (
    <div className="flex flex-col gap-4 p-5 md:p-7">
      <div>
        <StageTitle focus={moved} className="text-[30px] font-extralight tracking-tight" style={{ color: INK }}>
          That&rsquo;s everyone
        </StageTitle>
        <p className="mt-1 text-[15px] font-light" style={{ color: MUTED }}>
          All of them in one list, best first for &ldquo;{c.intent.label}&rdquo;.
        </p>
      </div>
      <ul className="[&>li+li]:border-t [&>li+li]:border-[var(--border-color)]">
        {deck.map((ch) => {
          const r = rank(ch.id);
          const inner = (
            <>
              <Tile id={ch.id} size={36} />
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-[16px]" style={{ color: INK }}>
                  {ch.label}
                  {r ? (
                    <span className="ml-2 text-[12px]" style={{ color: ACCENT }}>
                      #{r}
                    </span>
                  ) : null}
                </span>
                <span className="truncate text-[13px] font-light" style={{ color: MUTED }}>
                  {ch.handle}
                </span>
              </span>
              <span className="text-[14px]" style={{ color: ACCENT }}>
                {ch.id === "email" ? "Write" : ch.id === "call" ? "Book" : "Open"}
              </span>
            </>
          );
          const cls = `flex min-h-14 w-full items-center gap-3 py-2 ${RING_IN}`;
          return (
            <li key={ch.id}>
              {ch.id === "email" || ch.id === "call" ? (
                <button type="button" onClick={() => (ch.id === "email" ? compose("end") : showMatch("call"))} className={cls}>
                  {inner}
                </button>
              ) : (
                <a href={ch.href} {...external(ch.href)} className={cls}>
                  {inner}
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col items-center gap-1">
        <Primary onClick={restart}>Start over</Primary>
        <TextButton onClick={() => go("setup")}>Change my answers</TextButton>
      </div>
    </div>
  );

  const m = getChannel(matchId);
  const matchLine =
    m.id === "email"
      ? "Email it is. Write it here and I'll reply to the address you give me."
      : m.id === "call"
        ? "A call it is. Pick any slot. A line about what you'd like to talk about helps me prepare."
        : `${m.label} it is. ${m.use}`;
  const matchScreen = (
    <div className="flex flex-col items-center gap-4 p-5 text-center md:p-7">
      <StageTitle focus={moved} className="text-[34px] font-extralight tracking-tight" style={{ color: ACCENT }}>
        It&rsquo;s a match!
      </StageTitle>
      <div aria-hidden className="flex items-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full text-[18px] font-light text-white" style={{ background: "#c7c7cc", border: `3px solid ${CARD}` }}>
          You
        </span>
        <span className="relative z-10 -mx-3 rounded-full" style={{ border: `3px solid ${CARD}` }}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: TINT[m.id] }}>
            <Glyph id={m.id} size={28} />
          </span>
        </span>
        <span className="flex h-20 w-20 items-center justify-center rounded-full text-[24px] font-extralight text-white" style={{ background: ACCENT, border: `3px solid ${CARD}` }}>
          {INITIALS}
        </span>
      </div>
      <p className="max-w-[380px] text-[16px] font-light leading-snug" style={{ color: INK }}>
        {matchLine}
      </p>
      {m.id !== "email" && m.id !== "call" && (
        <p className="break-all text-[14px]" style={{ color: MUTED }}>
          {m.handle}
        </p>
      )}
      <div className="flex w-full max-w-[320px] flex-col items-center gap-1">
        {m.id === "email" ? (
          <>
            <Primary onClick={() => compose("match")}>Write to me</Primary>
            <a href={c.mailto} className={`flex min-h-11 items-center px-2 text-[15px] ${RING}`} style={{ color: ACCENT }}>
              Use my own mail app
            </a>
          </>
        ) : m.id === "call" ? (
          <TextButton onClick={() => compose("match")}>Write a note first instead</TextButton>
        ) : (
          <Primary href={m.href}>Open {m.label}</Primary>
        )}
      </div>
      {m.id === "call" && (
        <div className="w-full overflow-hidden rounded-[12px]" style={{ border: `1px solid ${HAIR}` }}>
          <CalEmbed height={600} />
        </div>
      )}
      <TextButton onClick={() => go(done ? "end" : "deck")} muted>
        {done ? "See every channel" : "Keep swiping"}
      </TextButton>
    </div>
  );

  const composeScreen = (
    <Composer
      c={c}
      focus={moved}
      onCancel={() => go(composeBack)}
      onDone={() => go(composeBack === "compose" ? "setup" : composeBack)}
    />
  );

  const screen = { setup, deck: deckScreen ?? endScreen, end: endScreen, match: matchScreen, compose: composeScreen }[stage];
  const screenKey = stage === "deck" && done ? "end" : stage;

  return (
    <div ref={rootRef} className="mx-auto max-w-5xl px-4 pt-6 md:pt-10" style={{ fontFamily: "var(--font-main)", color: INK }}>
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-6">
        {/* profile */}
        <header data-blueprint="header" className="flex flex-col gap-4 rounded-[14px] p-5 lg:col-start-1 lg:row-start-1" style={{ background: CARD, border: `1px solid ${HAIR}` }}>
          <div className="flex items-center gap-3.5">
            <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[22px] font-extralight text-white" style={{ background: "#c7c7cc" }}>
              {INITIALS}
            </span>
            <div className="min-w-0">
              <h1 className="text-[22px] font-light leading-tight tracking-tight" style={{ color: INK }}>
                {FACTS.name}
              </h1>
              <a href={FACTS.nowHref} target="_blank" rel="noopener noreferrer" className={`text-[14px] ${RING}`} style={{ color: ACCENT }}>
                {FACTS.now}
              </a>
            </div>
          </div>
          <p className="flex items-start gap-2 text-[14px] font-light leading-snug" style={{ color: INK }}>
            <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: c.awake ? GREEN : "#c7c7cc" }} />
            {statusLine(c)}
          </p>
          <dl className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[14px] font-light leading-snug">
            <dt style={{ color: MUTED }}>Before</dt>
            <dd style={{ color: INK }}>{FACTS.before}</dd>
            <dt style={{ color: MUTED }}>Based in</dt>
            <dd style={{ color: INK }}>
              {FACTS.place} · {FACTS.timezone}
            </dd>
            <dt style={{ color: MUTED }}>Works</dt>
            <dd style={{ color: INK }}>{FACTS.mode}</dd>
            <dt style={{ color: MUTED }}>Open to</dt>
            <dd style={{ color: INK }}>
              <ul>
                {FACTS.openTo.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </dd>
          </dl>
          <div className="flex items-center justify-between gap-3 pt-3" style={{ borderTop: `1px solid ${HAIR}` }}>
            <span className="min-w-0 break-all text-[13px] font-light" style={{ color: MUTED }}>
              {EMAIL}
            </span>
            <button type="button" onClick={c.copyEmail} className={`min-h-11 shrink-0 px-1 text-[15px] ${RING}`} style={{ color: ACCENT }}>
              {c.copied ? "Copied" : "Copy email"}
            </button>
          </div>
        </header>

        {/* the flow: setup → deck → match → composer */}
        <section
          ref={flowRef}
          data-blueprint="compose"
          aria-label="Find the best way to reach me"
          className="relative overflow-hidden rounded-[14px] lg:col-start-2 lg:row-span-2 lg:row-start-1"
          style={{ background: CARD, border: `1px solid ${HAIR}`, scrollMarginTop: "calc(var(--simple-game-nav-bottom, 4.5rem) + 12px)" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={screenKey}
              initial={c.reduce ? false : { opacity: 0, y: stage === "compose" ? 40 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={c.reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 0.8, 0.25, 1] }}
            >
              {screen}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* top picks: the ranked short list, and a shortcut past the deck */}
        <section
          data-blueprint="channels"
          aria-labelledby="flat13-picks"
          className="rounded-[14px] p-5 lg:col-start-1 lg:row-start-2"
          style={{ background: CARD, border: `1px solid ${HAIR}` }}
        >
          <h2 id="flat13-picks" className="text-[13px] uppercase tracking-[0.08em]" style={{ color: MUTED }}>
            Top picks for {c.intent.label}
          </h2>
          <ol className="mt-2 [&>li+li]:border-t [&>li+li]:border-[var(--border-color)]">
            {c.picks.map((p, i) => (
              <li key={p.id}>
                <button type="button" onClick={() => (p.id === "email" ? compose(stage) : showMatch(p.id))} className={`flex min-h-12 w-full items-center gap-3 py-1.5 text-left ${RING_IN}`}>
                  <Tile id={p.id} size={32} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[15px]" style={{ color: INK }}>
                      {p.label}
                    </span>
                    <span className="truncate text-[12px] font-light" style={{ color: MUTED }}>
                      {p.handle}
                    </span>
                  </span>
                  <span className="text-[12px]" style={{ color: matched.has(p.id) ? GREEN : MUTED }}>
                    {matched.has(p.id) ? "Matched" : `#${i + 1}`}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <TextButton onClick={() => go("end")}>Every channel</TextButton>
        </section>
      </div>
    </div>
  );
}
