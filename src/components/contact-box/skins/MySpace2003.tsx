"use client";

/**
 * 2003 · KirukSpace — contact as social actions on a profile page.
 *
 * On a 2003 social profile you didn't fill in a contact form, you acted on a
 * person: Send Message, Add to Friends, Instant Message, Rank User. So this
 * page is my profile, and the famous "Contacting" box is the way in. Every
 * action does something real: Add to Friends asks how you know me and what
 * it's about, then answers with the best way to reach me. Send Message and
 * Add Comment open the same letter. Instant Message, Favorites and Group go
 * to Instagram, LinkedIn and GitHub. The Top 8 are my channels, re-sorted
 * for what you're here for. Rank and Block are jokes, and say so.
 *
 * Sky-blue page, navy and soft-orange section heads, Verdana at small sizes,
 * glossy gel buttons. No fake friends, views or comments: the counts are real.
 */

import { useCallback, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { CHANNELS, EMAIL, FACTS, INTENTS, WHO, getChannel, type Channel, type ChannelId } from "@/data/contact";
import type { ContactSkinProps } from "../types";
import type { Contact } from "../use-contact";
import { CalEmbed, IntentSelect, external, statusLine } from "../contact-ui";

const NAVY = "#003366";
const NAVY2 = "#002244";
const BLUE_HEAD = "#336699";
const BLUE_EDGE = "#6699cc";
const BLUE_CELL = "#d5e8fb";
const BLUE_LABEL = "#b1d0f0";
const ORANGE_HEAD = "#ffcc99";
const ORANGE_INK = "#993300";
const ORANGE = "#ff6600";
const PAPER = "#ffffff";
const INK = "#1a1a1a";
const INK_DIM = "#555566";
const LINK = "#0066cc";
const GREEN = "#2e9e2e";
const FONT = "Verdana, Geneva, Arial, sans-serif";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
const focusStyle: CSSProperties = { outlineColor: NAVY };
const scrollGap: CSSProperties = { scrollMarginTop: "calc(var(--simple-game-nav-bottom, 4.5rem) + 12px)" };
const FIRST = FACTS.name.split(" ")[0];

/* ── glyphs: 24px, white on a candy tile ───────────────────────────── */

const CH_ART: Record<ChannelId, ReactNode> = {
  email: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="M3.5 7l8.5 6.5L20.5 7" />
    </>
  ),
  call: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M4 10h16M8 3v4M16 3v4" />
      <circle cx="9.5" cy="14.5" r="1.4" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="8" width="18" height="12" rx="1.5" />
      <path d="M9 8V5.5h6V8M3 13h18" />
    </>
  ),
  github: <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />,
  studio: (
    <>
      <path d="M4 20l1.5-5.5L16 4l4 4L9.5 18.5z" />
      <path d="M14 6l4 4" />
    </>
  ),
  life: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7l2-3h4l2 3" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  x: <path d="M4 5h16v11H10l-4 4v-4H4z" />,
};

const TILE: Record<ChannelId, string> = {
  email: "#ff6600",
  call: "#339933",
  linkedin: "#336699",
  github: "#444444",
  studio: "#cc0066",
  life: "#9933cc",
  x: "#0088cc",
};

function Glyph({ art, size = 24, stroke = "currentColor" }: { art: ReactNode; size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {art}
    </svg>
  );
}

/** A glossy candy tile: color, a gloss on the top half, a white glyph. */
function Tile({ id, size }: { id: ChannelId; size: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        color: PAPER,
        background: `linear-gradient(180deg, ${TILE[id]} 0%, color-mix(in srgb, ${TILE[id]} 70%, #000) 100%)`,
        border: `1px solid color-mix(in srgb, ${TILE[id]} 60%, #000)`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
      }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1/2" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08))" }} />
      <Glyph art={CH_ART[id]} size={Math.round(size * 0.5)} />
    </span>
  );
}

/* ── chrome ─────────────────────────────────────────────────────────── */

function Panel({
  tone,
  title,
  right,
  children,
  blueprint,
  pad = true,
}: {
  tone: "blue" | "orange";
  title: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  blueprint?: string;
  pad?: boolean;
}) {
  const blue = tone === "blue";
  return (
    <section data-blueprint={blueprint} style={{ background: PAPER, border: `1px solid ${BLUE_EDGE}` }}>
      <div
        className="flex flex-wrap items-baseline justify-between gap-x-3 px-2 py-1"
        style={{ background: blue ? BLUE_HEAD : ORANGE_HEAD, color: blue ? PAPER : ORANGE_INK }}
      >
        <h2 className="text-[12px] font-bold">{title}</h2>
        {right && <span className="text-[11px]">{right}</span>}
      </div>
      <div className={pad ? "p-2.5" : undefined}>{children}</div>
    </section>
  );
}

interface GelProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}

/** The 2003 gel button: a gradient lozenge with a highlight line on top. */
function Gel({ children, onClick, href, primary, disabled, type = "button" }: GelProps) {
  const style: CSSProperties = {
    ...focusStyle,
    borderRadius: 4,
    color: primary ? PAPER : INK,
    background: primary ? "linear-gradient(180deg, #f97a2c 0%, #c24400 100%)" : "linear-gradient(180deg, #ffffff 0%, #d8e6f5 100%)",
    border: `1px solid ${primary ? "#8f3200" : NAVY}`,
    boxShadow: primary ? "inset 0 1px 0 #ffd2a8, 0 1px 2px rgba(0,0,0,0.3)" : "inset 0 1px 0 #fff, 0 1px 2px rgba(0,0,0,0.18)",
    textShadow: primary ? "0 1px 0 rgba(0,0,0,0.35)" : "none",
  };
  const cls = `ks-gel inline-flex min-h-11 items-center justify-center px-4 text-[12px] font-bold disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`;
  if (href) {
    return (
      <a href={href} {...external(href)} className={cls} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} style={style}>
      {children}
    </button>
  );
}

/** Heading that takes focus (and scrolls into view) when its panel opens. */
function useOpenFocus() {
  const acted = useRef(false);
  const ref = useCallback((el: HTMLHeadingElement | null) => {
    if (el && acted.current) el.focus();
  }, []);
  return { ref, arm: () => (acted.current = true) };
}

/* ── the letter: one composer for Send Message and Add Comment ─────── */

const field = "ks-field min-h-11 w-full px-2 text-[16px] md:text-[12px]";

function Composer({ c, mode, onClose, headRef }: { c: Contact; mode: "message" | "comment"; onClose: () => void; headRef: (el: HTMLHeadingElement | null) => void }) {
  const id = useId();
  const sending = c.sendState === "sending";
  const first = c.name.trim().split(" ")[0] ?? "";
  const title = mode === "message" ? `Send a Message to ${FIRST}` : "Add Comment";

  const heading = (
    <h3 ref={headRef} tabIndex={-1} className="text-[13px] font-bold outline-none" style={{ color: NAVY, ...scrollGap }}>
      {title}
    </h3>
  );

  if (c.sendState === "sent") {
    return (
      <div className="flex flex-col gap-2">
        {heading}
        <div role="status" className="p-2.5 text-[12px] leading-relaxed" style={{ background: "#e8f7e8", border: `1px solid ${GREEN}`, color: INK }}>
          <p className="font-bold" style={{ color: "#1f6b1f" }}>
            {mode === "message" ? "Message sent!" : "Comment sent!"}
          </p>
          <p>
            Thanks{first ? `, ${first}` : ""}. It&rsquo;s in my inbox{mode === "comment" ? ", not on this wall, so the count here stays at 0" : ""}. I&rsquo;ll reply to{" "}
            <strong>{c.from}</strong> {c.awake ? "soon" : "once I'm up"}.
          </p>
        </div>
        <div>
          <Gel onClick={onClose}>Close</Gel>
        </div>
      </div>
    );
  }

  const need = [
    !c.name.trim() && "your name",
    !EMAIL_RE.test(c.from.trim()) && "your email",
    (c.body.trim().length <= 10 || c.body.trim() === c.intent.body.trim()) && "a line of your own",
  ].filter(Boolean) as string[];
  const label = "text-[11px] font-bold sm:pt-0 sm:text-right";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void c.send();
      }}
      className="flex flex-col gap-2"
    >
      {heading}
      {mode === "comment" && (
        <p className="text-[11px] leading-relaxed" style={{ color: INK_DIM }}>
          Comments here don&rsquo;t go on a public wall. They land in my inbox, and I answer by email.
        </p>
      )}
      <div className="grid gap-x-2 gap-y-1.5 text-[12px] sm:grid-cols-[84px_1fr] sm:items-center">
        <span className={label} style={{ color: INK_DIM }}>
          To:
        </span>
        <span className="font-bold">{FACTS.name}</span>
        <label htmlFor={`${id}-name`} className={label} style={{ color: INK_DIM }}>
          From:
        </label>
        <input id={`${id}-name`} aria-label="From: your name" autoComplete="name" placeholder="Your name" value={c.name} onChange={(e) => c.setName(e.target.value)} className={field} />
        <label htmlFor={`${id}-email`} className={label} style={{ color: INK_DIM }}>
          Email:
        </label>
        <input
          id={`${id}-email`}
          aria-label="Email: where I should reply"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={c.from}
          onChange={(e) => c.setFrom(e.target.value)}
          className={field}
        />
        <span className={label} style={{ color: INK_DIM }}>
          About:
        </span>
        <IntentSelect
          contact={c}
          className={`${field} cursor-pointer pr-7`}
          style={{
            background: `${PAPER} no-repeat right 8px center / 10px 6px url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M0 0h10L5 6z' fill='%23003366'/%3E%3C/svg%3E")`,
            border: "1px solid #7f9db9",
            padding: "0 28px 0 8px",
          }}
        />
        <label htmlFor={`${id}-subject`} className={label} style={{ color: INK_DIM }}>
          Subject:
        </label>
        <input id={`${id}-subject`} aria-label="Subject" value={c.subject} onChange={(e) => c.setSubject(e.target.value)} className={field} />
        <label htmlFor={`${id}-body`} className={`${label} sm:self-start sm:pt-2`} style={{ color: INK_DIM }}>
          Body:
        </label>
        <textarea
          id={`${id}-body`}
          aria-label="Body"
          rows={8}
          value={c.body}
          onChange={(e) => c.setBody(e.target.value)}
          className="ks-field w-full resize-y p-2 text-[16px] leading-relaxed md:text-[12px]"
        />
      </div>

      {c.sendState === "error" ? (
        <p role="alert" className="p-2 text-[12px]" style={{ background: "#fff0f0", border: "1px solid #cc0000" }}>
          <strong style={{ color: "#cc0000" }}>Couldn&rsquo;t send:</strong> {c.sendError}{" "}
          <a href={c.mailto} className={`ks-link ${FOCUS}`} style={focusStyle}>
            Send it from your mail app instead.
          </a>
        </p>
      ) : (
        <p className="text-[11px]" style={{ color: need.length ? INK_DIM : GREEN }}>
          {sending ? "Sending..." : need.length ? `Send works once ${need.join(", ")} ${need.length > 1 ? "are" : "is"} in.` : "Ready to send."}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Gel type="submit" primary disabled={!c.ready || sending}>
          {sending ? "Sending..." : mode === "message" ? "Send" : "Post Comment"}
        </Gel>
        <Gel href={c.mailto}>Open in your mail app</Gel>
        <Gel onClick={c.resetDraft}>Reset draft</Gel>
        <Gel onClick={onClose}>Cancel</Gel>
      </div>
    </form>
  );
}

/* ── Add to Friends: the who / what-for picker ──────────────────────── */

function FriendRequest({ c, onMessage, onClose, headRef }: { c: Contact; onMessage: () => void; onClose: () => void; headRef: (el: HTMLHeadingElement | null) => void }) {
  const id = useId();
  const [done, setDone] = useState(false);
  const [cal, setCal] = useState(false);
  const usual = WHO.find((w) => w.id === c.who)?.intent;
  const radio = `flex min-h-11 cursor-pointer items-center gap-2 px-1.5 text-[12px] has-[:focus-visible]:outline has-[:focus-visible]:outline-2`;

  return (
    <div className="flex flex-col gap-3">
      <h3 ref={headRef} tabIndex={-1} className="text-[13px] font-bold outline-none" style={{ color: NAVY, ...scrollGap }}>
        {done ? "Friend request approved" : `Add ${FIRST} to your Friends`}
      </h3>

      {!done ? (
        <>
          <fieldset className="flex flex-col">
            <legend className="mb-1 text-[12px] font-bold">How do you know {FIRST}?</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {WHO.map((w) => (
                <label key={w.id} className={radio} style={focusStyle}>
                  <input type="radio" name={`${id}-who`} checked={c.who === w.id} onChange={() => c.setWho(w.id)} className="h-4 w-4 accent-[#ff6600]" />
                  I&rsquo;m {w.label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col">
            <legend className="mb-1 text-[12px] font-bold">What&rsquo;s this about?</legend>
            {INTENTS.map((i) => (
              <label key={i.id} className={radio} style={focusStyle}>
                <input type="radio" name={`${id}-intent`} checked={c.intent.id === i.id} onChange={() => c.setIntent(i.id)} className="h-4 w-4 accent-[#ff6600]" />
                I&rsquo;d like to {i.label}
                {i.id === usual && <span style={{ color: INK_DIM }}>(the usual)</span>}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <Gel primary onClick={() => setDone(true)}>
              Add as Friend
            </Gel>
            <Gel onClick={onClose}>Cancel</Gel>
          </div>
        </>
      ) : (
        <>
          <p className="text-[12px] leading-relaxed">
            You&rsquo;re in. This is only a web page though, so here&rsquo;s the best way to actually reach me, in order. {c.intent.why}
          </p>
          <ol className="flex flex-col gap-1.5">
            {c.picks.map((ch, i) => (
              <li key={ch.id} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-4 shrink-0 text-right font-bold" style={{ color: ORANGE_INK }}>
                    {i + 1}.
                  </span>
                  <Tile id={ch.id} size={28} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    {ch.id === "email" ? (
                      <button type="button" onClick={onMessage} className={`ks-link min-h-6 self-start text-left ${FOCUS}`} style={focusStyle}>
                        Send me a message
                      </button>
                    ) : ch.id === "call" ? (
                      <button type="button" aria-expanded={cal} onClick={() => setCal((v) => !v)} className={`ks-link min-h-6 self-start text-left ${FOCUS}`} style={focusStyle}>
                        {cal ? "Hide the calendar" : "Book a 30-min call"}
                      </button>
                    ) : (
                      <a href={ch.href} {...external(ch.href)} className={`ks-link self-start ${FOCUS}`} style={focusStyle}>
                        {ch.label} · {ch.handle}
                      </a>
                    )}
                    <span className="text-[11px]" style={{ color: INK_DIM }}>
                      {ch.use}
                    </span>
                  </span>
                </div>
                {ch.id === "call" && cal && (
                  <div style={{ border: `1px solid ${BLUE_EDGE}` }}>
                    <CalEmbed height={560} />
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2">
            <Gel onClick={() => setDone(false)}>Change answers</Gel>
            <Gel onClick={onClose}>Close</Gel>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Rank User: five stars that go nowhere ─────────────────────────── */

const RANK_SAYS = ["", "One star. Fair. Tell me what to fix in a message?", "Two stars. Noted, and slightly stung.", "Three stars. Solidly okay, I'll take it.", "Four stars. Thank you.", "Five stars. Top 8 material."];

function Rank({ onClose, headRef }: { onClose: () => void; headRef: (el: HTMLHeadingElement | null) => void }) {
  const id = useId();
  const [n, setN] = useState(0);
  const [hover, setHover] = useState(0);
  const lit = hover || n;
  return (
    <div className="flex flex-col gap-2">
      <h3 ref={headRef} tabIndex={-1} className="text-[13px] font-bold outline-none" style={{ color: NAVY, ...scrollGap }}>
        Rank {FIRST}
      </h3>
      <fieldset>
        <legend className="sr-only">Rate {FIRST} from 1 to 5 stars</legend>
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((k) => (
            <label
              key={k}
              onMouseEnter={() => setHover(k)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center has-[:focus-visible]:outline has-[:focus-visible]:outline-2"
              style={focusStyle}
            >
              <input type="radio" name={`${id}-rank`} checked={n === k} onChange={() => setN(k)} className="sr-only" aria-label={`${k} star${k > 1 ? "s" : ""}`} />
              <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
                  fill={k <= lit ? "#ffcc00" : "#e6edf5"}
                  stroke={k <= lit ? "#cc8800" : "#99aabb"}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </label>
          ))}
        </div>
      </fieldset>
      <p role="status" className="min-h-[1.5em] text-[12px]">
        {RANK_SAYS[n]}
      </p>
      <p className="text-[11px]" style={{ color: INK_DIM }}>
        This rating isn&rsquo;t saved or counted anywhere. It stays between you and this tab.
      </p>
      <div>
        <Gel onClick={onClose}>Close</Gel>
      </div>
    </div>
  );
}

/* ── "Contacting Arun": the 2×4 action grid ─────────────────────────── */

type ActionId = "message" | "forward" | "friend" | "favorites" | "im" | "block" | "group" | "rank";
type PanelId = "message" | "friend" | "rank";

const ACTION_ART: Record<ActionId, ReactNode> = {
  message: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="M3.5 7l8.5 6.5L20.5 7" />
    </>
  ),
  forward: <path d="M4 18c1-6 5-9 11-9V5l6 6-6 6v-4c-5 0-8 1.5-11 5z" />,
  friend: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.5-4 3.2-6 6.5-6s6 2 6.5 6M19 8v6M16 11h6" />
    </>
  ),
  favorites: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.8l-5.4 2.8 1.1-6-4.5-4.2 6.1-.8z" />,
  im: <path d="M4 5h16v11H10l-4 4v-4H4z" />,
  block: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6 6l12 12" />
    </>
  ),
  group: (
    <>
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M2 20c.4-3.5 2.7-5 6-5s5.6 1.5 6 5M14.5 15.2c.5-.1 1-.2 1.5-.2 3.3 0 5.6 1.5 6 5" />
    </>
  ),
  rank: <path d="M4 20V14M10 20V9M16 20V12M22 20V5" />,
};

/* ── skin ───────────────────────────────────────────────────────────── */

const CSS = `
.ks-link{color:${LINK};text-decoration:underline;text-underline-offset:2px}
.ks-field{border:1px solid #7f9db9;background:${PAPER};color:${INK};border-radius:0}
.ks-field:focus{outline:2px solid ${ORANGE};outline-offset:0}
@media (hover:hover){
  .ks-link:hover{color:#cc0066}
  .ks-cell:hover{background:#eef4fc}
  .ks-gel:hover:not(:disabled){filter:brightness(1.07)}
  .ks-tile:hover .ks-name{color:#cc0066}
}
@keyframes ks-blink{50%{opacity:.35}}
`;

export function MySpace2003({ contact: c }: ContactSkinProps) {
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [cal, setCal] = useState(false);
  const [note, setNote] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const { ref: headRef, arm } = useOpenFocus();

  // Instagram for IM: whichever account fits the reason, else the work one.
  const im: Channel = c.picks.find((p) => p.id === "studio" || p.id === "life") ?? getChannel("studio");
  const rankOf = (id: ChannelId) => {
    const i = c.picks.findIndex((p) => p.id === id);
    return i < 0 ? null : i + 1;
  };

  const open = (p: PanelId) => {
    arm();
    setPanel((cur) => (cur === p ? null : p));
    if (p === "message") setCommenting(false);
    setNote("");
  };
  const comment = () => {
    arm();
    setCommenting(true);
    setPanel((cur) => (cur === "message" ? null : cur));
  };
  const openCal = () => {
    arm();
    setCal((v) => !v);
  };

  const forward = () => {
    const url = window.location.href;
    setFallbackUrl("");
    if (!navigator.clipboard) {
      setFallbackUrl(url);
      setNote("Couldn't copy automatically. Here's the link to share:");
      return;
    }
    navigator.clipboard.writeText(url).then(
      () => setNote("Link copied. Paste it to a friend."),
      () => {
        setFallbackUrl(url);
        setNote("Couldn't copy automatically. Here's the link to share:");
      },
    );
  };

  const linkedin = getChannel("linkedin");
  const github = getChannel("github");
  const actions: { id: ActionId; label: string; to?: string; run?: () => void; href?: string; opened?: string }[] = [
    { id: "message", label: "Send Message", to: "the letter", run: () => open("message") },
    { id: "forward", label: "Forward to Friend", to: "copies this link", run: forward },
    { id: "friend", label: "Add to Friends", to: "find the best way in", run: () => open("friend") },
    { id: "favorites", label: "Add to Favorites", to: "LinkedIn", href: linkedin.href, opened: `LinkedIn opened in a new tab: ${linkedin.handle}.` },
    { id: "im", label: "Instant Message", to: `Instagram ${im.handle}`, href: im.href, opened: `Instagram opened in a new tab. DM me at ${im.handle}.` },
    {
      id: "block",
      label: "Block User",
      to: "please don't",
      run: () => {
        setPanel(null);
        setFallbackUrl("");
        setNote("You can't block me, but you can close the tab. No hard feelings.");
      },
    },
    { id: "group", label: "Add to Group", to: "GitHub", href: github.href, opened: `GitHub opened in a new tab: ${github.handle}.` },
    { id: "rank", label: "Rank User", to: "just for fun", run: () => open("rank") },
  ];

  const facts: [string, ReactNode][] = [
    [
      "General",
      <a key="now" href={FACTS.nowHref} {...external(FACTS.nowHref)} className={`ks-link ${FOCUS}`} style={focusStyle}>
        {FACTS.now}
      </a>,
    ],
    ["Before", FACTS.before],
    [
      "Open to",
      <ul key="open" className="flex flex-col">
        {FACTS.openTo.map((o) => (
          <li key={o}>· {o}</li>
        ))}
      </ul>,
    ],
    ["Work mode", FACTS.mode],
    [
      "Timezone",
      <span key="tz">
        {FACTS.timezone}. {statusLine(c)}
      </span>,
    ],
    [
      "Email",
      <span key="email" className="flex flex-wrap items-center gap-x-2">
        <span className="break-all">{EMAIL}</span>
        <button type="button" onClick={c.copyEmail} className={`ks-link min-h-6 ${FOCUS}`} style={focusStyle}>
          {c.copied ? "copied!" : "copy"}
        </button>
      </span>,
    ],
  ];

  return (
    <div className="mx-auto max-w-[880px] px-4 pt-6 md:pt-10" style={{ fontFamily: FONT, color: INK }}>
      <div className="flex flex-col gap-3 p-2.5 md:p-3" style={{ background: PAPER, border: `1px solid ${NAVY}`, boxShadow: "0 2px 6px rgba(0,51,102,0.25)" }}>
        {/* ── profile banner ── */}
        <header
          data-blueprint="header"
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2"
          style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY2} 100%)`, color: PAPER }}
        >
          <p className="flex items-center gap-2">
            <span className="text-[17px] font-bold" style={{ fontFamily: "'Arial Black', Verdana, sans-serif", letterSpacing: "-0.02em" }}>
              Kiruk<span style={{ color: "#ffb380" }}>Space</span>
            </span>
            <span
              className="px-1.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ borderRadius: 3, background: "linear-gradient(180deg, #f97a2c, #c24400)", boxShadow: "inset 0 1px 0 #ffd2a8" }}
            >
              beta
            </span>
          </p>
          <h1 className="text-[11px] font-normal" style={{ color: "#cfe3ff" }}>
            Contacting {FACTS.name} · kiruk.in/contact
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[300px_minmax(0,1fr)]">
          {/* ── left column ── */}
          <div className="flex min-w-0 flex-col gap-3">
            <section aria-label={`${FIRST}'s profile`} className="flex flex-col gap-2 px-1">
              <p className="text-[20px] font-bold leading-tight">{FIRST}</p>
              <div className="flex gap-3">
                <span
                  aria-hidden
                  className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center overflow-hidden"
                  style={{
                    borderRadius: 6,
                    background: `linear-gradient(160deg, ${ORANGE} 0%, #cc3300 45%, ${NAVY} 100%)`,
                    border: `2px solid ${PAPER}`,
                    boxShadow: `0 0 0 1px ${BLUE_EDGE}, 0 2px 4px rgba(0,0,0,0.25)`,
                  }}
                >
                  <span className="absolute inset-x-0 top-0 h-1/2" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.05))" }} />
                  <span className="relative text-[38px] font-bold" style={{ fontFamily: "'Arial Black', Verdana, sans-serif", color: PAPER, textShadow: "0 2px 0 rgba(0,0,0,0.3)" }}>
                    AK
                  </span>
                </span>
                <div className="flex min-w-0 flex-col gap-1 text-[11px] leading-snug">
                  <p className="italic">&ldquo;Email me. I answer everything there.&rdquo;</p>
                  <p>{FACTS.place}</p>
                  <p style={{ color: INK_DIM }}>{FACTS.timezone}</p>
                  {c.awake ? (
                    <p className="flex items-center gap-1.5 font-bold" style={{ color: "#1f6b1f" }}>
                      <span
                        aria-hidden
                        data-era-calm
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: "#3ec43e", boxShadow: "0 0 5px #3ec43e", animation: c.reduce ? "none" : "ks-blink 1.6s ease-in-out infinite" }}
                      />
                      Online Now!
                    </p>
                  ) : (
                    <p style={{ color: INK_DIM }}>Last login: today</p>
                  )}
                </div>
              </div>
              <p className="flex items-center gap-1.5 text-[12px]">
                <strong>Mood:</strong> building
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <circle cx="8" cy="8" r="7" fill="#ffcc00" stroke="#cc8800" />
                  <circle cx="5.5" cy="6.5" r="1" fill="#333" />
                  <circle cx="10.5" cy="6.5" r="1" fill="#333" />
                  <path d="M4.8 9.6c1.6 1.8 4.8 1.8 6.4 0" fill="none" stroke="#333" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
              </p>
              <p className="text-[11px]" style={{ color: INK_DIM }}>
                {statusLine(c)}
              </p>
              <p className="text-[12px]">
                <strong>View my:</strong>{" "}
                <Link href="/work" className={`ks-link ${FOCUS}`} style={focusStyle}>
                  Work
                </Link>{" "}
                |{" "}
                <Link href="/notebook" className={`ks-link ${FOCUS}`} style={focusStyle}>
                  Notebook
                </Link>
              </p>
            </section>

            <Panel tone="blue" title={`Contacting ${FIRST}`} blueprint="compose">
              <ul className="grid grid-cols-2" style={{ border: `1px solid ${BLUE_CELL}` }}>
                {actions.map((a, i) => {
                  const on = a.run && panel === a.id;
                  const inner = (
                    <>
                      <span className="shrink-0" style={{ color: i % 2 ? LINK : ORANGE }}>
                        <Glyph art={ACTION_ART[a.id]} size={18} />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="ks-link text-[12px] leading-tight">{a.label}</span>
                        <span className="truncate text-[10px]" style={{ color: INK_DIM }}>
                          {a.to}
                        </span>
                      </span>
                    </>
                  );
                  const cls = `ks-cell flex min-h-11 w-full items-center gap-2 px-2 py-1.5 text-left ${FOCUS} focus-visible:-outline-offset-2`;
                  const style: CSSProperties = { ...focusStyle, background: on ? "#eef4fc" : undefined };
                  return (
                    <li key={a.id} style={{ borderBottom: i < 6 ? `1px solid ${BLUE_CELL}` : undefined, borderLeft: i % 2 ? `1px solid ${BLUE_CELL}` : undefined }}>
                      {a.href ? (
                        <a
                          href={a.href}
                          {...external(a.href)}
                          onClick={() => {
                            setFallbackUrl("");
                            setNote(a.opened ?? "");
                          }}
                          className={cls}
                          style={style}
                        >
                          {inner}
                        </a>
                      ) : (
                        <button type="button" aria-expanded={a.id === "forward" || a.id === "block" ? undefined : !!on} onClick={a.run} className={cls} style={style}>
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div role="status" aria-live="polite" className="text-[12px]">
                {note && (
                  <p className="mt-2 px-1" style={{ color: NAVY }}>
                    {note}
                  </p>
                )}
                {fallbackUrl && <input readOnly aria-label="Link to this page" value={fallbackUrl} onFocus={(e) => e.currentTarget.select()} className={`${field} mt-1`} />}
              </div>

              {panel && (
                <div className="mt-3 p-2.5" style={{ background: "#f4f8ff", border: `1px solid ${BLUE_EDGE}` }}>
                  {panel === "message" && <Composer c={c} mode="message" onClose={() => setPanel(null)} headRef={headRef} />}
                  {panel === "friend" && <FriendRequest c={c} onMessage={() => open("message")} onClose={() => setPanel(null)} headRef={headRef} />}
                  {panel === "rank" && <Rank onClose={() => setPanel(null)} headRef={headRef} />}
                </div>
              )}
            </Panel>

            <Panel tone="blue" title="KirukSpace URL">
              <p className="break-all p-1.5 text-[12px]" style={{ background: "#f4f8ff", border: `1px solid ${BLUE_EDGE}`, color: LINK }}>
                kiruk.in/contact
              </p>
            </Panel>
          </div>

          {/* ── right column ── */}
          <div className="flex min-w-0 flex-col gap-3">
            <p className="px-3 py-3 text-[15px] font-bold md:text-[17px]" style={{ border: `1px solid ${BLUE_EDGE}`, background: "#f4f8ff" }}>
              {FIRST} is in your extended network
            </p>

            <Panel tone="orange" title={`${FIRST}'s Details`} pad={false}>
              <table className="w-full border-separate text-[12px] leading-relaxed" style={{ borderSpacing: 2 }}>
                <tbody>
                  {facts.map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row" className="w-[88px] px-2 py-1.5 text-left align-top text-[11px] font-bold md:w-[110px]" style={{ background: BLUE_LABEL, color: NAVY }}>
                        {k}:
                      </th>
                      <td className="px-2 py-1.5 align-top" style={{ background: BLUE_CELL }}>
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <Panel tone="orange" title={`${FIRST}'s Friend Space`} right={<span style={{ color: ORANGE_INK }}>Sorted for: {c.intent.label}</span>} blueprint="channels">
              <p className="mb-2 text-[12px] font-bold">
                {FIRST} has <span style={{ color: "#cc0066" }}>{CHANNELS.length}</span> friends.
              </p>
              <ul className="grid grid-cols-4 gap-x-1 gap-y-3">
                {c.all.map((ch) => {
                  const r = rankOf(ch.id);
                  const inner = (
                    <>
                      <span className="relative">
                        <Tile id={ch.id} size={56} />
                        {r && (
                          <span
                            className="absolute -right-2 -top-2 px-1 text-[9px] font-bold"
                            style={{ borderRadius: 3, color: PAPER, background: "linear-gradient(180deg, #f97a2c, #c24400)", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                          >
                            #{r}
                          </span>
                        )}
                      </span>
                      <span className="ks-name w-full text-center text-[11px] leading-tight underline" style={{ color: LINK }}>
                        {ch.label}
                      </span>
                      <span className="w-full truncate text-center text-[10px]" style={{ color: INK_DIM }}>
                        {ch.id === "email" ? "write here" : ch.id === "call" ? "cal.com" : ch.handle}
                      </span>
                    </>
                  );
                  const cls = `ks-tile flex min-h-11 w-full flex-col items-center gap-1 p-0.5 ${FOCUS}`;
                  const label = `${ch.label}, ${ch.handle}. ${ch.use}${r ? ` Choice ${r} for this.` : ""}`;
                  return (
                    <li key={ch.id} className="flex min-w-0">
                      {ch.id === "email" || ch.id === "call" ? (
                        <button type="button" aria-label={label} onClick={ch.id === "email" ? () => open("message") : openCal} className={cls} style={focusStyle}>
                          {inner}
                        </button>
                      ) : (
                        <a href={ch.href} {...external(ch.href)} aria-label={label} className={cls} style={focusStyle}>
                          {inner}
                        </a>
                      )}
                    </li>
                  );
                })}
                <li className="flex min-w-0">
                  <button type="button" aria-label="You? Send me a friend request" onClick={() => open("friend")} className={`ks-tile flex min-h-11 w-full flex-col items-center gap-1 p-0.5 ${FOCUS}`} style={focusStyle}>
                    <span
                      className="flex h-14 w-14 items-center justify-center text-[22px] font-bold"
                      style={{ borderRadius: 6, border: `2px dashed ${BLUE_EDGE}`, color: BLUE_EDGE, background: "#f4f8ff" }}
                    >
                      ?
                    </span>
                    <span className="ks-name text-center text-[11px] leading-tight underline" style={{ color: LINK }}>
                      you?
                    </span>
                    <span className="text-center text-[10px]" style={{ color: INK_DIM }}>
                      add me
                    </span>
                  </button>
                </li>
              </ul>
              {cal && (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 ref={headRef} tabIndex={-1} className="text-[13px] font-bold outline-none" style={{ color: NAVY, ...scrollGap }}>
                      Book 30 minutes with {FIRST}
                    </h3>
                    <Gel onClick={() => setCal(false)}>Close</Gel>
                  </div>
                  <div style={{ border: `1px solid ${BLUE_EDGE}` }}>
                    <CalEmbed height={580} />
                  </div>
                </div>
              )}
            </Panel>

            <Panel tone="orange" title={`${FIRST}'s Friends Comments`} right={<span style={{ color: ORANGE_INK }}>Displaying 0 of 0 comments</span>}>
              {commenting ? (
                <Composer c={c} mode="comment" onClose={() => setCommenting(false)} headRef={headRef} />
              ) : (
                <div className="flex flex-col items-start gap-2 py-1">
                  <p className="text-[12px]">No comments yet. Be the first.</p>
                  <Gel primary onClick={comment}>
                    Add Comment
                  </Gel>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
      <style>{CSS}</style>
    </div>
  );
}
