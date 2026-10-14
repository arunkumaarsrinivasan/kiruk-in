"use client";

/**
 * 2000 · search for how to reach Arun. Contact as a query and ten blue links.
 *
 * The clean web won with one white page and one box: type what you want, get
 * ranked results with a title, a two-line snippet and a green URL. So that's
 * the whole interface. A small local reader (keywords and weights, no model,
 * same answer every time) works out who you are and what you want, and the
 * results are every channel I have, best first for that reason.
 *
 * Email opens a "Write to Arun" card right inside its result, the call result
 * unfolds the calendar, everything else leaves for its site. "Searched as"
 * says how the query was read and "change" fixes it. When the reader isn't
 * sure, "Did you mean" offers the closest reason. "I'm Feeling Curious" skips
 * the list and does whatever the top result does.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { EMAIL, FACTS, INTENTS, WHO, getChannel, getIntent, type Channel, type ChannelId, type ContactWhoId, type IntentId } from "@/data/contact";
import type { ContactSkinProps } from "../types";
import { CalEmbed, external, statusLine } from "../contact-ui";
import type { Contact } from "../use-contact";

const INK = "#000";
const MUTED = "#676767";
const LINK = "#0000cc";
const VISITED = "#551a8b";
const GREEN = "#008000";
const RULE = "#c9d7f1";
const BAR = "#e5ecf9";
const RED = "#cc0000";
const FONT = "Arial, Helvetica, sans-serif";
const LOGO_FONT = "'Times New Roman', Times, serif";
/** The brand eye's four inks, letter by letter. */
const BRAND = ["#1637F2", "#F2055C", "#F2A71B", "#1637F2", "#BF0B80"];

const ring = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
const btnCls = `inline-flex min-h-11 items-center justify-center border border-[#999] bg-[#f0f0f0] px-3 text-[13px] text-black hover:bg-[#e4e4e4] active:bg-[#d9d9d9] disabled:cursor-not-allowed disabled:opacity-50 ${ring}`;
const linkCls = `underline underline-offset-2 ${ring}`;
/** Sunken 2000 field, drawn with border colours instead of a shadow. 16px on phones so iOS doesn't zoom. */
const field: CSSProperties = { border: "1px solid", borderColor: "#666 #ccc #ccc #666", borderRadius: 0, background: "#fff", color: INK, outlineColor: LINK };

/** Suggested searches under the box, as a visitor would type them. */
const SUGGESTED = ["hiring arun", "build an mvp with arun", "portfolio feedback", "advice for design students", "say hi"];

/** Each channel's result title, after its label. */
const TITLE: Record<ChannelId, string> = {
  email: "Write to Arun",
  call: "Book 30 minutes with Arun",
  linkedin: "Arun Kumaar Sreenivasan",
  github: "Code, including this site",
  studio: "Sketches and design experiments",
  life: "Trips, food and vlogs",
  x: "Short thoughts",
};

/* ── reading the query: keywords and weights, not a model ───────────── */

type Cue = [RegExp, number];

const GREETING = /\b(hi|hey|hello|hiya|howdy|friends?)\b/;

/** What they want. Strong cues count 2, hints count 1. Highest score wins; ties go to the earlier intent. */
const WANTS: [IntentId, Cue[]][] = [
  [
    "hire",
    [
      [/\b(hir(?:e|es|ed|ing)|recruit\w*|roles?|jobs?|positions?|openings?|vacanc(?:y|ies)|headcount|join (?:us|our team))\b/g, 2],
      [/\b(team|company|full[- ]?time|contract|interview\w*|salary|looking for an?|need an?)\b/g, 1],
    ],
  ],
  [
    "build",
    [
      [/\b(build\w*|built|mvp|startups?|co-?found\w*|founders?|prototyp\w*|freelanc\w*|consult\w*)\b/g, 2],
      [/\b(products?|apps?|launch\w*|ship\w*|idea|together|collab\w*|partner\w*|projects?|website)\b/g, 1],
    ],
  ],
  [
    "advice",
    [
      [/\b(advice|advise|mentor\w*|careers?|students?|guidance|stuck)\b/g, 2],
      [/\b(learn\w*|tips?|questions?|how (?:do|did|can|should) (?:i|you)|getting started|break into|junior|college|universit(?:y|ies)|fresher|beginner)\b/g, 1],
    ],
  ],
  [
    "talk-design",
    [
      [/\b(feedback|critiqu\w*|portfolio|review)\b/g, 2],
      [/\b(design\w*|ux|ui|figma|typography|fonts?|thoughts on|your work|sketch\w*)\b/g, 1],
    ],
  ],
  [
    "hello",
    [
      [new RegExp(GREETING.source, "g"), 2],
      [/\b(thanks|thank you|lov(?:e|ed|ing)|cool|nice|wave|yo|say)\b/g, 1],
    ],
  ],
];

/** Who they are, when they say so outright. First match wins. */
const NAMES: [ContactWhoId, RegExp][] = [
  ["hiring", /\b(recruit\w*|hiring|talent|hr|headhunt\w*)\b/],
  ["founder", /\b(founders?|co-?found\w*|ceo|cto|my startup|our startup)\b/],
  ["student", /\b(students?|college|universit(?:y|ies)|intern|fresher|bootcamp|graduat\w*)\b/],
  ["designer", /\b(designers?|i design)\b/],
  ["friend", /\b(friends?|buddy|we met|long time)\b/],
];

/** Words each reason sounds like, for "Did you mean" when a query only nearly matches (typos, odd phrasing). */
const NEAR: Record<IntentId, string[]> = {
  hire: ["hiring", "hire", "recruiter", "role", "job", "position", "opening"],
  build: ["build", "mvp", "startup", "founder", "freelance", "prototype", "product", "collaborate"],
  "talk-design": ["design", "portfolio", "feedback", "critique", "review", "sketch"],
  advice: ["advice", "mentor", "student", "career", "guidance", "learning"],
  hello: ["hello", "hey", "thanks", "friend", "greetings"],
};

/** Asking about me rather than for a way in. Adds the facts box on top. */
const ABOUT = /\b(about|who is|who's|bio|resume|cv|background|experience)\b/;

/** When they don't say who they are, guess from what they want. */
const USUAL: Record<IntentId, ContactWhoId> = { hire: "hiring", build: "founder", "talk-design": "designer", advice: "student", hello: "curious" };

interface Reading {
  /** Null when the query gave nothing to go by: the current order stays. */
  who: ContactWhoId | null;
  intent: IntentId | null;
  /** The words the reading went by. */
  heard: string[];
  /** A strong cue or a named "I am". Below that, "Did you mean" shows. */
  sure: boolean;
  /** Closest reason to offer in "Did you mean". */
  near: IntentId | null;
  about: boolean;
}

const bigrams = (w: string) => new Set(Array.from({ length: Math.max(0, w.length - 1) }, (_, i) => w.slice(i, i + 2)));
function dice(a: string, b: string) {
  const x = bigrams(a);
  const y = bigrams(b);
  if (!x.size || !y.size) return 0;
  let both = 0;
  for (const g of x) if (y.has(g)) both++;
  return (2 * both) / (x.size + y.size);
}

function closest(s: string): IntentId | null {
  let best: { id: IntentId; score: number } | null = null;
  for (const word of s.match(/[a-z]{3,}/g) ?? []) {
    for (const [id, words] of Object.entries(NEAR) as [IntentId, string[]][]) {
      for (const w of words) {
        const score = dice(word, w);
        if (score > (best?.score ?? 0)) best = { id, score };
      }
    }
  }
  return best && best.score >= 0.5 ? best.id : null;
}

function read(text: string): Reading {
  const s = text.toLowerCase().replace(/[‘’]/g, "'");
  let best: { id: IntentId; score: number; heard: string[] } | null = null;
  for (const [id, cues] of WANTS) {
    let score = 0;
    const heard: string[] = [];
    for (const [re, weight] of cues) {
      for (const m of s.matchAll(re)) {
        score += weight;
        heard.push(m[0]);
      }
    }
    if (score > (best?.score ?? 0)) best = { id, score, heard };
  }
  const named = NAMES.find(([, re]) => re.test(s));
  const intent = best?.id ?? (named ? usualIntent(named[0]) : null);
  const who = named?.[0] ?? (best ? (best.id === "hello" && GREETING.test(s) ? "friend" : USUAL[best.id]) : null);
  const self = named ? [s.match(named[1])![0]] : [];
  const sure = !!named || (best?.score ?? 0) >= 2;
  const about = ABOUT.test(s);
  return {
    who,
    intent,
    heard: [...new Set([...self, ...(best?.heard ?? [])])].slice(0, 3),
    sure,
    // "about arun" asks about me, not for a way in: nothing to correct.
    near: sure || (about && !best) ? null : (best?.id ?? closest(s)),
    about,
  };
}

const usualIntent = (who: ContactWhoId) => WHO.find((w) => w.id === who)!.intent;
const whoLabel = (who: ContactWhoId) => WHO.find((w) => w.id === who)!.label;

/* ── results text ───────────────────────────────────────────────────── */

const STOP = new Set(["the", "and", "for", "with", "you", "your", "want", "would", "like", "can", "how", "who", "what", "some", "about", "into"]);
const stem = (w: string) => w.toLowerCase().replace(/(ing|ed|es|s|e)$/, "");

/** Query words worth bolding in a snippet. */
const termsOf = (q: string) => [...new Set((q.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter((w) => w.length >= 3 && !STOP.has(w)).map(stem))].filter((t) => t.length >= 3);

/** A snippet with the query's words in bold, the way results always did it. */
function Snippet({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  return (
    <>
      {text.split(/([A-Za-z0-9']+)/).map((part, i) => (i % 2 === 1 && terms.includes(stem(part)) ? <b key={i}>{part}</b> : part))}
    </>
  );
}

/** "linkedin.com/in/arunkumaarsreenivasan", or the address for email. */
const shortUrl = (ch: Channel) => (ch.id === "email" ? EMAIL : ch.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""));

/** Costume timing, steady per query so it doesn't flicker. */
const seconds = (q: string) => `0.${String(((q.length * 7) % 9) + 3).padStart(2, "0")}`;

/* ── pieces ─────────────────────────────────────────────────────────── */

function Wordmark({ size }: { size: number }) {
  return (
    <span aria-hidden className="inline-block select-none font-bold leading-none" style={{ fontFamily: LOGO_FONT, fontSize: size, letterSpacing: "-0.02em" }}>
      {"Kiruk".split("").map((ch, i) => (
        <span key={i} style={{ color: BRAND[i] }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/** A link-looking button: the result titles and small links that act on the page. */
function LinkBtn({
  children,
  onClick,
  expanded,
  controls,
  className = "",
  color = LINK,
}: {
  children: ReactNode;
  onClick: () => void;
  expanded?: boolean;
  controls?: string;
  className?: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={controls}
      className={`inline-flex min-h-11 items-center text-left ${linkCls} ${className}`}
      style={{ color, outlineColor: LINK }}
    >
      {children}
    </button>
  );
}

function Select<T extends string>({ id, label, value, options, onChange }: { id: string; label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <label htmlFor={id} className="text-[13px] sm:w-44">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={`min-h-11 px-1 text-base md:text-[13px] ${ring}`} style={field}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Advanced({ c, onEdit }: { c: Contact; onEdit?: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Select
        id="s2k-who"
        label="I am"
        value={c.who}
        options={WHO}
        onChange={(v) => {
          c.setWho(v);
          onEdit?.();
        }}
      />
      <Select
        id="s2k-intent"
        label="I'd like to"
        value={c.intent.id}
        options={INTENTS}
        onChange={(v) => {
          c.setIntent(v);
          onEdit?.();
        }}
      />
    </div>
  );
}

const newTab = <span className="sr-only"> (opens in a new tab)</span>;

/* ── skin ───────────────────────────────────────────────────────────── */

type View = "home" | "results" | "advanced";

interface Search {
  q: string;
  r: Reading;
  /** Set when the visitor fixed the reading themselves. */
  edited: boolean;
}

export function Search2000({ contact: c }: ContactSkinProps) {
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<Search | null>(null);
  const [changing, setChanging] = useState(false);
  const [open, setOpen] = useState<"email" | "call" | null>(null);
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [copiedId, setCopiedId] = useState<ChannelId | null>(null);
  const [announce, setAnnounce] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const homeInputRef = useRef<HTMLInputElement>(null);
  /** What to focus once the next render lands. */
  const after = useRef<"bar" | "email" | "call" | "home" | null>(null);

  const sent = c.sendState === "sent";
  const first = c.name.trim().split(" ")[0];
  const behavior: ScrollBehavior = c.reduce ? "auto" : "smooth";

  // A new page starts at its top; then hand focus where the action went.
  useEffect(() => {
    const el = rootRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }, [view]);

  useEffect(() => {
    const target = after.current;
    if (!target) return;
    after.current = null;
    if (target === "bar") barRef.current?.focus();
    if (target === "home") homeInputRef.current?.focus();
    if (target === "email") {
      nameRef.current?.scrollIntoView({ behavior, block: "center" });
      nameRef.current?.focus({ preventScroll: true });
    }
    if (target === "call") {
      calRef.current?.scrollIntoView({ behavior, block: "start" });
      calRef.current?.focus({ preventScroll: true });
    }
  });

  const lastSend = useRef(c.sendState);
  useEffect(() => {
    if (lastSend.current === c.sendState) return;
    lastSend.current = c.sendState;
    if (c.sendState === "sent") {
      setAnnounce(`Sent. I'll reply to ${c.from}.`);
      sentRef.current?.focus();
    }
  }, [c.sendState, c.from]);

  /**
   * Run a query. `forced` comes from a link that already knows the reason (Did you mean, related, advanced);
   * `keepWho` leaves "I am" as the visitor set it.
   */
  const run = (raw: string, focus: "bar" | null, forced?: IntentId, keepWho = false): IntentId | null => {
    const q = raw.trim();
    if (!q) return null;
    const r: Reading = forced
      ? {
          who: keepWho || (c.who !== "curious" && usualIntent(c.who) === forced) ? null : USUAL[forced],
          intent: forced,
          heard: [],
          sure: true,
          near: null,
          about: false,
        }
      : read(q);
    if (r.who) c.setWho(r.who);
    if (r.intent) c.setIntent(r.intent);
    const intent = r.intent ?? c.intent.id;
    setSearch({ q, r, edited: false });
    setQuery(q);
    setView("results");
    setChanging(false);
    setOpen(null);
    after.current = focus;
    setAnnounce(`${c.all.length} results for ${q}. Top result: ${getChannel(getIntent(intent).channels[0]).label}.`);
    return intent;
  };

  /** Do what the top result does, without the list in between. */
  const curious = () => {
    const typed = query.trim();
    const intent = run(typed || c.intent.label, null, typed ? undefined : c.intent.id, true) ?? c.intent.id;
    const top = getChannel(getIntent(intent).channels[0]);
    if (top.id === "email" || top.id === "call") {
      setOpen(top.id);
      after.current = top.id;
      return;
    }
    after.current = "bar";
    setVisited((v) => new Set(v).add(top.id));
    window.open(top.href, "_blank", "noopener,noreferrer");
    setAnnounce(`Opened ${top.label} in a new tab.`);
  };

  const goHome = () => {
    setView("home");
    after.current = "home";
  };

  const edit = () => setSearch((s) => s && { ...s, edited: true });

  const toggle = (id: "email" | "call") => {
    const next = open === id ? null : id;
    setOpen(next);
    after.current = next;
  };

  const copyLink = (ch: Channel) => {
    if (ch.id === "email") {
      c.copyEmail();
      return;
    }
    navigator.clipboard?.writeText(ch.href).then(
      () => {
        setCopiedId(ch.id);
        window.setTimeout(() => setCopiedId((id) => (id === ch.id ? null : id)), 1800);
      },
      () => undefined,
    );
  };

  const missing = [
    !c.name.trim() && "your name",
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.from.trim()) && "an email I can reply to",
    (c.body.trim().length <= 10 || c.body.trim() === c.intent.body.trim()) && "a line of your own",
  ].filter((m): m is string => !!m);
  const listOf = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

  /* ── the search form, big on home, compact on results ─────────────── */

  const form = (home: boolean) => (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        run(query, home ? "bar" : null);
      }}
      className={home ? "flex w-full max-w-[560px] flex-col items-center gap-4" : "flex w-full min-w-0 max-w-[520px] items-stretch gap-2"}
    >
      <label htmlFor={home ? "s2k-q" : "s2k-q2"} className="sr-only">
        Search for how to reach Arun
      </label>
      <input
        id={home ? "s2k-q" : "s2k-q2"}
        ref={home ? homeInputRef : undefined}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        maxLength={120}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`min-h-11 w-full min-w-0 px-2 text-base md:text-[15px] ${ring}`}
        style={field}
      />
      {home ? (
        <div className="flex flex-wrap justify-center gap-2">
          <button type="submit" className={btnCls}>
            Kiruk Search
          </button>
          <button type="button" onClick={curious} className={btnCls}>
            I&apos;m Feeling Curious
          </button>
        </div>
      ) : (
        <button type="submit" className={`${btnCls} shrink-0`}>
          Search
        </button>
      )}
    </form>
  );

  const header = (title?: string) => (
    <header data-blueprint="header" className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
      <h1 className="m-0">
        <button type="button" onClick={goHome} className={`inline-flex min-h-11 items-center ${ring}`} style={{ outlineColor: LINK }}>
          <Wordmark size={34} />
          <span className="sr-only">Kiruk search home{title ? `. ${title}` : ""}</span>
        </button>
      </h1>
      {form(false)}
    </header>
  );

  /* ── "Write to Arun", inside the email result ─────────────────────── */

  const label = "text-[13px]";
  const input = `min-h-11 w-full min-w-0 px-2 text-base md:text-[13px] ${ring}`;
  const writeCard = (
    <div id="s2k-email" className="mt-2 max-w-[42rem] border" style={{ borderColor: RULE }}>
      <p className="border-b px-3 py-2 font-bold" style={{ borderColor: RULE, background: BAR }}>
        Write to Arun
      </p>
      {sent ? (
        <div ref={sentRef} tabIndex={-1} className={`flex flex-col gap-1 p-3 outline-none ${ring}`} style={{ outlineColor: LINK }}>
          <p className="font-bold">Sent. Thanks{first ? `, ${first}` : ""}.</p>
          <p>
            I&apos;ll reply to <span className="[overflow-wrap:anywhere]">{c.from}</span>.
          </p>
          <p style={{ color: MUTED }}>{statusLine(c)}</p>
        </div>
      ) : (
        <form
          aria-label="Write to Arun"
          onSubmit={(e) => {
            e.preventDefault();
            void c.send();
          }}
          className="flex flex-col gap-3 p-3"
        >
          <p style={{ color: MUTED }}>I started it from what you searched. Change anything, then send it from here or from your own mail program.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="s2k-name" className={label}>
                Your name
              </label>
              <input id="s2k-name" ref={nameRef} autoComplete="name" value={c.name} onChange={(e) => c.setName(e.target.value)} className={input} style={field} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="s2k-from" className={label}>
                Your email
              </label>
              <input id="s2k-from" type="email" autoComplete="email" value={c.from} onChange={(e) => c.setFrom(e.target.value)} className={input} style={field} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="s2k-subject" className={label}>
              Subject
            </label>
            <input id="s2k-subject" value={c.subject} onChange={(e) => c.setSubject(e.target.value)} className={input} style={field} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="s2k-body" className={label}>
              Message
            </label>
            <textarea
              id="s2k-body"
              rows={9}
              value={c.body}
              onChange={(e) => c.setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              className={`w-full min-w-0 resize-y p-2 text-base leading-normal md:text-[13px] ${ring}`}
              style={field}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={!c.ready || c.sendState === "sending"} className={btnCls}>
              {c.sendState === "sending" ? "Sending..." : "Send to Arun"}
            </button>
            <button type="button" onClick={c.resetDraft} className={btnCls}>
              Reset
            </button>
            <a href={c.mailto} className={`inline-flex min-h-11 items-center px-1 ${linkCls}`} style={{ color: LINK, outlineColor: LINK }}>
              Open in your mail program
            </a>
          </div>
          {c.sendState === "error" ? (
            <p role="alert" style={{ color: RED }}>
              {c.sendError} Your mail program still works:{" "}
              <a href={c.mailto} className={linkCls} style={{ color: LINK, outlineColor: LINK }}>
                open the draft there
              </a>
              .
            </p>
          ) : (
            <p aria-live="polite" style={{ color: MUTED }}>
              {c.ready ? "Ready when you are." : `Add ${listOf(missing)}, then send.`}
            </p>
          )}
        </form>
      )}
    </div>
  );

  /* ── one result ───────────────────────────────────────────────────── */

  const result = (ch: Channel, rank: number, terms: string[]) => {
    const seen = visited.has(ch.id);
    const titleText = (
      <>
        {ch.label} - {TITLE[ch.id]}
      </>
    );
    const titleCls = "text-[16px] leading-snug";
    const copied = ch.id === "email" ? c.copied : copiedId === ch.id;
    return (
      <li key={ch.id} className="flex flex-col">
        <h3 className="m-0 font-normal">
          {ch.id === "email" || ch.id === "call" ? (
            <LinkBtn onClick={() => toggle(ch.id as "email" | "call")} expanded={open === ch.id} controls={open === ch.id ? `s2k-${ch.id}` : undefined} className={titleCls}>
              {titleText}
            </LinkBtn>
          ) : (
            <a
              href={ch.href}
              {...external(ch.href)}
              onClick={() => setVisited((v) => new Set(v).add(ch.id))}
              className={`inline-flex min-h-11 items-center ${titleCls} ${linkCls}`}
              style={{ color: seen ? VISITED : LINK, outlineColor: LINK }}
            >
              {titleText}
              {newTab}
            </a>
          )}
        </h3>
        <p className="max-w-[38rem] leading-[1.45]">
          <Snippet text={rank === 0 ? c.intent.why : ch.use} terms={terms} />
          {rank === 0 && (
            <span style={{ color: MUTED }}>
              {" "}
              ... <Snippet text={ch.use} terms={terms} />
            </span>
          )}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 leading-[1.45]">
          <span className="[overflow-wrap:anywhere]" style={{ color: GREEN }}>
            {shortUrl(ch)}
          </span>
          <span aria-hidden style={{ color: MUTED }}>
            -
          </span>
          <LinkBtn onClick={() => copyLink(ch)} color={MUTED} className="text-[13px]">
            {copied ? "Copied" : ch.id === "email" ? "Copy address" : "Copy link"}
          </LinkBtn>
          {ch.id === "email" && (
            <>
              <span aria-hidden style={{ color: MUTED }}>
                -
              </span>
              <a href={c.mailto} className={`inline-flex min-h-11 items-center text-[13px] ${linkCls}`} style={{ color: MUTED, outlineColor: LINK }}>
                Open in your mail program
              </a>
            </>
          )}
          {ch.id === "call" && (
            <>
              <span aria-hidden style={{ color: MUTED }}>
                -
              </span>
              <a href={ch.href} {...external(ch.href)} className={`inline-flex min-h-11 items-center text-[13px] ${linkCls}`} style={{ color: MUTED, outlineColor: LINK }}>
                Open on cal.com
                {newTab}
              </a>
            </>
          )}
        </p>

        {ch.id === "email" && open === "email" && writeCard}
        {ch.id === "call" && open === "call" && (
          <div id="s2k-call" ref={calRef} tabIndex={-1} role="region" aria-label="Book a 30 minute call" className={`mt-2 max-w-[42rem] border outline-none ${ring}`} style={{ borderColor: RULE, outlineColor: LINK }}>
            <p className="flex flex-wrap items-center justify-between gap-x-3 border-b px-3" style={{ borderColor: RULE, background: BAR }}>
              <span className="py-2">{ch.use}</span>
              <LinkBtn onClick={() => toggle("call")}>Hide</LinkBtn>
            </p>
            <CalEmbed height={620} />
          </div>
        )}
      </li>
    );
  };

  /* ── the right column: where things stand ─────────────────────────── */

  const status = (
    <aside data-blueprint="channels" aria-labelledby="s2k-status" className="flex flex-col gap-4 border-t pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0" style={{ borderColor: RULE }}>
      <h2 id="s2k-status" className="m-0 text-[13px] font-normal" style={{ color: MUTED }}>
        Arun&apos;s status
      </h2>
      <div className="flex flex-col">
        <a href={FACTS.nowHref} {...external(FACTS.nowHref)} className={`self-start ${linkCls}`} style={{ color: LINK, outlineColor: LINK }}>
          Now at Spera
          {newTab}
        </a>
        <span>{FACTS.now}</span>
        <span style={{ color: GREEN }}>{FACTS.nowHref.replace(/^https?:\/\//, "")}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-bold">Right now</span>
        <span>{statusLine(c)}</span>
        <span style={{ color: GREEN }}>
          {FACTS.place} · {FACTS.timezone}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-bold">Open to</span>
        <ul className="m-0 list-none p-0">
          {FACTS.openTo.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <span style={{ color: MUTED }}>{FACTS.mode}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-bold">Email me</span>
        <span className="[overflow-wrap:anywhere]" style={{ color: GREEN }}>
          {EMAIL}
        </span>
        <div>
          <button type="button" onClick={c.copyEmail} className={`${btnCls} mt-1`}>
            {c.copied ? "Copied" : "Copy email"}
          </button>
        </div>
        <span className="sr-only" aria-live="polite">
          {c.copied ? "Email copied" : ""}
        </span>
      </div>
    </aside>
  );

  /* ── pages ────────────────────────────────────────────────────────── */

  let page: ReactNode;

  if (view === "home") {
    page = (
      <div className="flex flex-col items-center gap-6 pt-6 text-center md:pt-12">
        <header data-blueprint="header" className="flex w-full flex-col items-center gap-6">
          <h1 className="m-0 flex flex-col items-center">
            <Wordmark size={72} />
            <span aria-hidden className="mt-1 self-end pr-1 text-[13px] font-normal" style={{ color: MUTED }}>
              how to reach Arun
            </span>
            <span className="sr-only">Kiruk: search for how to reach Arun</span>
          </h1>
          {form(true)}
        </header>
        <div className="flex max-w-[560px] flex-col items-center">
          <p style={{ color: MUTED }}>Try a search:</p>
          <ul className="m-0 flex list-none flex-wrap justify-center gap-x-4 p-0">
            {SUGGESTED.map((s) => (
              <li key={s}>
                <LinkBtn onClick={() => run(s, "bar")}>{s}</LinkBtn>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="More" className="flex flex-wrap justify-center gap-x-5 text-[13px]">
          <LinkBtn onClick={() => run("about arun", "bar")}>About Arun</LinkBtn>
          <LinkBtn
            onClick={() => {
              setView("advanced");
              after.current = null;
            }}
          >
            Advanced Search
          </LinkBtn>
        </nav>
        <p className="text-[12px]" style={{ color: MUTED }}>
          Searching {c.all.length} ways to reach me · {statusLine(c)}
        </p>
      </div>
    );
  } else if (view === "advanced") {
    page = (
      <div className="flex flex-col gap-4">
        {header("Advanced Search")}
        <h2 className="m-0 border-t px-2 py-1 text-[16px] font-bold" style={{ borderColor: RULE, background: BAR }}>
          Advanced Search
        </h2>
        <p style={{ color: MUTED }}>Skip the guessing and say it outright. Every way in still shows; only the order changes.</p>
        <Advanced c={c} />
        <div>
          <button type="button" onClick={() => run(c.intent.label, "bar", c.intent.id, true)} className={btnCls}>
            Kiruk Search
          </button>
        </div>
      </div>
    );
  } else if (search) {
    const { q, r, edited } = search;
    const terms = termsOf(q);
    const near = !edited && !r.sure && r.near ? getIntent(r.near) : null;
    const lost = !edited && !r.sure && !r.near && !r.about;
    const others = INTENTS.filter((i) => i.id !== c.intent.id);
    page = (
      <div className="flex flex-col gap-3">
        {header()}

        <div
          ref={barRef}
          tabIndex={-1}
          className={`flex flex-wrap items-baseline justify-between gap-x-4 border-t px-2 py-1 outline-none ${ring}`}
          style={{ borderColor: RULE, background: BAR, outlineColor: LINK }}
        >
          <h2 className="m-0 text-[16px] font-bold">Ways to reach Arun</h2>
          <p className="min-w-0 [overflow-wrap:anywhere]">
            Results <b>1</b> - <b>{c.all.length}</b> of about <b>{c.all.length}</b> for <b>{q}</b>. (<b>{seconds(q)}</b> seconds)
          </p>
        </div>

        <p className="flex flex-wrap items-center gap-x-1" style={{ color: MUTED }}>
          <span>
            Searched as: <span style={{ color: INK }}>{whoLabel(c.who)}</span> · wants to <span style={{ color: INK }}>{c.intent.label}</span>
            {!edited && r.heard.length > 0 && <> (went by {listOf(r.heard.map((w) => `"${w}"`))})</>}
            {edited && <> (you set this)</>}
          </span>
          <LinkBtn onClick={() => setChanging((v) => !v)} expanded={changing} controls={changing ? "s2k-change" : undefined}>
            {changing ? "done" : "change"}
          </LinkBtn>
        </p>
        {changing && (
          <div id="s2k-change" role="group" aria-label="Advanced search" className="border p-3" style={{ borderColor: RULE }}>
            <Advanced c={c} onEdit={edit} />
          </div>
        )}

        {near && (
          <p>
            <span style={{ color: RED }}>Did you mean: </span>
            <LinkBtn onClick={() => run(near.label, null, near.id)} className="font-bold italic">
              {near.label}
            </LinkBtn>
          </p>
        )}
        {lost && <p style={{ color: MUTED }}>Nothing in your search told me why you&apos;re here, so this is my usual order. Pick a reason under the results to sharpen it.</p>}

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_15rem]">
          <section data-blueprint="compose" aria-label="Results" className="flex min-w-0 flex-col gap-4">
            {r.about && (
              <section aria-label="About Arun" className="border-l-4 py-1 pl-3" style={{ borderColor: RULE }}>
                <h3 className="m-0 font-normal">
                  <Link href="/#about" className={`inline-flex min-h-11 items-center text-[16px] ${linkCls}`} style={{ color: LINK, outlineColor: LINK }}>
                    {FACTS.name} - the long version of my story
                  </Link>
                </h3>
                <dl className="m-0 grid gap-x-3 sm:grid-cols-[6.5rem_1fr]">
                  <dt style={{ color: MUTED }}>Now</dt>
                  <dd className="m-0">{FACTS.now}</dd>
                  <dt style={{ color: MUTED }}>Before</dt>
                  <dd className="m-0">{FACTS.before}</dd>
                  <dt style={{ color: MUTED }}>Lives in</dt>
                  <dd className="m-0">
                    {FACTS.place} · {FACTS.timezone}
                  </dd>
                  <dt style={{ color: MUTED }}>How I work</dt>
                  <dd className="m-0">{FACTS.mode}</dd>
                  <dt style={{ color: MUTED }}>Open to</dt>
                  <dd className="m-0">{FACTS.openTo.join(". ")}.</dd>
                </dl>
                <p style={{ color: GREEN }}>kiruk.in/#about</p>
              </section>
            )}

            <ol className="m-0 flex list-none flex-col gap-3 p-0">{c.all.map((ch, i) => result(ch, i, terms))}</ol>

            <nav aria-labelledby="s2k-related" className="flex flex-col border-t pt-3" style={{ borderColor: RULE }}>
              <h2 id="s2k-related" className="m-0 text-[13px] font-normal" style={{ color: MUTED }}>
                Searches related to Arun:
              </h2>
              <ul className="m-0 flex list-none flex-wrap gap-x-4 p-0">
                {others.map((i) => (
                  <li key={i.id}>
                    <LinkBtn onClick={() => run(i.label, "bar", i.id)}>{i.label}</LinkBtn>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          {status}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="mx-auto max-w-5xl px-4 pt-6 md:pt-10" style={{ fontFamily: FONT, color: INK, background: "#fff" }}>
      <div className="text-[14px] leading-[1.5] md:text-[13px]">
        <p className="sr-only" role="status" aria-live="polite">
          {announce}
        </p>
        {page}
      </div>
    </div>
  );
}
