"use client";

/**
 * 2009 · Skeuomorphic phone — contact as a thing you hold and touch.
 *
 * In 2009 the interface was a slab of glass you handled like an object: you
 * flicked wheels and slid knobs. So /contact is a phone. My card lives in
 * Contacts, where a two-column picker drum finishes "I'm [who] · I want to
 * [intent]" and the best ways to reach me rank themselves underneath. Mail
 * slides a compose sheet up from the bottom, and the letter only goes when you
 * slide to send. Every channel is also an app on the home screen; red badges
 * rank them for whatever you picked.
 *
 * Every gesture has a key: arrows spin the drum, arrows or Enter slide the
 * knob, Escape is the home button.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { EMAIL, FACTS, INTENTS, WHO, getChannel, type Channel, type ChannelId, type ContactWhoId, type IntentId } from "@/data/contact";
import type { Contact } from "../use-contact";
import type { ContactSkinProps } from "../types";
import { CalEmbed, external, statusLine } from "../contact-ui";

/* ── materials ──────────────────────────────────────────────────────── */

const INK = "#1a1a1a";
const GRAY = "#6d7380";
const SLATE = "#4c566c";
const LABEL = "#52669a";
const LINK = "#2a5db0";
const MARKER = "'Marker Felt', 'Comic Sans MS', cursive";
const RING = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b8cff]";
const RING_IN = "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#3b8cff]";
const HAIR = "1px solid #d9dce1";
const HINT_KEY = "kiruk-contact-2009-hint";

const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.28 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
const LINEN: CSSProperties = {
  backgroundColor: "#353a43",
  backgroundImage: `${NOISE}, repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0 1px, transparent 1px 3px)`,
};
const LEATHER: CSSProperties = {
  backgroundColor: "#5a3519",
  backgroundImage: `${NOISE}, radial-gradient(ellipse 120% 100% at 50% 0%, #7d4c25 0%, #5a3519 55%, #3b210e 100%)`,
};
const STITCH: CSSProperties = { border: "1.5px dashed rgba(255,226,180,0.5)" };
const PINSTRIPE = "repeating-linear-gradient(90deg, #c5ccd4 0 5px, #cbd2d8 5px 9px)";
const NAV_BAR = "linear-gradient(180deg, #b4c0d0 0%, #8b9db4 50%, #7d90ab 51%, #6d84a2 100%)";
const NAV_BTN = "linear-gradient(180deg, #8fa2bb 0%, #5d7698 50%, #4f6a8f 51%, #48638a 100%)";
const BLUE_BTN = "linear-gradient(180deg, #6ea3f2 0%, #3a78db 50%, #1f5cc4 51%, #2b6ad3 100%)";
const BEZEL = "linear-gradient(180deg, #3d4250 0%, #0b0b0e 7%, #0b0b0e 93%, #3d4250 100%)";
const ALERT: CSSProperties = {
  background: "linear-gradient(180deg, rgba(70,92,148,0.96) 0%, rgba(28,42,88,0.96) 100%)",
  border: "2px solid rgba(255,255,255,0.88)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
  textShadow: "0 -1px 0 rgba(0,0,0,0.6)",
};
const GLOSS = "radial-gradient(ellipse 140% 90% at 50% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.16) 49%, transparent 50%)";
const SHIMMER: CSSProperties = {
  backgroundImage: "linear-gradient(90deg, #77777d 0%, #77777d 42%, #ffffff 50%, #77777d 58%, #77777d 100%)",
  backgroundSize: "200% 100%",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  animation: "skeu09-shimmer 2.8s linear infinite",
};

const INITIALS = FACTS.name
  .split(" ")
  .slice(0, 2)
  .map((w) => w[0])
  .join("");

/* ── apps ───────────────────────────────────────────────────────────── */

type AppId = "contacts" | "mail" | "calendar" | "linkedin" | "github" | "studio" | "life" | "x";
type Kind = "zoom" | "push" | "pop";

interface App {
  id: AppId;
  label: string;
  tint: [string, string];
  channel: ChannelId | null;
}

const APPS: Record<AppId, App> = {
  contacts: { id: "contacts", label: "Contacts", tint: ["#d0a873", "#7a5330"], channel: null },
  mail: { id: "mail", label: "Mail", tint: ["#7cc4ff", "#1f6fd1"], channel: "email" },
  calendar: { id: "calendar", label: "Calendar", tint: ["#ffffff", "#dcdcdc"], channel: "call" },
  linkedin: { id: "linkedin", label: "LinkedIn", tint: ["#6b9dd9", "#1d4f91"], channel: "linkedin" },
  github: { id: "github", label: "GitHub", tint: ["#6b6f77", "#1d1f23"], channel: "github" },
  studio: { id: "studio", label: "Kirukism", tint: ["#ffbf7a", "#e0602a"], channel: "studio" },
  life: { id: "life", label: "Vlogs", tint: ["#8be0ad", "#1f8a57"], channel: "life" },
  x: { id: "x", label: "X", tint: ["#7a7c86", "#2a2b31"], channel: "x" },
};
const GRID: AppId[] = ["linkedin", "github", "studio", "life", "x"];
const DOCK: AppId[] = ["contacts", "mail", "calendar"];
const appOf = (ch: ChannelId): AppId => (ch === "email" ? "mail" : ch === "call" ? "calendar" : ch);

const LAYER: Variants = {
  enter: (k: Kind) =>
    k === "zoom" ? { scale: 0.1, opacity: 0, x: "0%", zIndex: 2 } : { x: k === "push" ? "100%" : "-30%", scale: 1, opacity: 1, zIndex: k === "push" ? 2 : 0 },
  center: { x: "0%", scale: 1, opacity: 1 },
  exit: (k: Kind) => (k === "zoom" ? { scale: 0.1, opacity: 0, zIndex: 1 } : { x: k === "push" ? "-30%" : "100%", zIndex: k === "push" ? 0 : 2 }),
  gone: { opacity: 0, transition: { duration: 0 } },
};

function istDay() {
  const d = new Date();
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }) };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/* ── glyphs: white, drawn on glossy tiles ───────────────────────────── */

function Glyph({ id }: { id: AppId }) {
  const s = { fill: "none", stroke: "#fff", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const art: Record<Exclude<AppId, "calendar">, ReactNode> = {
    contacts: (
      <>
        <rect x="4" y="3" width="21" height="26" rx="2" fill="#f4e6cf" />
        <circle cx="14.5" cy="13" r="4.2" fill="#8a6440" />
        <path d="M7 25c0-4.4 3.4-7 7.5-7s7.5 2.6 7.5 7z" fill="#8a6440" />
        <rect x="25" y="5" width="4" height="5" rx="1" fill="#ff6b5e" />
        <rect x="25" y="12" width="4" height="5" rx="1" fill="#ffd25e" />
        <rect x="25" y="19" width="4" height="5" rx="1" fill="#6bc2ff" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="8" width="26" height="17" rx="2" fill="#fff" />
        <path d="M4 9.5l12 9 12-9" fill="none" stroke="#5b8fd0" strokeWidth="1.8" />
      </>
    ),
    linkedin: (
      <>
        <rect x="4" y="11" width="24" height="15" rx="2.5" fill="#fff" />
        <path d="M12 11V8.5a1.5 1.5 0 0 1 1.5-1.5h5a1.5 1.5 0 0 1 1.5 1.5V11" {...s} />
        <path d="M4 17h24" stroke="#4a78b8" strokeWidth="1.6" />
      </>
    ),
    github: <path d="M12 9l-7 7 7 7M20 9l7 7-7 7" {...s} />,
    studio: (
      <>
        <path d="M6 26l2-7L21 6l5 5-13 13z" fill="#fff" />
        <path d="M8 19l5 5" stroke="#e0602a" strokeWidth="1.6" />
      </>
    ),
    life: (
      <>
        <circle cx="22" cy="10" r="4" fill="#fff6b0" />
        <path d="M2 27l9-11 6 7 4-4 9 8z" fill="#fff" />
      </>
    ),
    x: <path d="M6 7h20a2.5 2.5 0 0 1 2.5 2.5v10A2.5 2.5 0 0 1 26 22H15l-6 5v-5H6a2.5 2.5 0 0 1-2.5-2.5v-10A2.5 2.5 0 0 1 6 7z" fill="#fff" />,
  };
  if (id === "calendar") return null;
  return (
    <svg viewBox="0 0 32 32" width="62%" height="62%" aria-hidden style={{ filter: "drop-shadow(0 -1px 0 rgba(0,0,0,0.3))" }}>
      {art[id]}
    </svg>
  );
}

/** A glossy rounded tile. The calendar tile shows today's date in Bengaluru. */
function Tile({ app, size }: { app: App; size: number }) {
  const [a, b] = app.tint;
  const day = app.id === "calendar" ? istDay() : null;
  return (
    <span
      aria-hidden
      className="relative flex shrink-0 items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: `linear-gradient(180deg, ${a} 0%, ${b} 100%)`,
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -2px 3px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.55)",
      }}
    >
      {day ? (
        <span className="flex h-full w-full flex-col items-center">
          <span
            className="w-full text-center font-bold text-white"
            style={{ fontSize: size * 0.16, lineHeight: 1.45, background: "linear-gradient(180deg, #f0544a, #b8221a)" }}
          >
            {day.weekday}
          </span>
          <span className="font-bold" style={{ fontSize: size * 0.5, lineHeight: 1.15, color: INK, letterSpacing: -1 }}>
            {day.day}
          </span>
        </span>
      ) : (
        <Glyph id={app.id} />
      )}
      <span className="pointer-events-none absolute inset-0" style={{ background: GLOSS }} />
    </span>
  );
}

function Chevron() {
  return (
    <svg width="9" height="14" viewBox="0 0 9 14" aria-hidden className="shrink-0">
      <path d="M1.5 1.5L7 7l-5.5 5.5" fill="none" stroke="#8e939c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner({ reduce, color = "#fff" }: { reduce: boolean; color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden style={{ animation: reduce ? "none" : "skeu09-spin 1s steps(12) infinite" }}>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="9" y="1" width="2" height="5" rx="1" fill={color} opacity={0.15 + (i / 12) * 0.85} transform={`rotate(${i * 30} 10 10)`} />
      ))}
    </svg>
  );
}

/* ── chrome ─────────────────────────────────────────────────────────── */

function StatusBar({ clock }: { clock: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-30 flex h-5 items-center justify-between px-1.5 text-[11px] font-bold text-white"
      style={{ background: "linear-gradient(180deg, #2c2c2e 0%, #0d0d0f 100%)" }}
    >
      <span className="flex items-center gap-[2px]" aria-hidden>
        {[3, 5, 7, 9, 11].map((h, i) => (
          <span key={h} style={{ width: 3, height: h, background: i < 4 ? "#fff" : "rgba(255,255,255,0.4)", borderRadius: 1 }} />
        ))}
        <span className="ml-1 font-normal">kiruk</span>
      </span>
      <span aria-label={`Time in Bengaluru: ${clock || "unknown"}`}>{clock || "--:--"}</span>
      <span aria-hidden className="relative flex h-[10px] w-[22px] items-center rounded-[2px] border border-white p-[1px]">
        <span className="h-full rounded-[1px] bg-white" style={{ width: "80%" }} />
        <span className="absolute -right-[3px] top-[2px] h-1 w-[2px] rounded-r-[1px] bg-white" />
      </span>
    </div>
  );
}

/** iPhone OS navigation bar. The title takes focus when its screen opens. */
function NavBar({ title, back, onBack, right }: { title: string; back?: string; onBack?: () => void; right?: ReactNode }) {
  const h = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    h.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div
      className="relative grid h-11 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-1 px-1.5"
      style={{ background: NAV_BAR, borderBottom: "1px solid #2d3642", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)" }}
    >
      <span className="flex justify-start">
        {back && onBack && (
          <button type="button" onClick={onBack} className={`flex min-h-11 items-center ${RING}`} aria-label={`Back to ${back}`}>
            <span
              className="flex h-[30px] max-w-[96px] items-center truncate pl-3.5 pr-2 text-[12px] font-bold text-white"
              style={{
                background: NAV_BTN,
                clipPath: "polygon(11px 0, 100% 0, 100% 100%, 11px 100%, 0 50%)",
                borderRadius: "0 5px 5px 0",
                textShadow: "0 -1px 0 rgba(0,0,0,0.5)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              {back}
            </span>
          </button>
        )}
      </span>
      <h2
        ref={h}
        tabIndex={-1}
        className="truncate text-center text-[17px] font-bold text-white outline-none"
        style={{ textShadow: "0 -1px 0 rgba(0,0,0,0.5)" }}
      >
        {title}
      </h2>
      <span className="flex justify-end">{right}</span>
    </div>
  );
}

function NavButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`flex min-h-11 min-w-11 items-center justify-center ${RING}`}>
      <span
        className="flex h-[30px] items-center rounded-[5px] px-2.5 text-[12px] font-bold text-white"
        style={{ background: NAV_BTN, border: "1px solid #2f4466", textShadow: "0 -1px 0 rgba(0,0,0,0.5)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }}
      >
        {children}
      </span>
    </button>
  );
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="px-2.5 pt-4">
      {title && (
        <h3 className="px-2 pb-1.5 text-[15px] font-bold" style={{ color: SLATE, textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}>
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

/** White grouped table; rows split by a hairline. */
function Table({ children }: { children: ReactNode }) {
  return (
    <ul className="overflow-hidden rounded-[10px] bg-white [&>li+li]:border-t [&>li+li]:border-[#d9dce1]" style={{ border: "1px solid #a9adb5" }}>
      {children}
    </ul>
  );
}

function Field({ k, children }: { k: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[74px_minmax(0,1fr)] items-baseline gap-2.5 px-2.5 py-2.5">
      <span className="text-right text-[12px] font-bold" style={{ color: LABEL }}>
        {k}
      </span>
      <span className="text-[14px] font-semibold leading-snug" style={{ color: INK }}>
        {children}
      </span>
    </li>
  );
}

function ChannelRow({ ch, rank, onOpen }: { ch: Channel; rank?: number; onOpen: (ch: Channel) => void }) {
  const sub = ch.id === "email" ? "Write it here, slide to send" : ch.id === "call" ? "Pick a slot on cal.com" : ch.handle;
  const inner = (
    <>
      <span className="w-5 shrink-0 text-center text-[13px] font-bold" style={{ color: LABEL }}>
        {rank ?? "·"}
      </span>
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="text-[15px] font-bold" style={{ color: INK }}>
          {ch.label}
        </span>
        <span className="truncate text-[12px]" style={{ color: GRAY }}>
          {sub}
        </span>
      </span>
      <Chevron />
    </>
  );
  const cls = `flex min-h-11 w-full items-center gap-2 px-2.5 py-1.5 active:bg-[#e3ebf8] ${RING_IN}`;
  return (
    <li>
      {ch.id === "email" || ch.id === "call" ? (
        <button type="button" onClick={() => onOpen(ch)} className={cls} aria-label={`${ch.label}${rank ? `, my number ${rank} pick` : ""}`}>
          {inner}
        </button>
      ) : (
        <a href={ch.href} {...external(ch.href)} className={cls} aria-label={`${ch.label}, ${ch.handle}${rank ? `, my number ${rank} pick` : ""}, opens in a new tab`}>
          {inner}
        </a>
      )}
    </li>
  );
}

function GlossyButton({ children, onClick, href }: { children: ReactNode; onClick?: () => void; href?: string }) {
  const cls = `flex min-h-11 w-full items-center justify-center rounded-[10px] px-4 text-[16px] font-bold text-white ${RING}`;
  const style: CSSProperties = { background: BLUE_BTN, border: "1px solid #1a4a9c", textShadow: "0 -1px 0 rgba(0,0,0,0.4)", boxShadow: "0 1px 0 rgba(255,255,255,0.6)" };
  return href ? (
    <a href={href} {...external(href)} className={cls} style={style}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  );
}

function WhiteButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-[10px] px-2 text-[14px] font-bold active:bg-[#dfe7f5] ${RING}`}
      style={{ color: LINK, background: "linear-gradient(180deg, #ffffff 0%, #eef0f3 100%)", border: "1px solid #a9adb5" }}
    >
      {children}
    </button>
  );
}

function AlertButton({ children, onClick, strong }: { children: ReactNode; onClick: () => void; strong?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-[6px] px-2 text-[15px] text-white ${strong ? "font-bold" : "font-semibold"} ${RING}`}
      style={{
        background: strong
          ? "linear-gradient(180deg, rgba(160,180,230,0.65) 0%, rgba(90,115,180,0.6) 50%, rgba(60,85,150,0.6) 51%, rgba(90,115,180,0.65) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 51%, rgba(255,255,255,0.18) 100%)",
        border: "1px solid rgba(0,0,0,0.45)",
      }}
    >
      {children}
    </button>
  );
}

/* ── signature 1: the picker drum ───────────────────────────────────── */

const ROW = 36;
const TILT = 0.38; // radians per row around the cylinder
const RADIUS = ROW / TILT;
const STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 3, PageUp: -3, Home: -99, End: 99 };

interface WheelProps<T extends string> {
  name: string;
  items: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  reduce: boolean;
}

/**
 * One wheel: a scroll-snap column painted as a cylinder. Touch and wheel
 * scroll it natively, a mouse can drag it, a tap picks a row, arrows step it.
 * The chosen value is the source of truth; the wheel spins to follow it.
 */
function Wheel<T extends string>({ name, items, value, onChange, reduce }: WheelProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const idx = Math.max(0, items.findIndex((i) => i.id === value));
  const live = useRef({ items, value, onChange });
  useEffect(() => {
    live.current = { items, value, onChange };
  });
  const settle = useRef(0);
  const raf = useRef(0);
  const lockUntil = useRef(0);
  const first = useRef(true);
  const drag = useRef<{ y: number; top: number; id: number; moved: boolean } | null>(null);

  const paint = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const center = el.scrollTop + el.clientHeight / 2;
    el.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
      const d = clamp((row.offsetTop + ROW / 2 - center) / ROW, -2.6, 2.6);
      const t = d * TILT;
      row.style.transform = `translateY(${(RADIUS * Math.sin(t) - d * ROW).toFixed(1)}px) rotateX(${((-t * 180) / Math.PI).toFixed(1)}deg)`;
      row.style.opacity = String(Math.max(0.2, 1 - Math.abs(d) * 0.25));
    });
  }, []);

  // Once the wheel comes to rest, the row under the band is the answer.
  const commit = () => {
    const el = ref.current;
    if (!el || drag.current) return;
    const wait = lockUntil.current - performance.now();
    if (wait > 0) {
      settle.current = window.setTimeout(commit, wait + 20);
      return;
    }
    const { items: list, value: v, onChange: change } = live.current;
    const i = clamp(Math.round(el.scrollTop / ROW), 0, list.length - 1);
    if (list[i].id !== v) change(list[i].id);
  };

  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(paint);
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(commit, 120);
  };

  // Spin to the value: on mount, after a key or tap, or when the other wheel moved this one.
  useEffect(() => {
    const el = ref.current;
    if (!el || drag.current) return;
    const top = idx * ROW;
    if (Math.abs(el.scrollTop - top) >= 1) {
      lockUntil.current = performance.now() + 650;
      el.scrollTo({ top, behavior: first.current || reduce ? "auto" : "smooth" });
    }
    first.current = false;
    paint();
  }, [idx, reduce, paint]);

  useEffect(
    () => () => {
      window.clearTimeout(settle.current);
      cancelAnimationFrame(raf.current);
    },
    [],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
    drag.current = { y: e.clientY, top: ref.current.scrollTop, id: e.pointerId, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el) return;
    if (e.buttons === 0) {
      drag.current = null;
      return;
    }
    const dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.abs(dy) < 4) return;
      d.moved = true;
      el.setPointerCapture(d.id);
      el.style.scrollSnapType = "none";
    }
    el.scrollTop = d.top - dy;
  };
  const endDrag = () => {
    const d = drag.current;
    const el = ref.current;
    drag.current = null;
    if (!d?.moved || !el) return;
    el.style.scrollSnapType = "";
    el.scrollTo({ top: clamp(Math.round(el.scrollTop / ROW), 0, items.length - 1) * ROW, behavior: reduce ? "auto" : "smooth" });
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(commit, 400);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = STEPS[e.key];
    if (step === undefined) return;
    e.preventDefault();
    onChange(items[clamp(idx + step, 0, items.length - 1)].id);
  };

  return (
    <div
      ref={ref}
      role="listbox"
      tabIndex={0}
      aria-labelledby={`${name}-label`}
      aria-activedescendant={`${name}-${value}`}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`relative overflow-y-scroll overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${RING_IN}`}
      style={{ height: ROW * 5, scrollSnapType: "y mandatory", perspective: 520, userSelect: "none", cursor: "grab" }}
    >
      <div aria-hidden style={{ height: ROW * 2 }} />
      {items.map((it) => (
        <div
          key={it.id}
          id={`${name}-${it.id}`}
          data-row
          role="option"
          aria-selected={it.id === value}
          onClick={() => onChange(it.id)}
          className="truncate px-2.5 text-[15px] font-bold"
          style={{ height: ROW, lineHeight: `${ROW}px`, scrollSnapAlign: "center", color: INK, backfaceVisibility: "hidden" }}
        >
          {it.label}
        </div>
      ))}
      <div aria-hidden style={{ height: ROW * 2 }} />
    </div>
  );
}

function Drum({ c }: { c: Contact }) {
  const cols = "grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-x-1";
  const wheelBg = "linear-gradient(180deg, #c9cad0 0%, #f6f6f8 28%, #ffffff 50%, #f6f6f8 72%, #c9cad0 100%)";
  return (
    <div>
      <div className={`${cols} px-2 pb-1 text-[12px] font-bold`} style={{ color: SLATE, textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}>
        <span id="skeu09-who-label">I&rsquo;m</span>
        <span id="skeu09-intent-label">I want to</span>
      </div>
      <div
        className="relative rounded-[8px] p-1.5"
        style={{ background: "linear-gradient(180deg, #4b4e57 0%, #25272d 50%, #121317 100%)", boxShadow: "0 1px 0 rgba(255,255,255,0.7), inset 0 1px 0 rgba(255,255,255,0.2)" }}
      >
        <div className={cols}>
          <div className="overflow-hidden rounded-[3px]" style={{ background: wheelBg }}>
            <Wheel<ContactWhoId> name="skeu09-who" items={WHO} value={c.who} onChange={c.setWho} reduce={c.reduce} />
          </div>
          <div className="overflow-hidden rounded-[3px]" style={{ background: wheelBg }}>
            <Wheel<IntentId> name="skeu09-intent" items={INTENTS} value={c.intent.id} onChange={c.setIntent} reduce={c.reduce} />
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-1.5 rounded-[3px]"
          style={{ background: "linear-gradient(180deg, rgba(18,20,26,0.6) 0%, rgba(18,20,26,0) 34%, rgba(18,20,26,0) 66%, rgba(18,20,26,0.6) 100%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0.5 top-1/2 -translate-y-1/2"
          style={{
            height: ROW + 4,
            background: "linear-gradient(180deg, rgba(236,240,250,0.5) 0%, rgba(200,208,232,0.4) 50%, rgba(160,172,210,0.42) 51%, rgba(196,204,228,0.4) 100%)",
            borderTop: "1px solid rgba(70,80,110,0.7)",
            borderBottom: "1px solid rgba(70,80,110,0.7)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          }}
        />
      </div>
    </div>
  );
}

/* ── signature 2: slide to send ─────────────────────────────────────── */

const KNOB = 64;

function SlideToSend({ c, onBlocked }: { c: Contact; onBlocked: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; pos: number } | null>(null);
  const timer = useRef(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer.current);
    };
  }, []);

  // A failed send drops the knob back so it can be slid again.
  useEffect(() => {
    if (c.sendState === "error") setPos(0);
  }, [c.sendState]);

  const max = Math.max(0, width - KNOB - 8);
  const busy = c.sendState === "sending" || c.sendState === "sent";
  const x = busy ? max : Math.min(pos, max);
  const progress = max ? x / max : 0;

  const attempt = () => {
    if (!c.ready) {
      setPos(0);
      onBlocked();
      return;
    }
    setPos(max);
    void c.send();
  };
  const slideHome = () => {
    setPos(max);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(attempt, c.reduce ? 0 : 280);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (busy) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, pos: x };
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (start.current) setPos(clamp(start.current.pos + e.clientX - start.current.x, 0, max));
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    start.current = null;
    setDragging(false);
    if (!s) return;
    const at = clamp(s.pos + e.clientX - s.x, 0, max);
    if (max > 0 && at >= max * 0.9) attempt();
    else setPos(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (busy) return;
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(max, x + max / 4);
      if (next >= max - 1) slideHome();
      else setPos(next);
    } else if (k === "ArrowLeft" || k === "ArrowDown") {
      e.preventDefault();
      setPos(Math.max(0, x - max / 4));
    } else if (k === "Home") {
      e.preventDefault();
      setPos(0);
    } else if (k === "Enter" || k === "End" || k === " ") {
      e.preventDefault();
      slideHome();
    }
  };

  const label = c.sendState === "sending" ? "sending" : c.sendState === "sent" ? "sent" : "slide to send";

  return (
    <div className="px-3 pb-3 pt-2.5" style={{ background: "linear-gradient(180deg, #3a3a3f 0%, #111113 50%, #000 51%, #141416 100%)", borderTop: "1px solid #000" }}>
      <div
        ref={track}
        className="relative h-[52px] rounded-[12px]"
        style={{ background: "linear-gradient(180deg, #121214 0%, #2b2b30 100%)", border: "1px solid #000", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.18)" }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center pl-14 text-[19px]"
          style={{ opacity: Math.max(0, 1 - progress * 1.7), ...(c.reduce || busy ? { color: "rgba(255,255,255,0.6)" } : SHIMMER) }}
        >
          {label}
        </span>
        <div
          role="slider"
          tabIndex={busy ? -1 : 0}
          aria-label="Slide to send"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuetext={busy ? label : `${Math.round(progress * 100)} percent. Slide to the end to send.`}
          aria-disabled={busy || undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          className={`absolute left-[3px] top-[3px] flex h-11 items-center justify-center rounded-[9px] ${RING}`}
          style={{
            width: KNOB,
            transform: `translateX(${x}px)`,
            transition: dragging || c.reduce ? "none" : "transform 440ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            background: "linear-gradient(180deg, #fdfdfd 0%, #dadada 50%, #bdbdbd 51%, #e4e4e4 100%)",
            boxShadow: "inset 0 1px 0 #fff, 0 1px 3px rgba(0,0,0,0.6)",
            touchAction: "none",
            cursor: busy ? "default" : "grab",
          }}
        >
          {c.sendState === "sending" ? (
            <Spinner reduce={c.reduce} color="#555" />
          ) : (
            <svg width="26" height="18" viewBox="0 0 26 18" aria-hidden>
              <path d="M2 9h16M12 3l7 6-7 6" fill="none" stroke="#7a7a80" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── mail compose sheet ─────────────────────────────────────────────── */

function ComposeSheet({ c, onClose }: { c: Contact; onClose: () => void }) {
  const [showMissing, setShowMissing] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (c.sendState === "error") setAlertOpen(true);
  }, [c.sendState]);
  useEffect(() => {
    if (alertOpen) okRef.current?.focus();
  }, [alertOpen]);

  const missing = {
    name: !c.name.trim(),
    from: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.from.trim()),
    body: c.body.trim().length <= 10 || c.body.trim() === c.intent.body.trim(),
  };
  const flag = (k: keyof typeof missing) => showMissing && missing[k];
  const sent = c.sendState === "sent";
  const first = c.name.trim().split(/\s+/)[0];

  const row = (k: keyof typeof missing | null) =>
    `flex min-h-11 items-center gap-2 px-3 ${k && flag(k) ? "bg-[#fff1f0]" : "bg-white"}`;
  const key = (k: keyof typeof missing | null): CSSProperties => ({ color: k && flag(k) ? "#c8102e" : "#8e8e93" });
  const input = `min-h-11 min-w-0 flex-1 bg-transparent text-[16px] outline-none ${RING_IN}`;

  return (
    <div className="flex h-full flex-col" style={{ background: "#fff" }}>
      <NavBar title={sent ? "Sent" : "New Message"} back={sent ? undefined : "Cancel"} onBack={onClose} right={sent ? <NavButton onClick={onClose}>Done</NavButton> : undefined} />

      {sent ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center" style={{ background: PINSTRIPE }}>
          <span
            aria-hidden
            className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
            style={{ background: "linear-gradient(180deg, #7fdc6a 0%, #2f9a1e 100%)", border: "2px solid #fff", boxShadow: "0 2px 6px rgba(0,0,0,0.35)" }}
          >
            <svg width="30" height="24" viewBox="0 0 30 24">
              <path d="M3 13l8 8L27 3" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute inset-0" style={{ background: GLOSS }} />
          </span>
          <p role="status" className="text-[18px] font-bold" style={{ color: INK, textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}>
            Your message reached me
          </p>
          <p className="text-[14px] leading-snug" style={{ color: SLATE }}>
            Thanks{first ? `, ${first}` : ""}. I&rsquo;ll reply to {c.from} {c.awake ? "soon" : "after sunrise in Bengaluru"}.
          </p>
          <div className="w-full max-w-[220px] pt-2">
            <GlossyButton onClick={onClose}>Done</GlossyButton>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto overscroll-contain [&>*]:border-b [&>*]:border-[#d9dce1]">
            <div className={row(null)}>
              <span className="text-[15px]" style={key(null)}>
                To:
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[14px] font-semibold text-white"
                style={{ background: "linear-gradient(180deg, #7aa7e8 0%, #3c72cf 100%)", border: "1px solid #2c5bb0" }}
              >
                Arun Kumaar Sreenivasan
              </span>
            </div>
            <label className={row("name")}>
              <span className="shrink-0 text-[15px]" style={key("name")}>
                From:
              </span>
              <input aria-label="Your name" aria-invalid={flag("name") || undefined} placeholder="Your name" autoComplete="name" value={c.name} onChange={(e) => c.setName(e.target.value)} className={input} style={{ color: INK }} />
            </label>
            <label className={row("from")}>
              <span className="shrink-0 text-[15px]" style={key("from")}>
                Reply-To:
              </span>
              <input
                aria-label="Your email"
                aria-invalid={flag("from") || undefined}
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
            <label className={row(null)}>
              <span className="shrink-0 text-[15px]" style={key(null)}>
                Subject:
              </span>
              <input aria-label="Subject" value={c.subject} onChange={(e) => c.setSubject(e.target.value)} className={input} style={{ color: INK }} />
            </label>
            <div className={flag("body") ? "bg-[#fff1f0]" : "bg-white"}>
              <textarea
                aria-label="Your message"
                aria-invalid={flag("body") || undefined}
                rows={8}
                value={c.body}
                onChange={(e) => c.setBody(e.target.value)}
                className={`block w-full resize-none bg-transparent px-3 py-2.5 text-[16px] leading-snug outline-none ${RING_IN}`}
                style={{ color: INK }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-3 bg-[#f4f5f7] px-1.5">
              <a href={c.mailto} className={`flex min-h-11 items-center px-1.5 text-[14px] font-semibold ${RING_IN}`} style={{ color: LINK }}>
                Open in my own mail app
              </a>
              <button type="button" onClick={c.resetDraft} className={`min-h-11 px-1.5 text-[14px] ${RING_IN}`} style={{ color: GRAY }}>
                Reset draft
              </button>
            </div>
          </div>
          <p role="status" className="min-h-0 px-3 text-[12.5px] leading-snug" style={{ color: "#c8102e", background: "#fff" }}>
            {showMissing && !c.ready ? (
              <span className="block py-1.5">
                Almost. I need {[missing.name && "your name", missing.from && "an email I can reply to", missing.body && "a line of your own"].filter(Boolean).join(", ")}.
              </span>
            ) : null}
          </p>
          <SlideToSend c={c} onBlocked={() => setShowMissing(true)} />
        </>
      )}

      {alertOpen && c.sendState === "error" && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-5"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setAlertOpen(false);
            }
          }}
        >
          <div role="alertdialog" aria-labelledby="skeu09-err-title" aria-describedby="skeu09-err-body" className="relative w-full max-w-[280px] overflow-hidden rounded-[10px] px-4 pb-3.5 pt-3.5 text-center text-white" style={ALERT}>
            <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: GLOSS, opacity: 0.5 }} />
            <h3 id="skeu09-err-title" className="relative text-[16px] font-bold">
              Couldn&rsquo;t send that
            </h3>
            <p id="skeu09-err-body" className="relative mt-1 text-[13.5px] leading-snug">
              {c.sendError} Your words are still here. Slide again, or take them to your mail app.
            </p>
            <div className="relative mt-3 grid grid-cols-2 gap-2">
              <button
                ref={okRef}
                type="button"
                onClick={() => setAlertOpen(false)}
                className={`min-h-11 rounded-[6px] text-[15px] font-semibold text-white ${RING}`}
                style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(0,0,0,0.45)" }}
              >
                OK
              </button>
              <a
                href={c.mailto}
                className={`flex min-h-11 items-center justify-center rounded-[6px] text-[15px] font-bold text-white ${RING}`}
                style={{ background: "rgba(120,145,210,0.6)", border: "1px solid rgba(0,0,0,0.45)" }}
              >
                Mail app
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── apps ───────────────────────────────────────────────────────────── */

interface Nav {
  back: string;
  onBack: () => void;
}

function ContactsApp({ c, nav, onChannel }: { c: Contact; nav: Nav; onChannel: (ch: Channel) => void }) {
  const rest = c.all.slice(c.picks.length);
  return (
    <>
      <NavBar title="Info" {...nav} />
      <div className="flex-1 overflow-y-auto overscroll-contain pb-5" style={{ background: PINSTRIPE }}>
        <div className="relative px-3 py-3.5" style={{ ...LEATHER, boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.4)" }}>
          <span aria-hidden className="pointer-events-none absolute inset-1.5 rounded-[3px]" style={STITCH} />
          <div className="relative flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[6px] text-[24px] font-bold"
              style={{
                background: "linear-gradient(180deg, #e9edf3 0%, #aab4c3 100%)",
                color: "#5d6a7f",
                border: "3px solid #fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                textShadow: "0 1px 0 rgba(255,255,255,0.7)",
              }}
            >
              {INITIALS}
            </span>
            <div className="min-w-0">
              <h3 className="text-[17px] font-bold leading-tight" style={{ color: "#fff8ec", textShadow: "0 -1px 0 rgba(0,0,0,0.6)" }}>
                {FACTS.name}
              </h3>
              <p className="text-[13px] leading-snug" style={{ color: "#f3dfc2" }}>
                {FACTS.now}
              </p>
              <p className="mt-1 text-[11.5px] leading-snug" style={{ color: "#e3c9a4" }}>
                {statusLine(c)}
              </p>
            </div>
          </div>
        </div>

        <Group title="Finish my sentence">
          <Drum c={c} />
          <p className="mt-2 rounded-[10px] bg-white px-3 py-2 text-[13.5px] leading-snug" style={{ color: INK, border: "1px solid #a9adb5" }}>
            {c.intent.why}
          </p>
        </Group>

        <Group title="Best way to reach me">
          <Table>
            {c.picks.map((p, i) => (
              <ChannelRow key={p.id} ch={p} rank={i + 1} onOpen={onChannel} />
            ))}
          </Table>
        </Group>

        <Group title="Other ways">
          <Table>
            {rest.map((p) => (
              <ChannelRow key={p.id} ch={p} onOpen={onChannel} />
            ))}
          </Table>
        </Group>

        <Group>
          <Table>
            <Field k="work">
              <a href={FACTS.nowHref} target="_blank" rel="noopener noreferrer" className={`underline-offset-2 hover:underline ${RING}`} style={{ color: LINK }}>
                {FACTS.now}
              </a>
            </Field>
            <Field k="before">{FACTS.before}</Field>
            <Field k="email">
              <span className="flex flex-wrap items-center justify-between gap-x-2">
                <a href={`mailto:${EMAIL}`} className={`break-all ${RING}`} style={{ color: LINK }}>
                  {EMAIL}
                </a>
                <button type="button" onClick={c.copyEmail} className={`min-h-11 px-1 text-[13px] font-bold ${RING}`} style={{ color: LINK }}>
                  {c.copied ? "Copied" : "Copy"}
                </button>
              </span>
            </Field>
            <Field k="home page">
              <Link href="/" className={RING} style={{ color: LINK }}>
                kiruk.in
              </Link>
            </Field>
            <Field k="location">
              {FACTS.place} <span style={{ color: GRAY }}>· {FACTS.timezone}</span>
            </Field>
            <Field k="notes">
              <span className="flex flex-col gap-0.5 font-normal">
                <span className="font-semibold">Open to:</span>
                {FACTS.openTo.map((o) => (
                  <span key={o}>· {o}</span>
                ))}
                <span className="mt-1">{FACTS.mode}</span>
              </span>
            </Field>
          </Table>
        </Group>

        <div className="grid grid-cols-2 gap-2 px-2.5 pt-4">
          <WhiteButton onClick={() => onChannel(getChannel("email"))}>Send Message</WhiteButton>
          <WhiteButton onClick={() => onChannel(getChannel("call"))}>Book a Call</WhiteButton>
        </div>
      </div>
    </>
  );
}

function MailApp({ c, nav, onCompose }: { c: Contact; nav: Nav; onCompose: () => void }) {
  const sent = c.sendState === "sent";
  const snippet = c.body.replace(/\s+/g, " ").trim();
  const head = (t: string) => (
    <h3
      className="px-3 py-0.5 text-[13px] font-bold text-white"
      style={{ background: "linear-gradient(180deg, #a5b1ba 0%, #b9c2c9 100%)", textShadow: "0 1px 0 rgba(0,0,0,0.35)", borderBottom: "1px solid #8e9aa4" }}
    >
      {t}
    </h3>
  );
  const cell = `flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left ${RING_IN}`;
  return (
    <>
      <NavBar
        title="Mail"
        {...nav}
        right={
          <NavButton onClick={onCompose} label="New message">
            <svg width="18" height="16" viewBox="0 0 18 16" aria-hidden>
              <path d="M2 4h7M2 4v10h11V9" fill="none" stroke="#fff" strokeWidth="1.8" />
              <path d="M8 10l1-3 6-6 2 2-6 6z" fill="#fff" />
            </svg>
          </NavButton>
        }
      />
      <div className="flex-1 overflow-y-auto overscroll-contain bg-white [&_li]:border-b [&_li]:border-[#d9dce1]">
        {head("Drafts")}
        <ul>
          <li>
            <button type="button" onClick={onCompose} className={cell}>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-bold" style={{ color: INK }}>
                  To: Arun
                </span>
                <span className="truncate text-[14px]" style={{ color: INK }}>
                  {c.subject || "No subject"}
                </span>
                <span className="line-clamp-2 text-[12.5px] leading-snug" style={{ color: GRAY }}>
                  {snippet}
                </span>
              </span>
              <Chevron />
            </button>
          </li>
        </ul>
        {sent && (
          <>
            {head("Sent")}
            <ul>
              <li className="px-3 py-2">
                <span className="block text-[15px] font-bold" style={{ color: INK }}>
                  {c.subject}
                </span>
                <span className="block text-[12.5px]" style={{ color: GRAY }}>
                  To Arun · I&rsquo;ll reply to {c.from}
                </span>
              </li>
            </ul>
          </>
        )}
        {head("Elsewhere")}
        <ul>
          <li>
            <a href={c.mailto} className={cell} style={{ color: LINK }}>
              <span className="flex-1 text-[15px] font-semibold">Write it in my own mail app</span>
              <Chevron />
            </a>
          </li>
          <li>
            <button type="button" onClick={c.copyEmail} className={cell} style={{ color: LINK }}>
              <span className="flex-1 text-[15px] font-semibold">{c.copied ? "Copied my address" : "Copy my address"}</span>
              <span className="text-[12px]" style={{ color: GRAY }}>
                {EMAIL}
              </span>
            </button>
          </li>
        </ul>
      </div>
      <div
        className="flex h-11 shrink-0 items-center justify-center text-[12px] font-bold text-white"
        style={{ background: NAV_BAR, borderTop: "1px solid #2d3642", textShadow: "0 -1px 0 rgba(0,0,0,0.5)" }}
      >
        Updated {c.clock || "--:--"} in Bengaluru
      </div>
    </>
  );
}

function CalendarApp({ c, nav }: { c: Contact; nav: Nav }) {
  return (
    <>
      <NavBar title="Calendar" {...nav} />
      <div className="flex-1 overflow-y-auto overscroll-contain bg-white">
        <div className="px-3 py-2.5" style={{ borderBottom: HAIR, background: "linear-gradient(180deg, #f7f7f9 0%, #e8e9ed 100%)" }}>
          <p className="text-[15px] font-bold" style={{ color: INK }}>
            30 minutes with me
          </p>
          <p className="text-[12.5px] leading-snug" style={{ color: GRAY }}>
            {getChannel("call").use} {statusLine(c)}
          </p>
        </div>
        <CalEmbed height={640} />
      </div>
    </>
  );
}

function ChannelApp({ app, c, nav }: { app: App; c: Contact; nav: Nav }) {
  const ch = getChannel(app.channel!);
  const rank = c.picks.findIndex((p) => p.id === ch.id) + 1;
  return (
    <>
      <NavBar title={app.label} {...nav} />
      <div className="flex-1 overflow-y-auto overscroll-contain pb-5" style={{ background: PINSTRIPE }}>
        <div className="flex flex-col items-center gap-1 px-4 pt-5 text-center">
          <Tile app={app} size={72} />
          <p className="mt-2 text-[19px] font-bold" style={{ color: INK, textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}>
            {ch.label}
          </p>
          <p className="break-all text-[13px]" style={{ color: SLATE }}>
            {ch.handle}
          </p>
        </div>
        <Group>
          <Table>
            <Field k="good for">{ch.use}</Field>
            <Field k="for you">
              {rank ? `My number ${rank} pick for “${c.intent.label}”.` : `Not my first pick for “${c.intent.label}”, but it works.`}
            </Field>
          </Table>
        </Group>
        <div className="px-2.5 pt-4">
          <GlossyButton href={ch.href}>Open {ch.label}</GlossyButton>
        </div>
      </div>
    </>
  );
}

/* ── home screen ────────────────────────────────────────────────────── */

function AppIcon({ app, rank, onOpen, iconRef, small }: { app: App; rank: number; onOpen: () => void; iconRef: (el: HTMLButtonElement | null) => void; small?: boolean }) {
  return (
    <button
      ref={iconRef}
      type="button"
      onClick={onOpen}
      aria-label={`${app.label}${rank ? `, my number ${rank} pick` : ""}`}
      className={`flex min-h-11 flex-col items-center gap-1 rounded-[12px] ${RING}`}
    >
      <span className="relative">
        <Tile app={app} size={small ? 52 : 57} />
        {rank > 0 && (
          <span
            aria-hidden
            className="absolute -right-2 -top-2 flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 text-[12px] font-bold text-white"
            style={{ background: "linear-gradient(180deg, #ff6b5e 0%, #c81e12 100%)", border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
          >
            {rank}
          </span>
        )}
      </span>
      <span className="max-w-[72px] truncate text-[11px] font-semibold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
        {app.label}
      </span>
    </button>
  );
}

/* ── skin ───────────────────────────────────────────────────────────── */

export function IphoneSkeu2009({ contact: c }: ContactSkinProps) {
  const [stack, setStack] = useState<AppId[]>([]);
  const [kind, setKind] = useState<Kind>("zoom");
  const [origins, setOrigins] = useState<Partial<Record<AppId, string>>>({});
  const [sheet, setSheet] = useState(false);
  const [hint, setHint] = useState(() => {
    try {
      return sessionStorage.getItem(HINT_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const view: AppId | "home" = stack.length ? stack[stack.length - 1] : "home";
  const deviceRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const icons = useRef<Partial<Record<AppId, HTMLButtonElement | null>>>({});
  const sheetReturn = useRef<HTMLElement | null>(null);

  const rank = (id: AppId) => {
    const ch = APPS[id].channel;
    return ch ? c.picks.findIndex((p) => p.id === ch) + 1 : 0;
  };

  const dismissHint = () => {
    setHint(false);
    try {
      sessionStorage.setItem(HINT_KEY, "1");
    } catch {
      /* private mode: it just shows again next time */
    }
  };

  /** Zoom origin: the app's own icon, so apps grow out of it and shrink back into it. */
  const originFor = (id: AppId) => {
    const l = layerRef.current?.getBoundingClientRect();
    const i = icons.current[id]?.getBoundingClientRect();
    if (!l || !i) return "50% 50%";
    return `${Math.round(i.left + i.width / 2 - l.left)}px ${Math.round(i.top + 30 - l.top)}px`;
  };

  const inView = () => {
    const r = deviceRef.current?.getBoundingClientRect();
    if (r && (r.top < 0 || r.bottom > window.innerHeight)) deviceRef.current?.scrollIntoView({ block: "center", behavior: c.reduce ? "auto" : "smooth" });
  };

  const openApp = (id: AppId) => {
    dismissHint();
    setOrigins((o) => ({ ...o, [id]: originFor(id) }));
    setKind("zoom");
    setStack([id]);
    sheetReturn.current = icons.current[id] ?? null;
    setSheet(id === "mail");
  };
  const pushApp = (id: AppId) => {
    setOrigins((o) => ({ ...o, [id]: originFor(id) }));
    setKind("push");
    setStack((s) => [...s, id]);
  };
  const popApp = () => {
    setKind("pop");
    setStack((s) => s.slice(0, -1));
  };
  const goHome = () => {
    const leaving = stack[0];
    const hadFocus = !!deviceRef.current?.contains(document.activeElement);
    setSheet(false);
    setKind("zoom");
    setStack([]);
    if (leaving && hadFocus) requestAnimationFrame(() => icons.current[leaving]?.focus({ preventScroll: true }));
  };
  const openSheet = () => {
    sheetReturn.current = document.activeElement as HTMLElement | null;
    setSheet(true);
  };
  const closeSheet = () => {
    setSheet(false);
    const el = sheetReturn.current;
    requestAnimationFrame(() => {
      if (el?.isConnected) el.focus({ preventScroll: true });
    });
  };

  /** From inside the phone: email slides the sheet up, a call pushes Calendar, the rest leave for their site. */
  const onChannelInPhone = (ch: Channel) => {
    if (ch.id === "email") openSheet();
    else if (ch.id === "call") pushApp("calendar");
  };
  /** From the notepad beside the phone. */
  const onChannelOutside = (ch: Channel) => {
    openApp(appOf(ch.id));
    inView();
  };

  const onDeviceKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Escape") return;
    if (hint && view === "home") dismissHint();
    else if (sheet) closeSheet();
    else if (stack.length > 1) popApp();
    else if (stack.length) goHome();
    else return;
    e.preventDefault();
  };

  const renderApp = (id: AppId) => {
    const prev = stack.length > 1 ? stack[stack.length - 2] : null;
    const nav: Nav = prev ? { back: prev === "contacts" ? "Arun" : APPS[prev].label, onBack: popApp } : { back: "Home", onBack: goHome };
    if (id === "contacts") return <ContactsApp c={c} nav={nav} onChannel={onChannelInPhone} />;
    if (id === "mail") return <MailApp c={c} nav={nav} onCompose={openSheet} />;
    if (id === "calendar") return <CalendarApp c={c} nav={nav} />;
    return <ChannelApp app={APPS[id]} c={c} nav={nav} />;
  };

  const iconProps = (id: AppId, small?: boolean) => ({
    app: APPS[id],
    rank: rank(id),
    small,
    onOpen: () => openApp(id),
    iconRef: (el: HTMLButtonElement | null) => {
      icons.current[id] = el;
    },
  });

  const home = view === "home";

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:pt-10" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: INK }}>
      <div
        className="-mx-4 flex flex-col items-center gap-5 px-2 py-5 sm:mx-0 sm:rounded-[20px] sm:px-6 sm:py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-8"
        style={{ ...LINEN, boxShadow: "inset 0 2px 12px rgba(0,0,0,0.5)" }}
      >
        {/* nameplate */}
        <header
          data-blueprint="header"
          className="relative w-full max-w-[400px] overflow-hidden rounded-[14px] px-4 py-3.5 lg:max-w-[300px] lg:justify-self-end"
          style={{ ...LEATHER, boxShadow: "0 6px 16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,220,170,0.3)" }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-[5px] rounded-[10px]" style={STITCH} />
          <div className="relative flex flex-col gap-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "#e3c9a4" }}>
              Contact
            </p>
            <h1 className="text-[21px] font-bold leading-tight" style={{ color: "#fff8ec", textShadow: "0 -1px 0 rgba(0,0,0,0.6)" }}>
              {FACTS.name}
            </h1>
            <p className="text-[13.5px] leading-snug" style={{ color: "#f3dfc2" }}>
              {FACTS.now}
            </p>
            <p className="text-[12.5px] leading-snug" style={{ color: "#e3c9a4" }}>
              {statusLine(c)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <button
                type="button"
                onClick={c.copyEmail}
                className={`min-h-11 rounded-[8px] px-3.5 text-[14px] font-bold ${RING}`}
                style={{
                  color: "#3b210e",
                  background: "linear-gradient(180deg, #fbefd9 0%, #e6cfa6 50%, #d9bd8c 51%, #ecd8b2 100%)",
                  border: "1px solid #2a170a",
                  textShadow: "0 1px 0 rgba(255,255,255,0.6)",
                }}
              >
                {c.copied ? "Copied" : "Copy my email"}
              </button>
              <span className="break-all text-[12px]" style={{ color: "#e3c9a4" }}>
                {EMAIL}
              </span>
            </div>
          </div>
        </header>

        {/* the phone */}
        <div
          ref={deviceRef}
          data-blueprint="compose"
          onKeyDown={onDeviceKey}
          className="relative w-full rounded-[34px] px-2.5 pb-[78px] pt-9 sm:w-[384px] sm:rounded-[48px] sm:px-4 sm:pb-[90px] sm:pt-14"
          style={{ background: BEZEL, boxShadow: "0 24px 50px rgba(0,0,0,0.6), inset 0 2px 0 #555b6a, inset 0 -2px 0 #000, 0 0 0 1px #000" }}
        >
          <div aria-hidden className="absolute inset-x-0 top-3.5 flex items-center justify-center gap-3 sm:top-6">
            <span className="h-2 w-2 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #3a3a3a, #050505)" }} />
            <span className="h-[6px] w-14 rounded-full" style={{ background: "linear-gradient(180deg, #000, #222 50%, #000)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }} />
          </div>

          <div
            role="region"
            aria-label="Phone screen"
            className="relative overflow-hidden rounded-[3px] bg-black"
            style={{ height: "clamp(440px, calc(100svh - 240px), 600px)", boxShadow: "0 0 0 1px #000" }}
          >
            <StatusBar clock={c.clock} />
            <div ref={layerRef} className="absolute inset-x-0 bottom-0 top-5 overflow-hidden">
              {/* springboard: always mounted underneath, so apps can zoom out of their icons */}
              <div
                inert={!home || undefined}
                className="absolute inset-0 flex flex-col"
                style={{
                  background: "radial-gradient(ellipse 90% 60% at 50% 28%, #4d8fc4 0%, #1f3a5c 55%, #04101e 100%)",
                  transform: home || c.reduce ? "none" : "scale(1.12)",
                  opacity: home ? 1 : 0,
                  transition: c.reduce ? "none" : "transform 300ms ease, opacity 300ms ease",
                }}
              >
                <h2 className="sr-only">Home screen</h2>
                <div className="grid grid-cols-4 justify-items-center gap-x-1 gap-y-4 px-3 pt-4">
                  {GRID.map((id) => (
                    <AppIcon key={id} {...iconProps(id)} />
                  ))}
                </div>

                {hint && (
                  <div
                    role="group"
                    aria-labelledby="skeu09-hint-title"
                    className="relative mx-4 mt-6 overflow-hidden rounded-[10px] px-4 pb-3 pt-3.5 text-center text-white"
                    style={ALERT}
                  >
                    <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: GLOSS, opacity: 0.5 }} />
                    <h3 id="skeu09-hint-title" className="relative text-[16px] font-bold">
                      Hi, I&rsquo;m Arun
                    </h3>
                    <p className="relative mt-1 text-[13.5px] leading-snug">
                      Open Contacts and spin the wheel to tell me who you are. The red badges will rank the best ways to reach me.
                    </p>
                    <div className="relative mt-3 grid grid-cols-2 gap-2">
                      <AlertButton onClick={dismissHint}>Close</AlertButton>
                      <AlertButton strong onClick={() => openApp("contacts")}>
                        Open
                      </AlertButton>
                    </div>
                  </div>
                )}

                <div className="flex-1" />
                <div aria-hidden className="flex justify-center pb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <div
                  className="grid grid-cols-3 justify-items-center px-6 pb-2 pt-2.5"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 48%, rgba(0,0,0,0.28) 52%, rgba(0,0,0,0.4) 100%)",
                    borderTop: "1px solid rgba(255,255,255,0.5)",
                  }}
                >
                  {DOCK.map((id) => (
                    <AppIcon key={id} {...iconProps(id, true)} />
                  ))}
                </div>
              </div>

              <AnimatePresence initial={false} custom={kind}>
                {!home && (
                  <motion.div
                    key={view}
                    custom={kind}
                    variants={LAYER}
                    initial={c.reduce ? false : "enter"}
                    animate="center"
                    exit={c.reduce ? "gone" : "exit"}
                    transition={{ duration: 0.32, ease: [0.25, 0.8, 0.25, 1] }}
                    inert={sheet || undefined}
                    className="absolute inset-0 flex flex-col bg-white"
                    style={{ transformOrigin: origins[view] ?? "50% 50%" }}
                  >
                    {renderApp(view)}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {sheet && (
                  <motion.div
                    key="sheet"
                    initial={c.reduce ? false : { y: "100%" }}
                    animate={{ y: 0 }}
                    exit={c.reduce ? { opacity: 0, transition: { duration: 0 } } : { y: "100%" }}
                    transition={{ duration: 0.34, ease: [0.2, 0.85, 0.25, 1] }}
                    className="absolute inset-0 z-10"
                  >
                    <ComposeSheet c={c} onClose={closeSheet} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-3 flex justify-center sm:bottom-4">
            <button
              type="button"
              onClick={goHome}
              aria-label="Home button: back to the home screen"
              className={`relative h-[54px] w-[54px] rounded-full sm:h-[60px] sm:w-[60px] ${RING}`}
              style={{
                background: "radial-gradient(circle at 50% 35%, #4a4f5d 0%, #1a1d27 60%, #000 100%)",
                border: "1px solid #000",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.16), inset 0 -3px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <span aria-hidden className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[4px]" style={{ border: "1.5px solid #8a8f9c" }} />
            </button>
          </div>
        </div>

        {/* notepad: the short answer, for anyone who'd rather not play with a phone */}
        <aside
          data-blueprint="channels"
          aria-label="Best ways to reach me"
          className="w-full max-w-[400px] overflow-hidden rounded-[6px] lg:max-w-[300px] lg:justify-self-start"
          style={{ boxShadow: "0 6px 16px rgba(0,0,0,0.5)" }}
        >
          <div aria-hidden className="h-6" style={{ ...LEATHER, borderBottom: "1px solid #2a170a" }} />
          <div
            className="py-2 pl-10 pr-4 text-[16px] leading-[22px]"
            style={{
              fontFamily: MARKER,
              color: "#2a2300",
              backgroundColor: "#fff9c4",
              backgroundImage: "linear-gradient(90deg, transparent 30px, rgba(220,60,60,0.4) 30px 31px, transparent 31px), repeating-linear-gradient(180deg, transparent 0 21px, #d9d3a0 21px 22px)",
            }}
          >
            <h2 className="pt-1 text-[18px] font-bold">Best for &ldquo;{c.intent.label}&rdquo;</h2>
            <ol className="flex flex-col">
              {c.picks.map((p, i) => {
                const text = `${i + 1}. ${p.id === "email" ? "Write to me here" : p.id === "call" ? "Book 30 minutes" : `${p.label}, ${p.handle}`}`;
                const cls = `flex min-h-11 w-full items-center text-left underline-offset-4 hover:underline ${RING_IN}`;
                return (
                  <li key={p.id}>
                    {p.id === "email" || p.id === "call" ? (
                      <button type="button" onClick={() => onChannelOutside(p)} className={cls}>
                        {text}
                      </button>
                    ) : (
                      <a href={p.href} {...external(p.href)} className={`${cls} break-all`}>
                        {text}
                      </a>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="mt-2 text-[15px]">How the phone works:</p>
            <ol className="text-[14px]">
              <li>1. Open Contacts, spin the wheel.</li>
              <li>2. Tap the best way to reach me.</li>
              <li>3. Write, then slide to send.</li>
            </ol>
            <p className="mt-1 pb-1 text-[14px]">Escape or the round button takes you home.</p>
          </div>
        </aside>
      </div>
      <style>{`@keyframes skeu09-shimmer{from{background-position:150% 0}to{background-position:-50% 0}}@keyframes skeu09-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
