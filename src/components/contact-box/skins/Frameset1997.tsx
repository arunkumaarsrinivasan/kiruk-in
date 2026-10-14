"use client";

/**
 * 1997 · Kiruk Instant Messenger — contact as presence.
 *
 * 1997 was the year of the buddy list, so you sign on first: a screen name,
 * who you are, what you're here for. The door swings open onto a buddy list
 * where my channels are buddies, the best ways in for your reason grouped on
 * top, and I'm kiruk97, online or away by the clock in Bengaluru.
 * Double-click a buddy (or select it and press IM) to open its window. An IM
 * to kiruk97 is the letter: it lands in my inbox and I answer by e-mail.
 * Everything kiruk97 "says" is an auto response, so nothing pretends I'm live.
 *
 * Laid out as a frameset: a banner frame on top, the buddy list in the left
 * frame, the open window in the right. On phones the frames stack. Palette
 * and bevels follow the 1997 disc: wine, paper, gold.
 */

import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import { EMAIL, FACTS, INTENTS, WHO, getChannel, type Channel, type ChannelId, type ContactWhoId, type IntentId } from "@/data/contact";
import type { ContactSkinProps } from "../types";
import { CalEmbed, external, statusLine } from "../contact-ui";

const WINE = "#6b1f2e";
const WINE_DARK = "#4a1320";
const WINE_LIGHT = "#8a2d3e";
const PAPER = "#f5ecd7";
const PAPER_LIGHT = "#faf5e6";
const PAPER_DEEP = "#ebe0c6";
const INK = "#2a1f1a";
const INK_DIM = "#5c4a3b";
const MUTED = "#8c7a66";
const SHADOW = "#9e8b6c";
const GOLD = "#b8941c";
const GOLD_DARK = "#8a6d12";
const FRAME = "#c9b99a";
const RED = "#a8131f";
const BLUE = "#1d3a8a";
const UI = "Verdana, Tahoma, 'Lucida Grande', sans-serif";
const BODY = "Georgia, 'Bookman Old Style', 'Times New Roman', serif";

type Phase = "signon" | "connecting" | "online";
type BuddyId = "kiruk97" | ChannelId;
type View = "im" | "info" | "talk" | `ch:${ChannelId}`;
interface Entry {
  id: number;
  from: "you" | "kiruk97" | "sys";
  text: string;
  name?: string;
  subject?: string;
  auto?: boolean;
}

const STEPS = ["Connecting...", "Verifying screen name...", "Starting services..."];
const STEP_MS = 520;

/** Channels as buddies: screen-name-ish handles for each way in. */
const SN: Record<ChannelId, string> = {
  email: "kiruk.mail",
  call: "kiruk.cal",
  linkedin: "arun.linkedin",
  github: "arun.github",
  studio: "kirukism",
  life: "arunum.avan",
  x: "kirukism.x",
};

const AS: Record<ContactWhoId, string> = {
  hiring: "someone hiring",
  founder: "a founder",
  designer: "a designer",
  student: "a student",
  friend: "a friend",
  curious: "just curious",
};

/** kiruk97's profile quote: my own line from the "build something" route, not a new claim. */
const QUOTE = "Bring the rough version, it doesn't need to be ready.";

// Unlayered on purpose: these are the bevels; Tailwind classes handle size and spacing.
const CSS = `
.kim-btn{background:${PAPER_DEEP};color:${INK};border:1px solid;border-color:${PAPER_LIGHT} ${INK} ${INK} ${PAPER_LIGHT};box-shadow:inset -1px -1px 0 ${SHADOW},inset 1px 1px 0 #fff;cursor:pointer;text-decoration:none}
.kim-btn[data-default]{font-weight:700;box-shadow:0 0 0 1px ${INK},inset -1px -1px 0 ${SHADOW},inset 1px 1px 0 #fff}
.kim-btn:active:not(:disabled){border-color:${INK} ${PAPER_LIGHT} ${PAPER_LIGHT} ${INK};box-shadow:inset 1px 1px 0 ${SHADOW}}
.kim-btn:disabled{color:${MUTED};text-shadow:1px 1px 0 #fff;cursor:default}
.kim-field{background:#fffdf7;color:${INK};border:1px solid;border-color:${SHADOW} ${PAPER_LIGHT} ${PAPER_LIGHT} ${SHADOW};box-shadow:inset 1px 1px 0 ${INK};border-radius:0}
.kim-focus:focus-visible{outline:2px solid ${WINE};outline-offset:2px}
.kim-row:focus-visible{outline:2px dotted currentColor;outline-offset:-4px}
.kim-title:focus-visible{outline:2px solid ${GOLD};outline-offset:-2px}
@keyframes kim-frame{50%{opacity:0}}
`;

const sunken = { border: "1px solid", borderColor: `${INK} ${PAPER_LIGHT} ${PAPER_LIGHT} ${INK}` } as const;
const frameBg = {
  ...sunken,
  backgroundColor: "#3a2b23",
  backgroundImage: "repeating-conic-gradient(#3f2f26 0 25%, #33261f 0 50%)",
  backgroundSize: "4px 4px",
} as const;
const btn = "kim-btn kim-focus inline-flex min-h-11 items-center justify-center px-3 text-[13px]";
const input = "kim-field kim-focus min-h-11 w-full min-w-0 px-2";

/* ── art: SVG only, no brand marks ─────────────────────────────────── */

const POSE_A = ["M26 16L21 29", "M25 19l8 4 6-4", "M24 20l-8 1-4 5", "M21 29l7 6-2 9", "M21 29l-7 7-7-1"];
const POSE_B = ["M26 16L21 29", "M25 19l6 6 5 1", "M24 20l-6 4-1 6", "M21 29l3 8 6 5", "M21 29l-4 8-5 5"];

/** A generic running figure, gold with a wine outline. Two frames when it runs. */
function Runner({ size, running = false }: { size: number; running?: boolean }) {
  const pose = (d: string[]) => (
    <>
      {d.map((p) => (
        <path key={p} d={p} stroke={WINE_DARK} strokeWidth="7" />
      ))}
      {d.map((p) => (
        <path key={`g${p}`} d={p} stroke={GOLD} strokeWidth="3.5" />
      ))}
    </>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <g style={running ? { animation: "kim-frame 0.36s steps(1) infinite" } : undefined}>{pose(POSE_A)}</g>
      {running && <g style={{ animation: "kim-frame 0.36s steps(1) -0.18s infinite" }}>{pose(POSE_B)}</g>}
      <circle cx="29" cy="9.5" r="5.5" fill={GOLD} stroke={WINE_DARK} strokeWidth="2.5" />
    </svg>
  );
}

/** The sign-on door: swings open as the connection steps tick by. */
function Door({ open, reduce }: { open: number; reduce: boolean }) {
  return (
    <span
      aria-hidden
      className="relative block shrink-0"
      style={{ width: 40, height: 56, perspective: 140, background: `radial-gradient(circle at 50% 40%, #fff6d0, ${GOLD} 75%)`, border: `3px solid ${WINE_DARK}` }}
    >
      <span
        className="absolute inset-0 block"
        style={{
          background: WINE,
          boxShadow: `inset 0 0 0 2px ${WINE_LIGHT}`,
          transformOrigin: "left center",
          transform: `rotateY(${-78 * open}deg)`,
          transition: reduce ? "none" : `transform ${STEP_MS - 80}ms ease-out`,
        }}
      >
        <span className="absolute block rounded-full" style={{ right: 5, top: "50%", width: 5, height: 5, background: GOLD }} />
      </span>
    </span>
  );
}

function StatusIcon({ kind }: { kind: "online" | "away" | "door" | "dot" }) {
  const art: Record<typeof kind, ReactNode> = {
    online: <circle cx="7" cy="7" r="4.5" fill={GOLD} stroke={GOLD_DARK} strokeWidth="1.5" />,
    away: (
      <>
        <rect x="2.5" y="1.5" width="9" height="11" fill="#fff" stroke={INK} />
        <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke={INK} />
      </>
    ),
    door: (
      <>
        <rect x="3" y="1.5" width="8" height="11" fill={GOLD} stroke={INK} />
        <path d="M3 1.5l4 1.5v10.5l-4-1z" fill={WINE} stroke={INK} />
      </>
    ),
    dot: <circle cx="7" cy="7" r="3" fill="none" stroke={GOLD_DARK} strokeWidth="1.5" />,
  };
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
      {art[kind]}
    </svg>
  );
}

/* ── chrome ─────────────────────────────────────────────────────────── */

function Win({
  title,
  icon,
  titleRef,
  footer,
  className = "",
  children,
}: {
  title: string;
  icon?: ReactNode;
  titleRef?: Ref<HTMLHeadingElement>;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={`flex min-w-0 flex-col p-[3px] ${className}`}
      style={{
        background: PAPER_DEEP,
        border: "1px solid",
        borderColor: `${PAPER_LIGHT} ${INK} ${INK} ${PAPER_LIGHT}`,
        boxShadow: `inset -1px -1px 0 ${SHADOW}, inset 1px 1px 0 #fff, 3px 4px 0 rgba(0,0,0,0.35)`,
      }}
    >
      <h2
        id={id}
        ref={titleRef}
        tabIndex={titleRef ? -1 : undefined}
        className="kim-title flex min-h-8 items-center gap-2 px-2 py-1 text-[13px] font-bold leading-tight"
        style={{ fontFamily: UI, color: PAPER_LIGHT, background: `linear-gradient(90deg, ${WINE_DARK}, ${WINE_LIGHT})` }}
      >
        {icon}
        <span className="min-w-0 truncate">{title}</span>
      </h2>
      <div className="flex min-w-0 flex-col gap-3 p-2 md:p-3">{children}</div>
      {footer && (
        <div className="flex flex-wrap gap-1 px-0.5 pb-0.5 text-[12px]" style={{ color: INK_DIM }}>
          {footer}
        </div>
      )}
    </section>
  );
}

function Sheet({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="kim-field grid grid-cols-1 gap-x-3 p-3 text-[14px] leading-snug sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="font-bold" style={{ color: WINE }}>
            {k}
          </dt>
          <dd className="mb-2 min-w-0 break-words sm:mb-0">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** One line of the IM transcript: screen name in bold color, then the words. */
function Line({ entry, children }: { entry: Omit<Entry, "id" | "text">; children: ReactNode }) {
  if (entry.from === "sys") {
    return (
      <p className="text-[13px]" style={{ color: RED, fontFamily: UI }}>
        {children}
      </p>
    );
  }
  const you = entry.from === "you";
  return (
    <p className="whitespace-pre-wrap break-words">
      <span className="font-bold" style={{ color: you ? RED : BLUE, fontFamily: UI, fontSize: 13 }}>
        {entry.auto ? "Auto response from kiruk97:" : `${you ? entry.name : "kiruk97"}:`}
      </span>{" "}
      {entry.subject && (
        <>
          <em style={{ color: INK_DIM }}>({entry.subject})</em>
          {"\n"}
        </>
      )}
      {children}
    </p>
  );
}

/* ── skin ───────────────────────────────────────────────────────────── */

export function Frameset1997({ contact: c }: ContactSkinProps) {
  const [phase, setPhase] = useState<Phase>("signon");
  const [step, setStep] = useState(0);
  const [view, setView] = useState<View>("im");
  const [sel, setSel] = useState<BuddyId>("kiruk97");
  const [shut, setShut] = useState({ best: false, rest: false });
  const [log, setLog] = useState<Entry[]>([]);
  const [justOn, setJustOn] = useState(false);
  const nextId = useRef(0);
  const snRef = useRef<HTMLInputElement>(null);
  const meRef = useRef<HTMLButtonElement>(null);
  const winRef = useRef<HTMLHeadingElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const online = phase === "online";
  const screenName = c.name.trim() || "Guest";
  const first = c.name.trim().split(" ")[0] ?? "";
  const rest = c.all.slice(c.picks.length);
  const nameOf = (id: BuddyId) => (id === "kiruk97" ? "kiruk97" : SN[id]);
  const presence = c.awake ? "online" : "away";

  const push = useCallback((e: Omit<Entry, "id">) => setLog((l) => [...l, { ...e, id: nextId.current++ }]), []);

  /** Bring a window into the right frame, focus its title, and scroll to it when the frames are stacked. */
  const show = (v: View) => {
    setView(v);
    requestAnimationFrame(() => {
      winRef.current?.focus({ preventScroll: true });
      const el = frameRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) el.scrollIntoView({ block: "start", behavior: c.reduce ? "auto" : "smooth" });
    });
  };

  const signOn = () => {
    if (c.reduce) {
      setPhase("online");
      return;
    }
    setStep(0);
    setPhase("connecting");
  };
  const signOff = () => {
    setPhase("signon");
    setView("im");
    setSel("kiruk97");
  };

  // Connecting: three status lines while the door swings open, then the buddy list.
  useEffect(() => {
    if (phase !== "connecting") return;
    const t = window.setTimeout(() => {
      if (step < STEPS.length - 1) setStep(step + 1);
      else {
        setPhase("online");
        setJustOn(true);
      }
    }, STEP_MS);
    return () => window.clearTimeout(t);
  }, [phase, step]);

  // kiruk97 wears the open-door icon for a moment after you arrive, like a buddy who just signed on.
  useEffect(() => {
    if (!justOn) return;
    const t = window.setTimeout(() => setJustOn(false), 3000);
    return () => window.clearTimeout(t);
  }, [justOn]);

  // Keep focus where the next action is: kiruk97 after signing on, the screen name after signing off.
  const lastPhase = useRef(phase);
  useEffect(() => {
    if (lastPhase.current === phase) return;
    lastPhase.current = phase;
    if (phase === "online") meRef.current?.focus({ preventScroll: true });
    else if (phase === "signon") snRef.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log, c.sendState, view]);

  // What the network did with the IM, as kiruk97's auto response.
  const lastSend = useRef(c.sendState);
  useEffect(() => {
    if (lastSend.current === c.sendState) return;
    lastSend.current = c.sendState;
    if (c.sendState === "sent") {
      push({
        from: "kiruk97",
        auto: true,
        text: `Got it${first ? `, ${first}` : ""}. Your message is in my inbox, and I'll reply to ${c.from} ${c.awake ? "today" : "once I'm up"}.`,
      });
    } else if (c.sendState === "error") {
      push({ from: "sys", text: `Message not delivered: ${c.sendError}` });
    }
  }, [c.sendState, c.sendError, c.from, c.awake, first, push]);

  const sendIm = () => {
    if (!c.ready || c.sendState === "sending") return;
    push({ from: "you", name: screenName, subject: c.subject.trim() || undefined, text: c.body.trim() });
    void c.send();
  };
  const writeAnother = () => {
    c.resetDraft();
    c.setIntent(c.intent.id);
  };

  const openBuddy = (id: BuddyId) => {
    setSel(id);
    show(id === "kiruk97" ? "im" : `ch:${id}`);
  };
  const imSelected = () => {
    if (sel === "kiruk97" || sel === "email") return show("im");
    if (sel === "call") return show("talk");
    show(`ch:${sel}`);
  };

  const greeting = !c.clock
    ? "Anything you send here lands in my inbox, and I write back by e-mail."
    : c.awake
      ? `Hi! It's ${c.clock} in Bengaluru, so I'm probably around. Anything you send here lands in my inbox, and I write back by e-mail.`
      : `I'm away. It's ${c.clock} in Bengaluru and I'm asleep. Leave me a message and I'll read it in the morning.`;

  const whoSelect = (id?: string) => (
    <select id={id} value={c.who} onChange={(e) => c.setWho(e.target.value as ContactWhoId)} className={`${input} px-1`} style={{ fontSize: 16 }}>
      {WHO.map((w) => (
        <option key={w.id} value={w.id}>
          {AS[w.id]}
        </option>
      ))}
    </select>
  );
  const intentSelect = (id?: string) => (
    <select id={id} value={c.intent.id} onChange={(e) => c.setIntent(e.target.value as IntentId)} className={`${input} px-1`} style={{ fontSize: 16 }}>
      {INTENTS.map((i) => (
        <option key={i.id} value={i.id}>
          {i.label}
        </option>
      ))}
    </select>
  );

  /* ── left frame: sign on, then the buddy list ── */

  const signOnWindow = (
    <Win title="Sign On" icon={<Runner size={18} />} className="mx-auto w-full max-w-[340px]">
      <div
        className="flex flex-col items-center gap-1 px-3 py-4 text-center"
        style={{ background: `linear-gradient(180deg, ${WINE_LIGHT}, ${WINE_DARK})`, color: PAPER_LIGHT, border: "1px solid", borderColor: `${SHADOW} #fff #fff ${SHADOW}` }}
      >
        {phase === "connecting" ? (
          <span className="flex items-end gap-3">
            <Runner size={56} running={!c.reduce} />
            <Door open={step / (STEPS.length - 1)} reduce={c.reduce} />
          </span>
        ) : (
          <Runner size={64} />
        )}
        <p className="mt-1 text-[19px] font-bold italic leading-tight" style={{ fontFamily: BODY }}>
          Kiruk Instant Messenger
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: PAPER_DEEP }}>
          Guest pass · no password
        </p>
      </div>

      {phase === "connecting" ? (
        <div className="flex flex-col gap-1 py-1 text-[13px]">
          <p role="status" className="sr-only">
            {STEPS[step]}
          </p>
          <ol aria-hidden className="flex flex-col gap-1">
            {STEPS.map((s, k) => (
              <li key={s} style={{ color: k <= step ? INK : MUTED }}>
                {k < step ? "✓" : k === step ? "›" : "·"} {s}
              </li>
            ))}
          </ol>
          <div aria-hidden className="kim-field mt-1 h-5 p-[2px]">
            <div
              style={{
                height: "100%",
                width: `${((step + 1) / STEPS.length) * 100}%`,
                background: `repeating-linear-gradient(90deg, ${WINE} 0 8px, transparent 8px 10px)`,
                transition: c.reduce ? "none" : `width ${STEP_MS - 80}ms steps(4)`,
              }}
            />
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signOn();
          }}
          className="flex flex-col gap-3 text-[13px]"
        >
          <label className="flex flex-col gap-1">
            <span className="font-bold">Screen Name</span>
            <input ref={snRef} autoComplete="name" placeholder="Your name" value={c.name} onChange={(e) => c.setName(e.target.value)} className={input} style={{ fontSize: 16 }} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-bold">Signing on as</span>
            {whoSelect()}
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-bold">Here to</span>
            {intentSelect()}
          </label>
          <p className="text-[12px] leading-snug" style={{ color: INK_DIM }}>
            Your screen name signs your message. Leave it blank to look around as Guest.
          </p>
          <div className="flex justify-end">
            <button type="submit" data-default className={`${btn} px-6 text-[14px]`}>
              Sign On
            </button>
          </div>
        </form>
      )}
    </Win>
  );

  const row = (id: BuddyId, icon: ReactNode, hint: string, rank?: number) => {
    const on = sel === id;
    return (
      <li key={id}>
        <button
          ref={id === "kiruk97" ? meRef : undefined}
          type="button"
          onClick={() => setSel(id)}
          onDoubleClick={() => openBuddy(id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              openBuddy(id);
            }
          }}
          aria-current={on ? "true" : undefined}
          aria-label={`${nameOf(id)}, ${hint}`}
          className={`kim-row flex min-h-11 w-full items-center gap-2 pr-2 text-left ${id === "kiruk97" ? "pl-2" : "pl-6"}`}
          style={{ background: on ? WINE : "transparent", color: on ? PAPER_LIGHT : INK }}
        >
          <span aria-hidden className="inline-flex w-4 shrink-0 justify-center">
            {icon}
          </span>
          <span className="min-w-0 truncate" style={{ fontWeight: id === "kiruk97" ? 700 : 400 }}>
            {nameOf(id)}
          </span>
          {rank ? (
            <span aria-hidden className="ml-auto shrink-0 text-[11px]" style={{ color: on ? GOLD : GOLD_DARK }}>
              ★ {rank}
            </span>
          ) : null}
        </button>
      </li>
    );
  };

  const group = (key: "best" | "rest", title: string, list: Channel[]) => (
    <div key={key}>
      <button
        type="button"
        aria-expanded={!shut[key]}
        onClick={() => setShut((s) => ({ ...s, [key]: !s[key] }))}
        className="kim-row flex min-h-11 w-full items-center gap-1.5 px-2 text-left font-bold"
        style={{ color: INK }}
      >
        <span aria-hidden className="inline-block w-3">
          {shut[key] ? "▸" : "▾"}
        </span>
        {title}{" "}
        <span style={{ fontWeight: 400, color: INK_DIM }}>
          ({list.length}/{list.length})
        </span>
      </button>
      {!shut[key] && (
        <ul>
          {list.map((ch, k) =>
            key === "best"
              ? row(ch.id, <StatusIcon kind="online" />, `${ch.label}, best way in, choice ${k + 1}`, k + 1)
              : row(ch.id, <StatusIcon kind="dot" />, ch.label),
          )}
        </ul>
      )}
    </div>
  );

  const buddyList = (
    <Win
      title={`${screenName}'s Buddy List`}
      icon={<Runner size={18} />}
      footer={
        <span className="kim-field flex-1 px-2 py-0.5">
          kiruk97 is {presence}
          {c.clock ? ` · ${c.clock} IST` : ""}
        </span>
      }
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1.5 text-[13px]">
        <label htmlFor="kim-who" className="font-bold">
          I&rsquo;m
        </label>
        {whoSelect("kim-who")}
        <label htmlFor="kim-why" className="font-bold">
          Here to
        </label>
        {intentSelect("kim-why")}
      </div>
      <div className="kim-field flex flex-col py-1 text-[14px]">
        <ul aria-label="Arun">
          {row(
            "kiruk97",
            <StatusIcon kind={justOn ? "door" : c.awake ? "online" : "away"} />,
            `that's me, Arun. ${c.awake ? "Online" : "Away"}${justOn ? ", just signed on" : ""}.`,
          )}
        </ul>
        {group("best", "Best way in", c.picks)}
        {group("rest", "Everywhere else", rest)}
      </div>
      <p className="text-[12px] leading-snug" style={{ color: INK_DIM }}>
        Double-click a buddy, or select one and press IM. Changing &ldquo;Here to&rdquo; reshuffles the groups.
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        <button type="button" onClick={imSelected} className={btn}>
          IM<span className="sr-only"> {nameOf(sel)}</span>
        </button>
        <button type="button" onClick={() => show(sel === "kiruk97" ? "info" : `ch:${sel}`)} className={btn}>
          Info<span className="sr-only"> on {nameOf(sel)}</span>
        </button>
        <button type="button" onClick={signOff} className={btn}>
          Sign Off
        </button>
      </div>
    </Win>
  );

  /* ── right frame: whichever window is open ── */

  const infoWindow = (
    <Win title="Buddy Info: kiruk97" icon={<StatusIcon kind={c.awake ? "online" : "away"} />} titleRef={winRef}>
      {!online && <p className="kim-field px-3 py-2 text-[13px] leading-snug">This is my profile. Sign on to send me a message. No password, no account.</p>}
      <div className="flex items-center gap-3">
        <span className="kim-field inline-flex shrink-0 p-1">
          <Runner size={44} />
        </span>
        <div className="min-w-0">
          <p className="text-[19px] font-bold leading-tight" style={{ fontFamily: BODY, color: WINE }}>
            {FACTS.name}
          </p>
          <p className="text-[13px]" style={{ color: INK_DIM }}>
            Screen name kiruk97 · {c.awake ? "Online" : "Away"}
          </p>
        </div>
      </div>
      <Sheet
        rows={[
          ["Status", c.clock ? `${c.awake ? "Online" : "Away"} · ${c.clock} IST` : c.awake ? "Online" : "Away"],
          ["Location", `${FACTS.place} · ${FACTS.timezone}`],
          [
            "Now",
            <a key="now" href={FACTS.nowHref} {...external(FACTS.nowHref)} className="kim-focus underline" style={{ color: BLUE }}>
              {FACTS.now}
            </a>,
          ],
          ["Before", FACTS.before],
          [
            "Open to",
            <ul key="open" className="flex flex-col gap-0.5">
              {FACTS.openTo.map((o) => (
                <li key={o}>· {o}</li>
              ))}
            </ul>,
          ],
          ["How I work", FACTS.mode],
          ["E-mail", <span key="mail" className="break-all">{EMAIL}</span>],
        ]}
      />
      <p className="px-1 text-[16px] italic leading-snug" style={{ fontFamily: BODY, color: WINE }}>
        <span className="text-[11px] font-bold uppercase not-italic tracking-[0.15em]" style={{ fontFamily: UI, color: INK_DIM }}>
          Quote{" "}
        </span>
        &ldquo;{QUOTE}&rdquo;
      </p>
      <div className="flex flex-wrap gap-1.5">
        {online && (
          <>
            <button type="button" data-default onClick={() => show("im")} className={btn}>
              Send IM
            </button>
            <button type="button" onClick={() => show("talk")} className={btn}>
              Talk
            </button>
          </>
        )}
        <button type="button" onClick={c.copyEmail} className={btn}>
          {c.copied ? "Copied!" : "Copy e-mail address"}
        </button>
      </div>
    </Win>
  );

  const imWindow = (
    <Win
      title="kiruk97 - Instant Message"
      icon={<StatusIcon kind={c.awake ? "online" : "away"} />}
      titleRef={winRef}
      footer={
        <>
          <span className="kim-field flex-1 px-2 py-0.5">kiruk97 is {presence}</span>
          <span className="kim-field px-2 py-0.5">{c.clock ? `${c.clock} IST` : "IST"}</span>
        </>
      }
    >
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation with kiruk97"
        className="kim-field flex h-56 flex-col gap-2 overflow-y-auto p-2 text-[15px] leading-relaxed md:h-64"
        style={{ fontFamily: BODY }}
      >
        <Line entry={{ from: "kiruk97", auto: true }}>{greeting}</Line>
        <p className="text-[13px] italic" style={{ color: INK_DIM, fontFamily: UI }}>
          kiruk97&rsquo;s tip for &ldquo;{c.intent.label}&rdquo;: {c.intent.why}
        </p>
        {log.map((e) => (
          <Line key={e.id} entry={e}>
            {e.text}
          </Line>
        ))}
        {c.sendState === "sending" && (
          <p className="text-[13px]" style={{ color: INK_DIM, fontFamily: UI }}>
            Sending...
          </p>
        )}
      </div>

      {c.sendState === "sent" ? (
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <p role="status" className="min-w-0 flex-1">
            Delivered to my inbox. I&rsquo;ll answer by e-mail.
          </p>
          <button type="button" onClick={writeAnother} className={btn}>
            Write another
          </button>
        </div>
      ) : (
        <form
          id="kim-im"
          onSubmit={(e) => {
            e.preventDefault();
            sendIm();
          }}
          className="flex flex-col gap-2 text-[13px]"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1">
              <span className="font-bold">Screen name</span>
              <input autoComplete="name" value={c.name} onChange={(e) => c.setName(e.target.value)} className={input} style={{ fontSize: 16 }} />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span>
                <b>Your e-mail</b> <span style={{ color: INK_DIM }}>(so I can reply)</span>
              </span>
              <input type="email" autoComplete="email" value={c.from} onChange={(e) => c.setFrom(e.target.value)} className={input} style={{ fontSize: 16 }} />
            </label>
          </div>
          <label className="flex items-center gap-2">
            <span className="shrink-0 font-bold">Subject</span>
            <input value={c.subject} onChange={(e) => c.setSubject(e.target.value)} className={input} style={{ fontSize: 16 }} />
          </label>
          <textarea
            aria-label="Your message to kiruk97. Ctrl+Enter sends."
            rows={6}
            value={c.body}
            onChange={(e) => c.setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                sendIm();
              }
            }}
            className="kim-field kim-focus w-full resize-y p-2 leading-relaxed"
            style={{ fontSize: 16, fontFamily: BODY }}
          />
          <div className="flex flex-wrap items-center gap-x-3">
            {c.sendState === "error" ? (
              <p role="alert" className="min-w-0 flex-1" style={{ color: RED }}>
                Not sent: {c.sendError} Use Send via e-mail instead; your words come along.
              </p>
            ) : (
              <p className="min-w-0 flex-1" style={{ color: INK_DIM }}>
                {c.ready ? "Ready. Send it, or press Ctrl+Enter." : "Send lights up once you have a screen name, your e-mail, and a line of your own."}
              </p>
            )}
            <button type="button" onClick={c.resetDraft} className="kim-focus min-h-11 underline" style={{ color: INK_DIM }}>
              Reset draft
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => show("info")} className={btn}>
          Get Info
        </button>
        <button type="button" onClick={() => show("talk")} className={btn}>
          Talk
        </button>
        <a href={c.mailto} className={btn}>
          Send via e-mail
        </a>
        {c.sendState !== "sent" && (
          <button type="submit" form="kim-im" data-default disabled={!c.ready || c.sendState === "sending"} className={`${btn} ml-auto px-5`}>
            {c.sendState === "sending" ? "Sending..." : "Send"}
          </button>
        )}
      </div>
    </Win>
  );

  const call = getChannel("call");
  const talkWindow = (
    <Win title="Talk: kiruk97" icon={<StatusIcon kind="online" />} titleRef={winRef}>
      <p className="text-[14px] leading-snug">A 30 minute call on my calendar. {call.use}</p>
      <div className="kim-field p-[2px]">
        <CalEmbed height={560} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => show("im")} className={btn}>
          Back to IM
        </button>
        <a href={call.href} {...external(call.href)} className={btn}>
          Open in a new window
        </a>
      </div>
    </Win>
  );

  const channelWindow = (id: ChannelId) => {
    const ch = getChannel(id);
    const r = c.picks.findIndex((p) => p.id === id) + 1;
    return (
      <Win title={`Buddy Info: ${SN[id]}`} icon={<StatusIcon kind={r ? "online" : "dot"} />} titleRef={winRef}>
        <Sheet
          rows={[
            ["Screen name", SN[id]],
            ["Service", ch.label],
            ["Address", <span key="addr" className="break-all">{ch.handle}</span>],
            ["Group", r ? `Best way in, #${r} for "${c.intent.label}"` : "Everywhere else"],
          ]}
        />
        <div className="kim-field p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: WINE }}>
            Profile
          </p>
          <p className="mt-1 text-[16px] leading-snug" style={{ fontFamily: BODY }}>
            {ch.use}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {id === "email" ? (
            <>
              <button type="button" data-default onClick={() => show("im")} className={btn}>
                Write it here
              </button>
              <a href={c.mailto} className={btn}>
                Open your mail program
              </a>
              <button type="button" onClick={c.copyEmail} className={btn}>
                {c.copied ? "Copied!" : "Copy address"}
              </button>
            </>
          ) : id === "call" ? (
            <button type="button" data-default onClick={() => show("talk")} className={btn}>
              Talk (book a call)
            </button>
          ) : (
            <a href={ch.href} {...external(ch.href)} data-default className={btn}>
              Open {ch.label}
              <span className="sr-only"> in a new window</span>
            </a>
          )}
          <button type="button" onClick={() => show("im")} className={btn}>
            Close
          </button>
        </div>
      </Win>
    );
  };

  const right = !online
    ? infoWindow
    : view === "im"
      ? imWindow
      : view === "info"
        ? infoWindow
        : view === "talk"
          ? talkWindow
          : channelWindow(view.slice(3) as ChannelId);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 md:pt-10" style={{ fontFamily: UI, color: INK }}>
      <style>{CSS}</style>
      <div
        className="flex flex-col gap-1.5 p-1.5"
        style={{ background: FRAME, border: "1px solid", borderColor: `${PAPER_LIGHT} ${INK} ${INK} ${PAPER_LIGHT}`, boxShadow: "0 6px 0 rgba(0,0,0,0.35)" }}
      >
        {/* ── banner frame ── */}
        <header data-blueprint="header" className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 md:px-4" style={{ ...sunken, background: PAPER }}>
          <Runner size={40} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-bold italic leading-tight md:text-[26px]" style={{ fontFamily: BODY, color: WINE }}>
              Kiruk Instant Messenger
            </h1>
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: INK_DIM }}>
              Contact Arun · sign on, then send me an IM
            </p>
          </div>
          <div className="flex w-full flex-col gap-1 text-[13px] sm:w-auto sm:items-end">
            <p className="flex items-center gap-2">
              <StatusIcon kind={c.awake ? "online" : "away"} />
              <span>
                <b>kiruk97</b> is {presence}
              </span>
            </p>
            <p style={{ color: INK_DIM }}>{statusLine(c)}</p>
            <button type="button" onClick={c.copyEmail} className={`${btn} self-start text-[12px] sm:self-end`}>
              {c.copied ? "Copied!" : "Copy my e-mail"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-[300px_minmax(0,1fr)]">
          {/* ── left frame ── */}
          <div data-blueprint="channels" className="min-w-0 p-2 md:p-3" style={frameBg}>
            {online ? buddyList : signOnWindow}
          </div>
          {/* ── right frame ── */}
          <div data-blueprint="compose" ref={frameRef} className="min-w-0 scroll-mt-24 p-2 md:p-3" style={frameBg}>
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
