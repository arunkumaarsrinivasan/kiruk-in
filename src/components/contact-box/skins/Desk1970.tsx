"use client";

/**
 * 1970 · the desk. /contact on the same picture tube as the home and the
 * work, drawn as Arun's desk while he is away from it (desk.ts draws it): a
 * "while you were out" message pad to leave a note on, a card wheel with one
 * card for each way to reach him, his clock and lamp, his phone, his coffee
 * and the spike where notes wait.
 *
 * Nothing is dragged. Ticking what you came by for turns the wheel to the
 * best card by itself; a note torn off the pad flies onto the spike.
 *
 * A hidden mirror carries the same page as real buttons, links and form
 * fields for keyboards and screen readers, and the pad's fields type into it.
 */

import { VT323 } from "next/font/google";
import { useCallback, useRef, useState } from "react";
import { CHANNELS, INTENTS, WHO, getChannel, type ChannelId, type IntentId } from "@/data/contact";
import { useTube } from "@/components/modules/work-os/control-room/use-tube";
import "@/components/modules/work-os/control-room/control-room.css";
import type { ContactSkinProps } from "../types";
import { statusLine } from "../contact-ui";
import { drawDesk, type Desk, type Field } from "./desk";

const vt323 = VT323({ weight: "400", subsets: ["latin"], display: "swap" });

const PAGE_CSS = `
[data-terminal-shell]{display:none}
html:has(#contact-1970),body:has(#contact-1970){overflow:hidden}`;

const IST_DAY = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short" });

/** Today in Bengaluru, as a message pad writes it: "10 NOV". */
function istDate() {
  return IST_DAY.format(new Date()).toUpperCase();
}

export function Desk1970({ contact }: ContactSkinProps) {
  // the card the visitor turned to; a new purpose turns the wheel back to its best card
  const [turned, setTurned] = useState<{ intent: IntentId; id: ChannelId } | null>(null);
  const [focus, setFocus] = useState<Field | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [lamp, setLamp] = useState<boolean | null>(null);
  const [sips, setSips] = useState(3);
  const now = useRef(0);
  const tickAt = useRef(-9);
  const cardAt = useRef(-9);
  const typedAt = useRef(-9);
  const sipAt = useRef(-9);
  const sentAt = useRef(0);
  const wasSent = useRef(false);

  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const inputs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  // the tube draws the desk again whenever this renders, and right away for what only moves in refs
  const tube = useTube(
    root,
    canvas,
    {
      draw: (s, f) => {
        now.current = f.time;
        drawDesk(s, f, desk);
      },
      act: (id) => act(id),
      hover: setHoverId,
    },
    vt323.style.fontFamily,
  );
  const { redraw } = tube;

  const card = turned && turned.intent === contact.intent.id ? turned.id : contact.intent.channels[0];

  // the slip sets off the moment the note is delivered
  const sent = contact.sendState === "sent";
  if (sent && !wasSent.current) sentAt.current = now.current || 0.001;
  wasSent.current = sent;

  const tick = useCallback(
    (id: IntentId) => {
      contact.setIntent(id);
      tickAt.current = now.current;
      cardAt.current = now.current;
      redraw();
    },
    [contact, redraw],
  );

  const nextWho = useCallback(() => {
    const i = WHO.findIndex((w) => w.id === contact.who);
    const next = WHO[(i + 1) % WHO.length];
    contact.setWho(next.id);
    tickAt.current = now.current;
    cardAt.current = now.current;
    redraw();
  }, [contact, redraw]);

  const turnTo = useCallback(
    (id: ChannelId) => {
      setTurned({ intent: contact.intent.id, id });
      cardAt.current = now.current;
      redraw();
    },
    [contact.intent.id, redraw],
  );

  const write = useCallback((field?: Field) => {
    const first: Field = field ?? (!contact.name.trim() ? "name" : !contact.from.trim() ? "from" : "body");
    inputs.current[first]?.focus({ preventScroll: true });
  }, [contact.name, contact.from]);

  const act = useCallback(
    (id: string) => {
      const cut = id.indexOf(":");
      const kind = id.slice(0, cut);
      const arg = id.slice(cut + 1);
      if (kind === "intent") tick(arg as IntentId);
      else if (id === "who:next") nextWho();
      else if (kind === "chan") turnTo(arg as ChannelId);
      else if (kind === "card") {
        const i = CHANNELS.findIndex((c) => c.id === card);
        turnTo(CHANNELS[(i + (arg === "next" ? 1 : CHANNELS.length - 1)) % CHANNELS.length].id);
      } else if (kind === "field") write(arg as Field);
      else if (id === "key:write") write();
      else if (id === "key:send") {
        if (contact.ready && contact.sendState !== "sending") void contact.send();
      } else if (id === "key:mail") globalThis.location.assign(contact.mailto);
      else if (id === "key:copy") contact.copyEmail();
      else if (id === "key:open") globalThis.open(getChannel(card).href, "_blank", "noopener,noreferrer");
      else if (id === "key:new") {
        // a fresh slip: the purpose's own draft again
        contact.resetDraft();
        contact.setIntent(contact.intent.id);
      } else if (id === "toy:phone") turnTo("call");
      else if (id === "toy:pencil") write();
      else if (id === "toy:lamp") setLamp((v) => !(v ?? contact.awake));
      else if (id === "toy:cup") {
        setSips((v) => (v === 0 ? 3 : v - 1));
        sipAt.current = now.current;
        redraw();
      }
    },
    [card, contact, nextWho, redraw, tick, turnTo, write],
  );

  // the status line: what is under the pointer, else what the desk is for
  const hv = hoverId ?? "";
  const arg = hv.slice(hv.indexOf(":") + 1);
  let status = "Leave a note on the pad, or turn the cards for other ways to reach Arun";
  if (hv.startsWith("intent:")) status = `Tick: I'd like to ${INTENTS.find((i) => i.id === arg)?.label ?? ""}`;
  else if (hv === "who:next") status = "Press to change who you are";
  else if (hv.startsWith("chan:")) status = `${getChannel(arg as ChannelId).label} · ${getChannel(arg as ChannelId).use}`;
  else if (hv.startsWith("card:")) status = "Turn the wheel to the next card";
  else if (hv === "field:name") status = "Write your name";
  else if (hv === "field:from") status = "Write the email Arun should reply to";
  else if (hv === "field:body") status = "Write your message";
  else if (hv === "key:send") status = "Tear the slip off and send it to Arun";
  else if (hv === "key:mail") status = "Open this note in your own mail app";
  else if (hv === "toy:clock") status = statusLine(contact);
  else if (hv === "toy:lamp") status = "Arun's lamp. Pull the chain";
  else if (hv === "toy:phone") status = "Lift the phone to book a call";
  else if (hv === "toy:cup") status = sips > 0 ? "Arun's filter coffee. Have a sip" : "Empty. Press for another";
  else if (hv === "toy:spike") status = sent ? "Your note is on the spike" : "The spike. Notes wait here until Arun reads them";
  else if (hv === "toy:pencil") status = "Pick up the pencil";
  else if (contact.sendState === "sending") status = "Tearing the slip off";
  else if (sent) status = "Your note is on the spike";
  else if (focus) status = "Writing on the pad";

  const desk: Desk = {
    who: contact.who,
    intent: contact.intent,
    tickAt: tickAt.current,
    card,
    cardAt: cardAt.current,
    focus,
    typedAt: typedAt.current,
    name: contact.name,
    from: contact.from,
    body: contact.body,
    ready: contact.ready,
    sendState: contact.sendState,
    sendError: contact.sendError,
    sentAt: sentAt.current,
    copied: contact.copied,
    clock: contact.clock,
    date: contact.clock ? istDate() : "",
    awake: contact.awake,
    tz: statusLine(contact),
    lamp: lamp ?? contact.awake,
    sips,
    sipAt: sipAt.current,
    status,
  };

  const bind = (id: Field) => ({
    ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      inputs.current[id] = el;
    },
    onFocus: () => setFocus(id),
    onBlur: () => setFocus((f) => (f === id ? null : f)),
  });
  const typed = () => {
    typedAt.current = now.current;
    redraw();
  };

  return (
    <div id="contact-1970" style={{ position: "fixed", inset: 0, zIndex: 1, backgroundColor: "#030403" }}>
      <style>{PAGE_CSS}</style>
      <div className="cr-host">
        <div ref={root} className="cr" tabIndex={-1} data-own-cursor={tube.ownCursor ? "" : undefined}>
          <canvas key={tube.glass} ref={canvas} className="cr-canvas" aria-hidden />

          <div className="cr-mirror">
            <h1>Contact Arun</h1>
            <p>{statusLine(contact)}</p>
            <fieldset>
              <legend>I am</legend>
              {WHO.map((w) => (
                <button key={w.id} type="button" aria-pressed={contact.who === w.id} onClick={() => contact.setWho(w.id)}>
                  {w.label}
                </button>
              ))}
            </fieldset>
            <fieldset>
              <legend>I would like to</legend>
              {INTENTS.map((i) => (
                <button key={i.id} type="button" aria-pressed={contact.intent.id === i.id} onClick={() => tick(i.id)}>
                  {i.label}
                </button>
              ))}
            </fieldset>
            <p>{contact.intent.why}</p>
            <ul aria-label="Ways to reach Arun, best first">
              {contact.all.map((ch) => (
                <li key={ch.id}>
                  <a href={ch.href} target={ch.id === "email" ? undefined : "_blank"} rel="noopener noreferrer">
                    {ch.label}: {ch.handle}
                  </a>
                  . {ch.use}
                </li>
              ))}
            </ul>
            <form
              aria-label="Leave a note for Arun"
              onSubmit={(e) => {
                e.preventDefault();
                act("key:send");
              }}
            >
              <label>
                Your name
                <input
                  value={contact.name}
                  onChange={(e) => {
                    typed();
                    contact.setName(e.target.value);
                  }}
                  autoComplete="name"
                  {...bind("name")}
                />
              </label>
              <label>
                Your email
                <input
                  type="email"
                  value={contact.from}
                  onChange={(e) => {
                    typed();
                    contact.setFrom(e.target.value);
                  }}
                  autoComplete="email"
                  {...bind("from")}
                />
              </label>
              <label>
                Subject
                <input value={contact.subject} onChange={(e) => contact.setSubject(e.target.value)} {...bind("subject")} />
              </label>
              <label>
                Message
                <textarea
                  value={contact.body}
                  onChange={(e) => {
                    typed();
                    contact.setBody(e.target.value);
                  }}
                  rows={6}
                  {...bind("body")}
                />
              </label>
              <button type="submit" disabled={!contact.ready || contact.sendState === "sending"}>
                Send
              </button>
              <a href={contact.mailto}>Open in your mail app</a>
              <p role="status">{sent ? "Delivered." : contact.sendState === "error" ? contact.sendError : ""}</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Desk1970;
