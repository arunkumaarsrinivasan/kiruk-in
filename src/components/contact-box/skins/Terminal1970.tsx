"use client";

/**
 * 1970 · talk kiruk — contact as a live teletype conversation.
 *
 * Shaped like talk(1): kiruk's side scrolls on top, your side sits under the
 * divider. kiruk asks, you answer with a number key or a tap. The letter is
 * typed into your half and ended with a lone "." like mail(1). No form is on
 * screen until the moment it's needed, and every reply types itself out
 * (click or press any key to skip).
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { CHANNELS, EMAIL, FACTS, INTENTS, WHO, type Channel, type ContactWhoId, type IntentId } from "@/data/contact";
import type { ContactSkinProps } from "../types";
import { CalEmbed, external } from "../contact-ui";

const G = "#00ff41";
const BRIGHT = "#39ff14";
const DIM = "rgba(0,255,65,0.62)";
const FAINT = "rgba(0,255,65,0.35)";
const CPS = 90;

type Kind = "kiruk" | "you" | "sys" | "finger" | "list" | "cal" | "letter";
interface Line {
  id: number;
  kind: Kind;
  text?: string;
}
type Step = "who" | "intent" | "route" | "write" | "name" | "email" | "confirm" | "done";
interface Opt {
  label: string;
  hint?: string;
  href?: string;
  run?: () => void;
}

const HELLO: Record<ContactWhoId, string> = {
  hiring: "oh, hello. what's on your mind?",
  founder: "a fellow builder. what are we making?",
  designer: "hey, fellow pixel pusher. what's up?",
  student: "hey! i was there not long ago. what do you need?",
  friend: "ayy. what's up?",
  curious: "welcome, wanderer. what brings you here?",
};

const field: CSSProperties = {
  background: "transparent",
  color: BRIGHT,
  border: "none",
  borderRadius: 0,
  outline: "none",
  font: "inherit",
  caretColor: BRIGHT,
};

function Caret({ reduce }: { reduce: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: "0.6em",
        height: "1.05em",
        marginLeft: 2,
        verticalAlign: "text-bottom",
        background: BRIGHT,
        animation: reduce ? "none" : "kiruk-blink 1s steps(1) infinite",
      }}
    />
  );
}

/** Types `text` out at teletype speed, then calls onDone once. */
function Typed({ text, fast, onTick, onDone }: { text: string; fast: boolean; onTick: () => void; onDone: () => void }) {
  const [n, setN] = useState(0);
  const cb = useRef({ onTick, onDone });
  useEffect(() => {
    cb.current = { onTick, onDone };
  });

  useEffect(() => {
    if (fast) {
      setN(text.length);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(text.length, Math.floor(((t - start) / 1000) * CPS));
      setN(k);
      cb.current.onTick();
      if (k < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, fast]);

  useEffect(() => {
    if (n >= text.length) cb.current.onDone();
  }, [n, text.length]);

  return <>{text.slice(0, n)}</>;
}

function FingerBlock({ clock, awake }: { clock: string; awake: boolean }) {
  const rows: [string, ReactNode][] = [
    ["Login:", FACTS.handle],
    ["Name:", FACTS.name],
    ["Office:", FACTS.place],
    ["Local:", `${clock || "--:--"} IST ${awake ? "(around)" : "(asleep)"}`],
    [
      "Plan:",
      <span key="plan">
        {FACTS.now}. <span style={{ color: DIM }}>Before: {FACTS.before}.</span>
      </span>,
    ],
    [
      "Open to:",
      <span key="open-to" className="flex flex-col">
        {FACTS.openTo.map((o) => (
          <span key={o}>- {o.toLowerCase()}</span>
        ))}
        <span style={{ color: DIM }}>{FACTS.mode.toLowerCase()}</span>
      </span>,
    ],
  ];
  return (
    <div className="my-1 flex flex-col pl-3" style={{ borderLeft: `1px solid ${FAINT}` }}>
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[9ch_1fr] gap-x-2">
          <span style={{ color: DIM }}>{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  );
}

function ChannelList() {
  return (
    <ul className="my-1 flex flex-col pl-3" style={{ borderLeft: `1px solid ${FAINT}` }}>
      {CHANNELS.map((ch) => (
        <li key={ch.id} className="grid grid-cols-[10ch_1fr] gap-x-2 md:grid-cols-[10ch_26ch_1fr]">
          <a href={ch.href} {...external(ch.href)} className="underline-offset-4 hover:underline" style={{ color: BRIGHT }}>
            {ch.slug}
          </a>
          <span className="truncate">{ch.handle}</span>
          <span className="col-span-2 md:col-span-1" style={{ color: DIM }}>
            # {ch.use.toLowerCase()}
          </span>
        </li>
      ))}
    </ul>
  );
}

const say = (text: string) => ({ kind: "you" as const, text });
const kiruk = (text: string) => ({ kind: "kiruk" as const, text });
const sys = (text: string) => ({ kind: "sys" as const, text });

export function Terminal1970({ contact: c }: ContactSkinProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [shown, setShown] = useState(0);
  const [fast, setFast] = useState(false);
  const [step, setStep] = useState<Step>("who");
  const [entry, setEntry] = useState("");
  const nextId = useRef(0);
  const screenRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const entryRef = useRef<HTMLInputElement>(null);
  const optRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  const busy = shown < lines.length;
  const first = c.name.trim().split(" ")[0]?.toLowerCase() ?? "";

  const push = useCallback((...add: Omit<Line, "id">[]) => {
    setLines((prev) => [...prev, ...add.map((l) => ({ ...l, id: nextId.current++ }))]);
  }, []);

  const scrollDown = useCallback(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const greet = useCallback(() => {
    push(
      sys("[connected to kiruk@bengaluru]"),
      kiruk(
        c.awake
          ? `hey. it's ${c.clock} in bengaluru and i'm around. who's this?`
          : `it's ${c.clock} in bengaluru, so i'm asleep. this is my answering machine. who's this?`,
      ),
    );
    setStep("who");
  }, [push, c.awake, c.clock]);

  // Dial in once the clock is known, so the first line can say what time it is here.
  const dialed = useRef(false);
  useEffect(() => {
    if (dialed.current || !c.clock) return;
    dialed.current = true;
    greet();
    rootRef.current?.focus({ preventScroll: true });
  }, [c.clock, greet]);

  // Reveal queued lines in order: kiruk types, everything else lands at once.
  useEffect(() => {
    const next = lines[shown];
    if (!next || (next.kind === "kiruk" && !c.reduce && !fast)) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), next.kind === "sys" && !fast ? 260 : 0);
    return () => window.clearTimeout(t);
  }, [lines, shown, c.reduce, fast]);

  useEffect(() => {
    if (!busy) setFast(false);
    scrollDown();
  }, [busy, shown, scrollDown]);

  // Put the caret where the visitor types next.
  useEffect(() => {
    if (busy) return;
    if (step === "write") {
      const el = textRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      // Land on the template's first blank ("The role: |"), or at the end.
      const blank = el.value.indexOf(": \n");
      const at = blank >= 0 ? blank + 2 : el.value.length;
      el.setSelectionRange(at, at);
    } else if (step === "name" || step === "email") entryRef.current?.focus({ preventScroll: true });
    else rootRef.current?.focus({ preventScroll: true });
  }, [busy, step]);

  const restart = () => {
    setLines([]);
    setShown(0);
    setEntry("");
    greet();
  };

  const pickWho = (id: ContactWhoId) => {
    push(say(WHO.find((w) => w.id === id)!.label), kiruk(HELLO[id]));
    c.setWho(id);
    setStep("intent");
  };

  const pickIntent = (id: IntentId) => {
    const it = INTENTS.find((i) => i.id === id)!;
    push(say(it.label), kiruk(it.why.toLowerCase()), kiruk("so, what now?"));
    c.setIntent(id);
    setStep("route");
  };

  const startWrite = (again = false) => {
    push(
      say(again ? "let me edit" : "write it here"),
      kiruk(
        again
          ? "sure, edit away. end with a '.' on its own line."
          : "go ahead. i started it for you, change anything. end with a '.' on its own line, or press ctrl+enter.",
      ),
    );
    setStep("write");
  };

  const finishWrite = (raw: string) => {
    const body = raw.replace(/\n\.\s*$/, "").trimEnd();
    c.setBody(body);
    if (body.trim() === c.intent.body.trim() || body.trim().length <= 10) {
      push(kiruk("that's still my template. add a line of your own?"));
      return;
    }
    push({ kind: "letter", text: body }, kiruk("got it. who's it from? just a name."));
    setEntry(c.name);
    setStep("name");
  };

  const submitEntry = () => {
    const v = entry.trim();
    if (!v) return;
    if (step === "name") {
      c.setName(v);
      push(say(v), kiruk(`thanks, ${v.split(" ")[0].toLowerCase()}. your email, so i can write back?`));
      setEntry(c.from);
      setStep("email");
      return;
    }
    push(say(v));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      push(kiruk("hm, that doesn't look like an email. once more?"));
      return;
    }
    c.setFrom(v);
    push(kiruk("send it?"));
    setEntry("");
    setStep("confirm");
  };

  // Report what the network did with the letter.
  const lastSend = useRef(c.sendState);
  useEffect(() => {
    if (lastSend.current === c.sendState) return;
    lastSend.current = c.sendState;
    if (c.sendState === "sent") {
      const thanks = `sent. thanks${first ? `, ${first}` : ""}.`;
      push(
        sys("[mail delivered]"),
        kiruk(c.awake ? `${thanks} i'll read it today and reply to ${c.from}.` : `${thanks} i'll read it when i wake up and reply to ${c.from}.`),
      );
      setStep("done");
    } else if (c.sendState === "error") {
      push(kiruk(`the line dropped: ${c.sendError.toLowerCase()} want to use your mail app instead?`));
      setStep("confirm");
    }
  }, [c.sendState, c.sendError, c.awake, c.from, first, push]);

  const writeOpt: Opt = { label: "write it here", hint: "takes a minute", run: () => startWrite() };
  const mailOpt: Opt = {
    label: "use my own mail app",
    hint: EMAIL,
    href: c.mailto,
    run: () => push(say("mail app"), sys("[handed the draft to your mail program]")),
  };
  const listOpt: Opt = { label: "show every channel", run: () => push(say("every channel"), kiruk("here's everywhere i am:"), { kind: "list" }) };
  const fingerOpt: Opt = { label: "finger kiruk", hint: "who is this person", run: () => push(say("finger kiruk"), { kind: "finger" }) };

  const channelOpts = (ch: Channel): Opt[] => {
    if (ch.id === "email") return [writeOpt, mailOpt];
    if (ch.id === "call") {
      return [{ label: "book 30 minutes", hint: "cal.com", run: () => push(say("book a call"), kiruk("pick any slot that works:"), { kind: "cal" }) }];
    }
    return [
      {
        label: `open ${ch.slug}`,
        hint: ch.handle,
        href: ch.href,
        run: () => push(say(`open ${ch.slug}`), sys(`[${ch.handle} opened in a new window]`)),
      },
    ];
  };

  const usual = WHO.find((w) => w.id === c.who)?.intent;
  let opts: Opt[] = [];
  if (step === "who") opts = WHO.map((w) => ({ label: w.label, run: () => pickWho(w.id) }));
  else if (step === "intent")
    opts = [...INTENTS]
      .sort((a, b) => Number(b.id === usual) - Number(a.id === usual))
      .map((i) => ({ label: i.label, hint: i.id === usual ? "the usual" : undefined, run: () => pickIntent(i.id) }));
  else if (step === "route")
    opts = [
      ...c.picks.flatMap(channelOpts),
      ...(c.picks.some((p) => p.id === "email") ? [] : [writeOpt]),
      listOpt,
      fingerOpt,
      { label: "hang up", hint: "start over", run: restart },
    ];
  else if (step === "confirm")
    opts = [
      {
        label: "send it",
        run: () => {
          push(say("yes"), sys("[sending]"));
          void c.send();
        },
      },
      { label: "edit the letter", run: () => startWrite(true) },
      mailOpt,
    ];
  else if (step === "done") opts = [listOpt, fingerOpt, { label: "start over", run: restart }];

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    const typing = tag === "TEXTAREA" || tag === "INPUT";
    if (busy && !typing) {
      setFast(true);
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    const n = Number(e.key);
    if (n >= 1 && n <= opts.length) {
      e.preventDefault();
      optRefs.current[n - 1]?.click();
    }
  };

  const renderLine = (l: Line, i: number) => {
    const typing = i === shown;
    switch (l.kind) {
      case "kiruk":
        return (
          <p key={l.id} style={{ color: BRIGHT }}>
            <span style={{ color: DIM }}>kiruk: </span>
            {typing ? <Typed text={l.text!} fast={fast || c.reduce} onTick={scrollDown} onDone={() => setShown(i + 1)} /> : l.text}
            {typing && <Caret reduce={c.reduce} />}
          </p>
        );
      case "you":
        return (
          <p key={l.id} style={{ color: DIM }}>
            you: {l.text}
          </p>
        );
      case "sys":
        return (
          <p key={l.id} style={{ color: FAINT }}>
            {l.text}
          </p>
        );
      case "finger":
        return <FingerBlock key={l.id} clock={c.clock} awake={c.awake} />;
      case "list":
        return <ChannelList key={l.id} />;
      case "letter":
        return (
          <pre key={l.id} className="my-1 whitespace-pre-wrap pl-3" style={{ font: "inherit", color: G, borderLeft: `1px solid ${DIM}` }}>
            {l.text}
            {"\n."}
          </pre>
        );
      case "cal":
        return (
          <div key={l.id} className="my-2" style={{ border: `1px solid ${DIM}` }}>
            <CalEmbed height={520} />
          </div>
        );
    }
  };

  const btn: CSSProperties = { color: "#000", background: BRIGHT, textShadow: "none" };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:pt-10" style={{ fontFamily: "var(--font-main)" }}>
      <div
        ref={rootRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="flex flex-col text-[15px] leading-relaxed outline-none md:text-[17px]"
        style={{ background: "#000", color: G, border: `1px solid ${FAINT}`, textShadow: "0 0 6px rgba(0,255,65,0.35)" }}
      >
        <header
          data-blueprint="header"
          className="flex flex-wrap items-baseline justify-between gap-x-4 px-4 py-2 md:px-6"
          style={{ borderBottom: `1px solid ${FAINT}` }}
        >
          <h1 className="text-[length:inherit] font-normal">
            <span style={{ color: DIM }}>talk:</span> kiruk@bengaluru
          </h1>
          <span style={{ color: DIM }}>
            {c.clock || "--:--"} IST · {c.awake ? "around" : "asleep"}
          </span>
        </header>

        <div
          ref={screenRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation with kiruk"
          onClick={() => busy && setFast(true)}
          className="flex h-[50vh] min-h-[300px] flex-col gap-1.5 overflow-y-auto px-4 py-4 md:px-6"
        >
          {lines.slice(0, shown + 1).map(renderLine)}
        </div>

        <section
          data-blueprint="compose"
          aria-label="Your side"
          className="min-h-[180px] px-4 pb-4 pt-2 md:px-6"
          style={{ borderTop: `1px dashed ${DIM}` }}
        >
          <p className="mb-2" style={{ color: FAINT }}>
            you@kiruk.in {busy ? "· kiruk is typing (any key skips)" : opts.length ? "· press a number, or tap one" : ""}
          </p>

          {!busy && opts.length > 0 && (
            <ol className="flex flex-col">
              {opts.map((o, i) => {
                const inner = (
                  <>
                    <span style={{ color: DIM }}>[{i + 1}]</span> {o.label}
                    {o.hint && <span style={{ color: DIM }}> # {o.hint}</span>}
                  </>
                );
                const cls = "min-h-10 w-full text-left underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-1";
                const ref = (el: HTMLAnchorElement | HTMLButtonElement | null) => {
                  optRefs.current[i] = el;
                };
                return (
                  <li key={o.label}>
                    {o.href ? (
                      <a ref={ref} href={o.href} onClick={o.run} className={`inline-flex items-center ${cls}`} style={{ color: BRIGHT, outlineColor: BRIGHT }} {...external(o.href)}>
                        <span>{inner}</span>
                      </a>
                    ) : (
                      <button ref={ref} type="button" onClick={o.run} className={cls} style={{ color: BRIGHT, outlineColor: BRIGHT }}>
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}

          {!busy && step === "write" && (
            <div className="flex flex-col gap-2">
              <textarea
                ref={textRef}
                aria-label="Your letter. End with a full stop on its own line."
                rows={8}
                value={c.body}
                onChange={(e) => {
                  if (/\n\.\s*$/.test(e.target.value)) finishWrite(e.target.value);
                  else c.setBody(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    finishWrite(c.body);
                  }
                }}
                className="w-full resize-y p-2"
                style={{ ...field, border: `1px dashed ${FAINT}` }}
              />
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => finishWrite(c.body)} className="min-h-11 px-3 uppercase tracking-wider" style={btn}>
                  . done
                </button>
                <button type="button" onClick={c.resetDraft} className="min-h-11 underline underline-offset-4" style={{ color: DIM }}>
                  reset draft
                </button>
              </div>
            </div>
          )}

          {!busy && (step === "name" || step === "email") && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitEntry();
              }}
              className="flex items-center gap-2"
            >
              <span style={{ color: DIM }}>{step}&gt;</span>
              <input
                ref={entryRef}
                aria-label={step === "name" ? "Your name" : "Your email"}
                type={step === "email" ? "email" : "text"}
                autoComplete={step === "email" ? "email" : "name"}
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                className="min-h-11 min-w-0 flex-1"
                style={field}
              />
              <button type="submit" className="min-h-11 px-3 uppercase" style={btn}>
                enter
              </button>
            </form>
          )}
        </section>
      </div>
      <style>{`@keyframes kiruk-blink{50%{opacity:0}}`}</style>
    </div>
  );
}
