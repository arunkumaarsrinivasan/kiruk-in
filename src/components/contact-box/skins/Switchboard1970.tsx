"use client";

/**
 * 1970 · the call. /contact on the same picture tube as the home and the
 * work, drawn as one telephone call across three stations: your rotary phone,
 * the operator's switchboard, and Arun's desk (switchboard.ts draws it).
 *
 * Nothing is dragged. Dial who you are and the operator plugs the best line
 * herself; press another jack and she re-plugs. The line rings on his desk
 * and is answered by him, or at night by the answering machine. A note goes
 * along the wire as an envelope.
 *
 * A hidden mirror carries the same call as real buttons, links and form
 * fields for keyboards and screen readers, and the tube's text fields type
 * into it.
 */

import { VT323 } from "next/font/google";
import { useCallback, useEffect, useRef, useState } from "react";
import { CHANNELS, INTENTS, WHO, getChannel, type ChannelId, type ContactWhoId, type IntentId } from "@/data/contact";
import { useTube } from "@/components/modules/work-os/control-room/use-tube";
import "@/components/modules/work-os/control-room/control-room.css";
import type { ContactSkinProps } from "../types";
import { statusLine } from "../contact-ui";
import { drawCall, RING, type Board, type Field } from "./switchboard";

const vt323 = VT323({ weight: "400", subsets: ["latin"], display: "swap" });

const PAGE_CSS = `
[data-terminal-shell]{display:none}
html:has(#contact-1970),body:has(#contact-1970){overflow:hidden}`;

/** How long the dial takes to turn and run back, before the operator plugs in. */
const DIAL_MS = 900;

export function Switchboard1970({ contact }: ContactSkinProps) {
  const [dialled, setDialled] = useState(false);
  const [line, setLine] = useState<ChannelId | null>(null);
  const [focus, setFocus] = useState<Field | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const dialIdx = useRef(0);
  const dialAt = useRef(0);
  const lineAt = useRef(0);
  const sentAt = useRef(0);
  const now = useRef(0);
  const plugTimer = useRef(0);
  const focusTimer = useRef(0);
  const latest = useRef(contact);
  latest.current = contact;

  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const inputs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  useEffect(
    () => () => {
      window.clearTimeout(plugTimer.current);
      window.clearTimeout(focusTimer.current);
    },
    [],
  );

  /** The operator plugs a line. When it is the post, the cursor waits in the letter once he answers. */
  const plug = useCallback((id: ChannelId) => {
    setLine(id);
    lineAt.current = now.current;
    window.clearTimeout(focusTimer.current);
    if (id === "email") {
      const c = latest.current;
      const first: Field = !c.name.trim() ? "name" : !c.from.trim() ? "from" : "body";
      focusTimer.current = window.setTimeout(
        () => inputs.current[first]?.focus({ preventScroll: true }),
        now.current === 0 ? 0 : (RING + 0.4) * 1000,
      );
    }
  }, []);

  /** Dial who you are: the dial turns, and then the operator puts you through on the best line. */
  const dial = useCallback(
    (who: ContactWhoId) => {
      contact.setWho(who);
      setDialled(true);
      setLine(null);
      dialIdx.current = Math.max(0, WHO.findIndex((w) => w.id === who));
      dialAt.current = now.current;
      window.clearTimeout(plugTimer.current);
      plugTimer.current = window.setTimeout(
        () => plug(latest.current.intent.channels[0]),
        now.current === 0 ? 0 : DIAL_MS,
      );
    },
    [contact, plug],
  );

  const reAbout = useCallback(
    (id: IntentId) => {
      contact.setIntent(id);
      // the operator re-plugs for the new purpose
      if (dialled) {
        const best = INTENTS.find((i) => i.id === id)?.channels[0];
        if (best && best !== line) plug(best);
      }
    },
    [contact, dialled, line, plug],
  );

  const choose = useCallback(
    (id: ChannelId) => {
      if (!dialled) {
        setDialled(true);
        dialAt.current = -9;
      }
      plug(id);
    },
    [dialled, plug],
  );

  const hangUp = useCallback(() => {
    setLine(null);
    window.clearTimeout(focusTimer.current);
    (document.activeElement as HTMLElement | null)?.blur?.();
  }, []);

  const act = useCallback(
    (id: string) => {
      const cut = id.indexOf(":");
      const kind = id.slice(0, cut);
      const arg = id.slice(cut + 1);
      if (kind === "who") dial(arg as ContactWhoId);
      else if (kind === "intent") reAbout(arg as IntentId);
      else if (kind === "chan") choose(arg as ChannelId);
      else if (kind === "field") inputs.current[arg as Field]?.focus({ preventScroll: true });
      else if (id === "key:send") {
        if (!contact.ready || contact.sendState === "sending") return;
        sentAt.current = now.current || 0.001;
        void contact.send();
      } else if (id === "key:mail") globalThis.location.assign(contact.mailto);
      else if (id === "key:copy") contact.copyEmail();
      else if (id === "key:hang") hangUp();
      else if (id === "key:new") {
        contact.setIntent(contact.intent.id);
        sentAt.current = 0;
        setDialled(false);
        hangUp();
      } else if (id === "key:dial" && line) globalThis.open(getChannel(line).href, "_blank", "noopener,noreferrer");
    },
    [choose, contact, dial, hangUp, line, reAbout],
  );

  const board: Board = {
    who: contact.who,
    dialled,
    dialIdx: dialIdx.current,
    dialAt: dialAt.current,
    intent: contact.intent,
    line,
    lineAt: lineAt.current,
    sentAt: sentAt.current,
    focus,
    name: contact.name,
    from: contact.from,
    subject: contact.subject,
    body: contact.body,
    ready: contact.ready,
    sendState: contact.sendState,
    sendError: contact.sendError,
    copied: contact.copied,
    clock: contact.clock,
    awake: contact.awake,
    tz: statusLine(contact),
    status: "",
  };

  // the status line: what is under the pointer, else where the call stands
  const hv = hoverId ?? "";
  const hvArg = hv.slice(hv.indexOf(":") + 1);
  if (hv.startsWith("who:")) board.status = `Dial: I'm ${WHO.find((w) => w.id === hvArg)?.label ?? ""}`;
  else if (hv.startsWith("chan:")) board.status = `${getChannel(hvArg as ChannelId).label} · ${getChannel(hvArg as ChannelId).use}`;
  else if (hv.startsWith("intent:")) board.status = `About: I'd like to ${INTENTS.find((i) => i.id === hvArg)?.label ?? ""}`;
  else if (!dialled) board.status = "Dial who you are on the phone";
  else if (line) board.status = `On the line: ${getChannel(line).label}`;
  else board.status = "The operator is putting you through";

  const { ownCursor, glass } = useTube(
    root,
    canvas,
    {
      draw: (s, f) => {
        now.current = f.time;
        drawCall(s, f, board);
      },
      act,
      hover: setHoverId,
    },
    vt323.style.fontFamily,
  );

  const bind = (id: Field) => ({
    ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      inputs.current[id] = el;
    },
    onFocus: () => setFocus(id),
    onBlur: () => setFocus((f) => (f === id ? null : f)),
  });

  return (
    <div id="contact-1970" style={{ position: "fixed", inset: 0, zIndex: 1, backgroundColor: "#030403" }}>
      <style>{PAGE_CSS}</style>
      <div className="cr-host">
        <div ref={root} className="cr" tabIndex={-1} data-own-cursor={ownCursor ? "" : undefined}>
          <canvas key={glass} ref={canvas} className="cr-canvas" aria-hidden />

          <div className="cr-mirror">
            <h1>Contact Arun</h1>
            <p>{statusLine(contact)}</p>
            <fieldset>
              <legend>I am</legend>
              {WHO.map((w) => (
                <button key={w.id} type="button" aria-pressed={dialled && contact.who === w.id} onClick={() => dial(w.id)}>
                  {w.label}
                </button>
              ))}
            </fieldset>
            <fieldset>
              <legend>It is about</legend>
              {INTENTS.map((i) => (
                <button key={i.id} type="button" aria-pressed={contact.intent.id === i.id} onClick={() => reAbout(i.id)}>
                  {i.label}
                </button>
              ))}
            </fieldset>
            <p>{contact.intent.why}</p>
            <fieldset>
              <legend>Reach me by, best first</legend>
              {contact.all.map((ch) => (
                <button key={ch.id} type="button" aria-pressed={line === ch.id} onClick={() => choose(ch.id)}>
                  {ch.label}: {ch.handle}. {ch.use}
                </button>
              ))}
            </fieldset>
            {CHANNELS.filter((ch) => ch.id !== "email").map((ch) => (
              <a key={ch.id} href={ch.href} target="_blank" rel="noopener noreferrer">
                {ch.label}
              </a>
            ))}
            <form
              aria-label="Write to Arun"
              onSubmit={(e) => {
                e.preventDefault();
                act("key:send");
              }}
            >
              <label>
                Your name
                <input value={contact.name} onChange={(e) => contact.setName(e.target.value)} autoComplete="name" {...bind("name")} />
              </label>
              <label>
                Your email
                <input type="email" value={contact.from} onChange={(e) => contact.setFrom(e.target.value)} autoComplete="email" {...bind("from")} />
              </label>
              <label>
                Subject
                <input value={contact.subject} onChange={(e) => contact.setSubject(e.target.value)} {...bind("subject")} />
              </label>
              <label>
                Message
                <textarea value={contact.body} onChange={(e) => contact.setBody(e.target.value)} rows={6} {...bind("body")} />
              </label>
              <button type="submit" disabled={!contact.ready || contact.sendState === "sending"}>
                Send
              </button>
              <a href={contact.mailto}>Open in your mail app</a>
              <p role="status">{contact.sendState === "sent" ? "Delivered." : contact.sendState === "error" ? contact.sendError : ""}</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Switchboard1970;
