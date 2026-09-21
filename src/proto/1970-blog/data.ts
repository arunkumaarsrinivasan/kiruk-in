export type ProtoKind = "essay" | "seed";

export type ProtoPost = {
  slug: string;
  title: string;
  kind: ProtoKind;
  date: string;
  lsDate: string;
  excerpt: string;
  minutes: string;
  tags: string[];
  body: string[];
  cover?: string;
};

const HELLO_BODY = [
  "This blog is a sketchbook. It’s where the pen-and-paper thinking, the half-formed ideas, and the digital refinements live side by side. Less polished essay, more open notebook.",
  "Every idea starts as a scribble. No constraints, no grid — just the shape of the thought.",
  "The interesting part is the translation. What survives the jump from paper to screen, and what gets fixed along the way?",
  "The rough hierarchy — what’s big stays big. The dumb-but-honest labels written at 1am. Any arrow drawn twice, because that’s where the real logic was.",
  "The manual tells you how. The sketchbook tells you why — and shows the wrong turns that got cut before anyone saw them.",
];

const KERNEL_BODY = [
  "The blog stopped being the system. It’s now one consumer of a tiny content kernel — declare a schema, get typed entries, loud validation, one contract.",
  "Notes are the proof: this page exists because of a schema and a route. No engine changes. The next surfaces (progress, work, docs) join the same way.",
  "Seedling. Rough on purpose — the point is that it’s here, not that it’s done.",
];

export const PROTO_POSTS: ProtoPost[] = [
  {
    slug: "content-is-a-kernel",
    title: "Content is a kernel, not a blog feature",
    kind: "seed",
    date: "2026-07-11",
    lsDate: "Jul 11",
    excerpt:
      "Treating the content layer as its own small engine so every surface plugs in the same way.",
    minutes: "1 min read",
    tags: ["architecture", "kiruk-os"],
    body: KERNEL_BODY,
  },
  {
    slug: "hello",
    title: "How I sketch before I ship",
    kind: "essay",
    date: "2026-07-06",
    lsDate: "Jul  6",
    excerpt:
      "A walk through the messy middle — from a napkin scribble to a digital flow. Notebook first, pixels later.",
    minutes: "2 min read",
    tags: ["design", "ideation"],
    body: HELLO_BODY,
    cover: "/blog/hello/cover.png",
  },
  {
    slug: "dtrf",
    title: "dtrf",
    kind: "seed",
    date: "2026-07-18",
    lsDate: "Jul 18",
    excerpt: "",
    minutes: "0 min read",
    tags: ["seedling"],
    body: ["Start writing…"],
  },
  {
    slug: "character-cell",
    title: "Measuring type on a CRT when the only ruler is the character cell",
    kind: "essay",
    date: "2026-08-02",
    lsDate: "Aug  2",
    excerpt:
      "The operator is tired. The screen is eighty columns. You still have to choose a measure.",
    minutes: "4 min read",
    tags: ["type", "crt"],
    body: [
      "On a 1970 display the column is the unit. Not the pixel, not the point — the cell. Eighty across, twenty-four down, and every decision about reading has to live inside that cage.",
      "Kiruk’s notebook still has to be an essay in 2026. The question this year asks is not how to make the essay look old. It is how to let someone sit at this machine and read.",
      "If the line runs past 65 characters the eye loses the return path. If it sits at 40, the thought fragments. The cell does not care. The reader does.",
    ],
  },
  {
    slug: "phosphor-afterglow",
    title: "Phosphor afterglow",
    kind: "essay",
    date: "2026-06-22",
    lsDate: "Jun 22",
    excerpt: "Green that refuses to die the instant you look away.",
    minutes: "3 min read",
    tags: ["light"],
    body: [
      "The glow is not decoration. It is the tube catching up with the beam. Turn it off and you have a spreadsheet. Leave it on too strong and you cannot read.",
    ],
  },
  {
    slug: "batch-job",
    title: "What we sent to the line printer at 2am and pretended was a magazine",
    kind: "essay",
    date: "2026-05-30",
    lsDate: "May 30",
    excerpt:
      "Fanfold paper, sprocket holes, a title that wrapped, and a note to the operator taped on top.",
    minutes: "5 min read",
    tags: ["print"],
    body: [
      "The printout is the other 1970. No mouse, no glow — a stack of paper you could hold. The blog as a job that ran overnight.",
      "You did not hover. You flipped. You underlined in pencil. You lost page 7.",
    ],
  },
  {
    slug: "pf-keys",
    title: "PF3 is back",
    kind: "essay",
    date: "2026-04-14",
    lsDate: "Apr 14",
    excerpt: "A 3270 does not browse. It commits a screen, then another.",
    minutes: "2 min read",
    tags: ["3270"],
    body: [
      "Block terminals painted a whole form at once. You tabbed through fields. You did not scroll a page; you requested the next one.",
      "That is a different contract with a notebook. The article is a screen. PF3 puts the index back.",
    ],
  },
  {
    slug: "ascii-issue",
    title: "Issue 14 — summer, boxed",
    kind: "essay",
    date: "2026-03-01",
    lsDate: "Mar  1",
    excerpt: "A magazine that could travel down a serial line.",
    minutes: "3 min read",
    tags: ["magazine"],
    body: [
      "Before the web there were issues. Someone numbered the files, drew a masthead in hash marks, and mailed the packet.",
      "Reading then was choosing 1, 2, or 3 — not grazing a feed.",
    ],
  },
  {
    slug: "login-message",
    title: "last login: tty1",
    kind: "seed",
    date: "2026-02-11",
    lsDate: "Feb 11",
    excerpt: "The first line is not branding. It is whose machine you are on.",
    minutes: "1 min read",
    tags: ["session"],
    body: ["You are kiruk. The year is 1970. The files below were written later."],
  },
  {
    slug: "empty-reel",
    title: "Empty reel",
    kind: "seed",
    date: "2026-01-09",
    lsDate: "Jan  9",
    excerpt: "",
    minutes: "0 min read",
    tags: [],
    body: ["No copy on this reel yet."],
  },
  {
    slug: "wide-title-for-the-cell",
    title:
      "A title that will not fit the cell so we can see what the machine does when language is longer than the hardware",
    kind: "essay",
    date: "2025-12-20",
    lsDate: "Dec 20",
    excerpt:
      "Worst-case headline: two lines on a teletype, three on a 3270, a wrapped banner on fanfold.",
    minutes: "2 min read",
    tags: ["stress"],
    body: [
      "If the interface only works with tidy titles, it is not a 1970 interface. The hardware wrapped. So should we.",
    ],
  },
  {
    slug: "see-also",
    title: "SEE ALSO",
    kind: "seed",
    date: "2025-11-02",
    lsDate: "Nov  2",
    excerpt: "Related files at the bottom of the man page, not a card grid.",
    minutes: "1 min read",
    tags: ["ia"],
    body: ["Related work is a pointer, not a recommendation engine."],
  },
];

export function filterPosts(posts: ProtoPost[], query: string): ProtoPost[] {
  const q = query.trim().toLowerCase();
  if (!q) return posts;
  return posts.filter((post) =>
    `${post.title} ${post.excerpt} ${post.tags.join(" ")} ${post.slug}`.toLowerCase().includes(q),
  );
}
