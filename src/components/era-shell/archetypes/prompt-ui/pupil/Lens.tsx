"use client";

/**
 * The lens: the pupil dilated around an answer. It opens from the dot's
 * centre (a growing circle), holds the answer, and closes back into the dot.
 * Dark like a real pupil, rimmed in the 2026 orange.
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getIntent } from "@/data/contact";
import { draftFrom, read, sentence } from "@/data/contact-reader";
import { useContact } from "@/components/contact-box/use-contact";
import type { Answer, AnswerLink } from "./types";

const EASE = [0.23, 1, 0.32, 1] as const;

const isExternal = (href: string) => /^(https?:|mailto:)/.test(href);

function LensLink({ link }: { link: AnswerLink }) {
  const body = (
    <>
      <span className="r26-link-label">{link.label}</span>
      {link.note ? <span className="r26-link-note">{link.note}</span> : null}
    </>
  );
  return isExternal(link.href) ? (
    <a
      className="r26-link"
      href={link.href}
      target={link.href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
    >
      {body}
    </a>
  ) : (
    <Link className="r26-link" href={link.href}>
      {body}
    </Link>
  );
}

/** Contact answers end in a note the visitor can edit and send. */
function ContactDraft({ answer, asked }: { answer: Answer; asked: string }) {
  const c = useContact();
  const { setIntent, setBody } = c;
  const intentId = answer.contactIntent ?? "hello";
  useEffect(() => {
    setIntent(intentId);
    // Their own words open the note only when they said what they want.
    setBody(
      draftFrom(
        getIntent(intentId),
        read(asked).score >= 2 ? sentence(asked) : "",
      ),
    );
  }, [intentId, asked, setIntent, setBody]);

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
        <input
          value={c.name}
          onChange={(e) => c.setName(e.target.value)}
          autoComplete="name"
        />
      </label>
      <label className="r26-input">
        <span>Your email</span>
        <input
          type="email"
          value={c.from}
          onChange={(e) => c.setFrom(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="r26-input">
        <span>Note</span>
        <textarea
          rows={5}
          value={c.body}
          onChange={(e) => c.setBody(e.target.value)}
        />
      </label>
      <div className="r26-draft-row">
        <button
          type="submit"
          className="r26-send"
          disabled={!c.ready || c.sendState === "sending"}
        >
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

export function Lens({
  answer,
  asked,
  reduce,
  onAsk,
  onClose,
}: {
  answer: Answer;
  asked: string;
  reduce: boolean;
  onAsk: (text: string) => void;
  onClose: () => void;
}) {
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, [answer]);

  return (
    <motion.section
      className="r26-lens"
      role="region"
      aria-labelledby="r26-lens-title"
      data-kind={answer.kind}
      initial={
        reduce ? { opacity: 0 } : { clipPath: "circle(40px at 50% 46%)" }
      }
      animate={reduce ? { opacity: 1 } : { clipPath: "circle(80% at 50% 46%)" }}
      exit={
        reduce
          ? { opacity: 0 }
          : {
              clipPath: "circle(30px at 50% 46%)",
              transition: { duration: 0.2, ease: EASE },
            }
      }
      transition={{ duration: reduce ? 0.01 : 0.34, ease: EASE }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="r26-lens-body">
        <header className="r26-lens-head">
          <h2 id="r26-lens-title" ref={headRef} tabIndex={-1}>
            {answer.title}
          </h2>
          <button
            type="button"
            className="r26-close"
            onClick={onClose}
            aria-label="Close, back to the dot"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="r26-say">
          {answer.say.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {answer.links.length ? (
          <ul className="r26-links">
            {answer.links.map((l) => (
              <li key={l.href + l.label}>
                <LensLink link={l} />
              </li>
            ))}
          </ul>
        ) : null}

        {answer.kind === "contact" ? (
          <ContactDraft answer={answer} asked={asked} />
        ) : null}

        {answer.next.length ? (
          <div className="r26-next" aria-label="Ask next">
            {answer.next.map((n) => (
              <button key={n} type="button" onClick={() => onAsk(n)}>
                {n}
              </button>
            ))}
          </div>
        ) : null}

        {answer.heard.length ? (
          <p className="r26-heard">heard: {answer.heard.join(", ")}</p>
        ) : null}
      </div>
    </motion.section>
  );
}
