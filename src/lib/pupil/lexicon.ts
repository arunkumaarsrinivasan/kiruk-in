/**
 * The words the pupil listens for, as data. The parser reads these tables;
 * nothing here is a regular expression, so a new phrasing is one new row.
 *
 * Phrases are matched on the normalised question (see graph.norm) at word
 * boundaries, longest first, on words not already taken by an entity name.
 */

import type { FieldKey, Kind } from "./graph";

/** A facet asked about one thing. `links` isn't a stored field: it reads the entity's links. */
export type Facet = FieldKey | "links";

export const FACET_CUES: [string, Facet][] = [
  // stack
  ["tech stack", "stack"],
  ["stack", "stack"],
  ["tech", "stack"],
  ["technologies", "stack"],
  ["technology", "stack"],
  ["tools", "stack"],
  ["built with", "stack"],
  ["build it with", "stack"],
  ["made with", "stack"],
  ["framework", "stack"],
  ["frameworks", "stack"],
  ["languages", "stack"],
  ["how was it made", "stack"],
  ["how was it built", "stack"],
  ["what did you use", "stack"],
  ["use for", "stack"],
  // when
  ["how long", "when"],
  ["what year", "when"],
  ["which year", "when"],
  ["since when", "when"],
  ["when", "when"],
  ["dates", "when"],
  ["duration", "when"],
  ["join", "when"],
  ["joined", "when"],
  ["start", "when"],
  ["started", "when"],
  ["leave", "when"],
  ["left", "when"],
  // challenges
  ["hardest part", "challenges"],
  ["hard", "challenges"],
  ["hardest", "challenges"],
  ["difficult", "challenges"],
  ["challenge", "challenges"],
  ["challenges", "challenges"],
  ["problems", "challenges"],
  ["struggle", "challenges"],
  ["struggles", "challenges"],
  // learnings
  ["learn", "learnings"],
  ["learned", "learnings"],
  ["learnt", "learnings"],
  ["learning", "learnings"],
  ["learnings", "learnings"],
  ["lessons", "learnings"],
  ["takeaways", "learnings"],
  ["teach", "learnings"],
  ["taught", "learnings"],
  // features
  ["features", "features"],
  ["feature", "features"],
  ["what does it do", "features"],
  ["functionality", "features"],
  ["how does it work", "features"],
  // role
  ["your role", "role"],
  ["role", "role"],
  ["position", "role"],
  ["your part", "role"],
  ["job title", "role"],
  ["title", "role"],
  // did
  ["did you do", "did"],
  ["did u do", "did"],
  ["responsibilities", "did"],
  ["responsible", "did"],
  ["day to day", "did"],
  ["work on", "did"],
  ["worked on", "did"],
  // wins
  ["achievements", "wins"],
  ["achieve", "wins"],
  ["achieved", "wins"],
  ["accomplish", "wins"],
  ["accomplishments", "wins"],
  ["wins", "wins"],
  // impact
  ["impact", "impact"],
  ["results", "impact"],
  ["result", "impact"],
  ["outcome", "impact"],
  ["outcomes", "impact"],
  ["metrics", "impact"],
  // links
  ["link", "links"],
  ["links", "links"],
  ["url", "links"],
  ["see it", "links"],
  ["live", "links"],
  ["behance", "links"],
  ["case study", "links"],
  // where
  ["where", "where"],
  ["based", "where"],
  ["location", "where"],
  ["remote", "where"],
  ["relocate", "where"],
  ["available", "wins"],
  ["availability", "wins"],
  ["located", "where"],
  // status
  ["status", "status"],
  ["still working", "status"],
  ["finished", "status"],
  ["done yet", "status"],
  // treks
  ["how high", "elevation"],
  ["high", "elevation"],
  ["elevation", "elevation"],
  ["altitude", "elevation"],
  ["how far", "distance"],
  ["distance", "distance"],
  ["km", "distance"],
  ["how tough", "difficulty"],
  ["difficulty", "difficulty"],
  // books, games
  ["who wrote", "author"],
  ["author", "author"],
  ["written by", "author"],
  ["genre", "genre"],
  ["platform", "platform"],
  // education
  ["cgpa", "value"],
  ["gpa", "value"],
  ["grade", "value"],
  ["grades", "value"],
  ["marks", "value"],
  ["courses", "courses"],
  ["subjects", "courses"],
  ["studied", "courses"],
  // skills
  ["years of", "level"],
  ["experience with", "level"],
  ["how good", "level"],
  ["how long have you used", "level"],
  // beats
  ["what stuck", "lesson"],
  ["lesson", "lesson"],
];

/** Kind nouns: "projects", "treks"… Turn a question into a list of that kind. */
export const KIND_NOUNS: [string, Kind][] = [
  ["case studies", "project"],
  ["case study", "project"],
  ["projects", "project"],
  ["project", "project"],
  ["your work", "project"],
  ["ur work", "project"],
  ["portfolio", "project"],
  ["apps", "project"],
  ["things you made", "project"],
  ["things you built", "project"],
  ["did you build", "project"],
  ["did you make", "project"],
  ["have you built", "project"],
  ["have you made", "project"],
  ["you designed", "project"],
  ["companies", "role"],
  ["company", "role"],
  ["jobs", "role"],
  ["roles", "role"],
  ["workplaces", "role"],
  ["worked at", "role"],
  ["treks", "trek"],
  ["trek", "trek"],
  ["hikes", "trek"],
  ["trekking", "trek"],
  ["mountains", "trek"],
  ["places", "place"],
  ["cities", "place"],
  ["countries", "place"],
  ["travelled", "place"],
  ["traveled", "place"],
  ["visited", "place"],
  ["been to", "place"],
  ["have been", "place"],
  ["games", "game"],
  ["gaming", "game"],
  ["books", "book"],
  ["reading", "book"],
  ["read", "book"],
  ["skills", "skill"],
  ["good at", "skill"],
  ["strengths", "skill"],
  ["expertise", "skill"],
  ["tools", "tech"],
  ["technologies", "tech"],
  ["tech stack", "tech"],
  ["stack", "tech"],
  ["languages", "tech"],
  ["frameworks", "tech"],
  ["movies", "movie"],
  ["films", "movie"],
  ["music", "music"],
  ["playlists", "music"],
  ["stories", "beat"],
];

/** Project categories, only read as a filter when projects are being listed. */
export const CATEGORY_WORDS: [string, string][] = [
  ["ai", "ai"],
  ["mobile", "mobile"],
  ["web", "web"],
  ["design", "design"],
];

export const TREK_DIFFICULTY = ["easy", "moderate", "hard", "extreme"];

export const SORT_CUES: [string, "elevation" | "distance" | "hard" | "recent"][] = [
  ["highest", "elevation"],
  ["tallest", "elevation"],
  ["longest", "distance"],
  ["hardest", "hard"],
  ["toughest", "hard"],
  ["latest", "recent"],
  ["recent", "recent"],
  ["newest", "recent"],
];

export const COUNT_CUES = ["how many", "number of", "count of", "total"];
export const COMPARE_CUES = ["vs", "versus", "compare", "comparison", "difference between", "different from", "differ", "or"];
export const TIMELINE_CUES = ["career", "journey", "timeline", "history", "resume", "cv", "path so far", "so far", "over the years", "work history", "background"];
export const MORE_CUES = ["more", "tell me more", "go on", "go deeper", "deeper", "continue", "keep going", "say more", "elaborate", "more please", "and then", "what else"];
export const BROWSE_CUES = ["help", "what can i ask", "what can you do", "what do you know", "options", "menu", "examples", "what should i ask"];
export const GREETING_WORDS = ["hi", "hey", "hello", "hiya", "yo", "howdy", "sup", "hola", "namaste", "vanakkam", "good morning", "good evening", "good afternoon", "there", "arun"];
export const ABOUT_ME_CUES = ["who are you", "who r u", "who is arun", "about you", "about yourself", "tell me about you", "introduce yourself", "introduce", "yourself", "your story", "your bio", "bio"];

/** Contact words; the contact reader (contact-reader.ts) decides who and why. */
export const CONTACT_CUES = [
  "contact",
  "reach",
  "email",
  "e mail",
  "mail you",
  "call",
  "talk to you",
  "get in touch",
  "message you",
  "dm",
  "hire you",
  "hiring",
  "recruit",
  "recruiting",
  "work together",
  "book",
  "collaborate",
  "mentor",
  "mentor me",
  "freelance work",
  "open to work",
];

/** Opinion and self-reflection: answered only from curated lines. */
export const OPINION_CUES = [
  "favourite",
  "favorite",
  "philosophy",
  "believe",
  "opinion",
  "do you think",
  "why should",
  "proud",
  "next for you",
  "whats next",
  "what is next",
  "future",
  "dream",
  "love about",
  "how do you work",
  "your process",
  "makes a good",
  "approach",
  "inspire",
  "inspiration",
  "motivates",
  "advice for",
  "regret",
  "best project",
  "best work",
  "working on",
  "biggest achievement",
  "greatest achievement",
];

/** Private or out of scope: the pupil says so, kindly, and offers what it can. */
export const DECLINE_CUES = [
  "salary",
  "pay you",
  "earn",
  "ctc",
  "phone",
  "mobile number",
  "phone number",
  "address",
  "birthday",
  "date of birth",
  "dob",
  "married",
  "wife",
  "girlfriend",
  "boyfriend",
  "relationship",
  "religion",
  "caste",
  "politics",
  "vote",
  "poem",
  "joke",
  "song",
  "users",
  "revenue",
  "funding",
  "valuation",
  "weather",
  "news",
  "stock price",
  "cricket",
];

/** Writing: answered with the notebook. */
export const WRITING_CUES = ["write", "writing", "blog", "notebook", "articles", "essays", "posts", "what do you write"];

/** Story questions, keyed by about-story WHAT_OPTIONS keys. */
export const STORY_CUES: [string, string][] = [
  ["as a kid", "q:kid"],
  ["kid", "q:kid"],
  ["childhood", "q:kid"],
  ["grow up", "q:kid"],
  ["grew up", "q:kid"],
  ["growing up", "q:kid"],
  ["born", "q:kid"],
  ["into design", "q:into-design"],
  ["get into", "q:into-design"],
  ["got into", "q:into-design"],
  ["why design", "q:into-design"],
  ["become a designer", "q:into-design"],
  ["how did you start", "q:into-design"],
  ["work with you", "q:work-with"],
  ["working with you", "q:work-with"],
  ["like to work with", "q:work-with"],
  ["eras", "q:eras"],
  ["era", "q:eras"],
  ["this site have", "q:eras"],
  ["what do you do now", "q:now"],
  ["what do you do", "q:now"],
  ["doing now", "q:now"],
  ["these days", "q:now"],
  ["right now", "q:now"],
  ["currently", "q:now"],
  ["school", "phase:school"],
  ["family", "thread:family"],
  ["parents", "thread:family"],
  ["on weekends", "thread:play"],
  ["weekends", "thread:play"],
  ["outside work", "thread:play"],
  ["for fun", "thread:play"],
  ["fun", "thread:play"],
  ["hobbies", "thread:play"],
  ["free time", "thread:play"],
  ["leading people", "thread:leadership"],
  ["leadership", "thread:leadership"],
];

/**
 * Everyday words the spelling fixer must leave alone (otherwise "where"
 * could become "here" and "made" could become "mudra").
 */
export const COMMON = new Set(
  (
    "a about above after again all also am an and any are as at be because been before being below between both but by can could did do does doing done down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just let like make made me more most my myself no nor not now of off on once only or other our ours out over own same she should so some such than that the their theirs them then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves " +
    "tell show give know want need please thanks thank much many any every something anything nothing work worked working job jobs project projects thing things build built use used using good best better time year years long high far who wrote read play played visit visited went go going been seen see look looking find found ask asked answer love like think thought say said help question questions website site page app apps team people company companies design designer designs engineer engineering developer developers code coding hire hiring student students startup founder kid family school college story stories life fun travel trip trips trek treks game games book books movie movies music skill skills tool tools tech stack role roles now today right back next first last new old big small little hard easy part parts bring brings brought offer offers give gives makes making kind mind sort type types think thinking great better best good well real really fit hire hired level senior junior player team teams lead leads people person thing"
  ).split(/\s+/),
);

// ── round 2: judging, abilities, firsts and lasts ─────────────────────

/** "Is he good?" — answered with evidence, not a verdict. */
export const EVALUATE_CUES = [
  "are you good",
  "are you any good",
  "any good",
  "how good are you",
  "talented",
  "skilled",
  "worth hiring",
  "worth it",
  "good hire",
  "good fit",
  "experienced",
  "how experienced",
  "senior",
  "legit",
  "qualified",
  "competent",
  "capable",
  "why are you good",
  "convince me",
  "should i trust",
  "trustworthy",
  "reliable",
  "impressive",
  "are you the best",
  "good at",
];

/** "Can he…", "does he know…", "has he…": a yes/no about an ability. */
export const CAPABILITY_FORMS = [
  "can you",
  "could you",
  "do you know",
  "do you do",
  "do you use",
  "do you have experience",
  "have you used",
  "have you worked",
  "have you ever",
  "have you done",
  "have you led",
  "have you managed",
  "have you mentored",
  "have you",
  "are you familiar",
  "familiar with",
  "know how to",
  "experience with",
  "experience in",
  "did you use",
  "are you able",
  "you know",
];

/** Abilities named in plain words, and where the evidence lives. */
export interface Domain {
  label: string;
  /** Skills of this category. */
  category?: string;
  /** Skills or technologies whose id contains this. */
  match?: string[];
  /** Specific things that show it. */
  ids?: string[];
}

export const CAPABILITY_DOMAINS: [string, Domain][] = [
  ["code", { label: "code", category: "frontend" }],
  ["coding", { label: "code", category: "frontend" }],
  ["program", { label: "code", category: "frontend" }],
  ["programming", { label: "code", category: "frontend" }],
  ["develop", { label: "code", category: "frontend" }],
  ["frontend", { label: "frontend", category: "frontend" }],
  ["front end", { label: "frontend", category: "frontend" }],
  ["backend", { label: "backend", category: "backend" }],
  ["back end", { label: "backend", category: "backend" }],
  ["design", { label: "design", category: "design" }],
  ["ui", { label: "UI design", category: "design" }],
  ["ux", { label: "UX", category: "design" }],
  ["user research", { label: "user research", match: ["research", "usability"] }],
  ["research", { label: "research", match: ["research", "usability"] }],
  ["usability", { label: "usability testing", match: ["usability"] }],
  ["ai", { label: "AI", match: ["ai", "prompt", "llm"] }],
  ["lead a team", { label: "leading a team", ids: ["role:sns-square-product-designer", "beat:campus-lead", "role:spera-design-lead"] }],
  ["lead", { label: "leading", ids: ["role:sns-square-product-designer", "beat:campus-lead", "role:spera-design-lead"] }],
  ["led", { label: "leading", ids: ["role:sns-square-product-designer", "beat:campus-lead", "role:spera-design-lead"] }],
  ["team", { label: "leading a team", ids: ["role:sns-square-product-designer", "beat:campus-lead"] }],
  ["managed", { label: "managing people", ids: ["role:sns-square-product-designer", "beat:campus-lead"] }],
  ["manage", { label: "managing people", ids: ["role:sns-square-product-designer", "beat:campus-lead"] }],
  ["people", { label: "working with people", ids: ["role:sns-square-product-designer", "beat:campus-lead", "beat:systems-teaching"] }],
  ["mentored", { label: "mentoring", ids: ["beat:systems-teaching", "role:sns-square-product-designer"] }],
  ["mentor", { label: "mentoring", ids: ["beat:systems-teaching", "role:sns-square-product-designer"] }],
  ["teach", { label: "teaching", ids: ["beat:systems-teaching"] }],
  ["startup", { label: "a startup", ids: ["role:spera-design-lead", "project:spera-platform"] }],
  ["startups", { label: "startups", ids: ["role:spera-design-lead", "project:spera-platform"] }],
  ["early stage", { label: "an early-stage company", ids: ["role:spera-design-lead", "project:spera-platform"] }],
  ["big company", { label: "a big company", ids: ["role:hp-ux-designer", "project:mudra-ai-stack", "metric:design-system"] }],
  ["large company", { label: "a large company", ids: ["role:hp-ux-designer", "project:mudra-ai-stack", "metric:design-system"] }],
  ["enterprise", { label: "enterprise", ids: ["role:hp-ux-designer", "project:mudra-ai-stack", "metric:design-system"] }],
  ["corporate", { label: "a corporate team", ids: ["role:hp-ux-designer", "project:mudra-ai-stack"] }],
  ["mobile", { label: "mobile", ids: ["project:get-my-prints", "project:foodies-buddies", "project:hp-onboarding-app"] }],
  ["animation", { label: "motion", match: ["gsap", "three"] }],
  ["motion", { label: "motion", match: ["gsap", "three"] }],
  ["3d", { label: "3D", match: ["three", "blender"] }],
];

/** Firsts and lasts: [phrase, kind, which]. */
export const SUPERLATIVES: [string, Kind, "first" | "last" | "previous"][] = [
  ["first job", "role", "first"],
  ["first role", "role", "first"],
  ["first company", "role", "first"],
  ["first work", "role", "first"],
  ["current job", "role", "last"],
  ["current role", "role", "last"],
  ["current company", "role", "last"],
  ["where do you work", "role", "last"],
  ["where are you working", "role", "last"],
  ["latest job", "role", "last"],
  ["previous job", "role", "previous"],
  ["last job", "role", "previous"],
  ["before this", "role", "previous"],
  ["first project", "project", "first"],
  ["earliest project", "project", "first"],
  ["oldest project", "project", "first"],
  ["latest project", "project", "last"],
  ["newest project", "project", "last"],
  ["most recent project", "project", "last"],
  ["most recent work", "project", "last"],
  ["latest work", "project", "last"],
  ["recent work", "project", "last"],
  ["last project", "project", "last"],
  ["first trek", "trek", "first"],
  ["latest trek", "trek", "last"],
  ["last trek", "trek", "last"],
];

/** "Biggest impact", "your numbers": the impact metrics. */
export const IMPACT_CUES = ["biggest impact", "most impact", "your numbers", "key numbers", "metrics", "impact numbers", "results you got"];

export const BEFORE_AFTER: [string, "before" | "after"][] = [
  ["before", "before"],
  ["prior to", "before"],
  ["after", "after"],
  ["since", "after"],
];

/** Words that point back at the thing just shown. */
export const BACK_REFERENCES = ["it", "its", "that", "this", "there", "they", "them", "those", "these", "that one", "this one", "the project", "that project", "this project", "the company", "that company"];

/** Sends a question straight to contact, even if it also names an ability. */
export const DIRECT_CONTACT = ["mentor me", "contact", "reach", "email", "e mail", "mail you", "call", "talk to you", "get in touch", "message you", "dm", "work together", "book", "collaborate"];
