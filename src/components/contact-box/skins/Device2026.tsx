"use client";

/**
 * 2026 · No screen. Contact as a talk with the pocket device from the home.
 *
 * There are no pages here, only captions. Hold the button (or the screen, or
 * Space) and type what you need: typing is the voice, nothing touches the
 * microphone. A small local reader (keywords and weights, no model) works out
 * who you are and what you want, the tiny screen says so in dots, and the
 * captions under the device say why. Then roll the wheel through the ways in,
 * best first, and press to choose. Email drafts a note from your own words on
 * a card that slides up; the call opens the calendar; the rest open in a new
 * tab. A plain list of every way in sits at the bottom for people who would
 * rather not talk to a gadget.
 *
 * The device is drawn like the home's (src/components/era-shell/archetypes/
 * prompt-ui/Device.tsx): em units off one width, so it scales as one object.
 */

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CHANNELS, EMAIL, FACTS, INTENTS, WHO, getChannel, getIntent, type Channel, type ContactWhoId, type IntentId } from "@/data/contact";
import { DOTS_2026, FONT_VARS_2026, MONO_2026, SANS_2026 } from "@/components/era-shell/archetypes/prompt-ui/fonts";
import { draftFrom, read, sentence } from "@/data/contact-reader";
import type { ContactSkinProps } from "../types";
import { CalEmbed, external, statusLine } from "../contact-ui";

const INK = "#161513";
const MUTED = "#77736b";
const LINE = "#d3d0c8";
const ROOM = "#e8e6e1";
const CARD = "#f2f1ed";
const ORANGE = "#ff4f00";

const EASE = [0.23, 1, 0.32, 1] as const;
/** A press longer than this is a hold: push to talk. Shorter is a tap. */
const HOLD_MS = 280;
const WHEEL_PITCH = 40;
const DRAG_PITCH = 18;
const RIDGES = 14;
const BARS = [0.35, 0.6, 0.9, 0.55, 1, 0.7, 0.4, 0.85, 0.5, 0.65, 0.3];

/** Spoken by tapping them. Phrased as the visitor would say them. */
const EXAMPLES = [
  "I’m hiring for a design engineering role",
  "I’m building a product and need a design engineer",
  "I’d like feedback on my portfolio",
  "I’m a student and could use some advice",
];

const whoLabel = (who: ContactWhoId) => WHO.find((w) => w.id === who)!.label;
/** "Just curious · just say hi" reads twice; drop the second "just". */
const intentLabel = (who: ContactWhoId, id: IntentId) => (who === "curious" ? getIntent(id).label.replace(/^just /, "") : getIntent(id).label);
const isTemplate = (body: string) => INTENTS.some((i) => i.body.trim() === body.trim());
const isStockSubject = (subject: string) => INTENTS.some((i) => i.subject === subject);
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/* ── what the wheel rolls through ───────────────────────────────────── */

type Item = { kind: "channel"; ch: Channel } | { kind: "write" } | { kind: "about" } | { kind: "reset" };
type Panel = "none" | "write" | "call" | "about";
type View = "idle" | "listening" | "menu" | "write" | "call" | "about";

const itemName = (it: Item) =>
  it.kind === "channel" ? it.ch.label : it.kind === "write" ? "Write to Arun" : it.kind === "about" ? "Who is Arun" : "Start over";
/** The tiny screen has room for about ten dots a line. */
const screenName = (it: Item) => (it.kind === "channel" ? it.ch.label.replace("Instagram", "IG") : itemName(it));

interface Heard {
  /** What they typed, as typed. */
  text: string;
  /** Their words as the draft's opening line. */
  said: string;
  words: string[];
}

/* ── pieces ─────────────────────────────────────────────────────────── */

const ring = "focus-visible:outline-2 focus-visible:outline-offset-2";
const card: CSSProperties = { background: CARD, border: `1px solid ${LINE}`, borderRadius: 14 };
const field: CSSProperties = { background: ROOM, color: INK, border: `1px solid ${LINE}`, borderRadius: 10, outlineColor: INK };
const newTab = <span className="sr-only"> (opens in a new tab)</span>;

interface BtnProps {
  children: ReactNode;
  primary?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

function Btn({ children, primary, href, onClick, type = "button", disabled }: BtnProps) {
  const cls =
    `inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium transition-[background-color,opacity,transform] duration-150 ${ring} ` +
    "motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 " +
    (primary ? "hover:opacity-90" : "hover:bg-[#161513]/5");
  const style: CSSProperties = {
    border: `1px solid ${primary ? INK : LINE}`,
    background: primary ? INK : "transparent",
    color: primary ? CARD : INK,
    outlineColor: INK,
  };
  if (href) {
    return (
      <a href={href} onClick={onClick} className={cls} style={style} {...external(href)}>
        {children}
        {href.startsWith("http") && newTab}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} style={style}>
      {children}
    </button>
  );
}

function TextBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center px-1 text-[15px] underline decoration-[#161513]/35 underline-offset-4 transition-colors hover:decoration-[#161513] ${ring}`}
      style={{ color: INK, outlineColor: INK }}
    >
      {children}
    </button>
  );
}

function RollBtn({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === -1 ? "Roll up" : "Roll down"}
      onClick={onClick}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:bg-[#161513]/5 ${ring}`}
      style={{ borderColor: LINE, color: INK, outlineColor: INK }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={dir === -1 ? "M3 9l4-4 4 4" : "M3 5l4 4 4-4"} />
      </svg>
    </button>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px]" style={{ color: MUTED }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── skin ───────────────────────────────────────────────────────────── */

export function Device2026({ contact: c }: ContactSkinProps) {
  const [heard, setHeard] = useState<Heard | null>(null);
  /** Rolled the wheel (or skipped talking) without saying anything. */
  const [browsing, setBrowsing] = useState(false);
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState("");
  const [sel, setSel] = useState(0);
  /** Rolled since the last answer: captions describe the item, not the reading. */
  const [moved, setMoved] = useState(false);
  const [panel, setPanel] = useState<Panel>("none");
  /** With a card open, the screen and captions follow it until the wheel moves. */
  const [showing, setShowing] = useState<"menu" | "panel">("menu");
  const [fact, setFact] = useState(0);
  const [turns, setTurns] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [holding, setHolding] = useState(false);
  const [flash, setFlash] = useState("");
  /** The last draft I wrote, so I can tell when they've started editing it. */
  const [gen, setGen] = useState({ body: "", subject: "" });
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);

  const deviceRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  // Cards cross-fade: the leaving one must not clear the ref the arriving one just set.
  const setCard = (el: HTMLElement | null) => {
    if (el) cardRef.current = el;
  };
  const nameRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const press = useRef<{ src: "pointer" | "key"; held: boolean; timer: number } | null>(null);
  const drag = useRef<{ id: number; y: number } | null>(null);
  const jump = useRef(false);
  const logId = useRef(0);
  const turnRef = useRef<(d: 1 | -1) => void>(() => undefined);
  const wheelLive = useRef(false);

  const items: Item[] = [...c.all.map((ch) => ({ kind: "channel" as const, ch })), { kind: "write" }, { kind: "about" }, { kind: "reset" }];
  const n = items.length;
  const item = items[sel] ?? items[0];
  const sent = c.sendState === "sent";
  const first = c.name.trim().split(" ")[0];

  const view: View = listening
    ? "listening"
    : panel !== "none" && showing === "panel"
      ? panel
      : heard || browsing
        ? "menu"
        : "idle";

  const facts: { k: string; t: string }[] = [
    { k: "Name", t: `I’m ${FACTS.name}. You’ll also see me as ${FACTS.handle}.` },
    { k: "Now", t: `Right now: ${FACTS.now}.` },
    { k: "Before", t: `Before that: ${FACTS.before}.` },
    { k: "Place", t: `I’m based in ${FACTS.place}, ${FACTS.timezone}.` },
    { k: "How", t: FACTS.mode },
    { k: "Open to", t: `I’m open to ${list(FACTS.openTo.map(lowerFirst))}.` },
    { k: "Status", t: statusLine(c) },
  ];

  /* ── actions ── */

  const say = (text: string) => setLog((l) => [...l.slice(-40), { id: ++logId.current, text }]);

  const beginListening = () => {
    flushSync(() => {
      setListening(true);
      setFlash("");
    });
    inputRef.current?.focus({ preventScroll: true });
  };

  const stopListening = () => {
    setListening(false);
    setDraft("");
    deviceRef.current?.focus({ preventScroll: true });
  };

  /** Point the draft at an intent. Rewrite it from their words unless they've started editing; then only their old sentence is swapped. */
  const redraft = (intentId: IntentId, said: string, oldSaid: string) => {
    const intent = getIntent(intentId);
    const nextGen = { ...gen };
    if (!c.body.trim() || isTemplate(c.body) || c.body === gen.body) {
      nextGen.body = draftFrom(intent, said);
      c.setBody(nextGen.body);
    } else if (oldSaid && said && said !== oldSaid && c.body.includes(oldSaid)) {
      c.setBody(c.body.replace(oldSaid, said));
    }
    if (isStockSubject(c.subject) || c.subject === gen.subject) {
      nextGen.subject = intent.subject;
      c.setSubject(nextGen.subject);
    }
    setGen(nextGen);
  };

  const redraftNow = () => {
    const body = draftFrom(c.intent, heard?.said ?? "");
    c.setBody(body);
    c.setSubject(c.intent.subject);
    setGen({ body, subject: c.intent.subject });
  };

  const ask = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const r = read(text);
    const said = sentence(text);
    c.setWho(r.who);
    c.setIntent(r.intent);
    redraft(r.intent, said, heard?.said ?? "");
    setHeard({ text, said, words: r.heard });
    setListening(false);
    setDraft("");
    setSel(0);
    setMoved(false);
    setPanel("none");
    setShowing("menu");
    setFlash("");
    say(`You: ${text}`);
    deviceRef.current?.focus({ preventScroll: true });
  };

  const startOver = () => {
    setHeard(null);
    setBrowsing(false);
    setListening(false);
    setDraft("");
    setSel(0);
    setMoved(false);
    setPanel("none");
    setShowing("menu");
    setFact(0);
    setFlash("");
    deviceRef.current?.focus({ preventScroll: true });
  };

  const openPanel = (p: Exclude<Panel, "none">) => {
    setListening(false);
    setFlash("");
    setPanel(p);
    setShowing("panel");
    if (p === "about") setFact(0);
    jump.current = p !== "about";
  };

  const closePanel = () => {
    setPanel("none");
    setShowing("menu");
    deviceRef.current?.focus({ preventScroll: true });
  };

  const goToCard = () => {
    const el = cardRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: c.reduce ? "auto" : "smooth", block: "start" });
    if (panel === "write" && !sent) {
      if (!c.name.trim()) {
        nameRef.current?.focus({ preventScroll: true });
        return;
      }
      const body = bodyRef.current;
      if (!body) return;
      body.focus({ preventScroll: true });
      // Land on the template's first blank ("The role: |"), or at the end.
      const blank = body.value.indexOf(": \n");
      const at = blank >= 0 ? blank + 2 : body.value.length;
      body.setSelectionRange(at, at);
      return;
    }
    el.focus({ preventScroll: true });
  };

  const turn = (d: 1 | -1) => {
    if (listening) return;
    setTurns((t) => t + d);
    setFlash("");
    if (view === "about") {
      const next = fact + d;
      if (next >= 0 && next < facts.length) {
        setFact(next);
        return;
      }
      setPanel("none");
      setShowing("menu");
      setSel(n - 2);
      setMoved(true);
      return;
    }
    if (view === "idle") {
      setSel(d === 1 ? 0 : n - 1);
    } else {
      setSel((s) => (((s + d) % n) + n) % n);
    }
    setMoved(true);
    setBrowsing(true);
    setShowing("menu");
  };

  /** A tap of the button, Enter, or a tap of the visible control under the device. */
  const choose = () => {
    setFlash("");
    if (view === "listening") {
      if (draft.trim()) ask(draft);
      else stopListening();
      return;
    }
    if (view === "idle") return beginListening();
    if (view === "about") {
      if (fact < facts.length - 1) {
        setFact(fact + 1);
      } else {
        setPanel("none");
        setShowing("menu");
        setMoved(true);
      }
      return;
    }
    if (view === "write" || view === "call") return goToCard();
    if (item.kind === "reset") return startOver();
    if (item.kind === "about") return openPanel("about");
    if (item.kind === "write" || item.ch.id === "email") return openPanel("write");
    if (item.ch.id === "call") return openPanel("call");
    window.open(item.ch.href, "_blank", "noopener,noreferrer");
    setFlash(`Opened ${item.ch.handle} in a new tab.`);
  };

  const back = () => {
    if (listening) stopListening();
    else if (panel === "about") closePanel();
    else if (showing === "panel") setShowing("menu");
  };

  /* ── push to talk ── */

  const pressStart = (src: "pointer" | "key") => {
    if (press.current) return;
    const p = { src, held: false, timer: 0 };
    p.timer = window.setTimeout(() => {
      p.held = true;
      setHolding(true);
      beginListening();
    }, HOLD_MS);
    press.current = p;
    setPressed(true);
  };

  const pressEnd = (cancel = false) => {
    const p = press.current;
    if (!p) return;
    press.current = null;
    window.clearTimeout(p.timer);
    setPressed(false);
    setHolding(false);
    if (cancel) return;
    if (!p.held) return choose();
    // Let go: send what they typed. Nothing typed yet, so keep listening.
    if (draft.trim()) ask(draft);
    else inputRef.current?.focus({ preventScroll: true });
  };

  const onPressDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!listening) deviceRef.current?.focus({ preventScroll: true });
    pressStart("pointer");
  };
  const onPressUp = () => {
    if (press.current?.src === "pointer") pressEnd();
  };
  const onPressCancel = () => {
    if (press.current?.src === "pointer") pressEnd(true);
  };

  const onDeviceKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      turn(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === " ") {
      e.preventDefault();
      if (!e.repeat) pressStart("key");
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!e.repeat) choose();
    } else if (e.key === "Escape") {
      back();
    }
  };

  // Space goes up wherever focus went while it was held (usually the caption field).
  const onRootKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " && press.current?.src === "key") {
      e.preventDefault();
      pressEnd();
    }
  };

  /* ── the wheel ── */

  const onWheelDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    deviceRef.current?.focus({ preventScroll: true });
    drag.current = { id: e.pointerId, y: e.clientY };
  };
  const onWheelMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    let dy = e.clientY - d.y;
    while (Math.abs(dy) >= DRAG_PITCH) {
      const dir = dy > 0 ? 1 : -1;
      dy -= dir * DRAG_PITCH;
      d.y += dir * DRAG_PITCH;
      turn(dir);
    }
  };
  const onWheelUp = () => {
    drag.current = null;
  };

  useEffect(() => {
    turnRef.current = turn;
    wheelLive.current = view !== "idle" && view !== "listening";
  });

  // A mouse wheel over the device rolls its wheel, once there's something to roll.
  // In the idle room the page scrolls as usual.
  useEffect(() => {
    const el = deviceRef.current;
    if (!el) return;
    let acc = 0;
    let at = 0;
    const onWheel = (e: WheelEvent) => {
      if (!wheelLive.current) return;
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const d = e.deltaY * scale;
      const now = performance.now();
      if (now - at > 220 || acc * d < 0) acc = 0;
      at = now;
      acc += d;
      while (Math.abs(acc) >= WHEEL_PITCH) {
        const dir = acc > 0 ? 1 : -1;
        acc -= dir * WHEEL_PITCH;
        turnRef.current(dir);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* ── effects ── */

  // A card just opened: bring it up and put the caret where they'll type.
  useEffect(() => {
    if (!jump.current || (panel !== "write" && panel !== "call")) return;
    jump.current = false;
    goToCard();
  });

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(""), 2600);
    return () => window.clearTimeout(t);
  }, [flash]);

  const lastSend = useRef(c.sendState);
  useEffect(() => {
    if (lastSend.current === c.sendState) return;
    lastSend.current = c.sendState;
    if (c.sendState === "sent") sentRef.current?.focus({ preventScroll: true });
  }, [c.sendState]);

  /* ── what the device says ── */

  const heardLine = !heard
    ? ""
    : heard.words.length
      ? `I went by ${list(heard.words.map((w) => `“${w}”`))}.`
      : "I couldn’t place that, so this is my best guess.";

  const verb = (ch: Channel) => (ch.id === "email" ? "write to me" : ch.id === "call" ? "book a slot" : `open ${ch.label}`);

  const describe = (it: Item, i: number): [string, string] => {
    if (it.kind === "channel") {
      const rank = heard && i < c.picks.length ? `Pick ${i + 1} for this. ` : "";
      return [it.ch.use, `${it.ch.handle}. ${rank}Press the button to ${verb(it.ch)}.`];
    }
    if (it.kind === "write") return ["I’ll start a note from your words. You change anything, then send.", "Press the button to write."];
    if (it.kind === "about") return ["Who I am, one line at a time.", "Press the button to hear it."];
    return ["Clear this and ask me something else.", "Press the button to start over."];
  };

  let line = "";
  let sub = "";
  switch (view) {
    case "idle":
      line = "Hold the button and tell me what you need.";
      sub = statusLine(c);
      break;
    case "listening":
      sub = holding ? "Let go when you’re done." : "Press Enter when you’re done. Esc to stop.";
      break;
    case "menu":
      if (!moved && heard) [line, sub] = [c.intent.why, `${heardLine} Scroll to choose.`];
      else if (!moved) [line, sub] = ["Here’s every way to reach me.", "Scroll to choose. Press the button to pick one."];
      else [line, sub] = describe(item, sel);
      break;
    case "write":
      if (c.sendState === "sending") [line, sub] = ["Sending it now.", ""];
      else if (sent) [line, sub] = [`Sent. Thanks${first ? `, ${first}` : ""}.`, `I’ll reply to ${c.from}. ${statusLine(c)}`];
      else if (c.sendState === "error") [line, sub] = ["That didn’t go through.", `${c.sendError} Your mail app still works.`];
      else if (heard?.said) [line, sub] = ["I drafted a note from your words. Change anything, then send.", `It opens: “${heard.said}”`];
      else [line, sub] = ["Here’s a note to start from. Change anything, then send.", "It comes straight to my inbox."];
      break;
    case "call":
      [line, sub] = ["Pick any slot that works.", getChannel("call").use];
      break;
    case "about":
      line = facts[fact].t;
      sub = fact < facts.length - 1 ? `${fact + 1} of ${facts.length}. Scroll or press for the next line.` : `${facts.length} of ${facts.length}. Press to go back to the list.`;
      break;
  }
  if (flash) sub = flash;

  const spoken = view === "listening" ? "Listening. Type what you need, then press Enter." : `${line} ${sub}`.trim();
  useEffect(() => {
    setLog((l) => (l[l.length - 1]?.text === spoken ? l : [...l.slice(-40), { id: ++logId.current, text: spoken }]));
  }, [spoken]);

  const pressLabel =
    view === "idle"
      ? "Talk"
      : view === "listening"
        ? draft.trim()
          ? "Done"
          : "Stop"
        : view === "about"
          ? fact < facts.length - 1
            ? "Next"
            : "Back to the list"
          : view === "write"
            ? "Go to the note"
            : view === "call"
              ? "Go to the calendar"
              : `Choose ${itemName(item)}`;

  const hint =
    view === "idle"
      ? "Hold the button on top, or the screen. Or tap Talk."
      : view === "listening"
        ? "Typing is the voice here. Nothing uses your microphone."
        : view === "about"
          ? "Roll the wheel for the next line."
          : view === "menu"
            ? "Roll the wheel to choose. Press the button to pick."
            : "Roll the wheel to look at other ways in. Hold to ask again.";

  /* ── the tiny screen ── */

  const summary = heard ? `${whoLabel(c.who)} · ${intentLabel(c.who, c.intent.id)}` : "Every way in";

  const screen = (): ReactNode => {
    if (view === "idle") {
      return (
        <div className="c26-scr" key="idle">
          <p className="c26-top">
            <span className="c26-face">
              <i />
              <i />
            </span>
            <span>Bengaluru</span>
          </p>
          <p className="c26-title">{c.clock || "--:--"}</p>
          <p className="c26-small">{c.awake ? "Around. Hold to talk" : "Asleep. Hold to leave a note"}</p>
        </div>
      );
    }
    if (view === "listening") {
      return (
        <div className="c26-scr c26-scr--listen" key="listen">
          <p className="c26-top">
            <span>Listening</span>
            <span className="c26-rec" />
          </p>
          <div className="c26-wave">
            {BARS.map((h, i) => (
              <span key={i} style={{ ["--h" as string]: h, animationDelay: `${(i % 5) * -0.18}s` }} />
            ))}
          </div>
          <p className="c26-small">{draft.trim() ? draft.trim().slice(-48) : "Type, I’m listening"}</p>
        </div>
      );
    }
    if (view === "write") {
      const state = { idle: "Writing", sending: "Sending", sent: "Sent", error: "Error" }[c.sendState];
      return (
        <div className="c26-scr" key={`w-${c.sendState}`}>
          <p className="c26-top">
            <span>{summary}</span>
          </p>
          <p className={state.length <= 5 ? "c26-title" : "c26-big"} data-tone="orange">
            {state}
          </p>
          <p className="c26-small">{sent ? "Reply on its way" : "To Arun"}</p>
        </div>
      );
    }
    if (view === "call") {
      return (
        <div className="c26-scr" key="call">
          <p className="c26-top">
            <span>30-min call</span>
          </p>
          <p className="c26-big" data-tone="orange">
            Calendar
          </p>
          <p className="c26-small">Pick a slot</p>
        </div>
      );
    }
    if (view === "about") {
      return (
        <div className="c26-scr" key={`a-${fact}`}>
          <p className="c26-top">
            <span>Who is Arun</span>
            <span>
              {fact + 1}/{facts.length}
            </span>
          </p>
          <p className="c26-big">{facts[fact].k}</p>
          <p className="c26-small">{facts[fact].t}</p>
        </div>
      );
    }
    return (
      <div className="c26-scr" key={flash ? "flash" : `m-${sel}`}>
        <p className="c26-top">
          <span>{summary}</span>
          <span>
            {sel + 1}/{n}
          </span>
        </p>
        {flash ? (
          <p className="c26-big" data-tone="orange">
            Opened
          </p>
        ) : (
          <p className="c26-big">{screenName(item)}</p>
        )}
        <p className="c26-small">
          {item.kind === "channel"
            ? `${heard && sel < c.picks.length ? `Pick ${sel + 1} · ` : ""}${item.ch.handle}`
            : item.kind === "write"
              ? "From your words"
              : item.kind === "about"
                ? "One line at a time"
                : "Ask again"}
        </p>
      </div>
    );
  };

  /* ── the note card ── */

  const missing = [
    !c.name.trim() && "your name",
    !isEmail(c.from) && "an email I can reply to",
    (c.body.trim().length <= 10 || c.body.trim() === c.intent.body.trim()) && "a line of your own",
  ].filter((m): m is string => !!m);
  const ready = c.ready ? "Ready when you are." : `Add ${list(missing)}, then send.`;

  const panelHead = (title: string) => (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-3">
      <h2 className="text-[11px] font-normal uppercase tracking-[0.16em]" style={{ fontFamily: MONO_2026, color: MUTED }}>
        {title}
      </h2>
      <div className="flex items-center gap-3">
        {panel === "write" && !sent && c.body !== gen.body && (
          <TextBtn onClick={redraftNow}>{heard?.said ? "Redraft from your words" : "Reset draft"}</TextBtn>
        )}
        <TextBtn onClick={closePanel}>Hide</TextBtn>
      </div>
    </div>
  );

  const motionIn = {
    initial: c.reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: c.reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 12 },
    transition: { duration: 0.32, ease: EASE },
  } as const;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 md:pt-10">
      <div className={`c26 ${FONT_VARS_2026}`} data-reduce={c.reduce ? "true" : undefined} onKeyUp={onRootKeyUp}>
        <style>{CSS}</style>

        <div role="log" aria-live="polite" aria-label="Captions" className="sr-only">
          {log.map((l) => (
            <p key={l.id}>{l.text}</p>
          ))}
        </div>

        <header data-blueprint="header" className="flex flex-col items-center">
          <div className="flex min-h-11 w-full items-center justify-between gap-3">
            <h1 className="text-[11px] font-normal uppercase tracking-[0.16em]" style={{ fontFamily: MONO_2026, color: MUTED }}>
              Contact · {FACTS.place}
            </h1>
            {(heard || browsing || panel !== "none") && <TextBtn onClick={startOver}>Start over</TextBtn>}
          </div>

          <div
            ref={deviceRef}
            className="c26-device"
            role="group"
            aria-roledescription="pocket device"
            aria-label={`Device. ${pressLabel}.`}
            aria-describedby="d26-keys"
            tabIndex={0}
            onKeyDown={onDeviceKeyDown}
          >
            <button
              type="button"
              className="c26-ptt"
              data-pressed={pressed ? "true" : undefined}
              aria-label={view === "idle" ? "Talk. Hold, or tap, then type what you need" : pressLabel}
              tabIndex={-1}
              onPointerDown={onPressDown}
              onPointerUp={onPressUp}
              onPointerCancel={onPressCancel}
              onClick={(e) => {
                // Assistive tech clicks without pointer events: treat it as a tap.
                if (e.detail === 0) choose();
              }}
              onContextMenu={(e) => e.preventDefault()}
            />
            <div className="c26-body" aria-hidden>
              <div className="c26-camera">
                <span className="c26-lens" />
              </div>
              {/* Thumbs land on the screen first, so holding it works like the button. */}
              <div
                className="c26-screen"
                onPointerDown={onPressDown}
                onPointerUp={onPressUp}
                onPointerCancel={onPressCancel}
                onContextMenu={(e) => e.preventDefault()}
              >
                {screen()}
              </div>
              <div className="c26-slot" onPointerDown={onWheelDown} onPointerMove={onWheelMove} onPointerUp={onWheelUp} onPointerCancel={onWheelUp}>
                <div className="c26-wheel">
                  {Array.from({ length: RIDGES }, (_, i) => {
                    const y = (((i + turns * 0.5) % RIDGES) + RIDGES) % RIDGES;
                    const depth = Math.sin((Math.PI * (y + 0.5)) / RIDGES);
                    return <i key={i} style={{ top: `${(y / RIDGES) * 100}%`, opacity: 0.2 + depth * 0.8, transform: `scaleY(${0.4 + depth * 0.6})` }} />;
                  })}
                </div>
              </div>
              <span className="c26-mark">kiruk</span>
            </div>
          </div>
        </header>

        <section data-blueprint="compose" aria-label="Talk to Arun" className="mt-8 flex flex-col items-center text-center">
          {view === "listening" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
              className="flex w-full max-w-[34rem] flex-col items-center"
            >
              <label htmlFor="d26-say" className="sr-only">
                Tell me what you need
              </label>
              <input
                id="d26-say"
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  // Space held down to talk keeps repeating; don't type it.
                  if (e.key === " " && press.current) e.preventDefault();
                  else if (e.key === "Escape") stopListening();
                }}
                placeholder="Say it… (type, I’m listening)"
                enterKeyHint="send"
                autoComplete="off"
                className="min-h-14 w-full border-b-2 bg-transparent text-center text-[22px] leading-snug outline-none transition-colors placeholder:text-[#77736b] focus:border-[#161513] md:text-[28px]"
                style={{ borderColor: LINE, caretColor: ORANGE, color: INK }}
              />
              <p className="mt-3 text-[16px]" style={{ color: MUTED }}>
                {sub}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <Btn primary type="submit" disabled={!draft.trim()}>
                  Done
                </Btn>
                <Btn onClick={stopListening}>Stop</Btn>
              </div>
            </form>
          ) : (
            <>
              <motion.div
                key={line}
                aria-hidden
                initial={c.reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: EASE }}
                className="flex min-h-[7.5rem] w-full max-w-[36rem] flex-col items-center gap-2"
              >
                {heard && (
                  <p className="text-[14px]" style={{ color: MUTED }}>
                    You: “{heard.text}”
                  </p>
                )}
                <p className="text-[22px] leading-snug tracking-[-0.01em] [text-wrap:balance] md:text-[28px]">{line}</p>
                <p className="text-[16px] leading-relaxed [overflow-wrap:anywhere] [text-wrap:pretty]" style={{ color: MUTED }}>
                  {sub}
                </p>
              </motion.div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <RollBtn dir={-1} onClick={() => turn(-1)} />
                <button
                  type="button"
                  onClick={choose}
                  className={`inline-flex min-h-11 items-center rounded-full px-5 text-[15px] font-medium transition-opacity hover:opacity-90 motion-safe:active:scale-[0.98] ${ring}`}
                  style={{ background: INK, color: CARD, outlineColor: INK }}
                >
                  {pressLabel}
                </button>
                <RollBtn dir={1} onClick={() => turn(1)} />
              </div>
            </>
          )}

          <p id="d26-keys" className="mt-3 text-[13px]" style={{ color: MUTED }}>
            {hint}
            <span className="c26-desk"> Keyboard: hold Space to talk, arrows to roll, Enter to choose.</span>
          </p>

          {view === "idle" && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <div role="group" aria-label="Or say one of these" className="flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className={`min-h-11 rounded-full border px-4 py-2 text-[15px] leading-snug transition-colors hover:bg-[#f2f1ed] ${ring}`}
                    style={{ borderColor: LINE, color: INK, outlineColor: INK }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <TextBtn
                onClick={() => {
                  setBrowsing(true);
                  setMoved(false);
                  deviceRef.current?.focus({ preventScroll: true });
                }}
              >
                Skip talking, let me scroll
              </TextBtn>
            </div>
          )}

          {view === "about" && (
            <div className="mt-4 flex flex-wrap justify-center gap-x-5">
              <TextBtn onClick={c.copyEmail}>{c.copied ? "Copied my email" : "Copy my email"}</TextBtn>
              {facts[fact].k === "Now" && (
                <a
                  href={FACTS.nowHref}
                  {...external(FACTS.nowHref)}
                  className={`inline-flex min-h-11 items-center px-1 text-[15px] underline decoration-[#161513]/35 underline-offset-4 ${ring}`}
                  style={{ outlineColor: INK }}
                >
                  Visit Spera <span aria-hidden>↗</span>
                  {newTab}
                </a>
              )}
              <TextBtn onClick={closePanel}>Back to the list</TextBtn>
            </div>
          )}

          <AnimatePresence initial={false}>
            {panel === "write" && (
              <motion.section
                key="write"
                ref={setCard}
                tabIndex={-1}
                aria-label="Your note to Arun"
                {...motionIn}
                className="mt-10 flex w-full max-w-2xl scroll-mt-24 flex-col gap-4 p-5 text-left outline-none md:p-7"
                style={card}
              >
                {panelHead("Your note")}
                {sent ? (
                  <div ref={sentRef} tabIndex={-1} className={`flex flex-col gap-2 outline-none ${ring}`} style={{ outlineColor: INK }}>
                    <p className="text-[28px] leading-tight tracking-[-0.01em]">Sent. Thanks{first ? `, ${first}` : ""}.</p>
                    <p className="text-[17px] leading-relaxed">
                      I’ll reply to{" "}
                      <span className="[overflow-wrap:anywhere]" style={{ fontFamily: MONO_2026 }}>
                        {c.from}
                      </span>
                      .
                    </p>
                    <p className="text-sm" style={{ color: MUTED }}>
                      {statusLine(c)}
                    </p>
                  </div>
                ) : (
                  <form
                    aria-label="Write to Arun"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setShowing("panel");
                      void c.send();
                    }}
                    className="flex flex-col gap-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="d26-name" label="Your name">
                        <input
                          id="d26-name"
                          ref={nameRef}
                          autoComplete="name"
                          value={c.name}
                          onChange={(e) => c.setName(e.target.value)}
                          className={`min-h-11 w-full px-3 text-base ${ring}`}
                          style={field}
                        />
                      </Field>
                      <Field id="d26-email" label="Your email">
                        <input
                          id="d26-email"
                          type="email"
                          autoComplete="email"
                          value={c.from}
                          onChange={(e) => c.setFrom(e.target.value)}
                          className={`min-h-11 w-full px-3 text-base ${ring}`}
                          style={field}
                        />
                      </Field>
                    </div>
                    <Field id="d26-subject" label="Subject">
                      <input id="d26-subject" value={c.subject} onChange={(e) => c.setSubject(e.target.value)} className={`min-h-11 w-full px-3 text-base ${ring}`} style={field} />
                    </Field>
                    <Field id="d26-body" label="Message">
                      <textarea
                        id="d26-body"
                        ref={bodyRef}
                        rows={9}
                        value={c.body}
                        onChange={(e) => c.setBody(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            e.currentTarget.form?.requestSubmit();
                          }
                        }}
                        className={`w-full resize-y p-3 text-base leading-relaxed ${ring}`}
                        style={field}
                      />
                    </Field>
                    <div className="flex flex-wrap items-center gap-3">
                      <Btn primary type="submit" disabled={!c.ready || c.sendState === "sending"}>
                        {c.sendState === "sending" ? "Sending…" : "Send to Arun"}
                      </Btn>
                      <Btn href={c.mailto}>Open in your mail app</Btn>
                    </div>
                    {c.sendState === "error" ? (
                      <p role="alert" className="text-sm">
                        {c.sendError} Your mail app still works:{" "}
                        <a href={c.mailto} className={`underline underline-offset-4 ${ring}`} style={{ outlineColor: INK }}>
                          open the draft there
                        </a>
                        .
                      </p>
                    ) : (
                      <p aria-live="polite" className="text-sm" style={{ color: MUTED }}>
                        {ready}
                      </p>
                    )}
                  </form>
                )}
              </motion.section>
            )}

            {panel === "call" && (
              <motion.section
                key="call"
                ref={setCard}
                tabIndex={-1}
                aria-label="Book a 30 minute call"
                {...motionIn}
                className="mt-10 flex w-full max-w-2xl scroll-mt-24 flex-col gap-3 overflow-hidden p-3 text-left outline-none md:p-4"
                style={card}
              >
                <div className="px-2">{panelHead("Book 30 minutes")}</div>
                <CalEmbed height={620} style={{ borderRadius: 10 }} />
              </motion.section>
            )}
          </AnimatePresence>
        </section>

        <section data-blueprint="channels" aria-labelledby="d26-every" className="mx-auto mt-20 max-w-2xl">
          <h2 id="d26-every" className="text-[11px] font-normal uppercase tracking-[0.16em]" style={{ fontFamily: MONO_2026, color: MUTED }}>
            Every way in
          </h2>
          <ul className="mt-3 flex flex-col border-t" style={{ borderColor: LINE }}>
            {CHANNELS.map((ch) => {
              const inner = (
                <>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-base font-medium">{ch.label}</span>
                      <span className="text-[12px] [overflow-wrap:anywhere]" style={{ fontFamily: MONO_2026, color: MUTED }}>
                        {ch.handle}
                      </span>
                    </span>
                    <span className="text-sm" style={{ color: MUTED }}>
                      {ch.use}
                    </span>
                  </span>
                  <span aria-hidden style={{ color: MUTED }}>
                    {ch.id === "email" || ch.id === "call" ? "↑" : "↗"}
                  </span>
                </>
              );
              const cls = `flex min-h-14 w-full items-center gap-4 py-3 text-left transition-colors hover:text-[#ff4f00] ${ring}`;
              return (
                <li key={ch.id} className="border-b" style={{ borderColor: LINE }}>
                  {ch.id === "email" || ch.id === "call" ? (
                    <button type="button" onClick={() => openPanel(ch.id === "email" ? "write" : "call")} className={cls} style={{ outlineColor: INK }}>
                      {inner}
                    </button>
                  ) : (
                    <a href={ch.href} {...external(ch.href)} className={cls} style={{ outlineColor: INK }}>
                      {inner}
                      {newTab}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 text-sm" style={{ color: MUTED }}>
            <span className="[overflow-wrap:anywhere]" style={{ fontFamily: MONO_2026, color: INK }}>
              {EMAIL}
            </span>
            <TextBtn onClick={c.copyEmail}>{c.copied ? "Copied" : "Copy"}</TextBtn>
            <span className="sr-only" aria-live="polite">
              {c.copied ? "Email copied" : ""}
            </span>
          </p>
        </section>
      </div>
    </div>
  );
}

/* ── the device, drawn like the home's: em units off one width ──────── */

const CSS = `
.c26 {
  --orange: ${ORANGE};
  --ink: ${INK};
  --glass: #121110;
  font-family: ${SANS_2026};
  color: ${INK};
  font-synthesis: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.c26 :where(button, a) { touch-action: manipulation; }
.c26-desk { display: none; }
@media (hover: hover) and (pointer: fine) { .c26-desk { display: inline; } }

.c26-device {
  --d: min(320px, 76vw);
  position: relative;
  width: var(--d);
  font-size: calc(var(--d) / 34);
  border-radius: 4.6em;
  margin-top: 2.6em; /* room for the button on top */
  outline: none;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}
.c26-device:focus-visible { outline: 2px solid var(--ink); outline-offset: 10px; }
.c26-body {
  position: relative; z-index: 1;
  width: 34em; height: 32em;
  border-radius: 4.6em;
  background: var(--orange);
  box-shadow:
    inset 0 0.25em 0 rgba(255, 255, 255, 0.16),
    inset 0 -0.35em 0 rgba(0, 0, 0, 0.08),
    0 0.2em 0.5em rgba(22, 21, 19, 0.08),
    0 2.6em 3.2em -2.2em rgba(22, 21, 19, 0.5);
}
.c26-ptt {
  position: absolute; z-index: 0;
  top: -1.1em; right: 5.2em;
  width: 10em; height: 3em;
  padding: 0; border: 0; border-radius: 1.5em 1.5em 0.6em 0.6em;
  background: #e94800;
  box-shadow: inset 0 0.2em 0 rgba(255, 255, 255, 0.18);
  cursor: pointer; touch-action: none;
  transition: transform 90ms ease-out;
}
/* Hit area: the lip plus room above it, at least 44px tall on a phone. */
.c26-ptt::before { content: ""; position: absolute; top: -4em; left: -1.2em; right: -1.2em; height: 5.1em; }
.c26-ptt[data-pressed="true"] { transform: translateY(0.75em); }
.c26-camera {
  position: absolute; top: 2.6em; right: 4.6em;
  width: 3.4em; height: 3.4em; border-radius: 50%;
  background: #1d1b19; box-shadow: inset 0 0 0 0.25em #2b2825;
  display: grid; place-items: center;
}
.c26-lens { width: 1.3em; height: 1.3em; border-radius: 50%; background: #0b0b0b; box-shadow: 0 0 0 0.12em #3a3632; }
.c26-mark { position: absolute; left: 3em; bottom: 2.4em; font: 500 1.25em/1 ${SANS_2026}; letter-spacing: 0.12em; color: #d94300; }

.c26-screen {
  position: absolute; left: 2.4em; top: 7.2em;
  width: 21.4em; height: 18.4em;
  border-radius: 2.2em;
  background: var(--glass);
  box-shadow: inset 0 0 0 0.1em rgba(255, 255, 255, 0.06), inset 0 0.25em 0.6em rgba(0, 0, 0, 0.6);
  overflow: hidden; cursor: pointer; touch-action: manipulation;
}
.c26-scr {
  position: absolute; inset: 0; padding: 1.6em 1.8em;
  display: flex; flex-direction: column;
  font-family: ${DOTS_2026}; color: #f2efe8; text-transform: uppercase;
  animation: c26-in 180ms ease-out;
}
@keyframes c26-in { from { opacity: 0; } }
.c26-top {
  display: flex; align-items: center; justify-content: space-between; gap: 0.8em;
  font-size: 1.3em; font-weight: 700; line-height: 1.25; color: #8d877c; letter-spacing: 0.02em;
}
.c26-top > span:first-child { min-width: 0; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.c26-title { margin-top: auto; font-size: 4.4em; font-weight: 800; line-height: 0.95; color: var(--orange); font-variant-numeric: tabular-nums; }
.c26-big { margin-top: auto; font-size: 2.5em; font-weight: 800; line-height: 1.05; overflow-wrap: anywhere; }
.c26-big[data-tone="orange"], .c26-title[data-tone="orange"] { color: var(--orange); }
.c26-small {
  margin-top: 0.6em; font-size: 1.35em; font-weight: 600; line-height: 1.3; color: #c9c3b8;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; overflow-wrap: anywhere;
}
.c26-face { display: inline-flex; gap: 0.35em; }
.c26-face i { width: 0.55em; height: 0.75em; background: var(--orange); border-radius: 0.12em; animation: c26-blink 4.2s infinite; }
@keyframes c26-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.12); } }
.c26-rec { flex: none; width: 0.7em; height: 0.7em; border-radius: 50%; background: var(--orange); animation: c26-rec 1.2s steps(1) infinite; }
@keyframes c26-rec { 50% { opacity: 0.2; } }
.c26-scr--listen { justify-content: space-between; }
.c26-wave { display: flex; align-items: center; justify-content: center; gap: 0.55em; height: 6em; }
.c26-wave span {
  width: 0.7em; height: calc(var(--h) * 100%); border-radius: 0.35em; background: var(--orange);
  animation: c26-wave 0.9s ease-in-out infinite alternate;
}
@keyframes c26-wave { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }

.c26-slot {
  position: absolute; right: 2.4em; top: 8.6em;
  width: 6em; height: 17em; border-radius: 3em;
  background: #c93c00; box-shadow: inset 0 0.3em 0.6em rgba(0, 0, 0, 0.28);
  cursor: ns-resize; touch-action: none;
}
.c26-wheel { position: absolute; inset: 0.7em 0.8em; border-radius: 2.4em; background: #ff5d14; overflow: hidden; }
.c26-wheel i { position: absolute; left: 0; right: 0; height: 0.16em; background: #c23a00; }

@media (hover: hover) and (pointer: fine) { .c26-ptt:hover { background: #f04b00; } }
.c26[data-reduce="true"] *, .c26[data-reduce="true"] *::before, .c26[data-reduce="true"] *::after { animation: none !important; transition: none !important; }
.c26[data-reduce="true"] .c26-wave span { transform: scaleY(0.8); }
@media (prefers-reduced-motion: reduce) {
  .c26 *, .c26 *::before, .c26 *::after { animation: none !important; transition: none !important; }
  .c26 .c26-wave span { transform: scaleY(0.8); }
}
`;
