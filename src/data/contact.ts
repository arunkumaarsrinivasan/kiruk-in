/**
 * Contact — the one source for "how to reach Arun".
 *
 * Same idea as the about story: the visitor finishes one sentence,
 *   "I'm [who]. I'd like to [intent]."
 * and the page answers with the right channel first and a drafted note they
 * can edit and send. Every era's /contact plays this data through its own
 * skin (src/components/contact-box).
 *
 * Facts follow docs/resume/MASTER-CAREER.md. Voice: first person, plain,
 * specific. No em dashes.
 */

export type ChannelId = "email" | "call" | "linkedin" | "github" | "studio" | "life" | "x";
export type IntentId = "hire" | "build" | "talk-design" | "advice" | "hello";
export type ContactWhoId = "hiring" | "founder" | "designer" | "student" | "friend" | "curious";

export interface Channel {
  id: ChannelId;
  label: string;
  /** What shows as the address: handle, email, or short URL. */
  handle: string;
  href: string;
  /** One line: what this channel is good for. */
  use: string;
  /** Short lowercase name for terminals and file systems. */
  slug: string;
}

export const EMAIL = "arunkumaar.srinivasan@gmail.com";
export const CAL_URL = "https://cal.com/arun-kumaar-sreenivasan-uihrg5";

export const CHANNELS: Channel[] = [
  { id: "email", slug: "mail", label: "Email", handle: EMAIL, href: `mailto:${EMAIL}`, use: "Anything with detail. I answer everything here." },
  { id: "call", slug: "call", label: "30-min call", handle: "cal.com", href: CAL_URL, use: "Pick a slot. Best once we know what to talk about." },
  { id: "linkedin", slug: "linkedin", label: "LinkedIn", handle: "/in/arunkumaarsreenivasan", href: "https://linkedin.com/in/arunkumaarsreenivasan/", use: "Roles, references, the formal version of me." },
  { id: "github", slug: "github", label: "GitHub", handle: "@arunkumaarsrinivasan", href: "https://github.com/arunkumaarsrinivasan", use: "Code, including this site." },
  { id: "studio", slug: "kirukism", label: "Instagram · work", handle: "@kirukism", href: "https://instagram.com/kirukism", use: "Sketches, design experiments, process." },
  { id: "life", slug: "vlogs", label: "Instagram · life", handle: "@arunum.avan.seyalum", href: "https://instagram.com/arunum.avan.seyalum", use: "Trips, food, and vlogs." },
  { id: "x", slug: "x", label: "X", handle: "@kirukism", href: "https://twitter.com/kirukism", use: "Short thoughts, when I remember to post." },
];

export interface Intent {
  id: IntentId;
  /** Completes "I'd like to …". */
  label: string;
  /** Channels in the order I'd want them used. The first is the answer. */
  channels: ChannelId[];
  /** One line under the sentence: why that channel. */
  why: string;
  subject: string;
  /** Draft body. The visitor edits it before sending. */
  body: string;
}

export const INTENTS: Intent[] = [
  {
    id: "hire",
    label: "talk about a role",
    channels: ["email", "linkedin", "call"],
    why: "Email me the role and a link. If it fits, we book a call.",
    subject: "A role you might like",
    body: "Hi Arun,\n\nI'm hiring for a role and your work caught my eye.\n\nThe role: \nThe team: \nWhy I thought of you: \n\nHappy to share more on a call.",
  },
  {
    id: "build",
    label: "build something together",
    channels: ["call", "email", "github"],
    why: "Book 30 minutes. Bring the rough version, it doesn't need to be ready.",
    subject: "Let's build something",
    body: "Hi Arun,\n\nI'm working on something and would love a design engineer on it.\n\nWhat it is: \nWhere it's at: \nWhat I need help with: \n",
  },
  {
    id: "talk-design",
    label: "swap notes on design",
    channels: ["studio", "email", "x"],
    why: "DM me on @kirukism, or email if it's long. I like critiques both ways.",
    subject: "Design notes",
    body: "Hi Arun,\n\nI saw your work on kiruk.in and had a thought about it.\n\n",
  },
  {
    id: "advice",
    label: "ask for advice",
    channels: ["email", "linkedin", "studio"],
    why: "Email works best. Tell me where you're stuck and what you've tried.",
    subject: "A question about design / getting started",
    body: "Hi Arun,\n\nI'm a student / early in my career and I'd love your take on something.\n\nWhere I am: \nWhat I'm stuck on: \nWhat I've tried: \n",
  },
  {
    id: "hello",
    label: "just say hi",
    channels: ["life", "studio", "email"],
    why: "Say hi on Instagram. That's where the trips and food live.",
    subject: "Hello from your site",
    body: "Hi Arun,\n\nJust wandered through the eras and wanted to say hi.\n\n",
  },
];

export const WHO: { id: ContactWhoId; label: string; intent: IntentId }[] = [
  { id: "hiring", label: "hiring", intent: "hire" },
  { id: "founder", label: "a founder", intent: "build" },
  { id: "designer", label: "a designer", intent: "talk-design" },
  { id: "student", label: "a student", intent: "advice" },
  { id: "friend", label: "a friend", intent: "hello" },
  { id: "curious", label: "just curious", intent: "hello" },
];

/** Where things stand. Shown as plain facts beside the composer. */
export const FACTS = {
  name: "Arun Kumaar Sreenivasan",
  handle: "kiruk",
  now: "Co-founder · Design Lead at Spera",
  nowHref: "https://www.spera.bot",
  before: "UX Design Engineer at HP, Innovation for India",
  place: "Bengaluru, India",
  timezone: "IST · GMT+5:30",
  mode: "Remote-first. Hybrid in Bengaluru. Worldwide remote.",
  openTo: ["Design engineering roles and conversations", "Selective freelance and consulting", "Mentoring students"],
} as const;

export function getChannel(id: ChannelId): Channel {
  return CHANNELS.find((c) => c.id === id)!;
}

export function getIntent(id: IntentId): Intent {
  return INTENTS.find((i) => i.id === id)!;
}
