/**
 * Surface: what the pupil shows, as data. An A2UI-style flat list of nodes
 * from our own small catalog; the client renders each type with its own
 * component (prompt-ui/pupil/surface/).
 *
 * Every piece of text a visitor reads about Arun is a Txt: the words plus
 * where they came from (`src`). The eval resolves every src and checks the
 * words match, so the pupil can't say anything the data doesn't.
 */

import type { IntentId } from "@/data/contact";
import type { Link } from "./graph";
import type { Intent } from "./parse";

export interface Txt {
  text: string;
  /** `kind:id#field`, `kind:id#field[i]`, `kind:id#name`, `curated:<id>` or `voice:<key>|args`. */
  src: string;
}

export type Depth = "skim" | "read" | "deep";

export interface Fact {
  /** UI label ("When", "Stack"). Chrome, not a claim. */
  label: string;
  value: Txt;
}

export interface Item {
  ref?: string;
  title: Txt;
  note?: Txt;
  /** Small right-hand label (a year, a handle). */
  meta?: Txt;
  href?: string;
  /** Asking this opens it in the pupil. */
  ask?: string;
}

export type Node =
  | { id: string; type: "text"; text: Txt; variant?: "lead" | "body" | "quote" | "note" }
  | { id: string; type: "entity"; ref: string; title: Txt; subtitle?: Txt; facts?: Fact[]; href?: string; links?: Link[] }
  | { id: string; type: "list"; label?: string; items: Item[] }
  | { id: string; type: "timeline"; label?: string; items: (Item & { when: Txt })[] }
  | { id: string; type: "facts"; items: Fact[] }
  | { id: string; type: "chips"; label?: string; items: { label: Txt; ask: string }[] }
  | { id: string; type: "compare"; left: { ref: string; title: Txt }; right: { ref: string; title: Txt }; rows: { label: string; a?: Txt; b?: Txt }[] }
  | { id: string; type: "compose"; intent: IntentId; channels: Item[] }
  | { id: string; type: "links"; items: Link[] }
  | { id: string; type: "next"; asks: string[] }
  /** A second answer in the same surface ("…and how do I reach you"). */
  | { id: string; type: "section"; title: Txt };

export interface Surface {
  /** Stable key for this answer (intent + refs + depth). */
  id: string;
  intent: Intent;
  title: Txt;
  nodes: Node[];
  /** Entity ids the answer came from: these dots stay lit. */
  sources: string[];
  /** The same sources as words, for everyone who can't see the dots. */
  from: { ref: string; label: Txt; ask: string }[];
  /** The visible agent step line: heard · looked at · found. */
  trace: string;
  heard: string[];
  fixed: [string, string][];
  depth: Depth;
  /** What "tell me more" deepens. */
  ref?: string;
  /** The words that produced this surface (contact drafts quote them). */
  asked: string;
}

/** Every Txt inside a surface, for the grounding check. */
export function textsOf(s: Surface): Txt[] {
  const out: Txt[] = [s.title, ...s.from.map((f) => f.label)];
  for (const n of s.nodes) {
    switch (n.type) {
      case "text":
        out.push(n.text);
        break;
      case "section":
        out.push(n.title);
        break;
      case "entity":
        out.push(n.title, ...(n.subtitle ? [n.subtitle] : []), ...(n.facts ?? []).map((f) => f.value));
        break;
      case "list":
      case "timeline":
        for (const it of n.items) out.push(it.title, ...(it.note ? [it.note] : []), ...(it.meta ? [it.meta] : []), ...("when" in it ? [it.when] : []));
        break;
      case "facts":
        out.push(...n.items.map((f) => f.value));
        break;
      case "chips":
        out.push(...n.items.map((c) => c.label));
        break;
      case "compare":
        out.push(n.left.title, n.right.title);
        for (const r of n.rows) out.push(...(r.a ? [r.a] : []), ...(r.b ? [r.b] : []));
        break;
      case "compose":
        for (const it of n.channels) out.push(it.title, ...(it.note ? [it.note] : []));
        break;
    }
  }
  return out;
}
