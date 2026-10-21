"use client";

/**
 * 1995 · GeoCities — contact as a homepage you sign and a webring you ride.
 *
 * Two rituals from the personal homepage. My channels are member sites of a
 * webring: Prev, Next and Random walk them one stop at a time, best first for
 * what you picked, and "Visit this site" goes there. The email stop drops you
 * at the guestbook; the call stop unrolls my calendar in place. The guestbook
 * is the letter: how you found the page says who you are, the radio buttons
 * say why, and "Sign it!" sends it to my inbox. Nothing is posted in public,
 * no entries are made up, and the hit counter is the site's real page-view
 * count or nothing at all.
 */

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Comic_Neue } from "next/font/google";
import { EMAIL, FACTS, INTENTS, WHO, type Channel, type ChannelId, type ContactWhoId, type IntentId } from "@/data/contact";
import { useCalmMotion } from "@/hooks/useCalmMotion";
import type { ContactSkinProps } from "../types";
import { CalEmbed, external, statusLine } from "../contact-ui";

// Comic Sans where the system has it, Comic Neue on phones that don't. Never the browser's script "cursive".
const comicNeue = Comic_Neue({ weight: ["400", "700"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-kc95" });

const NAVY = "#000033";
const CREAM = "#ffff99";
const YELLOW = "#ffff00";
const MAGENTA = "#ff00ff";
const CYAN = "#00ffff";
const PINK = "#ff66cc";
const LIME = "#66ff66";
const COMIC = "'Comic Sans MS', var(--font-kc95), Chalkboard, cursive";
const MONO = "'Courier New', Courier, monospace";
const RAINBOW = `linear-gradient(90deg, ${MAGENTA}, ${YELLOW}, ${CYAN}, ${LIME}, ${PINK}, ${MAGENTA})`;

const dot = (x: number, y: number, color: string, r = 1) => `radial-gradient(circle at ${x}px ${y}px, ${color} 0 ${r}px, transparent ${r + 0.7}px)`;
/** The tiled night sky every other homepage had as a background GIF. */
const STARFIELD = [
  dot(14, 22, "#fff"),
  dot(71, 9, YELLOW, 0.8),
  dot(118, 47, "#fff", 1.4),
  dot(39, 88, CYAN),
  dot(96, 112, "#fff"),
  dot(127, 131, PINK),
  dot(57, 133, "#fff", 0.8),
  dot(8, 70, "#fff", 0.7),
  dot(88, 64, "#fff", 0.6),
].join(", ");

const CSS = `
.kc95 button, .kc95 input, .kc95 select, .kc95 textarea { font-family: inherit; }
@keyframes kc95-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes kc95-rainbow { from { background-position: 0% 50% } to { background-position: 200% 50% } }
@keyframes kc95-blink { 50% { opacity: 0 } }
@keyframes kc95-pop { from { transform: scale(0.5); opacity: 0 } to { transform: none; opacity: 1 } }
`;

/** "How did you find my page?", phrased like the dropdowns of the day. */
const FOUND: Record<ContactWhoId, string> = {
  hiring: "I'm hiring! Found you on the Web",
  founder: "I'm building something new",
  designer: "Fellow designer, saw your work",
  student: "I'm a student, looking for tips",
  friend: "I know you, silly!",
  curious: "Webring surfing (just curious)",
};

const FACE: Record<IntentId, string> = { hire: "B-)", build: "8-D", "talk-design": ";-)", advice: ":-?", hello: ":-)" };

/** Each ring stop's 88x31 button: two lines of shouty text and a little picture. */
const BADGE: Record<ChannelId, { top: string; bottom: string; bg: string; fg: string; alt: string }> = {
  email: { top: "E-MAIL", bottom: "ME NOW!", bg: "#000080", fg: YELLOW, alt: "#ffffff" },
  call: { top: "BOOK A", bottom: "30 MIN CALL", bg: "#004000", fg: LIME, alt: "#ffffff" },
  linkedin: { top: "MY RESUME", bottom: "LINKEDIN", bg: "#003a57", fg: CYAN, alt: "#ffffff" },
  github: { top: "VIEW MY", bottom: "SOURCE", bg: "#1a1a1a", fg: "#ffffff", alt: LIME },
  studio: { top: "@KIRUKISM", bottom: "SKETCHES", bg: "#3a003a", fg: PINK, alt: YELLOW },
  life: { top: "TRIPS AND", bottom: "FOOD!", bg: "#4a2200", fg: "#ffaa55", alt: "#ffffff" },
  x: { top: "SHORT", bottom: "THOUGHTS", bg: "#000000", fg: "#ffffff", alt: CYAN },
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const psLine = (n: number) => `P.S. I rated your page ${n} out of 5 stars.`;
const PS_RE = /\s*P\.S\. I rated your page \d out of 5 stars\.\s*$/;

const field: CSSProperties = {
  background: "#ffffff",
  color: "#000000",
  border: "2px inset #bbbbbb",
  borderRadius: 0,
  fontFamily: MONO,
  fontSize: 16,
  outlineColor: CYAN,
};
const fieldCls = "min-h-11 w-full min-w-0 px-2 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const btnCls =
  "inline-flex min-h-11 items-center justify-center px-4 text-center font-bold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const yellowBtn: CSSProperties = { background: YELLOW, color: "#000", border: `3px outset ${YELLOW}`, outlineColor: CYAN };
const grayBtn: CSSProperties = { background: "#c0c0c0", color: "#000", border: "3px outset #e8e8e8", outlineColor: CYAN };
const ringBtn: CSSProperties = { background: "#000", color: YELLOW, border: `2px outset ${CYAN}`, outlineColor: CYAN };
const linkCls = "underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
const link: CSSProperties = { color: CYAN, outlineColor: CYAN };

/* ── art: CSS and SVG only ─────────────────────────────────────────── */

function Glyph({ id, color, size }: { id: ChannelId; color: string; size: number }) {
  const s = { fill: "none", stroke: color, strokeWidth: 1.5 } as const;
  const art: Record<ChannelId, ReactNode> = {
    email: (
      <>
        <rect x="1.5" y="3.5" width="13" height="9" {...s} />
        <path d="M1.5 3.5l6.5 5 6.5-5" {...s} />
      </>
    ),
    call: (
      <>
        <circle cx="8" cy="8" r="6" {...s} />
        <path d="M8 4.5V8h3" {...s} />
      </>
    ),
    linkedin: (
      <>
        <rect x="1.5" y="3" width="13" height="10" {...s} />
        <circle cx="5.5" cy="7" r="1.6" {...s} />
        <path d="M3.2 11.5c.6-1.6 1.4-2.2 2.3-2.2s1.7.6 2.3 2.2M9.5 6.5H13M9.5 9H13" {...s} />
      </>
    ),
    github: <path d="M5.5 4L1.8 8l3.7 4M10.5 4l3.7 4-3.7 4" {...s} />,
    studio: (
      <>
        <path d="M2.5 13.5l1-3.5 7.5-7.5 2.5 2.5-7.5 7.5z" {...s} />
        <path d="M9.5 4L12 6.5" {...s} />
      </>
    ),
    life: (
      <>
        <rect x="1.5" y="5" width="13" height="8.5" {...s} />
        <path d="M5 5l1-2h4l1 2" {...s} />
        <circle cx="8" cy="9.2" r="2.4" {...s} />
      </>
    ),
    x: <path d="M2 3h12v7H8l-3 3v-3H2z" {...s} />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden shapeRendering="crispEdges">
      {art[id]}
    </svg>
  );
}

/** An 88x31 web button, drawn at 1x or 2x. Decorative: the label beside it says what it is. */
function Badge({ ch, scale = 1 }: { ch: Channel; scale?: 1 | 2 }) {
  const b = BADGE[ch.id];
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 select-none"
      style={{ width: 88 * scale, height: 31 * scale, background: b.bg, border: `${scale}px solid`, borderColor: `${b.alt} #000 #000 ${b.alt}` }}
    >
      <span className="flex items-center justify-center" style={{ width: 28 * scale, background: b.fg }}>
        <Glyph id={ch.id} color={b.bg} size={16 * scale} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-center justify-center" style={{ font: `700 ${8 * scale}px/1.15 ${MONO}`, color: b.fg }}>
        <span>{b.top}</span>
        <span style={{ color: b.alt }}>{b.bottom}</span>
      </span>
    </span>
  );
}

function Twinkle({ motion, color = YELLOW }: { motion: boolean; color?: string }) {
  return (
    <span aria-hidden style={{ color, animation: motion ? "kc95-blink 1s steps(1) infinite" : "none" }}>
      ✦
    </span>
  );
}

function Rule({ motion }: { motion: boolean }) {
  return (
    <hr
      aria-hidden
      className="my-5 h-1 border-0 md:my-7"
      style={{
        background: RAINBOW,
        backgroundSize: "200% 100%",
        boxShadow: "0 0 8px rgba(255,0,255,0.5)",
        animation: motion ? "kc95-rainbow 6s linear infinite" : "none",
      }}
    />
  );
}

/** Two GIF frames, closed and open, swapped like a 2-frame animation. */
function Envelope({ motion }: { motion: boolean }) {
  const closed = (
    <>
      <rect x="4" y="12" width="40" height="24" fill={YELLOW} stroke={MAGENTA} strokeWidth="2" />
      <path d="M4 12l20 14 20-14" fill="none" stroke={MAGENTA} strokeWidth="2" />
    </>
  );
  return (
    <svg width="64" height="54" viewBox="0 0 48 40" aria-hidden shapeRendering="crispEdges">
      <g style={{ animation: motion ? "kc95-blink 1.2s steps(1) infinite" : "none" }}>{closed}</g>
      {motion && (
        <g style={{ animation: "kc95-blink 1.2s steps(1) -0.6s infinite" }}>
          <rect x="10" y="3" width="28" height="18" fill="#ffffff" stroke={CYAN} strokeWidth="1.5" />
          <path d="M14 8h20M14 12h14" stroke={NAVY} strokeWidth="1.5" />
          <rect x="4" y="14" width="40" height="22" fill={YELLOW} stroke={MAGENTA} strokeWidth="2" />
          <path d="M4 14l20 9 20-9" fill="none" stroke={MAGENTA} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

function SunMoon({ awake }: { awake: boolean }) {
  return awake ? (
    <span aria-hidden className="inline-block h-5 w-5 shrink-0 rounded-full" style={{ background: YELLOW, boxShadow: `0 0 0 3px rgba(255,255,0,0.25), 0 0 10px ${YELLOW}` }} />
  ) : (
    <span aria-hidden className="inline-block h-5 w-5 shrink-0 rounded-full" style={{ boxShadow: `inset 6px -3px 0 0 ${CREAM}` }} />
  );
}

/** Odometer digits from /api/visitors: the site's logged page views. Shown only when the count is real. */
function Counter({ total }: { total: number }) {
  const digits = String(total).padStart(6, "0");
  return (
    <p className="flex flex-col items-center gap-1 text-[13px]" style={{ color: PINK }}>
      <span aria-hidden className="inline-flex" style={{ background: "#000", border: "2px inset #888" }}>
        {digits.split("").map((d, k) => (
          <span key={k} className="px-1" style={{ font: `700 20px ${MONO}`, color: LIME, borderLeft: k ? "1px solid #333" : undefined }}>
            {d}
          </span>
        ))}
      </span>
      <span>
        <span className="sr-only">{total.toLocaleString("en-IN")} </span>
        page views logged on kiruk.in so far
      </span>
    </p>
  );
}

function Row({ label, htmlFor, top, children }: { label: string; htmlFor: string; top?: boolean; children: ReactNode }) {
  return (
    <div className={`grid gap-1 @lg:grid-cols-[10.5rem_minmax(0,1fr)] @lg:gap-3 ${top ? "@lg:items-start" : "@lg:items-center"}`}>
      <label htmlFor={htmlFor} className="font-bold" style={{ color: YELLOW }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Neon({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="text-center text-[24px] font-bold leading-tight md:text-[30px]"
      style={{ fontFamily: COMIC, color: YELLOW, textShadow: `0 0 8px ${MAGENTA}, 0 0 14px ${MAGENTA}` }}
    >
      <span aria-hidden>★ </span>
      {children}
      <span aria-hidden> ★</span>
    </h2>
  );
}

/* ── skin ───────────────────────────────────────────────────────────── */

export function Geocities1995({ contact: c }: ContactSkinProps) {
  const [at, setAt] = useState<{ intent: IntentId; i: number }>({ intent: c.intent.id, i: 0 });
  const [calOpen, setCalOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  // null = the visitor hasn't chosen; phones then open with it all stopped.
  const [paused, setPaused] = useState<boolean | null>(null);
  const calm = useCalmMotion();
  const [stars, setStars] = useState(0);
  const [rateOn, setRateOn] = useState(false);
  const [queued, setQueued] = useState(false);
  const [hits, setHits] = useState<number | null>(null);
  const bookRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const stopped = paused ?? calm;
  const motion = !c.reduce && !stopped;
  const sent = c.sendState === "sent";
  const first = c.name.trim().split(" ")[0] ?? "";

  // The ring is c.all, best first. A new intent reorders it, so the ride starts over at stop 1.
  const n = c.all.length;
  const i = at.intent === c.intent.id ? Math.min(at.i, n - 1) : 0;
  const stop = c.all[i];
  const rank = c.picks.findIndex((p) => p.id === stop.id) + 1;
  const calShown = calOpen && stop.id === "call";

  const goTo = (to: number) => {
    setAt({ intent: c.intent.id, i: (to + n) % n });
    setCalOpen(false);
  };
  const random = () => {
    const r = Math.floor(Math.random() * (n - 1));
    goTo(r >= i ? r + 1 : r);
  };
  const onRingKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(i + 1);
    }
  };
  const toGuestbook = () => {
    bookRef.current?.scrollIntoView({ behavior: c.reduce ? "auto" : "smooth", block: "start" });
    (nameRef.current ?? bookRef.current)?.focus({ preventScroll: true });
  };

  // A real counter or none: the site's logged page views, read-only.
  useEffect(() => {
    let live = true;
    fetch("/api/visitors")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { total?: number | null } | null) => {
        if (live && typeof d?.total === "number" && d.total > 0) setHits(d.total);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  // The rating rides along only if ticked: it's written into the note first, so what's sent is what's on screen.
  const sign = () => {
    if (!c.ready || c.sendState === "sending") return;
    const base = c.body.replace(PS_RE, "");
    const next = rateOn && stars ? `${base.trimEnd()}\n\n${psLine(stars)}` : base;
    if (next === c.body) {
      void c.send();
      return;
    }
    c.setBody(next);
    setQueued(true);
  };
  const send = c.send;
  useEffect(() => {
    if (!queued) return;
    setQueued(false);
    void send();
  }, [queued, send]);

  const lines = [
    "Welcome to my contact page!!",
    c.clock && `It's ${c.clock} in Bengaluru.`,
    "Ride the contact ring to find the best way to reach me.",
    "Sign my guestbook and it lands in my inbox.",
    "Thanks for stopping by :)",
  ].filter(Boolean);
  const marquee = lines.join("   ✦   ");

  const now = c.clock
    ? `It's ${c.clock} in Bengaluru right now, so I'm ${c.awake ? "probably around" : "probably asleep. I'll read your entry in the morning"}.`
    : statusLine(c);

  return (
    <div className={`kc95 ${comicNeue.variable} mx-auto max-w-[900px] px-4 pt-6 md:pt-10`} style={{ fontFamily: COMIC, color: CREAM }}>
      <style>{CSS}</style>
      <div
        className="flex flex-col p-3 md:p-6"
        style={{
          backgroundColor: NAVY,
          backgroundImage: STARFIELD,
          backgroundSize: "140px 140px",
          border: `3px ridge ${MAGENTA}`,
          boxShadow: "0 0 18px rgba(255,0,255,0.35)",
        }}
      >
        {/* ── the top of the homepage ── */}
        <header data-blueprint="header" className="flex flex-col items-center gap-4 text-center">
          <div className="flex w-full items-stretch" style={{ background: "#000", border: `2px ridge ${MAGENTA}` }}>
            <div className="relative min-w-0 flex-1 overflow-hidden py-2 text-[15px]" style={{ color: YELLOW }}>
              {motion ? (
                <>
                  <p className="sr-only">{lines.join(" ")}</p>
                  <div aria-hidden className="flex w-max whitespace-nowrap" style={{ animation: "kc95-marquee 30s linear infinite" }}>
                    <span className="pr-16">{marquee}</span>
                    <span className="pr-16">{marquee}</span>
                  </div>
                </>
              ) : (
                <p className="px-3">{marquee}</p>
              )}
            </div>
            {!c.reduce && (
              <button
                type="button"
                onClick={() => setPaused(!stopped)}
                aria-pressed={stopped}
                className="min-h-11 shrink-0 px-3 text-[13px] underline focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4"
                style={{ color: CYAN, borderLeft: `2px ridge ${MAGENTA}`, outlineColor: CYAN }}
              >
                {stopped ? "animate" : "stop"}
                <span className="sr-only"> the scrolling and blinking</span>
              </button>
            )}
          </div>

          <div
            className="flex w-full items-center justify-center gap-3 px-2 py-1.5"
            style={{ background: "repeating-linear-gradient(-45deg, #ffcc00 0 12px, #111 12px 24px)", border: "2px solid #ffcc00" }}
          >
            <span aria-hidden className="shrink-0" style={{ borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "18px solid #ff6600" }} />
            <span className="px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider md:text-[13px]" style={{ background: "#111", color: "#ffcc00", fontFamily: MONO }}>
              This page is always under construction
            </span>
            <span aria-hidden className="shrink-0" style={{ borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "18px solid #ff6600" }} />
          </div>

          <h1
            className="font-bold leading-[1.05]"
            style={{
              fontFamily: COMIC,
              fontSize: "clamp(32px, 8vw, 58px)",
              backgroundImage: RAINBOW,
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 0 10px rgba(255,0,255,0.45))",
              animation: motion ? "kc95-rainbow 6s linear infinite" : "none",
            }}
          >
            Welcome to my Contact Page!
          </h1>

          <p className="max-w-[62ch] text-[17px] leading-relaxed">
            Hi!! I&rsquo;m{" "}
            <b style={{ color: YELLOW }}>Arun</b>, a design engineer in {FACTS.place}. Ride my{" "}
            <a href="#kc95-ring" className={linkCls} style={link}>
              contact ring
            </a>{" "}
            to find the best way to reach me, or{" "}
            <a href="#kc95-guestbook" className={linkCls} style={link}>
              sign my guestbook
            </a>
            . Signing it sends your note straight to my inbox :)
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <p className="inline-flex max-w-[44ch] items-center gap-3 text-left text-[15px]" style={{ color: CYAN }}>
              <SunMoon awake={c.awake} />
              <span>{now}</span>
            </p>
            {hits !== null && <Counter total={hits} />}
          </div>
        </header>

        <Rule motion={motion} />

        {/* ── the webring: one channel per stop ── */}
        <section
          id="kc95-ring"
          data-blueprint="channels"
          aria-labelledby="kc95-ring-title"
          className="mx-auto flex w-full max-w-[600px] scroll-mt-24 flex-col items-center gap-3 p-3 text-center md:p-5"
          style={{ background: "rgba(0,0,0,0.6)", border: `4px double ${CYAN}` }}
        >
          <Neon id="kc95-ring-title">Arun&rsquo;s Contact Ring</Neon>
          <p className="text-[14px]" style={{ color: PINK }}>
            Every member site is a real way to reach me, ordered best first for &ldquo;{c.intent.label}&rdquo;.
          </p>

          <div key={stop.id} className="flex flex-col items-center gap-2 py-2" style={{ animation: c.reduce ? "none" : "kc95-pop 240ms steps(3) both" }}>
            <Badge ch={stop} scale={2} />
            <p className="text-[22px] font-bold leading-tight" style={{ color: YELLOW }}>
              {stop.label}
            </p>
            <p className="break-all text-[14px]" style={{ fontFamily: MONO, color: CYAN }}>
              {stop.handle}
            </p>
            <p className="max-w-[44ch] text-[16px]">{stop.use}</p>
            {rank > 0 && (
              <p className="flex flex-wrap items-center justify-center gap-x-2 text-[15px] font-bold" style={{ color: LIME }}>
                <Twinkle motion={motion} color={LIME} />
                Arun recommends this stop! #{rank} for &ldquo;{c.intent.label}&rdquo;
                <Twinkle motion={motion} color={LIME} />
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {stop.id === "email" ? (
              <>
                <button type="button" onClick={toGuestbook} className={btnCls} style={yellowBtn}>
                  Visit this site! (it&rsquo;s my guestbook)
                </button>
                <a href={c.mailto} className={`inline-flex min-h-11 items-center ${linkCls}`} style={link}>
                  or use your own mail program
                </a>
              </>
            ) : stop.id === "call" ? (
              <button type="button" aria-expanded={calShown} onClick={() => setCalOpen((v) => !v)} className={btnCls} style={yellowBtn}>
                {calShown ? "Close my calendar" : "Visit this site! (opens right here)"}
              </button>
            ) : (
              <a href={stop.href} {...external(stop.href)} className={btnCls} style={yellowBtn}>
                Visit this site!<span className="sr-only"> {stop.label} opens in a new window</span>
              </a>
            )}
          </div>
          {calShown && (
            <div className="w-full" style={{ border: `3px inset ${CYAN}` }}>
              <CalEmbed height={560} />
            </div>
          )}

          <nav aria-label="Contact ring" onKeyDown={onRingKey} className="grid w-full grid-cols-3 gap-2 pt-2">
            <button type="button" onClick={() => goTo(i - 1)} className={btnCls} style={ringBtn}>
              &laquo; Prev
            </button>
            <button type="button" onClick={random} className={btnCls} style={ringBtn}>
              Random
            </button>
            <button type="button" onClick={() => goTo(i + 1)} className={btnCls} style={ringBtn}>
              Next &raquo;
            </button>
          </nav>
          <p aria-live="polite" className="text-[14px]" style={{ color: CREAM }}>
            Stop {i + 1} of {n}: {stop.label}
          </p>
          <button
            type="button"
            aria-expanded={listOpen}
            onClick={() => setListOpen((v) => !v)}
            className={`min-h-11 px-2 text-[14px] ${linkCls}`}
            style={link}
          >
            {listOpen ? "Hide the list" : `List all ${n} sites in the ring`}
          </button>
          {listOpen && (
            <ol className="flex w-full flex-col gap-1 text-left" aria-label="Every stop on the ring">
              {c.all.map((ch, k) => (
                <li key={ch.id}>
                  <button
                    type="button"
                    aria-current={k === i ? "true" : undefined}
                    onClick={() => goTo(k)}
                    className="flex min-h-11 w-full items-center gap-3 px-2 py-1.5 text-left focus-visible:outline focus-visible:outline-2"
                    style={{ background: k === i ? "rgba(255,0,255,0.28)" : "transparent", outlineColor: CYAN, color: CREAM }}
                  >
                    <Badge ch={ch} />
                    <span className="min-w-0 flex-1 text-[14px] leading-snug">
                      <span className="font-bold" style={{ color: YELLOW }}>
                        {k + 1}. {ch.label}
                      </span>
                      {k < c.picks.length && <span style={{ color: LIME }}> ★ pick #{k + 1}</span>}
                      <br />
                      {ch.use}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>

        <Rule motion={motion} />

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_250px] md:items-start">
          {/* ── the guestbook is the letter ── */}
          <section
            id="kc95-guestbook"
            ref={bookRef}
            tabIndex={-1}
            data-blueprint="compose"
            aria-labelledby="kc95-book-title"
            className="@container flex min-w-0 scroll-mt-24 flex-col gap-3 outline-none"
          >
            <Neon id="kc95-book-title">Sign my guestbook!</Neon>

            {sent ? (
              <div role="status" className="flex flex-col items-center gap-3 p-4 text-center" style={{ border: `3px ridge ${LIME}`, background: "rgba(0,40,0,0.7)" }}>
                <p className="text-[24px] font-bold leading-tight" style={{ color: YELLOW, textShadow: `0 0 8px ${MAGENTA}` }}>
                  <Twinkle motion={motion} /> Thanks for signing my guestbook{first ? `, ${first}` : ""}! <Twinkle motion={motion} />
                </p>
                <p className="max-w-[48ch] text-[16px]">
                  It went to my inbox, not onto a public page. I&rsquo;ll write back to{" "}
                  <span className="break-all" style={{ fontFamily: MONO, color: CYAN }}>
                    {c.from}
                  </span>{" "}
                  {c.awake ? "soon" : "after I wake up"}.
                </p>
                <figure className="w-full p-3 text-left" style={{ borderLeft: `3px solid ${LIME}`, background: "rgba(0,0,0,0.45)" }}>
                  <figcaption className="text-[14px]">
                    <b style={{ color: YELLOW }}>{c.name.trim()}</b> signed: <span style={{ color: CYAN }}>{c.subject}</span>
                  </figcaption>
                  <blockquote className="mt-2 whitespace-pre-wrap break-words text-[15px]">{c.body.trim()}</blockquote>
                </figure>
                <p className="text-[15px]">
                  While you wait,{" "}
                  <a href="#kc95-ring" className={linkCls} style={link}>
                    ride the contact ring
                  </a>
                  .
                </p>
              </div>
            ) : (
              <>
                <p className="text-center text-[15px]" style={{ color: CYAN }}>
                  My guestbook is private. Signing it sends your note to me, and nothing shows up on this page for anyone else.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sign();
                  }}
                  className="flex flex-col gap-4 p-3 text-[16px] md:p-4"
                  style={{ background: "rgba(40,0,70,0.8)", border: `2px solid ${MAGENTA}` }}
                >
                  <Row label="Your name:" htmlFor="kc95-name">
                    <input
                      id="kc95-name"
                      ref={nameRef}
                      autoComplete="name"
                      value={c.name}
                      onChange={(e) => c.setName(e.target.value)}
                      className={fieldCls}
                      style={field}
                    />
                  </Row>
                  <Row label="Your e-mail:" htmlFor="kc95-from">
                    <input
                      id="kc95-from"
                      type="email"
                      autoComplete="email"
                      value={c.from}
                      onChange={(e) => c.setFrom(e.target.value)}
                      className={fieldCls}
                      style={field}
                    />
                  </Row>
                  <Row label="How did you find my page?" htmlFor="kc95-who">
                    <select id="kc95-who" value={c.who} onChange={(e) => c.setWho(e.target.value as ContactWhoId)} className={fieldCls} style={field}>
                      {WHO.map((w) => (
                        <option key={w.id} value={w.id}>
                          {FOUND[w.id]}
                        </option>
                      ))}
                    </select>
                  </Row>

                  <fieldset className="flex flex-col">
                    <legend className="mb-1 font-bold" style={{ color: YELLOW }}>
                      Why are you here?
                    </legend>
                    {INTENTS.map((it) => (
                      <label
                        key={it.id}
                        className="flex min-h-11 cursor-pointer items-center gap-3 px-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-2"
                        style={{ outlineColor: CYAN }}
                      >
                        <input
                          type="radio"
                          name="kc95-why"
                          value={it.id}
                          checked={c.intent.id === it.id}
                          onChange={() => c.setIntent(it.id)}
                          className="h-5 w-5 shrink-0"
                          style={{ accentColor: MAGENTA }}
                        />
                        <span aria-hidden className="w-10 shrink-0" style={{ fontFamily: MONO, color: LIME }}>
                          {FACE[it.id]}
                        </span>
                        <span>{cap(it.label)}</span>
                      </label>
                    ))}
                  </fieldset>
                  <p className="-mt-1 px-3 py-2 text-[15px]" style={{ border: `1px dashed ${CYAN}`, color: CYAN }}>
                    <b style={{ color: PINK }}>Webmaster&rsquo;s tip:</b> {c.intent.why}
                  </p>

                  <Row label="Subject:" htmlFor="kc95-subject">
                    <input id="kc95-subject" value={c.subject} onChange={(e) => c.setSubject(e.target.value)} className={fieldCls} style={field} />
                  </Row>
                  <Row label="Your message:" htmlFor="kc95-body" top>
                    <textarea
                      id="kc95-body"
                      rows={9}
                      value={c.body}
                      onChange={(e) => c.setBody(e.target.value)}
                      className={`${fieldCls} resize-y py-1.5 leading-relaxed`}
                      style={field}
                    />
                  </Row>

                  <fieldset className="flex flex-col gap-1">
                    <legend className="mb-1 font-bold" style={{ color: YELLOW }}>
                      Rate my page!
                    </legend>
                    <div className="flex flex-wrap">
                      {[1, 2, 3, 4, 5].map((k) => (
                        <label
                          key={k}
                          className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-[28px] leading-none has-[:focus-visible]:outline has-[:focus-visible]:outline-2"
                          style={{ color: k <= stars ? YELLOW : "#55557a", textShadow: k <= stars ? `0 0 8px ${YELLOW}` : "none", outlineColor: CYAN }}
                        >
                          <input type="radio" name="kc95-stars" value={k} checked={stars === k} onChange={() => setStars(k)} className="sr-only" />
                          <span aria-hidden>★</span>
                          <span className="sr-only">
                            {k} star{k > 1 ? "s" : ""}
                          </span>
                        </label>
                      ))}
                    </div>
                    <label className="flex min-h-11 items-center gap-3" style={{ opacity: stars ? 1 : 0.6 }}>
                      <input
                        type="checkbox"
                        checked={rateOn && stars > 0}
                        disabled={!stars}
                        onChange={(e) => setRateOn(e.target.checked)}
                        className="h-5 w-5 shrink-0"
                        style={{ accentColor: MAGENTA }}
                      />
                      Add my rating to the note as a P.S.
                    </label>
                    <p className="text-[14px]" style={{ color: CYAN }}>
                      {stars && rateOn ? (
                        <>Your note will end with &ldquo;{psLine(stars)}&rdquo;</>
                      ) : (
                        "Just for fun. I don't count ratings anywhere, and yours only travels with your note if you tick the box."
                      )}
                    </p>
                  </fieldset>

                  {c.sendState === "error" ? (
                    <p role="alert" className="text-[15px]" style={{ color: PINK }}>
                      Uh oh, the guestbook didn&rsquo;t take it: {c.sendError}{" "}
                      <a href={c.mailto} className={linkCls} style={link}>
                        E-mail it to me instead
                      </a>
                      , your note comes along.
                    </p>
                  ) : (
                    !c.ready && (
                      <p className="text-[14px]" style={{ color: CYAN }}>
                        The Sign it! button wakes up once your name, e-mail and a line of your own are in.
                      </p>
                    )
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button type="submit" disabled={!c.ready || c.sendState === "sending"} className={`${btnCls} text-[18px]`} style={yellowBtn}>
                      {c.sendState === "sending" ? "Signing..." : "Sign it!"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        c.resetDraft();
                        setStars(0);
                        setRateOn(false);
                      }}
                      className={btnCls}
                      style={grayBtn}
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>

          <aside aria-label="About the webmaster" className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col items-center gap-2 p-3 text-center" style={{ border: `2px dashed ${YELLOW}`, background: "rgba(0,0,0,0.5)" }}>
              <a href={c.mailto} className={`flex flex-col items-center gap-1 ${linkCls}`} style={{ ...link, color: YELLOW }}>
                <Envelope motion={motion} />
                <span className="text-[22px] font-bold">E-mail me!</span>
              </a>
              <p className="text-[13px]">Opens your mail program with your note already in it.</p>
              <p className="break-all text-[13px]" style={{ fontFamily: MONO, color: CYAN }}>
                {EMAIL}
              </p>
              <button type="button" onClick={c.copyEmail} className={`${btnCls} text-[14px]`} style={grayBtn}>
                {c.copied ? "Copied!" : "Copy my address"}
              </button>
            </div>

            <div className="flex flex-col gap-3 p-3 text-[14px] leading-snug" style={{ border: `2px solid ${CYAN}`, background: "rgba(0,0,0,0.55)" }}>
              <h2 className="text-center text-[18px] font-bold" style={{ fontFamily: COMIC, color: PINK }}>
                ~ About the webmaster ~
              </h2>
              <dl className="flex flex-col gap-2">
                {(
                  [
                    ["Name", `${FACTS.name} (${FACTS.handle})`],
                    [
                      "Now",
                      <a key="now" href={FACTS.nowHref} {...external(FACTS.nowHref)} className={linkCls} style={link}>
                        {FACTS.now}
                      </a>,
                    ],
                    ["Before", FACTS.before],
                    ["Home base", `${FACTS.place} (${FACTS.timezone})`],
                    ["How I work", FACTS.mode],
                  ] as [string, ReactNode][]
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-bold" style={{ color: CYAN }}>
                      {k}:
                    </dt>
                    <dd>{v}</dd>
                  </div>
                ))}
                <div>
                  <dt className="font-bold" style={{ color: CYAN }}>
                    Open to:
                  </dt>
                  <dd>
                    <ul className="flex flex-col gap-0.5">
                      {FACTS.openTo.map((o) => (
                        <li key={o}>
                          <span aria-hidden style={{ color: YELLOW }}>
                            ★{" "}
                          </span>
                          {o}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
              <p className="flex items-start gap-2 pt-1" style={{ color: YELLOW }}>
                <SunMoon awake={c.awake} />
                <span>{now}</span>
              </p>
            </div>
          </aside>
        </div>

        <Rule motion={motion} />

        <footer className="flex flex-col items-center gap-1 pb-1 text-center text-[14px]">
          <p style={{ color: PINK }}>Thanks for stopping by! Come back soon :)</p>
          <p className="text-[12px]" style={{ color: CYAN }}>
            Best viewed with any browser, at any screen size.
          </p>
        </footer>
      </div>
    </div>
  );
}
