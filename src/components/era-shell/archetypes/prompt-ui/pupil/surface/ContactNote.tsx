"use client";

/** A contact answer ends in a note the visitor can edit and send. */

import { useEffect } from "react";
import { getIntent, type IntentId } from "@/data/contact";
import { draftFrom, read, sentence } from "@/data/contact-reader";
import { useContact } from "@/components/contact-box/use-contact";

export function ContactNote({ intent, asked }: { intent: IntentId; asked: string }) {
  const c = useContact();
  const { setIntent, setBody } = c;
  useEffect(() => {
    setIntent(intent);
    // Their own words open the note only when they said what they want.
    setBody(draftFrom(getIntent(intent), read(asked).score >= 2 ? sentence(asked) : ""));
  }, [intent, asked, setIntent, setBody]);

  if (c.sendState === "sent") {
    return (
      <p className="r26-sent" role="status">
        Sent. I read everything that comes in.
      </p>
    );
  }
  return (
    <form
      className="r26-draft"
      onSubmit={(e) => {
        e.preventDefault();
        void c.send();
      }}
    >
      <label className="r26-input">
        <span>Your name</span>
        <input value={c.name} onChange={(e) => c.setName(e.target.value)} autoComplete="name" />
      </label>
      <label className="r26-input">
        <span>Your email</span>
        <input type="email" value={c.from} onChange={(e) => c.setFrom(e.target.value)} autoComplete="email" />
      </label>
      <label className="r26-input">
        <span>Note</span>
        <textarea rows={5} value={c.body} onChange={(e) => c.setBody(e.target.value)} />
      </label>
      <div className="r26-draft-row">
        <button type="submit" className="r26-send" disabled={!c.ready || c.sendState === "sending"}>
          {c.sendState === "sending" ? "Sending…" : "Send"}
        </button>
        <a className="r26-quiet" href={c.mailto}>
          or open it in your mail app
        </a>
      </div>
      {c.sendState === "error" ? (
        <p className="r26-error" role="alert">
          {c.sendError} The mail app link still works.
        </p>
      ) : null}
    </form>
  );
}
