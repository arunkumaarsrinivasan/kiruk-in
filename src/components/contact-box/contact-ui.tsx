"use client";

/**
 * Shared, unstyled building blocks for contact skins. The two blanks are
 * native <select>s (keyboard, screen reader and phone pickers for free);
 * skins dress them with className/style.
 */

import type { CSSProperties } from "react";
import { CAL_URL, INTENTS, WHO, type ContactWhoId, type IntentId } from "@/data/contact";
import { bareSelect } from "@/components/about-story/story-ui";
import type { Contact } from "./use-contact";

interface SelectProps {
  contact: Contact;
  className?: string;
  style?: CSSProperties;
}

export function WhoSelect({ contact, className, style }: SelectProps) {
  return (
    <select
      aria-label="Who you are"
      className={className}
      style={{ ...bareSelect, ...style }}
      value={contact.who}
      onChange={(e) => contact.setWho(e.target.value as ContactWhoId)}
    >
      {WHO.map((w) => (
        <option key={w.id} value={w.id}>
          {w.label}
        </option>
      ))}
    </select>
  );
}

export function IntentSelect({ contact, className, style }: SelectProps) {
  return (
    <select
      aria-label="What you'd like to do"
      className={className}
      style={{ ...bareSelect, ...style }}
      value={contact.intent.id}
      onChange={(e) => contact.setIntent(e.target.value as IntentId)}
    >
      {INTENTS.map((i) => (
        <option key={i.id} value={i.id}>
          {i.label}
        </option>
      ))}
    </select>
  );
}

/** "It's 14:05 in Bengaluru, so I'm probably around." */
export function statusLine(c: Contact): string {
  if (!c.clock) return "Bengaluru, India · IST";
  return c.awake
    ? `It's ${c.clock} in Bengaluru, so I'm probably around.`
    : `It's ${c.clock} in Bengaluru. I'm likely asleep, so expect a reply after sunrise.`;
}

/** cal.com, loaded only when asked for. */
export function CalEmbed({ height = 640, style }: { height?: number; style?: CSSProperties }) {
  return (
    <iframe
      src={CAL_URL}
      title="Book a 30 minute call"
      loading="lazy"
      width="100%"
      height={height}
      style={{ border: "none", display: "block", background: "#fff", ...style }}
    />
  );
}

export const external = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {});
