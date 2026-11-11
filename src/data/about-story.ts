/**
 * About story — the one source for "who is Arun", told in beats.
 *
 * Every era's home page embeds the same story box (src/components/about-story).
 * A visitor picks who they are, what they want to know, and how long they
 * have; resolvePath() turns that into an ordered list of beats, and the era's
 * skin plays it.
 *
 * Each beat is written three times: skim (one line), read (a short
 * paragraph), deep (a few paragraphs + what stuck). Facts follow
 * docs/resume/MASTER-CAREER.md; open questions live in docs/ABOUT_STORY.md.
 * Voice: first person, plain, specific. No em dashes.
 */

export type Phase = "roots" | "school" | "college" | "work" | "now";
export type Thread = "design" | "engineering" | "leadership" | "play" | "family";
export type Depth = "skim" | "read" | "deep";
export type VisitorId = "curious" | "recruiter" | "designer" | "friend";

export interface Beat {
  id: string;
  year: number;
  period: string;
  place: string;
  phase: Phase;
  threads: Thread[];
  title: string;
  icon: string;
  /** One line, 18 words or fewer. */
  skim: string;
  /** A short paragraph, roughly 40–70 words. */
  read: string;
  /** Two or three short paragraphs (roughly 90–200 words). */
  deep: string[];
  /** One line: what it changed in how I work. */
  stuck: string;
  skills?: string[];
}

export const BEATS: Beat[] = [
  {
    id: "salem",
    year: 2001,
    period: "2001",
    place: "Salem, Tamil Nadu",
    phase: "roots",
    threads: ["family"],
    title: "A house of thirty people",
    icon: "🏠",
    skim: "Born in Salem into a joint family of about thirty people. Something was always being made.",
    read:
      "I was born in Salem, Tamil Nadu, into a joint family of nearly thirty people. My aunts crocheted, lettered and painted. My uncles ran projects, shops and small companies, and every plan got talked through over chai before anyone did anything. I grew up thinking that was just how work happens: loudly, together, and with a lot of opinions.",
    deep: [
      "I was born in Salem, Tamil Nadu, in 2001, into a joint family of nearly thirty people. Thirty people means there is no such thing as a quiet idea. Somebody hears it, somebody has a better version, somebody has a reason it won't work.",
      "The women in the house made things with their hands: crochet, calligraphy, murals on the walls. The men were project managers, marketers and founders, and they workshopped their ventures over chai in the evenings. I sat in both rooms.",
      "I didn't have a word for it then. Now I'd call it a studio with a kitchen attached.",
    ],
    stuck: "Nothing ships straight out of my head. It gets talked through first.",
  },
  {
    id: "family-studio",
    year: 2008,
    period: "2008 – 2012",
    place: "Salem, the family home",
    phase: "roots",
    threads: ["family", "design"],
    title: "Critiques over tea",
    icon: "🧶",
    skim: "Watched my mom crochet and my aunts letter and paint. Every piece got a critique over tea.",
    read:
      "Between seven and eleven I spent most evenings watching. My mom crocheted, one aunt lettered scripts, another painted murals, and my cousins and I doodled next to them. When something was finished it went around the room over tea, and everyone said what they thought. Nobody was offended. That was just the last step of making something.",
    deep: [
      "My mom crocheted. One aunt did calligraphy, another painted murals, and my cousins and I sat on the floor doodling next to them. It wasn't a class. It was just what the evenings looked like.",
      "The part I remember most is what happened after. A finished piece went around the room over tea and everybody had an opinion: the colour, the spacing, whether the border was too heavy. It was honest and nobody took it personally, because the next piece was always better for it.",
      "Years later, when I sat in my first design critique at college, it felt familiar. I'd been doing it since I was seven.",
    ],
    stuck: "Every idea invites another perspective before it ships.",
    skills: ["Observation", "Critique"],
  },
  {
    id: "biryani-qa",
    year: 2014,
    period: "Class 6 – 10",
    place: "Uncle's office, school notebooks",
    phase: "school",
    threads: ["engineering", "play", "family"],
    title: "Bug reports for biryani",
    icon: "📝",
    skim: "My notebooks had more sketches than notes. I tested my uncle's ERP software and got paid in biryani.",
    read:
      "At school my notebooks had more drawings than notes. Outside school I had a side job: my uncle built ERP software, and I was his tester. He'd hand me a checklist, I'd click through every screen trying to break it, and I'd write down what went wrong. The pay was biryani. It was the best deal I've ever taken.",
    deep: [
      "My school notebooks had more sketches than notes.",
      "My uncle built ERP software, and somewhere around Class 6 I became his tester. He'd give me a regression checklist and a new build. I'd go through every screen, try to break it, and write up what I found in a bug log. When a build passed, there was biryani.",
      "I didn't know the words QA or black-box testing. I just knew that if you try hard enough to break something, you find out how it's supposed to work. I still design that way: I look for where a flow falls over before I make it pretty.",
    ],
    stuck: "Try to break it first. You learn how it's meant to work.",
    skills: ["QA testing", "Curiosity", "Doodling"],
  },
  {
    id: "first-paycheck",
    year: 2018,
    period: "Summer 2018",
    place: "Salem, and clients online",
    phase: "school",
    threads: ["design"],
    title: "The first paycheck",
    icon: "💸",
    skim: "At 17, before college, I got paid for posters and illustrations. Learned pricing the hard way.",
    read:
      "The summer before college, family friends started asking me for posters and illustrations. Then their friends asked. It was the first time someone paid me for something I drew, and the first time I had to name a price, take feedback I didn't agree with, and still deliver on the date I promised. I got a few of those wrong.",
    deep: [
      "The summer before college, word got around that I could draw. Posters and illustrations, mostly through family referrals and word of mouth around town.",
      "It was the first time I had to do the boring parts: name a price, write down what the client actually wanted, take feedback I didn't agree with, and still deliver on the day I said. I underpriced almost everything.",
      "But the paycheck changed something. Drawing wasn't only a thing I did in notebooks anymore. People would pay for it if it solved their problem.",
    ],
    stuck: "Design is paid for when it solves someone's problem, not mine.",
    skills: ["Poster design", "Illustration", "Client work"],
  },
  {
    id: "sona",
    year: 2019,
    period: "2019 – 2023",
    place: "Sona College of Technology, Salem",
    phase: "college",
    threads: ["engineering", "design"],
    title: "Computer Science, and a sketchbook",
    icon: "💻",
    skim: "Studied Computer Science at Sona College. Code labs by day, sketch critiques by night.",
    read:
      "I studied Computer Science and Engineering at Sona College of Technology from 2019 to 2023 and finished with a CGPA of 8.9. Days were algorithms, systems and networks. Evenings were sketching and design work for anyone who asked. For four years I kept both going, and that's where the design engineer in me comes from.",
    deep: [
      "I did my B.E. in Computer Science and Engineering at Sona College of Technology, 2019 to 2023, and finished with a CGPA of 8.9.",
      "The CS part was real: algorithms, systems, networks. It's why, years later, I could ship Spring Boot as an intern at HP and why today my design work lives inside the code repository instead of next to it.",
      "But I never put the sketchbook down. Code labs in the day, sketch critiques at night. For a while I thought I'd have to pick one. I didn't, and I'm glad.",
    ],
    stuck: "I don't have to choose between design and code.",
    skills: ["CS fundamentals", "Logic", "Sketching"],
  },
  {
    id: "campus-lead",
    year: 2020,
    period: "2019 – 2021",
    place: "Sona cultural crew and incubation lab",
    phase: "college",
    threads: ["design", "leadership"],
    title: "Leading the campus crew",
    icon: "🎭",
    skim: "Led the college's cultural design team, redid the website, and designed a medical app.",
    read:
      "In college I ended up leading the cultural design team: stage branding, posters, everything with the fest's name on it. I also redesigned the college website and worked on a medical incubation app with developers from the lab. It was my first time being responsible for other people's work, not just mine, and for keeping stakeholders happy without losing the fun.",
    deep: [
      "I joined the cultural crew to make posters and somehow ended up running the design team. Stage branding, fest identity, signage, anything with our name on it.",
      "Around the same time I redesigned the college website and designed a medical incubation app with developers from the incubation lab. That was my first real handoff to engineers, and my first time learning that a design isn't done when it looks right. It's done when it's built right.",
      "Leading taught me the unglamorous part: reviews with faculty, deadlines that don't move, keeping a team of volunteers excited. Playful for the students, professional for the people signing off.",
    ],
    stuck: "A design is done when it's built right, not when it looks right.",
    skills: ["Web design", "Team lead", "HTML/CSS"],
  },
  {
    id: "playlab",
    year: 2020,
    period: "2020",
    place: "Home, and the Play Store",
    phase: "college",
    threads: ["play", "design", "engineering"],
    title: "Lockdown games",
    icon: "🕹️",
    skim: "During lockdown my cousin and I made mobile games and put them on the Play Store.",
    read:
      "When the pandemic shut everything in 2020, my cousin and I started making mobile games. I did the art, the motion and the UI, we shipped them to the Play Store, and every evening turned into a game jam. None of them made us rich. All of them taught me how a player feels in the first ten seconds.",
    deep: [
      "Lockdown in 2020 left my cousin and me at home with laptops and a lot of evenings. So we made games.",
      "I drew the art, animated it, designed the screens and built the asset pipeline so we weren't redrawing everything by hand. We shipped them to the Google Play Store. I also kept doing freelance work and internship case studies in between.",
      "Games are brutal teachers. A player decides in seconds whether they get it. If they don't, they're gone, and no amount of explaining brings them back. That's where my obsession with first moments comes from, and it's why this site is full of games.",
    ],
    stuck: "People decide in the first ten seconds. Design those first.",
    skills: ["Game art", "Motion", "Unity basics"],
  },
  {
    id: "systems-teaching",
    year: 2021,
    period: "2020 – 2023",
    place: "College studio, freelance clients",
    phase: "college",
    threads: ["design", "leadership"],
    title: "Writing it down, teaching it",
    icon: "🎛️",
    skim: "Freelanced for studios and resorts, wrote my first design systems, and taught UX to 100+ students.",
    read:
      "From 2020 until I graduated I freelanced for a design studio, resorts and smaller clients: branding, UI, web and print. Working with many teams at once forced me to write things down, so I started documenting UI kits, motion rules and UX playbooks. I also ran UX workshops and guest lectures for more than a hundred students.",
    deep: [
      "From 2020 to 2023 I freelanced while studying: branding, UI and UX, web, mobile and print, for a design studio, a few resorts and smaller clients. Foodies Buddies, a food-taste dating app I co-designed in 2022, became my first mobile case study I was actually proud of.",
      "Juggling several teams at once taught me to write things down. I started documenting UI kits, motion rules, accessibility checklists and UX playbooks, so a developer I'd never met could build the thing without calling me. Those were my first design systems, even if I didn't call them that.",
      "I also started teaching. UX and UI workshops and guest lectures, more than a hundred students in total. Explaining something to a room is the fastest way to find out you don't understand it yet.",
    ],
    stuck: "If it only lives in my head, it isn't a system yet.",
    skills: ["Design systems", "Figma", "Branding", "Teaching"],
  },
  {
    id: "peoplegamez",
    year: 2022,
    period: "Nov 2022 – Jan 2023",
    place: "PeopleGamez.com, remote",
    phase: "college",
    threads: ["design", "play"],
    title: "Making HR playful",
    icon: "🎮",
    skim: "Interned as an interaction designer, making HR software feel like a game. Drew 100+ game assets.",
    read:
      "My first internship was at PeopleGamez, a company that turns HR into games (4Plantz, Motivuz and others). I did user research and storyboards, designed flows and interaction models, drew more than a hundred game assets, and built dashboards and a design system for their reports. Every week we had a critique jam where prototypes changed while people reacted to them.",
    deep: [
      "PeopleGamez makes HR software that behaves like a game: 4Plantz, Motivuz and a few more. I joined as an interaction design intern, remote, from November 2022 to January 2023.",
      "I did user research and storyboards, then flows and interaction models, then more than a hundred game assets. I also designed the performance report dashboards, with a small design system and data-viz rules so the charts stayed consistent.",
      "The best part was the weekly critique jam in FigJam and Notion. We'd sketch loops before writing any code, and prototypes changed live while people reacted. It was the family tea critique again, just with more sticky notes.",
    ],
    stuck: "Playful and professional aren't opposites. You design the line between them.",
    skills: ["Interaction design", "Figma prototyping", "Game assets"],
  },
  {
    id: "square-bridge",
    year: 2023,
    period: "Feb – Jul 2023",
    place: "SNS Square, remote",
    phase: "work",
    threads: ["design", "leadership"],
    title: "Leading designers on Square Bridge",
    icon: "🧩",
    skim: "Led three designers on a student hiring platform. 150+ screens, 200+ people tested.",
    read:
      "In 2023, through my mentor Jothi Sekaran, I joined SNS Square to lead design on Square Bridge, a platform that connects students, recruiters and college placement officers. I led three designers, built one design system and over 150 screens, and tested with more than 200 candidates. The portfolio builder we made lifted student engagement by 45%.",
    deep: [
      "My mentor Jothi Sekaran (IBM) brought me into SNS Square in February 2023, as a subject matter expert and design lead on Square Bridge. It ran alongside my HP internship until July.",
      "Campus placements are chaos. Students don't know how to show their skills, recruiters can't find the right people, and placement officers sit in the middle with spreadsheets. We designed for all three: a portfolio builder for students, search for recruiters, and one central dashboard for placement officers.",
      "I led three designers, set up one design system across the three personas, and we made more than 150 screens. Research and usability testing covered over 200 candidates. The portfolio builder lifted student engagement by 45%, recruiters found candidates 40% faster, and the build matched the design at about 98%.",
    ],
    stuck: "When three people want different things, design the thing between them.",
    skills: ["Design systems", "User research", "Mentoring"],
  },
  {
    id: "hp",
    year: 2023,
    period: "Feb 2023 – Feb 2026",
    place: "HP Inc, Innovation for India, Bengaluru",
    phase: "work",
    threads: ["design", "engineering"],
    title: "Three years at HP",
    icon: "🖨️",
    skim: "Intern, then design engineer at HP. Worked on HP Print AI and a design system used by 500+.",
    read:
      "I joined HP's Innovation for India team as an R&D intern in February 2023 and became its main UX design engineer that August. For three years I worked on HP Print AI, a design system called Mudra used by more than 500 employees, a doorstep printing app and a WhatsApp flow for parents. Most of it is under NDA, so the story here is the thinking.",
    deep: [
      "I started at HP Inc in Bengaluru in February 2023 as an R&D intern, building COE BOT, a Spring Boot tool that set up Splunk dashboards and alerts for fleets of IoT printers. In August 2023 I became the UX design engineer on the Innovation for India team, and for most of the next three years I was the main one.",
      "The biggest project was HP Print AI, the first printer experience built around AI. The design problem wasn't making it clever. It was making people trust it, so they'd let it change their print without second-guessing. I also built Mudra, the design system and branding for our internal AI stack in Figma and Next.js, which more than 500 employees use.",
      "Smaller, very human projects too: Get my Prints, a Flutter web app for printing at your doorstep, and Print Learn Center, a WhatsApp flow parents use to pull learning worksheets for their kids. Plus more than fifteen hackathon solutions. Most visuals are under NDA, which is why you won't see screenshots here.",
    ],
    stuck: "With AI, the design problem is trust, not novelty.",
    skills: ["React", "Flutter", "AI UX", "Design systems"],
  },
  {
    id: "spera",
    year: 2026,
    period: "Feb 2026 – now",
    place: "Spera, remote",
    phase: "work",
    threads: ["design", "engineering", "leadership"],
    title: "Designing Spera from day one",
    icon: "🌈",
    skim: "Now founding design engineer and Design Lead at Spera. I own the design and the frontend, end to end.",
    read:
      "In February 2026 I left HP to join Spera, a platform where you can build, backtest and paper trade crypto strategies without hiring a developer, as its founding design engineer. We're three people. Praveen, our CEO, leads the product. I lead design and frontend end to end: the logo, the voice, the design system, the interface, and the workflows that turn a sketch or a bug report into shipped UI.",
    deep: [
      "In February 2026 I left HP to join Praveen at Spera as its founding design engineer and design lead. Spera lets traders build, backtest and paper trade crypto strategies without hiring a developer or running their own servers. We're a team of three: Praveen is CEO and leads the product, I lead design and frontend, and our third teammate runs marketing and growth.",
      "From the first week I owned how Spera looks, sounds and works: the logo, the brand, the design system and tokens, and the production frontend. My UI went into our main branch on 22 February and I've made more than 330 commits since. The way we work is simple: sit together, ideate, start from a sketch, then encode it as a spec or a rule so the next pass doesn't start from zero.",
      "The piece I'm proudest of is the feedback loop. Anyone can report a UI problem in the app, and the report captures the exact element, screenshots and state, then turns into a prompt already wired to our specs and docs. The UX of reporting was designed to improve the UX of fixing. Right now I'm working on how chat and the MCP interface feel together.",
    ],
    stuck: "Ship it, notice the friction, then write the rule so it doesn't happen twice.",
    skills: ["Design leadership", "Next.js", "Design systems", "Interaction design"],
  },
  {
    id: "off-hours",
    year: 2026,
    period: "Always",
    place: "Mountains, mostly",
    phase: "now",
    threads: ["play", "family"],
    title: "Off hours",
    icon: "⛰️",
    skim: "Mountains, a ukulele, the weirdest thing on the menu, and this site. I try not to repeat days.",
    read:
      "Outside work I try not to live the same day twice. I keep three toothbrushes so mornings don't start as copies. I order the strangest thing on the menu. For the last few years I've kept going back to the mountains, including Buran Ghati at 4,572 metres. When I'm happy I play the ukulele and make up my own words. This site is the same idea: one portfolio, ten eras.",
    deep: [
      "People tell me to follow a routine. I tried it and got bored inside my own life. So I keep small variations everywhere: two or three toothbrushes, four or five pairs of shoes, a different light in the shower. I order the thing on the menu I can't picture. Sometimes it's bad. Sometimes it's the thing I come back for.",
      "I'm a mountain person. For the last few years I've kept going back, with friends, with strangers, sometimes alone. The highest so far was Buran Ghati, six days up to 4,572 metres. When I'm happy I pick up the ukulele, try to copy a song, and end up adding my own words. It's never perfect. It doesn't need to be.",
      "This site came from the same place. I wondered what my portfolio would look like if I'd made it in 1970, or 1995, or 2013. We are many things, so the site is too. You don't know best. You know one.",
    ],
    stuck: "You don't know best. You know one.",
    skills: ["Trekking", "Ukulele", "Sketching"],
  },
];

// ── What a visitor can ask for ────────────────────────────────────────

export const PHASES: { id: Phase; label: string }[] = [
  { id: "roots", label: "my roots" },
  { id: "school", label: "school days" },
  { id: "college", label: "college" },
  { id: "work", label: "my work" },
  { id: "now", label: "life now" },
];

export const THREADS: { id: Thread; label: string }[] = [
  { id: "design", label: "design" },
  { id: "engineering", label: "engineering" },
  { id: "leadership", label: "leading people" },
  { id: "play", label: "games and play" },
  { id: "family", label: "family" },
];

export const QUESTIONS: { id: string; label: string; beats: string[] }[] = [
  {
    id: "into-design",
    label: "how you got into design",
    beats: ["family-studio", "biryani-qa", "first-paycheck", "campus-lead", "playlab", "systems-teaching"],
  },
  { id: "now", label: "what you do now", beats: ["hp", "spera", "off-hours"] },
  {
    id: "work-with",
    label: "what you're like to work with",
    beats: ["family-studio", "campus-lead", "square-bridge", "spera"],
  },
  { id: "kid", label: "what you were like as a kid", beats: ["salem", "family-studio", "biryani-qa"] },
  { id: "eras", label: "why this site has eras", beats: ["family-studio", "playlab", "off-hours"] },
];

export const VISITORS: { id: VisitorId; label: string; what: string; depth: Depth }[] = [
  { id: "curious", label: "just curious", what: "all", depth: "skim" },
  { id: "recruiter", label: "hiring", what: "phase:work", depth: "read" },
  { id: "designer", label: "a designer", what: "q:work-with", depth: "read" },
  { id: "friend", label: "a friend", what: "phase:now", depth: "deep" },
];

export const DEPTHS: { id: Depth; label: string; hint: string }[] = [
  { id: "skim", label: "a skim", hint: "one line each" },
  { id: "read", label: "a read", hint: "a paragraph each" },
  { id: "deep", label: "a deep dive", hint: "the full story" },
];

/** Every "what" option as a flat, keyed list for selects, chips and flags. */
export const WHAT_OPTIONS: { key: string; label: string; group: "all" | "phase" | "thread" | "question" }[] = [
  { key: "all", label: "everything", group: "all" },
  ...PHASES.map((p) => ({ key: `phase:${p.id}`, label: p.label, group: "phase" as const })),
  ...THREADS.map((t) => ({ key: `thread:${t.id}`, label: t.label, group: "thread" as const })),
  ...QUESTIONS.map((q) => ({ key: `q:${q.id}`, label: q.label, group: "question" as const })),
];

export interface Selection {
  who: VisitorId;
  /** A WHAT_OPTIONS key: "all" | "phase:<id>" | "thread:<id>" | "q:<id>". */
  what: string;
  depth: Depth;
}

export const DEFAULT_SELECTION: Selection = { who: "curious", what: "all", depth: "skim" };

/** Resolve a selection into the ordered beats to play. Never empty. */
export function resolvePath(sel: Pick<Selection, "what">): Beat[] {
  const [kind, id] = sel.what.split(":") as [string, string | undefined];
  let out: Beat[];
  if (kind === "phase") {
    // "life now" is today's work plus off hours.
    out = id === "now" ? BEATS.filter((b) => b.year >= 2026) : BEATS.filter((b) => b.phase === id);
  } else if (kind === "thread") {
    out = BEATS.filter((b) => b.threads.includes(id as Thread));
  } else if (kind === "q") {
    const q = QUESTIONS.find((x) => x.id === id);
    out = q ? q.beats.map((bid) => BEATS.find((b) => b.id === bid)).filter((b): b is Beat => !!b) : [];
  } else {
    out = BEATS;
  }
  return out.length ? out : BEATS;
}

export function beatWords(b: Beat, depth: Depth): number {
  const text = depth === "skim" ? b.skim : depth === "read" ? b.read : [...b.deep, b.stuck].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** Reading time for a path at a depth, in minutes, at 200 words a minute. */
export function readingMinutes(beats: Beat[], depth: Depth): number {
  const words = beats.reduce((n, b) => n + beatWords(b, depth), 0);
  return words / 200;
}

export function formatDuration(minutes: number): string {
  const sec = Math.round((minutes * 60) / 10) * 10;
  if (sec < 60) return `${Math.max(10, sec)} sec`;
  return `${Math.max(1, Math.round(minutes))} min`;
}
