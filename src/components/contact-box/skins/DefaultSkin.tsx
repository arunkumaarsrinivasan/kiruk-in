"use client";

/**
 * DefaultSkin — contact with era tokens only. Used by eras without their own
 * costume yet and by custom eras. Answer first: the sentence, the best
 * channel, then the draft and the facts.
 */

import { useState, type CSSProperties, type ReactNode } from "react";
import { FACTS } from "@/data/contact";
import type { ContactSkinProps } from "../types";
import { CalEmbed, IntentSelect, WhoSelect, external, statusLine } from "../contact-ui";

const surface = "color-mix(in srgb, var(--text-main) 6%, var(--bg-main))";
const blank: CSSProperties = {
  color: "var(--accent-color)",
  borderBottom: "2px solid color-mix(in srgb, var(--accent-color) 55%, transparent)",
  paddingRight: "0.9em",
  backgroundImage:
    "linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)",
  backgroundPosition: "right 0.3em center, right 0.05em center",
  backgroundSize: "0.25em 0.25em, 0.25em 0.25em",
  backgroundRepeat: "no-repeat",
};
const field: CSSProperties = {
  background: "var(--bg-main)",
  color: "var(--text-main)",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--era-radius, 6px)",
  outlineColor: "var(--accent-color)",
};
const card: CSSProperties = {
  background: surface,
  color: "var(--text-main)",
  border: "1px solid var(--border-color)",
  borderRadius: "var(--era-radius, 8px)",
};

function Btn({ children, onClick, href, primary, disabled }: { children: ReactNode; onClick?: () => void; href?: string; primary?: boolean; disabled?: boolean }) {
  const style: CSSProperties = {
    borderRadius: "var(--era-radius, 6px)",
    border: "1px solid var(--border-color)",
    background: primary ? "var(--accent-color)" : "transparent",
    color: primary ? "var(--bg-main)" : "var(--text-main)",
    outlineColor: "var(--accent-color)",
  };
  const cls =
    "inline-flex min-h-11 items-center px-5 text-sm font-medium transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-35";
  return href ? (
    <a href={href} className={cls} style={style} {...external(href)}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} disabled={disabled} className={cls} style={style}>
      {children}
    </button>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--accent-color)" }}>
      {children}
    </p>
  );
}

export function DefaultSkin({ contact: c }: ContactSkinProps) {
  const [showCal, setShowCal] = useState(false);
  const [best, ...rest] = c.picks;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-8 md:pt-12" style={{ fontFamily: "var(--font-main)", color: "var(--text-main)" }}>
      <header data-blueprint="header" className="flex flex-col gap-4">
        <Label>Contact</Label>
        <h1 className="max-w-3xl text-3xl leading-snug md:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          I&rsquo;m <WhoSelect contact={c} style={blank} />. I&rsquo;d like to <IntentSelect contact={c} style={blank} />.
        </h1>
        <p className="max-w-2xl text-lg" style={{ color: "var(--text-muted)" }}>
          {c.intent.why}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {best.id === "call" ? (
            <Btn primary onClick={() => setShowCal((v) => !v)}>
              {showCal ? "Hide the calendar" : "Book 30 minutes →"}
            </Btn>
          ) : (
            <Btn primary href={best.id === "email" ? c.mailto : best.href}>
              {best.label} · {best.handle} →
            </Btn>
          )}
          {rest.map((ch) =>
            ch.id === "call" ? (
              <Btn key={ch.id} onClick={() => setShowCal((v) => !v)}>
                {showCal ? "Hide the calendar" : "Book a call"}
              </Btn>
            ) : (
              <Btn key={ch.id} href={ch.id === "email" ? c.mailto : ch.href}>
                {ch.label}
              </Btn>
            ),
          )}
        </div>
        {showCal && (
          <div className="overflow-hidden" style={card}>
            <CalEmbed />
          </div>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <section data-blueprint="compose" aria-label="Write to Arun" className="flex flex-col gap-3 p-5 md:p-6" style={card}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl" style={{ fontFamily: "var(--font-heading)" }}>
              Or write it here
            </h2>
            <button type="button" onClick={c.resetDraft} className="min-h-11 text-sm underline underline-offset-4" style={{ color: "var(--text-muted)" }}>
              Reset draft
            </button>
          </div>
          {c.sendState === "sent" ? (
            <div className="flex min-h-[280px] flex-col justify-center gap-3">
              <p className="text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
                Got it, {c.name.trim().split(" ")[0]}.
              </p>
              <p style={{ color: "var(--text-muted)" }}>I&rsquo;ll reply to {c.from}. {statusLine(c)}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <input aria-label="Your name" placeholder="Your name" autoComplete="name" value={c.name} onChange={(e) => c.setName(e.target.value)} className="min-h-11 px-3 text-base" style={field} />
                <input aria-label="Your email" placeholder="you@email.com" type="email" autoComplete="email" value={c.from} onChange={(e) => c.setFrom(e.target.value)} className="min-h-11 px-3 text-base" style={field} />
              </div>
              <input aria-label="Subject" value={c.subject} onChange={(e) => c.setSubject(e.target.value)} className="min-h-11 px-3 text-base" style={field} />
              <textarea aria-label="Message" rows={9} value={c.body} onChange={(e) => c.setBody(e.target.value)} className="p-3 text-base leading-relaxed" style={field} />
              <div className="flex flex-wrap items-center gap-3">
                <Btn primary onClick={c.send} disabled={!c.ready || c.sendState === "sending"}>
                  {c.sendState === "sending" ? "Sending…" : "Send"}
                </Btn>
                <Btn href={c.mailto}>Open in my mail app</Btn>
                {c.sendState === "error" && (
                  <span role="alert" className="text-sm" style={{ color: "var(--accent-color)" }}>
                    {c.sendError} Try the mail app.
                  </span>
                )}
              </div>
            </>
          )}
        </section>

        <aside data-blueprint="channels" className="flex flex-col gap-5 p-5 md:p-6" style={card}>
          <div className="flex flex-col gap-1">
            <Label>Right now</Label>
            <p className="text-base">
              <a href={FACTS.nowHref} {...external(FACTS.nowHref)} className="underline underline-offset-4">
                {FACTS.now}
              </a>
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {statusLine(c)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Open to</Label>
            <ul className="text-sm leading-relaxed">
              {FACTS.openTo.map((o) => (
                <li key={o}>· {o}</li>
              ))}
            </ul>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {FACTS.mode}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Every channel</Label>
            <ul className="flex flex-col">
              {c.all.map((ch) => (
                <li key={ch.id} className="border-t py-2 first:border-t-0" style={{ borderColor: "color-mix(in srgb, var(--border-color) 60%, transparent)" }}>
                  {ch.id === "call" ? (
                    <button type="button" onClick={() => setShowCal(true)} className="min-h-11 text-left underline-offset-4 hover:underline">
                      <span className="font-medium">{ch.label}</span> <span style={{ color: "var(--text-muted)" }}>· {ch.handle}</span>
                    </button>
                  ) : (
                    <a href={ch.href} {...external(ch.href)} className="inline-block min-h-11 py-1 underline-offset-4 hover:underline">
                      <span className="font-medium">{ch.label}</span> <span style={{ color: "var(--text-muted)" }}>· {ch.handle}</span>
                    </a>
                  )}
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {ch.use}
                  </p>
                </li>
              ))}
            </ul>
            {c.copied ? (
              <p className="text-sm">Email copied.</p>
            ) : (
              <button type="button" onClick={c.copyEmail} className="min-h-11 self-start text-sm underline underline-offset-4">
                Copy my email
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
