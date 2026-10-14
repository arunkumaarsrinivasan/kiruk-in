"use client";

/**
 * 1991 · contact.html — contact as a tiny web of linked pages.
 *
 * On the first web, the interface was the link. So every choice here is one:
 * "I am hiring" goes to hiring.html, which asks what you want, which goes to
 * a page that answers with the best way in. Back and Home work, followed
 * links turn purple, the trail of pages you took sits at the foot, and the
 * line under the page shows where a link goes before you follow it.
 */

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CHANNELS, EMAIL, FACTS, INTENTS, WHO, getIntent, type ContactWhoId, type IntentId } from "@/data/contact";
import type { ContactSkinProps } from "../types";
import { CalEmbed } from "../contact-ui";

const TEXT = "#000";
const SOFT = "#666";
const LINK = "#0000ee";
const VISITED = "#551a8b";
const MONO = "'Courier New', Courier, monospace";
const BASE = "http://kiruk.in/contact/";

type PageId = "contact" | "letter" | "everywhere" | "author" | "calendar" | "sent" | `who/${ContactWhoId}` | `do/${IntentId}`;

const WHO_PAGE: Record<ContactWhoId, { title: string; link: string; hello: string }> = {
  hiring: {
    title: "You are hiring",
    link: "I am hiring",
    hello: "Hello. Thanks for thinking of me. Roles are easiest to judge in writing, so most of what follows points at email.",
  },
  founder: {
    title: "You are building something",
    link: "I am a founder",
    hello: "Hello, fellow builder. I co-founded Spera, so I know what the early, messy version looks like. Bring it.",
  },
  designer: {
    title: "You design things too",
    link: "I am a designer",
    hello: "Hello. I grew up with critiques over tea, so I'm always happy to swap notes, both ways.",
  },
  student: {
    title: "You are learning",
    link: "I am a student",
    hello: "Hello. I mentored students through college, and I remember being stuck. Ask me anything.",
  },
  friend: {
    title: "You are a friend",
    link: "I am a friend",
    hello: "Hey! You probably know the fastest way already, but here it is anyway.",
  },
  curious: {
    title: "You are curious",
    link: "I'm just curious",
    hello: "Hello, wanderer. Welcome to the first web page era. Click around, nothing breaks.",
  },
};

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fileOf = (p: PageId) => (p === "contact" ? "index" : p.replace(/^(who|do)\//, ""));
const urlOf = (p: PageId) => `${BASE}${fileOf(p)}.html`;

const h1: CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1.15,
  margin: "0 0 12px",
};
const h2: CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  margin: "26px 0 8px",
};
const input: CSSProperties = {
  font: `14px ${MONO}`,
  color: TEXT,
  background: "#fff",
  border: "2px inset #ccc",
  padding: "4px 6px",
};
const button: CSSProperties = {
  font: "15px 'Times New Roman', serif",
  color: TEXT,
  background: "#e0e0e0",
  border: "2px outset #ccc",
  padding: "4px 14px",
};

interface Browser {
  visited: Set<string>;
  go: (p: PageId) => void;
  visit: (url: string) => void;
  setHover: (url: string) => void;
}
const BrowserCtx = createContext<Browser | null>(null);

/** A hypertext link: to another page here, or out to the web. */
function A({ to, href, children }: { to?: PageId; href?: string; children: ReactNode }) {
  const { visited, go, visit, setHover } = useContext(BrowserCtx)!;
  const url = to ? urlOf(to) : href!;
  const style: CSSProperties = {
    color: visited.has(url) ? VISITED : LINK,
    outlineColor: LINK,
  };
  const cls = "underline underline-offset-2 focus-visible:outline focus-visible:outline-2";
  const hoverProps = {
    onMouseEnter: () => setHover(url),
    onMouseLeave: () => setHover(""),
    onFocus: () => setHover(url),
    onBlur: () => setHover(""),
  };
  if (to) {
    return (
      <a
        href={`#${fileOf(to)}`}
        onClick={(e) => {
          e.preventDefault();
          go(to);
        }}
        className={cls}
        style={style}
        {...hoverProps}
      >
        {children}
      </a>
    );
  }
  const ext = url.startsWith("http");
  return (
    <a
      href={url}
      onClick={() => visit(url)}
      className={cls}
      style={style}
      {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...hoverProps}
    >
      {children}
    </a>
  );
}

export function DocHtml1991({ contact: c }: ContactSkinProps) {
  const [history, setHistory] = useState<PageId[]>(["contact"]);
  const [visited, setVisited] = useState<Set<string>>(() => new Set([urlOf("contact")]));
  const [hover, setHover] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const page = history[history.length - 1];

  const go = (p: PageId) => {
    if (p.startsWith("who/")) c.setWho(p.slice(4) as ContactWhoId);
    if (p.startsWith("do/")) c.setIntent(p.slice(3) as IntentId);
    setHistory((h) => [...h, p]);
    setVisited((v) => new Set(v).add(urlOf(p)));
    setHover("");
  };
  const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  const jump = (i: number) => setHistory((h) => h.slice(0, i + 1));

  // A new page starts at its top, like following a link does.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = topRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }, [page]);

  // A sent letter lands on its own page.
  const lastSend = useRef(c.sendState);
  useEffect(() => {
    if (lastSend.current === c.sendState) return;
    lastSend.current = c.sendState;
    if (c.sendState === "sent") go("sent");
  });

  const status = c.clock
    ? `It is ${c.clock} in Bengaluru. ${c.awake ? "I'm probably at my desk." : "I'm probably asleep; mail gets read in the morning."}`
    : "";

  const body = (() => {
    if (page === "contact") {
      return (
        <>
          <h1 style={h1}>How to reach Arun</h1>
          <p>
            This page finds the best way to reach me, Arun Kumaar Sreenivasan, a design engineer in {FACTS.place}. It takes two links. Start
            by saying who you are. (Never heard of me? <A to="author">Who is Arun?</A>)
          </p>
          <h2 style={h2}>Who are you?</h2>
          <ul style={{ listStyle: "disc", paddingLeft: 28 }}>
            {WHO.map((w) => (
              <li key={w.id}>
                <A to={`who/${w.id}`}>{WHO_PAGE[w.id].link}</A>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 16 }}>
            Already know what you want? See <A to="everywhere">every channel</A>, <A to="letter">write a letter</A> straight away, or{" "}
            <A to="calendar">book a call</A>.
          </p>
          {status && <p style={{ marginTop: 12, color: SOFT }}>{status}</p>}
        </>
      );
    }

    if (page.startsWith("who/")) {
      const who = page.slice(4) as ContactWhoId;
      const usual = WHO.find((w) => w.id === who)!.intent;
      const order = [...INTENTS].sort((a, b) => Number(b.id === usual) - Number(a.id === usual));
      return (
        <>
          <h1 style={h1}>{WHO_PAGE[who].title}</h1>
          <p>{WHO_PAGE[who].hello}</p>
          <h2 style={h2}>What would you like to do?</h2>
          <ul style={{ listStyle: "disc", paddingLeft: 28 }}>
            {order.map((i) => (
              <li key={i.id}>
                <A to={`do/${i.id}`}>{titleCase(i.label)}</A>
                {i.id === usual && <span style={{ color: SOFT }}> (the usual reason)</span>}
              </li>
            ))}
          </ul>
        </>
      );
    }

    if (page.startsWith("do/")) {
      const intent = getIntent(page.slice(3) as IntentId);
      return (
        <>
          <h1 style={h1}>{titleCase(intent.label)}</h1>
          <p>{intent.why}</p>
          <h2 style={h2}>The best way, in order</h2>
          <ol style={{ listStyle: "decimal", paddingLeft: 28 }} className="flex flex-col gap-2">
            {intent.channels.map((id) => {
              const ch = CHANNELS.find((x) => x.id === id)!;
              return (
                <li key={id}>
                  {id === "email" ? (
                    <>
                      <A to="letter">Write me a letter</A> on the next page, or <A href={c.mailto}>use your own mail program</A>.
                    </>
                  ) : id === "call" ? (
                    <>
                      <A to="calendar">Book 30 minutes</A>. {ch.use}
                    </>
                  ) : (
                    <>
                      <A href={ch.href}>{ch.label}</A> <span style={{ font: `13px ${MONO}`, color: SOFT }}>{ch.handle}</span>. {ch.use}
                    </>
                  )}
                </li>
              );
            })}
          </ol>
          <p style={{ marginTop: 16 }}>
            Not quite right? <A to={`who/${c.who}`}>Pick another reason</A>, or see <A to="everywhere">every channel</A>.
          </p>
        </>
      );
    }

    if (page === "letter") {
      return (
        <>
          <h1 style={h1}>A letter to Arun</h1>
          <p>
            I started it from what you picked: <em>{c.intent.label}</em>. Change anything. This page can send it, or you can{" "}
            <A href={c.mailto}>take it to your own mail program</A>.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void c.send();
            }}
            className="mt-4 flex flex-col gap-2"
          >
            <label className="grid gap-1 sm:grid-cols-[120px_1fr] sm:items-center">
              Your name:{" "}
              <input autoComplete="name" value={c.name} onChange={(e) => c.setName(e.target.value)} className="min-h-10" style={input} />
            </label>
            <label className="grid gap-1 sm:grid-cols-[120px_1fr] sm:items-center">
              Your email:{" "}
              <input
                type="email"
                autoComplete="email"
                value={c.from}
                onChange={(e) => c.setFrom(e.target.value)}
                className="min-h-10"
                style={input}
              />
            </label>
            <label className="grid gap-1 sm:grid-cols-[120px_1fr] sm:items-center">
              Subject: <input value={c.subject} onChange={(e) => c.setSubject(e.target.value)} className="min-h-10" style={input} />
            </label>
            <textarea
              aria-label="Your letter"
              rows={10}
              value={c.body}
              onChange={(e) => c.setBody(e.target.value)}
              style={{ ...input, lineHeight: 1.5 }}
            />
            <p className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!c.ready || c.sendState === "sending"}
                className="min-h-11 disabled:opacity-50"
                style={button}
              >
                {c.sendState === "sending" ? "Sending..." : "Submit"}
              </button>
              <button type="button" onClick={c.resetDraft} className="min-h-11" style={button}>
                Reset
              </button>
            </p>
            {c.sendState === "error" ? (
              <p role="alert">
                <strong>Error:</strong> {c.sendError} <A href={c.mailto}>Use your mail program instead.</A>
              </p>
            ) : (
              !c.ready && <p style={{ color: SOFT }}>Submit works once your name, email and a line of your own are in.</p>
            )}
          </form>
        </>
      );
    }

    if (page === "sent") {
      return (
        <>
          <h1 style={h1}>Sent</h1>
          <p>
            Thank you{c.name.trim() ? `, ${c.name.trim().split(" ")[0]}` : ""}. Your letter arrived. I&rsquo;ll reply to{" "}
            <code style={{ fontFamily: MONO }}>{c.from}</code> {c.awake ? "soon" : "once I'm up"}.
          </p>
          <p style={{ marginTop: 12 }}>
            While you wait: <A to="author">who is Arun?</A> or <A href="/#about">the long version of my story</A>.
          </p>
        </>
      );
    }

    if (page === "everywhere") {
      return (
        <>
          <h1 style={h1}>Every channel</h1>
          <dl>
            {CHANNELS.map((ch) => (
              <div key={ch.id} style={{ marginBottom: 10 }}>
                <dt>
                  {ch.id === "call" ? <A to="calendar">{ch.label}</A> : <A href={ch.href}>{ch.label}</A>}{" "}
                  <span style={{ font: `13px ${MONO}`, color: SOFT }}>{ch.handle}</span>
                </dt>
                <dd style={{ marginLeft: 28 }}>{ch.use}</dd>
              </div>
            ))}
          </dl>
        </>
      );
    }

    if (page === "author") {
      return (
        <>
          <h1 style={h1}>Who is Arun?</h1>
          <p>
            {FACTS.name}. Right now: <A href={FACTS.nowHref}>{FACTS.now}</A>. Before that, {FACTS.before}. I live in {FACTS.place} (
            {FACTS.timezone}).
          </p>
          <h2 style={h2}>Open to</h2>
          <ul style={{ listStyle: "disc", paddingLeft: 28 }}>
            {FACTS.openTo.map((o) => (
              <li key={o}>{o}</li>
            ))}
            <li>{FACTS.mode}</li>
          </ul>
          <p style={{ marginTop: 16 }}>
            The long version is <A href="/#about">on the home page</A>. Ready? <A to="contact">Back to the start</A>.
          </p>
        </>
      );
    }

    return (
      <>
        <h1 style={h1}>Book 30 minutes</h1>
        <p>
          Pick any slot that works. A short note first helps; you can <A to="letter">write one here</A>.
        </p>
        <div style={{ marginTop: 12, border: `1px solid ${SOFT}` }}>
          <CalEmbed height={620} />
        </div>
      </>
    );
  })();

  const browser: Browser = {
    visited,
    go,
    visit: (url) => setVisited((v) => new Set(v).add(url)),
    setHover,
  };

  return (
    <BrowserCtx.Provider value={browser}>
      <div
        ref={topRef}
        className="mx-auto max-w-[720px] px-4 pt-6 md:pt-10"
        style={{
          color: TEXT,
          fontFamily: "var(--font-main)",
          fontSize: 18,
          lineHeight: 1.55,
        }}
      >
        <nav
          data-blueprint="header"
          aria-label="Browser"
          className="mb-6 flex flex-col gap-1"
          style={{ font: `13px ${MONO}`, color: SOFT }}
        >
          <p className="flex flex-wrap gap-x-4">
            <button
              type="button"
              onClick={back}
              disabled={history.length < 2}
              className="min-h-9 underline disabled:no-underline disabled:opacity-40"
              style={{ color: LINK }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => jump(0)}
              disabled={page === "contact"}
              className="min-h-9 underline disabled:no-underline disabled:opacity-40"
              style={{ color: LINK }}
            >
              Home
            </button>
            <span className="self-center">
              {history.length} page{history.length === 1 ? "" : "s"} visited
            </span>
          </p>
          <p className="truncate">Address: {urlOf(page)}</p>
        </nav>

        <main data-blueprint="compose" aria-live="polite" key={page}>
          {body}
        </main>

        <footer data-blueprint="channels" className="mt-10 flex flex-col gap-2">
          <hr style={{ borderColor: SOFT }} />
          <p style={{ font: `13px ${MONO}`, color: SOFT }}>
            You followed:{" "}
            {history.map((p, i) => (
              <span key={`${p}-${i}`}>
                {i > 0 && " → "}
                {i === history.length - 1 ? (
                  <span style={{ color: TEXT }}>{fileOf(p)}.html</span>
                ) : (
                  <button type="button" onClick={() => jump(i)} className="underline" style={{ color: VISITED }}>
                    {fileOf(p)}.html
                  </button>
                )}
              </span>
            ))}
          </p>
          <address style={{ fontStyle: "italic" }}>
            {FACTS.name}, {FACTS.place} · <A href={`mailto:${EMAIL}`}>{EMAIL}</A> ·{" "}
            <button type="button" onClick={c.copyEmail} className="underline" style={{ color: LINK, font: "inherit", fontStyle: "italic" }}>
              {c.copied ? "copied" : "copy address"}
            </button>
          </address>
          <p aria-hidden className="min-h-[1.4em] truncate" style={{ font: `12px ${MONO}`, color: SOFT }}>
            {hover ? `Link: ${hover}` : ""}
          </p>
        </footer>
      </div>
    </BrowserCtx.Provider>
  );
}
