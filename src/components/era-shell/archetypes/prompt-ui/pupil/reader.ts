/**
 * The pupil's reader: what a visitor typed → one Answer.
 *
 * Keywords and weights, no model. It never writes a claim of its own: what it
 * says about Arun is copied from src/data (about-story beats, portfolio
 * projects and roles, contact intents). The only lines written here are the
 * connective ones in VOICE, all in first person, plain, no em dashes.
 *
 * Order matters, most specific first: more → contact → a named project →
 * a named company → a story question → work → skills → writing → greeting →
 * site search → "didn't catch that".
 */

import { BEATS, QUESTIONS, resolvePath, type Beat } from "@/data/about-story";
import { CHANNELS, FACTS, getChannel, getIntent } from "@/data/contact";
import { read } from "@/data/contact-reader";
import { portfolioData, type Experience, type Project } from "@/data/portfolio-data";
import { getProjectCoverLabel } from "@/data/project-media";
import { queryTerms, search, snippetFor } from "../../flash-splash/search-index";
import type { Answer, AnswerDepth, AnswerLink } from "./types";

export interface NotebookItem {
  title: string;
  href: string;
  excerpt?: string;
}

export interface ReaderContext {
  /** The answer on screen, for "tell me more". */
  prev?: Answer | null;
  /** Notebook entries, once fetched from /api/blog. */
  notebook?: NotebookItem[] | null;
}

/** The pupil's own lines. Everything else it says comes from the data. */
export const VOICE = {
  help: "Ask me about my work, my story, or how to reach me.",
  greeting: "Hi, I'm Arun. This dot is the whole site. Ask it anything.",
  unknown: "I didn't catch that. Try one of these.",
  work: (n: number) => `${n} things I've worked on. Pick one.`,
  writing: "I write in a notebook. Here's what's in it.",
  writingEmpty: "I write in a notebook. It's open here.",
  deepest: "That's all I've written down about it.",
} as const;

/** Asks the pupil offers when it has nothing better to say. */
export const SUGGESTIONS = ["What do you do?", "Show me your work", "How do I reach you?"];

const { projects, experience, skills, personal } = portfolioData;

const DEPTHS: AnswerDepth[] = ["skim", "read", "deep"];
const deeper = (d: AnswerDepth): AnswerDepth | null => DEPTHS[DEPTHS.indexOf(d) + 1] ?? null;

const norm = (text: string) =>
  text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** First match of any pattern, for the "heard" line. */
function hit(s: string, re: RegExp): string | null {
  return s.match(re)?.[0]?.trim() ?? null;
}

// ── story ────────────────────────────────────────────────────────────

/** Story questions, by how a visitor would phrase them. Keys are about-story WHAT_OPTIONS keys. */
const STORY: [string, RegExp][] = [
  ["q:kid", /\b(kid|child(?:hood)?|grow(?:ing)? up|grew up|young(?:er)?|born|salem|roots|hometown)\b/],
  ["q:into-design", /\b(into design|get into|got into|start(?:ed)? (?:in |with )?design|why design|become a designer|how did you (?:start|begin))\b/],
  ["q:work-with", /\b(work(?:ing)? with you|like to work|teammate|collaborat\w*|as a colleague|your process|how do you work)\b/],
  ["q:eras", /\b(eras?|this site|why .*(?:1970|years|time ?machine)|the dot|this website)\b/],
  ["phase:school", /\b(school)\b/],
  ["phase:college", /\b(college|university|degree|campus|sona)\b/],
  ["thread:family", /\b(family|parents|mom|mother|dad|father|aunts?|uncles?)\b/],
  ["thread:leadership", /\b(lead(?:ing|er|ership)?|manag\w*|mentor\w*|teach\w*)\b/],
  ["thread:play", /\b(games?|play\w*|fun|hobb\w*|trek\w*|ukulele|sketch\w*)\b/],
  ["thread:engineering", /\b(engineer\w*|code|coding|develop\w*|frontend|programm\w*)\b/],
];

const NOW = /\b(now|today|currently|these days|right now|what do you do|what are you (?:doing|working on)|your job|day job)\b/;
const ABOUT = /\b(about you|about yourself|who are you|who is arun|who's arun|introduce|your story|tell me about you|yourself|bio)\b/;
const MORE = /^(more|tell me more|go on|go deeper|deeper|continue|keep going|and then|what else|say more|more please)$/;

function beatLines(beats: Beat[], depth: AnswerDepth): string[] {
  if (depth === "skim") return beats.map((b) => b.skim);
  if (depth === "read") return beats.map((b) => b.read);
  return beats.flatMap((b) => [...b.deep, b.stuck]);
}

const QUESTION_TITLE: Record<string, string> = Object.fromEntries(QUESTIONS.map((q) => [`q:${q.id}`, q.label]));

function storyTitle(what: string): string {
  if (QUESTION_TITLE[what]) {
    const t = QUESTION_TITLE[what].replace(/\byou\b/g, "I").replace(/\byour\b/g, "my").replace(/\bwere\b/g, "was").replace(/\bI're\b/g, "I'm");
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  const [, id] = what.split(":");
  return id ? id.charAt(0).toUpperCase() + id.slice(1) : "My story";
}

function storyAnswer(what: string, depth: AnswerDepth, heard: string[], kind: "story" | "now" | "about" = "story"): Answer {
  const beats = resolvePath({ what });
  return {
    kind,
    title: kind === "now" ? "What I do now" : storyTitle(what),
    say: beatLines(beats, depth),
    depth,
    links: [],
    next: kind === "now" ? ["Tell me more", "Show me your work", "How do I reach you?"] : ["Tell me more", "What do you do?", "Show me your work"],
    heard,
    ref: `what:${what}`,
  };
}

function aboutAnswer(depth: AnswerDepth, heard: string[]): Answer {
  // Skim is the short bio; deeper is the whole story, one beat at a time.
  if (depth === "skim") {
    return {
      kind: "about",
      title: personal.fullName,
      say: [personal.bio],
      depth,
      links: [],
      next: ["Tell me more", "What were you like as a kid?", "Show me your work"],
      heard,
      ref: "what:all",
    };
  }
  return { ...storyAnswer("all", depth === "read" ? "skim" : "read", heard, "about"), title: "My story", depth };
}

// ── work ─────────────────────────────────────────────────────────────

const shortTitle = (p: Project) => getProjectCoverLabel(p.id, p.title);

/** Extra names visitors use for a project. Cover labels and ids are matched already. */
const PROJECT_ALIASES: Record<string, string[]> = {
  "spera-platform": ["spera bot", "spera.bot", "backtest", "crypto"],
  "hp-print-ai": ["print ai", "printing ai"],
  "mudra-ai-stack": ["mudra", "design system"],
  "get-my-prints": ["get my prints", "doorstep print"],
  "hp-print-learn-center": ["learn center", "plc", "worksheets", "whatsapp"],
  "hp-onboarding-app": ["hp onboarding", "onboarding app"],
  "square-bridge": ["square bridge", "recruitment platform"],
  "peoplegamez-hr": ["peoplegamez", "people gamez", "gamified hr"],
  "foodies-buddies": ["foodies", "foodie", "dating app"],
  desirable: ["desirable", "furniture"],
  "prags-website": ["prags", "musician", "scroll to play"],
  "portfolio-v3": ["this portfolio", "kiruk portfolio", "your portfolio site"],
};

function findProject(s: string): { p: Project; word: string } | null {
  for (const p of projects) {
    const names = [shortTitle(p).toLowerCase(), ...(PROJECT_ALIASES[p.id] ?? [])];
    // "Spera" alone names the company; the project needs its own words.
    const word = names.find((n) => n !== "spera" && new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(s));
    if (word) return { p, word };
  }
  return null;
}

const COMPANY_WORDS: Record<string, RegExp> = {
  "spera-design-lead": /\b(spera)\b/,
  "hp-ux-designer": /\b(hp|hewlett|innovation for india)\b/,
  "sns-square-product-designer": /\b(sns|sns square)\b/,
  "peoplegamez-intern": /\b(intern(?:ship)?)\b/,
  "freelance-general": /\b(freelanc\w*|clients?)\b/,
};

function findRole(s: string): { e: Experience; word: string } | null {
  for (const e of experience) {
    const re = COMPANY_WORDS[e.id];
    const word = re ? hit(s, re) : null;
    if (word) return { e, word };
  }
  return null;
}

function projectAnswer(p: Project, depth: AnswerDepth, heard: string[]): Answer {
  const say =
    depth === "skim"
      ? [p.description]
      : depth === "read"
        ? [p.longDescription]
        : [p.longDescription, ...p.features.slice(0, 4), ...p.learnings.slice(0, 2)];
  const links: AnswerLink[] = [{ label: "Open the case", href: `/work/${p.id}`, note: p.role }];
  if (p.links.live) links.push({ label: "Live site", href: p.links.live });
  return {
    kind: "project",
    title: shortTitle(p),
    say,
    depth,
    links,
    next: ["Tell me more", "Show me your work", "How do I reach you?"],
    heard,
    ref: `project:${p.id}`,
  };
}

function roleAnswer(e: Experience, depth: AnswerDepth, heard: string[]): Answer {
  const say = depth === "skim" ? [e.description] : depth === "read" ? [e.description, ...e.achievements] : [e.description, ...e.responsibilities, ...e.achievements];
  const links = e.projects
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is Project => !!p)
    .map((p) => ({ label: shortTitle(p), href: `/work/${p.id}`, note: p.role }));
  return {
    kind: "role",
    title: `${e.position}, ${e.company}`,
    say,
    depth,
    links,
    next: ["Tell me more", "Show me your work", "What do you do?"],
    heard,
    ref: `role:${e.id}`,
  };
}

function workAnswer(heard: string[]): Answer {
  return {
    kind: "work",
    title: "My work",
    say: [VOICE.work(projects.length)],
    depth: "skim",
    links: projects.map((p) => ({ label: shortTitle(p), href: `/work/${p.id}`, note: p.description })),
    next: ["Tell me about Spera", "What did you do at HP?", "How do I reach you?"],
    heard,
  };
}

function skillsAnswer(heard: string[]): Answer {
  const top = [...skills].sort((a, b) => b.level - a.level || b.yearsOfExperience - a.yearsOfExperience).slice(0, 8);
  return {
    kind: "skills",
    title: "What I'm good at",
    say: top.map((k) => `${k.name}: ${k.description}`),
    depth: "skim",
    links: [{ label: "Skills observatory", href: "/work/observatory" }],
    next: ["Show me your work", "How did you get into design?", "How do I reach you?"],
    heard,
  };
}

// ── contact, writing, small talk ─────────────────────────────────────

const CONTACT = /\b(contact|reach|email|e-mail|mail you|call|talk to you|get in touch|message you|linkedin|instagram|github|twitter|dm|hire you|hiring|recruit\w*|work together|book)\b/;
const WRITING = /\b(writ\w*|blog|notebook|notes?|articles?|essays?|posts?)\b/;
const WORK = /\b(work|projects?|portfolio|case stud\w*|show me|what have you (?:made|built|done)|things you made|built)\b/;
const SKILLS = /\b(skills?|tools?|stack|tech\w*|good at|strengths?|expertise)\b/;
const PLACE = /\b(where are you|based|location|located|live|timezone|time zone|remote|relocat\w*|open to|available|availability)\b/;
const CAREER = /\b(resume|cv|career|experience|where have you worked|past jobs|companies|work history)\b/;
const GREETING = /^(hi|hey|hello|hiya|yo|howdy|good (?:morning|evening|afternoon))\b/;

function contactAnswer(text: string): Answer {
  const r = read(text);
  // A plain "how do I reach you" names no intent: every way in, email first.
  if (r.score < 2) {
    return {
      kind: "contact",
      title: "Ways to reach me",
      say: [getChannel("email").use],
      depth: "skim",
      links: CHANNELS.map((ch) => ({ label: ch.label, href: ch.href, note: ch.handle })),
      next: ["Show me your work", "What do you do?"],
      heard: [],
      contactIntent: "hello",
    };
  }
  const intent = getIntent(r.intent);
  // The intent's own channels, best first. "How do I reach you" lists them all.
  const ranked = intent.channels;
  return {
    kind: "contact",
    title: `To ${intent.label}`,
    say: [intent.why],
    depth: "skim",
    links: ranked.map((id) => {
      const ch = getChannel(id);
      return { label: ch.label, href: ch.href, note: ch.handle };
    }),
    next: ["Show me your work", "What do you do?"],
    heard: r.heard,
    contactIntent: r.intent,
  };
}

function writingAnswer(heard: string[], notebook: NotebookItem[] | null | undefined): Answer {
  const items = notebook ?? [];
  return {
    kind: "writing",
    title: "My notebook",
    say: [items.length ? VOICE.writing : VOICE.writingEmpty],
    depth: "skim",
    links: [...items.slice(0, 6).map((n) => ({ label: n.title, href: n.href, note: n.excerpt })), { label: "Open the notebook", href: "/notebook" }],
    next: ["Show me your work", "What do you do?"],
    heard,
  };
}

function placeAnswer(heard: string[]): Answer {
  return {
    kind: "now",
    title: FACTS.place,
    say: [FACTS.mode, FACTS.timezone, ...FACTS.openTo],
    depth: "skim",
    links: [],
    next: ["How do I reach you?", "Show me your work"],
    heard,
  };
}

function careerAnswer(heard: string[]): Answer {
  const links: AnswerLink[] = [{ label: getChannel("linkedin").label, href: getChannel("linkedin").href }];
  if (personal.resumeUrl) links.push({ label: "Portfolio on Behance", href: personal.resumeUrl });
  return {
    kind: "role",
    title: "Where I've worked",
    say: experience.map((e) => `${e.position}, ${e.company}`),
    depth: "skim",
    links,
    next: ["What did you do at HP?", "Tell me about Spera", "Show me your work"],
    heard,
  };
}

const help = (heard: string[] = []): Answer => ({ kind: "help", title: "Ask me", say: [VOICE.help], depth: "skim", links: [], next: SUGGESTIONS, heard });

// ── the reader ───────────────────────────────────────────────────────

/** Re-answer the previous ref one level deeper. */
function deepen(prev: Answer): Answer {
  const next = deeper(prev.depth);
  if (!prev.ref || !next) return { ...prev, say: [...prev.say, VOICE.deepest], next: prev.next.filter((n) => n !== "Tell me more") };
  const cut = prev.ref.indexOf(":");
  const type = prev.ref.slice(0, cut);
  const id = prev.ref.slice(cut + 1);
  if (type === "what") return prev.kind === "about" ? aboutAnswer(next, prev.heard) : storyAnswer(id, next, prev.heard, prev.kind === "now" ? "now" : "story");
  if (type === "project") {
    const p = projects.find((x) => x.id === id);
    if (p) return projectAnswer(p, next, prev.heard);
  }
  if (type === "role") {
    const e = experience.find((x) => x.id === id);
    if (e) return roleAnswer(e, next, prev.heard);
  }
  return prev;
}

export function answer(text: string, ctx: ReaderContext = {}): Answer {
  const s = norm(text);
  if (!s) return help();

  if (ctx.prev && MORE.test(s)) return deepen(ctx.prev);

  const r = read(text);
  const contactWord = hit(s, CONTACT);
  if (contactWord || (r.score >= 2 && r.intent !== "hello")) {
    const a = contactAnswer(text);
    return contactWord && !a.heard.includes(contactWord) ? { ...a, heard: [contactWord, ...a.heard].slice(0, 3) } : a;
  }

  const careerWord = hit(s, CAREER);
  if (careerWord) return careerAnswer([careerWord]);

  const project = findProject(s);
  if (project) return projectAnswer(project.p, "skim", [project.word]);

  const role = findRole(s);
  if (role) return roleAnswer(role.e, "skim", [role.word]);

  for (const [what, re] of STORY) {
    const word = hit(s, re);
    if (word) return storyAnswer(what, "skim", [word]);
  }

  const placeWord = hit(s, PLACE);
  if (placeWord) return placeAnswer([placeWord]);

  const nowWord = hit(s, NOW);
  if (nowWord) return storyAnswer("q:now", "skim", [nowWord], "now");

  const aboutWord = hit(s, ABOUT);
  if (aboutWord || s === "about") return aboutAnswer("skim", [aboutWord ?? "about"]);

  const workWord = hit(s, WORK);
  if (workWord) return workAnswer([workWord]);

  const skillWord = hit(s, SKILLS);
  if (skillWord) return skillsAnswer([skillWord]);

  const writingWord = hit(s, WRITING);
  if (writingWord) return writingAnswer([writingWord], ctx.notebook);

  const greet = hit(s, GREETING);
  if (greet) return { kind: "greeting", title: "Hi", say: [VOICE.greeting], depth: "skim", links: [], next: SUGGESTIONS, heard: [greet] };

  if (/\bdesign\b/.test(s)) return storyAnswer("thread:design", "skim", ["design"]);

  // Last resort: the site index. Its pages that live inside the dot become asks, not links.
  const terms = queryTerms(s);
  const doc = terms.length ? search(s)[0] : undefined;
  if (doc) {
    const linkable = doc.url.startsWith("/work/") || doc.url.startsWith("/notebook");
    return {
      kind: "unknown",
      title: doc.title,
      say: [snippetFor(doc, terms)],
      depth: "skim",
      links: linkable ? [{ label: doc.title, href: doc.url }] : [],
      next: SUGGESTIONS,
      heard: terms.slice(0, 3),
    };
  }

  return { kind: "unknown", title: "Hmm", say: [VOICE.unknown], depth: "skim", links: [], next: SUGGESTIONS, heard: [] };
}

/** What `?ask=` deep links and the 2026 /work, /contact, #about handoffs mean. */
export const ASK_ALIASES: Record<string, string> = {
  work: "Show me your work",
  contact: "How do I reach you?",
  about: "Tell me about yourself",
  notebook: "What do you write?",
};

/** Scripted asks for the ?pupil-debug table: [ask, expected kind, expected title contains]. */
export const PUPIL_SCRIPT: [string, Answer["kind"], string][] = [
  ["I'm hiring for a design engineering role", "contact", "role"],
  ["Show me your work", "work", "My work"],
  ["What did you do at HP?", "role", "HP"],
  ["Tell me about Spera", "role", "Spera"],
  ["What were you like as a kid?", "story", "kid"],
  ["How did you get into design?", "story", "design"],
  ["What are your skills?", "skills", "good at"],
  ["What do you do?", "now", "now"],
  ["How do I reach you?", "contact", ""],
  ["Do you write?", "writing", "notebook"],
  ["asdfgh qwerty", "unknown", ""],
  ["", "help", "Ask"],
];

/** Every beat id, for the screen-reader index. */
export const BEAT_IDS = BEATS.map((b) => b.id);
