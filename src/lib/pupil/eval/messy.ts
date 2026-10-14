/**
 * Messy questions, written before the parser existed and frozen since
 * (2026-10-15). Typos, loose phrasing, several asks at once, things the
 * pupil must decline. Do not edit to make the parser pass; add new ones at
 * the end instead.
 *
 * [question, expected intent, expected top ref ("" = any), also-safe intents]
 *   ref for list/count = the filter entity or "kind:<kind>"
 *   ref for compare    = "a|b" (order free)
 */

export type ExpectIntent =
  | "describe"
  | "facet"
  | "list"
  | "count"
  | "compare"
  | "timeline"
  | "contact"
  | "opinion"
  | "browse"
  | "greeting"
  | "decline"
  | "unknown";

export type MessyCase = [string, ExpectIntent, string, ExpectIntent[]?];

export const MESSY: MessyCase[] = [
  // describe
  ["tell me abt hp print ai", "describe", "project:hp-print-ai"],
  ["whats mudra", "describe", "project:mudra-ai-stack"],
  ["foodies buddy app?", "describe", "project:foodies-buddies"],
  ["square bridge", "describe", "project:square-bridge", ["facet"]],
  ["what is spera", "describe", "", ["facet"]],
  ["get my prints??", "describe", "project:get-my-prints"],
  ["the furniture thing", "describe", "project:desirable"],
  ["prags website", "describe", "project:prags-website"],
  ["who r u", "describe", "me:arun"],
  ["introduce yourself", "describe", "me:arun"],
  ["peoplegamez", "describe", "", ["facet"]],
  ["sona college", "describe", "education:engineering"],
  ["kudremukh trek", "describe", "trek:trek-3"],
  ["hades", "describe", "game:game-1"],
  ["design of everyday things", "describe", "book:book-2"],
  ["this website how was it made", "describe", "project:portfolio-v3", ["facet"]],

  // facet of one thing
  ["what tech did u use for spera", "facet", "project:spera-platform"],
  ["stack behind get my prints", "facet", "project:get-my-prints"],
  ["when did you join hp", "facet", "role:hp-ux-designer"],
  ["how long were you at sns square", "facet", "role:sns-square-product-designer"],
  ["what was hard about hp print ai", "facet", "project:hp-print-ai"],
  ["challenges in square bridge", "facet", "project:square-bridge"],
  ["what did you learn from foodies buddies", "facet", "project:foodies-buddies"],
  ["features of mudra", "facet", "project:mudra-ai-stack"],
  ["your role in desirable", "facet", "project:desirable"],
  ["what did u do at peoplegamez", "facet", "", ["describe"]],
  ["achievements at hp", "facet", "role:hp-ux-designer"],
  ["impact of mudra stack", "facet", "project:mudra-ai-stack"],
  ["link to spera", "facet", "", ["describe"]],
  ["where is spera based", "facet", "", ["describe"]],
  ["whats your cgpa", "facet", "education:engineering"],
  ["how high is kudremukh", "facet", "trek:trek-3"],
  ["who wrote design of everyday things", "facet", "book:book-2"],
  ["what did hp teach you", "facet", "role:hp-ux-designer", ["describe"]],
  ["how many years of figma", "facet", "skill:figma", ["describe"]],

  // lists and filters
  ["which projects used flutter", "list", "tech:flutter"],
  ["projects with next js", "list", "tech:next.js"],
  ["what did you build with figma", "list", "tech:figma"],
  ["show me your ai projects", "list", "kind:project"],
  ["mobile apps you designed", "list", "kind:project"],
  ["all your projects", "list", "kind:project"],
  ["show me ur work", "list", "kind:project"],
  ["list your treks", "list", "kind:trek"],
  ["hardest treks", "list", "kind:trek"],
  ["places you have been", "list", "kind:place"],
  ["what games do you play", "list", "kind:game"],
  ["books you read", "list", "kind:book"],
  ["what are you good at", "list", "kind:skill"],
  ["your skills", "list", "kind:skill"],
  ["what tools do you use", "list", "kind:tech", ["list"]],
  ["projects from 2023", "list", "kind:project"],
  ["what did you do in 2024", "timeline", "", ["list"]],
  ["companies you worked at", "list", "kind:role", ["timeline"]],

  // counts
  ["how many projects have you done", "count", "kind:project"],
  ["how many treks", "count", "kind:trek"],
  ["number of places visited", "count", "kind:place"],
  ["how many projects used figma", "count", "tech:figma", ["list"]],

  // compare
  ["hp vs spera", "compare", "role:hp-ux-designer|role:spera-design-lead"],
  ["compare foodies buddies and desirable", "compare", "project:foodies-buddies|project:desirable"],
  ["difference between mudra and hp print ai", "compare", "project:mudra-ai-stack|project:hp-print-ai"],
  ["get my prints or print learn center", "compare", "project:get-my-prints|project:hp-print-learn-center"],

  // timeline
  ["your career so far", "timeline", ""],
  ["walk me thru your journey", "timeline", ""],
  ["resume", "timeline", "", ["list"]],
  ["work history", "timeline", "", ["list"]],

  // story
  ["what were u like as a kid", "describe", "", ["facet", "timeline", "list"]],
  ["how did you get into design", "describe", "", ["facet", "list", "opinion"]],
  ["tell me about your family", "describe", "", ["facet", "list"]],
  ["biryani story", "describe", "beat:biryani-qa"],
  ["where did you grow up", "describe", "", ["facet"]],
  ["why does this site have eras", "describe", "", ["opinion", "facet"]],
  ["what do you do for fun", "describe", "", ["list", "opinion"]],
  ["what do you do now", "describe", "", ["facet", "timeline"]],

  // contact
  ["how do i reach u", "contact", ""],
  ["im hiring a design engineer", "contact", ""],
  ["can we work together on my startup", "contact", ""],
  ["your email", "contact", ""],
  ["linkedin?", "contact", "channel:linkedin", ["describe"]],
  ["i want to book a call", "contact", ""],
  ["can you mentor me im a student", "contact", ""],
  ["are you open to freelance work", "contact", "", ["facet", "describe"]],
  ["where are you based", "facet", "me:arun", ["describe"]],

  // opinions (curated)
  ["whats your favourite project", "opinion", "", ["list"]],
  ["your design philosophy", "opinion", ""],
  ["what makes a good design engineer", "opinion", ""],
  ["why should i hire you", "opinion", "", ["contact"]],
  ["what are you proud of", "opinion", "", ["facet"]],
  ["what's next for you", "opinion", "", ["describe"]],
  ["how do you work with developers", "opinion", "", ["describe"]],

  // greeting and browse
  ["hey", "greeting", ""],
  ["hello there!", "greeting", ""],
  ["what can i ask you", "browse", ""],
  ["help", "browse", ""],
  ["", "browse", ""],

  // decline / out of scope / private
  ["whats your salary", "decline", ""],
  ["give me your phone number", "decline", "", ["contact"]],
  ["when is your birthday", "decline", "", ["describe"]],
  ["write me a poem", "decline", "", ["unknown"]],
  ["how many users does spera have", "decline", "", ["facet", "describe"]],
  ["are you married", "decline", ""],
  ["what is your religion", "decline", ""],
  ["asdkjh qweoiu", "unknown", ""],
  ["the weather in chennai", "unknown", "", ["decline"]],

  // typos
  ["spra", "describe", "", ["facet", "unknown"]],
  ["foodis buddies", "describe", "project:foodies-buddies"],
  ["squre bridge challenges", "facet", "project:square-bridge"],
  ["flutr projects", "list", "tech:flutter"],
  ["kudremuk", "describe", "trek:trek-3"],
];
