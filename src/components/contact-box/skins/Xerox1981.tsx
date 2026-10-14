"use client";

/**
 * 1981 · Star desktop — contact as objects you act on.
 *
 * The Star's grammar was noun, then verb: select an icon, press a function
 * key (OPEN, PROPS, MOVE, COPY). So the contact page is a desktop: ARUN is a
 * card, the LETTER is a document, the OUT-BASKET sends. Select the letter,
 * press MOVE, point at the basket, and it's sent. Dragging the letter works
 * too. The letter's property sheet asks who you are and ranks where it
 * should go; ranked icons wear a numbered tab.
 *
 * Dressed in the site's 1981 desktop: gray bevels, navy title bars, hard
 * 2px shadows, Pixelify Sans chrome.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { CHANNELS, EMAIL, FACTS, INTENTS, WHO, getChannel, type ChannelId } from "@/data/contact";
import type { ContactSkinProps } from "../types";
import { CalEmbed } from "../contact-ui";

const INK = "#000";
const PAPER = "#fff";
const GRAY = "#c0c0c0";
const GRAY_LIGHT = "#dcdcdc";
const SHADOW = "#808080";
const NAVY = "#000080";
const CHROME = "'Pixelify Sans', 'IBM Plex Sans', Helvetica, sans-serif";
const LABEL = "'IBM Plex Mono', 'Courier New', monospace";
const DOC = "var(--font-main)";

/** Raised gray bevel with the era's hard 2px drop. */
const raised = `inset -1px -1px 0 ${SHADOW}, inset 1px 1px 0 ${PAPER}, 2px 2px 0 ${INK}`;
const sunken = `inset 1px 1px 0 ${SHADOW}, inset -1px -1px 0 ${PAPER}`;
const dots: CSSProperties = {
  backgroundColor: GRAY_LIGHT,
  backgroundImage: `radial-gradient(${SHADOW} 1px, transparent 1px)`,
  backgroundSize: "6px 6px",
};

type ObjId = "arun" | "letter" | "basket" | ChannelId;
type Verb = "open" | "props" | "move" | "copy";
type WinId = "letter" | "letter-props" | "arun" | "basket" | "call" | "help" | `props:${ChannelId}`;

const OBJECTS: { id: ObjId; label: string }[] = [
  { id: "arun", label: "Arun" },
  { id: "letter", label: "Letter" },
  { id: "basket", label: "Out-basket" },
  { id: "call", label: "Calendar" },
  { id: "email", label: "Mail app" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "github", label: "GitHub" },
  { id: "studio", label: "Kirukism" },
  { id: "life", label: "Vlogs" },
  { id: "x", label: "X" },
];
const label = (id: ObjId) => OBJECTS.find((o) => o.id === id)!.label.toUpperCase();
const isChannel = (id: ObjId): id is ChannelId => CHANNELS.some((c) => c.id === id);

const line: CSSProperties = {
  background: PAPER,
  color: INK,
  border: `1px solid ${INK}`,
  boxShadow: sunken,
  borderRadius: 0,
  outline: "none",
  padding: "0 8px",
  fontFamily: DOC,
};

/* ── glyphs: 32px, two inks ─────────────────────────────────────────── */

function Glyph({ id, on }: { id: ObjId; on: boolean }) {
  const fg = on ? PAPER : INK;
  const bg = on ? INK : PAPER;
  const s = { fill: "none", stroke: fg, strokeWidth: 1.5 } as const;
  const box = (x: number, y: number, w: number, h: number) => <rect x={x} y={y} width={w} height={h} fill={bg} stroke={fg} strokeWidth="1.5" />;
  const art: Record<ObjId, ReactNode> = {
    arun: (
      <>
        {box(4, 6, 24, 20)}
        <circle cx="12" cy="14" r="3.5" {...s} />
        <path d="M7 23c1-3.5 3-5 5-5s4 1.5 5 5M19 12h6M19 16h6M19 20h4" {...s} />
      </>
    ),
    letter: (
      <>
        <path d="M6 2h14l7 7v21H6z" fill={bg} stroke={fg} strokeWidth="1.5" />
        <path d="M20 2v7h7M10 14h12M10 18h12M10 22h8" {...s} />
      </>
    ),
    basket: (
      <>
        <path d="M3 12h26l-3 15H6z" fill={bg} stroke={fg} strokeWidth="1.5" />
        <path d="M9 12v15M16 12v15M23 12v15M5 19h22" {...s} strokeWidth="1" />
        <path d="M12 9l4-5 4 5" {...s} />
      </>
    ),
    email: (
      <>
        {box(3, 8, 26, 17)}
        <path d="M3 8l13 10 13-10" {...s} />
      </>
    ),
    call: (
      <>
        {box(4, 6, 24, 22)}
        <path d="M4 12h24M10 3v6M22 3v6" {...s} />
        <rect x="9" y="16" width="5" height="4" fill={fg} />
      </>
    ),
    linkedin: (
      <>
        {box(3, 7, 26, 18)}
        <path d="M8 12v9M8 9.5v.5M12 21v-6c0-2 4-2 4 0v6M12 15v6" {...s} />
        <path d="M20 13h6M20 17h6M20 21h4" {...s} />
      </>
    ),
    github: (
      <>
        {box(3, 5, 26, 22)}
        <path d="M12 11l-5 5 5 5M20 11l5 5-5 5" {...s} />
      </>
    ),
    studio: (
      <>
        <path d="M5 27l3-8L22 5l5 5-14 14z" fill={bg} stroke={fg} strokeWidth="1.5" />
        <path d="M8 19l5 5" {...s} />
      </>
    ),
    life: (
      <>
        {box(3, 9, 26, 17)}
        <path d="M11 9l2-4h6l2 4" {...s} />
        <circle cx="16" cy="17" r="5" {...s} />
      </>
    ),
    x: (
      <>
        {box(4, 4, 24, 24)}
        <path d="M10 10l12 12M22 10L10 22" {...s} />
      </>
    ),
  };
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" aria-hidden shapeRendering="crispEdges">
      {art[id]}
    </svg>
  );
}

/* ── chrome ─────────────────────────────────────────────────────────── */

function Cmd({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-9 px-2 text-[12px] uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-40"
      style={{ background: GRAY, color: INK, border: `1px solid ${INK}`, boxShadow: `inset -1px -1px 0 ${SHADOW}, inset 1px 1px 0 ${PAPER}`, outlineColor: NAVY }}
    >
      {children}
    </button>
  );
}

/** Option button: a box with a label; the chosen one is inverted. */
function Option({ children, on, onClick }: { children: ReactNode; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="min-h-10 px-2 text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{ background: on ? INK : GRAY, color: on ? PAPER : INK, border: `1px solid ${INK}`, boxShadow: on ? "none" : raised, outlineColor: NAVY, fontFamily: CHROME }}
    >
      {children}
    </button>
  );
}

function Window({ title, status, commands, children, onClose }: { title: string; status?: string; commands?: ReactNode; children: ReactNode; onClose: () => void }) {
  return (
    <section aria-label={title} className="flex flex-col" style={{ background: PAPER, border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}>
      <header
        className="flex flex-wrap items-center gap-2 px-1.5 py-1"
        style={{ background: NAVY, color: PAPER, borderBottom: `2px solid ${INK}`, fontFamily: CHROME }}
      >
        <h2 className="px-1 text-[13px] uppercase tracking-wide">
          {title}
        </h2>
        {status && (
          <span className="px-2 text-[11px] uppercase" style={{ background: PAPER, color: INK, fontFamily: LABEL }}>
            {status}
          </span>
        )}
        <span className="ml-auto flex flex-wrap gap-1">
          {commands}
          <Cmd onClick={onClose}>Close</Cmd>
        </span>
      </header>
      <div className="p-3 md:p-4">{children}</div>
    </section>
  );
}

function Sheet({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-1.5 text-[14px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="pt-0.5 text-[11px] uppercase tracking-widest" style={{ fontFamily: LABEL }}>
            {k}
          </dt>
          <dd style={{ fontFamily: DOC }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const KEYS: { verb: Verb | "help"; key: string; hint: string }[] = [
  { verb: "open", key: "O", hint: "Open the selected icon" },
  { verb: "props", key: "P", hint: "Show its property sheet" },
  { verb: "move", key: "M", hint: "Move it onto another icon" },
  { verb: "copy", key: "C", hint: "Copy its address or text" },
  { verb: "help", key: "H", hint: "How this desktop works" },
];

/* ── skin ───────────────────────────────────────────────────────────── */

export function Xerox1981({ contact: c }: ContactSkinProps) {
  const [selected, setSelected] = useState<ObjId | null>("letter");
  const [pending, setPending] = useState<ObjId | null>(null);
  const [windows, setWindows] = useState<WinId[]>(["letter-props", "arun"]);
  const [message, setMessage] = useState("Select an icon, then press a key. The letter's property sheet is open.");
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const sent = c.sendState === "sent";

  /** Rank tabs: where this intent says to go, in order. Email means the Out-basket. */
  const rank = (id: ObjId) => {
    const i = c.picks.findIndex((p) => (p.id === "email" ? id === "basket" : p.id === id));
    return i < 0 ? null : i + 1;
  };

  const show = useCallback((w: WinId) => setWindows((ws) => [w, ...ws.filter((x) => x !== w)].slice(0, 3)), []);
  const close = (w: WinId) => setWindows((ws) => ws.filter((x) => x !== w));

  const copy = (text: string, done: string) => {
    navigator.clipboard?.writeText(text).then(
      () => setMessage(done),
      () => setMessage("Copy failed. Select the text by hand."),
    );
  };

  const openChannel = (id: ChannelId) => {
    if (id === "call") return show("call");
    if (id === "email") {
      window.location.href = c.mailto;
      return setMessage("Handed the letter to your mail program.");
    }
    const ch = getChannel(id);
    window.open(ch.href, "_blank", "noopener,noreferrer");
    setMessage(`${ch.label.toUpperCase()} opened in a new window.`);
  };

  const moveTo = (src: ObjId, dest: ObjId) => {
    setPending(null);
    if (src !== "letter") return setMessage(`${label(src)} stays put. Only the letter can be moved.`);
    if (dest === "letter") return setMessage("Point at another icon.");
    if (dest === "basket") {
      if (sent) return setMessage("The Out-basket already has your letter.");
      if (!c.ready) {
        show("letter");
        return setMessage("Letter incomplete: fill FROM, REPLY TO, and add a line of your own.");
      }
      setMessage("Moving the letter to the Out-basket…");
      void c.send();
      return;
    }
    if (dest === "arun") return setMessage("Arun is a card, not a mailbox. Try the Out-basket.");
    if (dest === "email") return openChannel("email");
    if (dest === "call") {
      show("call");
      return setMessage("Calendar opened. Bring the letter to the call.");
    }
    const ch = getChannel(dest);
    navigator.clipboard?.writeText(c.body).catch(() => undefined);
    window.open(ch.href, "_blank", "noopener,noreferrer");
    setMessage(`Letter copied. Paste it into ${ch.label} in the new window.`);
  };

  const act = (verb: Verb | "help", id: ObjId | null = selected) => {
    if (verb === "help") return show("help");
    if (!id) return setMessage("Nothing selected. Point at an icon first.");
    if (verb === "move") {
      setPending(id);
      return setMessage(`MOVE ${label(id)}: now point at the destination. Esc cancels.`);
    }
    if (verb === "copy") {
      if (id === "arun" || id === "email") return copy(EMAIL, `Address copied: ${EMAIL}`);
      if (id === "letter") return copy(`${c.subject}\n\n${c.body}`, "Letter copied.");
      if (isChannel(id)) return copy(getChannel(id).href, `${label(id)} address copied.`);
      return setMessage("The Out-basket can't be copied.");
    }
    if (verb === "props") {
      if (id === "letter") return show("letter-props");
      if (id === "arun") return show("arun");
      if (id === "basket") return show("basket");
      return show(`props:${id}`);
    }
    // open
    if (id === "letter" || id === "arun" || id === "basket") return show(id);
    openChannel(id);
  };

  const pick = (id: ObjId) => {
    if (pending) return moveTo(pending, id);
    setSelected(id);
    setMessage(`${label(id)} selected. Press OPEN, PROPS, MOVE, or COPY.`);
  };

  // The network's answer to "move to Out-basket".
  const lastSend = useRef(c.sendState);
  useEffect(() => {
    if (lastSend.current === c.sendState) return;
    lastSend.current = c.sendState;
    if (c.sendState === "sent") {
      setMessage(`Letter moved to the Out-basket. Arun replies to ${c.from}.`);
      setSelected("basket");
      show("basket");
    } else if (c.sendState === "error") {
      setMessage(`${c.sendError} Move the letter onto MAIL APP instead.`);
    }
  }, [c.sendState, c.sendError, c.from, show]);

  // Dragging the letter = MOVE. Only the letter is draggable, so touch can still scroll the desktop.
  const moveRef = useRef(moveTo);
  useEffect(() => {
    moveRef.current = moveTo;
  });
  const startDrag = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const sx = e.clientX;
    const sy = e.clientY;
    let dragging = false;
    const onMove = (ev: globalThis.PointerEvent) => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
      dragging = true;
      setGhost({ x: ev.clientX, y: ev.clientY });
    };
    const onUp = (ev: globalThis.PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setGhost(null);
      if (!dragging) return;
      const hit = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>("[data-star-obj]");
      const dest = hit?.dataset.starObj as ObjId | undefined;
      if (dest && dest !== "letter") moveRef.current("letter", dest);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape" && pending) {
      setPending(null);
      setMessage("Move cancelled.");
      return;
    }
    const k = KEYS.find((x) => x.key === e.key.toUpperCase());
    if (k) {
      e.preventDefault();
      act(k.verb);
    }
  };

  /* ── windows ── */

  const renderWindow = (w: WinId) => {
    if (w === "letter-props") {
      const usual = WHO.find((x) => x.id === c.who)?.intent;
      return (
        <Window key={w} title="Letter · Properties" onClose={() => close(w)} commands={<Cmd onClick={() => show("letter")}>Open letter</Cmd>}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: LABEL }}>
                Writer
              </p>
              <div className="flex flex-wrap gap-1.5">
                {WHO.map((x) => (
                  <Option key={x.id} on={c.who === x.id} onClick={() => c.setWho(x.id)}>
                    {x.label}
                  </Option>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: LABEL }}>
                Purpose
              </p>
              <div className="flex flex-wrap gap-1.5">
                {INTENTS.map((i) => (
                  <Option key={i.id} on={c.intent.id === i.id} onClick={() => c.setIntent(i.id)}>
                    {i.label}
                    {i.id === usual && c.intent.id !== i.id ? " ·" : ""}
                  </Option>
                ))}
              </div>
            </div>
            <div className="p-3" style={{ background: GRAY_LIGHT, border: `1px solid ${INK}` }}>
              <div className="p-3" style={{ background: PAPER, border: `1px solid ${INK}`, borderLeft: `4px solid ${NAVY}` }}>
                <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: LABEL }}>
                  Where it should go
                </p>
                <p className="mt-1 text-[15px] leading-relaxed" style={{ fontFamily: DOC }}>
                  {c.intent.why}
                </p>
                <ol className="mt-2 flex flex-col gap-1 text-[14px]" style={{ fontFamily: DOC }}>
                  {c.picks.map((p, i) => (
                    <li key={p.id} className="flex items-baseline gap-2">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-[11px]" style={{ background: NAVY, color: PAPER, fontFamily: LABEL }}>
                        {i + 1}
                      </span>
                      <span>
                        {p.id === "email" ? "OUT-BASKET" : label(p.id)} <span className="opacity-70">· {p.id === "email" ? "send it from here" : p.handle}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </Window>
      );
    }

    if (w === "letter") {
      return (
        <Window
          key={w}
          title="Letter to Arun"
          status={sent ? "Filed" : "Draft"}
          onClose={() => close(w)}
          commands={!sent && <Cmd onClick={() => moveTo("letter", "basket")}>Move to Out-basket</Cmd>}
        >
          {sent ? (
            <p className="text-[16px]" style={{ fontFamily: DOC }}>
              This letter is in the Out-basket.
            </p>
          ) : (
            <div className="flex flex-col gap-2 text-[15px]" style={{ fontFamily: DOC }}>
              <div className="grid grid-cols-[84px_1fr] items-center gap-x-3 gap-y-2">
                <span className="text-[11px] uppercase tracking-widest" style={{ fontFamily: LABEL }}>To</span>
                <span>Arun Kumaar Sreenivasan</span>
                <label htmlFor="st-from" className="text-[11px] uppercase tracking-widest" style={{ fontFamily: LABEL }}>From</label>
                <input id="st-from" placeholder="Your name" autoComplete="name" value={c.name} onChange={(e) => c.setName(e.target.value)} className="min-h-10" style={line} />
                <label htmlFor="st-reply" className="text-[11px] uppercase tracking-widest" style={{ fontFamily: LABEL }}>Reply to</label>
                <input id="st-reply" placeholder="you@email.com" type="email" autoComplete="email" value={c.from} onChange={(e) => c.setFrom(e.target.value)} className="min-h-10" style={line} />
                <label htmlFor="st-subj" className="text-[11px] uppercase tracking-widest" style={{ fontFamily: LABEL }}>Subject</label>
                <input id="st-subj" value={c.subject} onChange={(e) => c.setSubject(e.target.value)} className="min-h-10" style={line} />
              </div>
              <textarea
                aria-label="Letter"
                rows={9}
                value={c.body}
                onChange={(e) => c.setBody(e.target.value)}
                className="mt-1 p-2 leading-relaxed"
                style={{ ...line, padding: 8, fontSize: 16 }}
              />
              <p className="text-[12px]" style={{ fontFamily: CHROME }}>
                {c.ready ? "Ready. Move it to the Out-basket to send." : "Fill FROM, REPLY TO, and add a line of your own."}{" "}
                <button type="button" onClick={c.resetDraft} className="underline">
                  Reset draft
                </button>
              </p>
            </div>
          )}
        </Window>
      );
    }

    if (w === "arun") {
      return (
        <Window key={w} title="Arun · Card" status={c.clock ? `${c.clock} IST` : undefined} onClose={() => close(w)} commands={<Cmd onClick={() => act("copy", "arun")}>Copy address</Cmd>}>
          <Sheet
            rows={[
              ["Name", FACTS.name],
              ["Desk", `${FACTS.place} · ${FACTS.timezone}`],
              ["Status", c.clock ? (c.awake ? "At the desk, probably" : "Asleep. Reads mail in the morning") : "—"],
              [
                "Now",
                <a key="now" href={FACTS.nowHref} target="_blank" rel="noopener noreferrer" className="underline">
                  {FACTS.now}
                </a>,
              ],
              ["Before", FACTS.before],
              [
                "Open to",
                <ul key="open">
                  {FACTS.openTo.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>,
              ],
              ["Mode", FACTS.mode],
              ["Address", EMAIL],
            ]}
          />
        </Window>
      );
    }

    if (w === "basket") {
      return (
        <Window key={w} title="Out-basket" status={sent ? "1 item" : "Empty"} onClose={() => close(w)}>
          {sent ? (
            <Sheet
              rows={[
                ["Item", c.subject],
                ["From", `${c.name} · ${c.from}`],
                ["Read", c.awake ? "Today" : "After sunrise, IST"],
              ]}
            />
          ) : (
            <p className="text-[15px]" style={{ fontFamily: DOC }}>
              Empty. Select the LETTER, press MOVE, then point here. Or drag the letter onto this icon.
            </p>
          )}
        </Window>
      );
    }

    if (w === "call") {
      return (
        <Window key={w} title="Calendar · 30 minutes" onClose={() => close(w)}>
          <div style={{ border: `1px solid ${INK}` }}>
            <CalEmbed height={560} />
          </div>
        </Window>
      );
    }

    if (w === "help") {
      return (
        <Window key={w} title="Help" onClose={() => close(w)}>
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-[15px]" style={{ fontFamily: DOC }}>
            <li>Point at an icon to select it. It turns black.</li>
            <li>Press a key on the left: OPEN, PROPS, MOVE, or COPY. The letters O, P, M, C work too.</li>
            <li>To send: select LETTER, press MOVE, point at OUT-BASKET. Or drag it there.</li>
            <li>Numbered tabs mark the best places to take your letter.</li>
          </ol>
        </Window>
      );
    }

    const id = w.slice(6) as ChannelId;
    const ch = getChannel(id);
    const r = rank(id);
    return (
      <Window key={w} title={`${ch.label} · Properties`} onClose={() => close(w)} commands={<Cmd onClick={() => act("open", id)}>Open</Cmd>}>
        <Sheet
          rows={[
            ["Name", ch.label],
            ["Address", ch.handle],
            ["Good for", ch.use],
            ["Rank", r ? `${r} for “${c.intent.label}”` : "Not first choice for this"],
          ]}
        />
      </Window>
    );
  };

  /* ── layout ── */

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:pt-10" style={{ fontVariantLigatures: "none" }}>
      <div
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="flex flex-col outline-none"
        style={{ color: INK, border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}`, background: GRAY, fontFamily: CHROME }}
      >
        <header data-blueprint="header" className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2" style={{ background: NAVY, color: PAPER, borderBottom: `2px solid ${INK}` }}>
          <h1 className="text-[15px] uppercase tracking-wide">Contact · Arun&rsquo;s desktop</h1>
          <p role="status" aria-live="polite" className="text-[13px] md:ml-auto">
            {message}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[104px_1fr]">
          {/* function keys, like the Star keyboard's left-hand block */}
          <nav aria-label="Function keys" className="grid grid-cols-5 gap-1 p-2 md:flex md:flex-col md:gap-1.5" style={{ background: GRAY, borderBottom: `2px solid ${INK}`, borderRight: `2px solid ${INK}` }}>
            {KEYS.map((k) => {
              const armed = k.verb === "move" && pending;
              return (
                <button
                  key={k.verb}
                  type="button"
                  title={k.hint}
                  onClick={() => act(k.verb)}
                  className="flex min-h-11 items-center justify-center gap-2 px-1 text-[12px] uppercase md:justify-between md:px-2 md:text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{
                    background: armed ? INK : GRAY,
                    color: armed ? PAPER : INK,
                    border: `1px solid ${INK}`,
                    boxShadow: armed ? "none" : raised,
                    outlineColor: NAVY,
                  }}
                >
                  {k.verb}
                  <span className="hidden text-[10px] opacity-60 md:inline">{k.key}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex flex-col-reverse gap-4 p-3 lg:grid lg:grid-cols-[1fr_232px] lg:items-start" style={dots}>
            <div data-blueprint="compose" className="flex min-w-0 flex-col gap-4">
              {windows.length ? (
                windows.map(renderWindow)
              ) : (
                <p className="self-start px-2 py-1 text-[13px]" style={{ background: PAPER, border: `1px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}>
                  No windows open. Select an icon and press OPEN.
                </p>
              )}
            </div>

            <ul data-blueprint="channels" aria-label="Desktop icons" className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1 lg:grid-cols-2">
              {OBJECTS.map((o) => {
                const on = selected === o.id;
                const r = rank(o.id);
                const isTarget = !!pending && o.id !== pending;
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      data-star-obj={o.id}
                      aria-pressed={on}
                      aria-label={`${o.label}${r ? `, choice ${r}` : ""}`}
                      onClick={() => pick(o.id)}
                      onDoubleClick={() => act("open", o.id)}
                      onPointerDown={o.id === "letter" && !sent ? startDrag : undefined}
                      className="relative flex min-h-11 w-full flex-col items-center gap-1 px-1 py-2 focus-visible:outline focus-visible:outline-2"
                      style={{
                        outlineColor: INK,
                        touchAction: o.id === "letter" ? "none" : undefined,
                        cursor: isTarget ? "crosshair" : undefined,
                        background: isTarget ? PAPER : undefined,
                        border: isTarget ? `1px dashed ${INK}` : "1px solid transparent",
                      }}
                    >
                      {r && (
                        <span className="absolute right-2 top-1 inline-flex h-5 w-5 items-center justify-center text-[11px]" style={{ background: NAVY, color: PAPER, border: `1px solid ${PAPER}`, fontFamily: LABEL }}>
                          {r}
                        </span>
                      )}
                      <Glyph id={o.id} on={on} />
                      <span className="px-1 text-[12px] uppercase leading-tight" style={{ background: on ? INK : PAPER, color: on ? PAPER : INK }}>
                        {o.label}
                        {o.id === "basket" && sent ? " (1)" : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {ghost && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 h-10 w-8"
          style={{ left: ghost.x - 16, top: ghost.y - 20, border: `1px dashed ${INK}`, background: "transparent" }}
        />
      )}
    </div>
  );
}
