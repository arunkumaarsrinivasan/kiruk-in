"use client";

/**
 * useContact — the headless contact engine every era skin plays.
 *
 * Pick (who / what for) → the channels reorder and a draft appears → edit
 * → send. Send goes through /api/contact; mailto is always offered too, so a
 * note never depends on the form working. Skins only decide how it looks.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  CHANNELS,
  EMAIL,
  INTENTS,
  WHO,
  getChannel,
  getIntent,
  type Channel,
  type ContactWhoId,
  type Intent,
  type IntentId,
} from "@/data/contact";

export type SendState = "idle" | "sending" | "sent" | "error";

export interface Contact {
  who: ContactWhoId;
  intent: Intent;
  setWho: (who: ContactWhoId) => void;
  setIntent: (id: IntentId) => void;
  /** Channels for this intent, best first. */
  picks: Channel[];
  /** Every channel, the intent's picks first. */
  all: Channel[];
  name: string;
  setName: (v: string) => void;
  from: string;
  setFrom: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  /** Put the intent's template back. */
  resetDraft: () => void;
  mailto: string;
  /** True when name, email and a real message are in. */
  ready: boolean;
  send: () => Promise<void>;
  sendState: SendState;
  sendError: string;
  copied: boolean;
  copyEmail: () => void;
  /** Arun's local time, "14:05". Empty until mounted. */
  clock: string;
  /** Rough guess from the clock: 9:00 to 23:00 IST. */
  awake: boolean;
  reduce: boolean;
}

const KEY = "kiruk-contact-selection";

function istNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return { clock: `${String(h).padStart(2, "0")}:${m}`, awake: h >= 9 && h < 23 };
}

export function useContact(): Contact {
  const reduce = !!useReducedMotion();
  const [who, setWhoState] = useState<ContactWhoId>("curious");
  const [intentId, setIntentId] = useState<IntentId>("hello");
  const intent = getIntent(intentId);
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState(intent.subject);
  const [body, setBody] = useState(intent.body);
  const [touched, setTouched] = useState(false);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendError, setSendError] = useState("");
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState({ clock: "", awake: true });

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as { who: ContactWhoId; intent: IntentId } | null;
      if (saved && WHO.some((w) => w.id === saved.who) && INTENTS.some((i) => i.id === saved.intent)) {
        setWhoState(saved.who);
        setIntentId(saved.intent);
        setSubject(getIntent(saved.intent).subject);
        setBody(getIntent(saved.intent).body);
      }
    } catch {
      /* private mode: start from the default */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ who, intent: intentId }));
    } catch {
      /* ignore */
    }
  }, [who, intentId]);

  useEffect(() => {
    const tick = () => setTime(istNow());
    tick();
    const t = window.setInterval(tick, 30_000);
    return () => window.clearInterval(t);
  }, []);

  // Switching intent swaps the draft, unless the visitor already wrote their own.
  const applyIntent = useCallback(
    (id: IntentId) => {
      setIntentId(id);
      if (!touched) {
        setSubject(getIntent(id).subject);
        setBody(getIntent(id).body);
      }
      setSendState("idle");
    },
    [touched],
  );

  const setWho = useCallback(
    (id: ContactWhoId) => {
      setWhoState(id);
      const w = WHO.find((x) => x.id === id);
      if (w) applyIntent(w.intent);
    },
    [applyIntent],
  );

  const editBody = useCallback((v: string) => {
    setTouched(true);
    setBody(v);
  }, []);
  const editSubject = useCallback((v: string) => {
    setTouched(true);
    setSubject(v);
  }, []);
  const resetDraft = useCallback(() => {
    setTouched(false);
    setSubject(intent.subject);
    setBody(intent.body);
  }, [intent]);

  const picks = useMemo(() => intent.channels.map(getChannel), [intent]);
  const all = useMemo(() => [...picks, ...CHANNELS.filter((c) => !intent.channels.includes(c.id))], [picks, intent]);

  const signed = name.trim() ? `${body.trimEnd()}\n\n${name.trim()}` : body;
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(signed)}`;
  // The untouched template isn't a message: ask for at least a line of their own.
  const ready =
    !!name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from.trim()) &&
    body.trim().length > 10 &&
    body.trim() !== intent.body.trim();

  const send = useCallback(async () => {
    if (!ready || sendState === "sending") return;
    setSendState("sending");
    setSendError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: from.trim(), message: `[${intent.label}] ${subject}\n\n${body}` }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Couldn't send.");
      setSendState("sent");
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Couldn't send.");
      setSendState("error");
    }
  }, [ready, sendState, name, from, intent.label, subject, body]);

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText(EMAIL).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => undefined,
    );
  }, []);

  return {
    who,
    intent,
    setWho,
    setIntent: applyIntent,
    picks,
    all,
    name,
    setName,
    from,
    setFrom,
    subject,
    setSubject: editSubject,
    body,
    setBody: editBody,
    resetDraft,
    mailto,
    ready,
    send,
    sendState,
    sendError,
    copied,
    copyEmail,
    clock: time.clock,
    awake: time.awake,
    reduce,
  };
}
