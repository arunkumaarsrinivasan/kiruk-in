/**
 * Curated answers for the 2026 pupil: the questions the data files can't
 * answer on their own (opinions, how I work, what's next).
 *
 * DRAFTS, written by restating docs/resume/MASTER-CAREER.md and
 * src/data/about-story.ts, never inventing. Each names its `source`, and
 * `refs` are graph entities the answer leans on (their dots light up).
 *
 * Production serves only APPROVED; DRAFTS is referenced only in dev, so its
 * words never reach the production bundle. To approve one: read it, rewrite
 * it in your own words if it isn't yours, set status "approved" and move it
 * from DRAFTS to APPROVED.
 *
 * Voice: first person, plain, specific. No em dashes. No numbers that
 * MASTER-CAREER §12 marks Hold. Nothing that is Praveen's lane (the idea,
 * CEO, the engine) or the third teammate's (marketing, growth).
 */

export interface Curated {
  id: string;
  /** Ways people ask it. The first is the canonical one. */
  questions: string[];
  answer: string;
  refs: string[];
  source: string;
  status: "draft" | "approved";
}

const DRAFTS: Curated[] = [
  // ── who I am as a designer ──
  {
    id: "design-engineer",
    questions: ["what is a design engineer", "what kind of designer are you", "are you a designer or a developer", "designer or engineer"],
    answer:
      "I'm not a visual designer who hands files over, and I'm not a frontend engineer who colours in tickets. I'm a design engineer: I own the product surface and the system that keeps it honest.",
    refs: ["me:arun", "role:spera-design-lead"],
    source: "MASTER-CAREER §2 Positioning",
    status: "draft",
  },
  {
    id: "one-line",
    questions: ["describe yourself in one line", "your one liner", "sum yourself up", "elevator pitch"],
    answer:
      "Founding Design Engineer and Design Lead at Spera. Brand, design system, frontend, and the workflows that keep them one language. Before that, three years as a UX Design Engineer on HP's Innovation for India team.",
    refs: ["role:spera-design-lead", "role:hp-ux-designer"],
    source: "MASTER-CAREER §3 C. Short",
    status: "draft",
  },
  {
    id: "roles-wanted",
    questions: ["what roles are you looking for", "what kind of job do you want", "what are you open to", "what should i hire you as"],
    answer:
      "Founding, staff or lead design engineer. A product designer who ships. A design lead at an early company. Or an AI-experience designer who can still write production UI.",
    refs: ["me:arun"],
    source: "MASTER-CAREER §2 What he is hiring as",
    status: "draft",
  },
  {
    id: "roles-not",
    questions: ["what are you not", "what roles dont fit you", "would you do pure graphic design", "are you a backend developer"],
    answer: "Not a pure graphic designer, not backend-only, not a \"prompt engineer\", not a generic full-stack developer. Backend is something I ship when the work needs it, not what I lead with.",
    refs: ["skill:spring-boot"],
    source: "MASTER-CAREER §2 What he is not hiring as; §11 Backend (supporting)",
    status: "draft",
  },
  {
    id: "why-hire",
    questions: ["why should i hire you", "why you", "what makes you different", "what do you bring"],
    answer:
      "I take a product from sketch to shipped interface without a handoff in the middle, and I leave behind the system (specs, tokens, checks, a feedback loop) so the next screen isn't a blank canvas.",
    refs: ["role:spera-design-lead", "project:spera-platform"],
    source: "MASTER-CAREER §5 Q1, How he works",
    status: "draft",
  },

  // ── how I work ──
  {
    id: "how-i-work",
    questions: ["how do you work", "your process", "what is your design process", "how do you approach a project"],
    answer: "Sit together, ideate, start from a sketch, then encode it. The encoding is the spec, the token, the audit, the feedback prompt, so the next pass doesn't start from zero.",
    refs: ["role:spera-design-lead"],
    source: "MASTER-CAREER §5 How he works",
    status: "draft",
  },
  {
    id: "normal-week",
    questions: ["what does a normal week look like", "what do you do day to day", "your typical day", "a day in your life at spera"],
    answer:
      "New feature UI. Bugs, plus a skill so the same bug can't happen again. Making the workflow faster. Broken components, feedback-driven fixes, accessibility, stress tests. Then prototype in a dev session and keep the best version.",
    refs: ["role:spera-design-lead"],
    source: "MASTER-CAREER §5 Q2",
    status: "draft",
  },
  {
    id: "ship-then-encode",
    questions: ["how do you stop the same mistake twice", "how do you handle bugs", "what happens after you fix a bug"],
    answer: "Ship a real capability, watch where it rubs, then encode the lesson as a rule, a spec, a test or a workflow, and check it against the rendered product. Then reuse it.",
    refs: ["role:spera-design-lead"],
    source: "MASTER-CAREER §5 Q2 + PDF operating loop",
    status: "draft",
  },
  {
    id: "sketch-first",
    questions: ["do you sketch", "where do your ideas start", "pen and paper or figma", "do you start on paper"],
    answer: "On paper. My school notebooks had more drawings than notes, and I still start from a sketch before anything gets encoded.",
    refs: ["beat:biryani-qa"],
    source: "about-story biryani-qa; MASTER-CAREER §5 How he works",
    status: "draft",
  },
  {
    id: "figma-role",
    questions: ["how do you use figma", "figma or code", "is figma your source of truth", "do you design in figma"],
    answer: "Figma is a mirror, not the source. Specs and the rendered code lead; Figma comes in when a task explicitly asks for it, a few exact frames at a time.",
    refs: ["skill:figma", "role:spera-design-lead"],
    source: "MASTER-CAREER §5 Design-engineering OS: Figma is a mirror",
    status: "draft",
  },
  {
    id: "done-means",
    questions: ["when is a design done", "how do you know it works", "what does done mean to you"],
    answer: "Not when it compiles. When it's been checked on the rendered product: focused tests, the token audit, a look in the browser.",
    refs: ["role:spera-design-lead"],
    source: "MASTER-CAREER §5 Ten systems #5",
    status: "draft",
  },
  {
    id: "feedback-loop",
    questions: ["how do you handle user feedback", "how do bug reports work at spera", "feedback loop"],
    answer:
      "A report captures the actual UI problem: the route, the element, screenshots, steps, console errors. Then it's triaged and turned into a prompt that already carries the right specs and checks. The UX of reporting was designed to improve the UX of fixing.",
    refs: ["role:spera-design-lead"],
    source: "MASTER-CAREER §5 Q1 Feedback as an operator; principles quote",
    status: "draft",
  },
  {
    id: "work-with-devs",
    questions: ["how do you work with developers", "how do you hand off to engineers", "design handoff"],
    answer: "Mostly there is no handoff: I write the frontend. When there is one, as at Square Bridge with a Node.js team, the system does the talking, and it landed at 98% design-to-code accuracy.",
    refs: ["project:square-bridge", "role:sns-square-product-designer"],
    source: "MASTER-CAREER §7 Metrics (98%)",
    status: "draft",
  },
  {
    id: "work-with-me",
    questions: ["what are you like to work with", "are you a team player", "how do you collaborate"],
    answer: "Loud, together, and with a lot of opinions, the way my family talked plans through over chai. Nothing ships straight out of my head. It gets talked through first.",
    refs: ["beat:salem", "beat:family-studio"],
    source: "about-story salem (read + stuck)",
    status: "draft",
  },

  // ── beliefs ──
  {
    id: "philosophy",
    questions: ["your design philosophy", "what do you believe about design", "design principles", "what matters most in design"],
    answer: "An intuitive product from a design-first approach. Interfaces built for decisions: curated layouts, honest colour. And a system behind the screens, so it stays that way.",
    refs: ["role:spera-design-lead"],
    source: "MASTER-CAREER §5 Q7 + principles (Handbook Design book)",
    status: "draft",
  },
  {
    id: "colour-means",
    questions: ["how do you use colour", "what is gold means metered", "colour as meaning"],
    answer: "Colour should mean one thing. In Spera, solid gold says: this costs me something. Paint Save gold and Run and Deploy stop standing out.",
    refs: ["project:spera-platform"],
    source: "MASTER-CAREER §5 principles (gold quotes; product rule, not personal authorship)",
    status: "draft",
  },
  {
    id: "ai-ux",
    questions: ["how do you design for ai", "your view on ai ux", "ai in products", "inspectable ai"],
    answer: "Inspectable, not magic. The assistant proposes before it acts, approval is explicit, and every change it makes can be seen and undone.",
    refs: ["project:spera-platform", "project:hp-print-ai"],
    source: "MASTER-CAREER §5 AI as accountable teammate; Spera bullet 3; §11 AI",
    status: "draft",
  },
  {
    id: "trust",
    questions: ["what was hp print ai really about", "biggest lesson from hp", "what did hp teach you about ai"],
    answer: "Trust, not novelty, was the design problem. The work was translating opaque AI, hardware and cloud logic into flows people could follow and believe.",
    refs: ["project:hp-print-ai", "role:hp-ux-designer"],
    source: "MASTER-CAREER §6 HP Print AI",
    status: "draft",
  },
  {
    id: "design-systems",
    questions: ["why do you care about design systems", "your take on design systems", "what is a design system for"],
    answer: "Visual consistency has to be part of the platform, not a polish pass. Specs, tokens and audits catch drift before review does, so people and agents inherit the same contract.",
    refs: ["project:mudra-ai-stack", "project:spera-platform"],
    source: "MASTER-CAREER §5 Maturation (Mar, May-Jun) + Ten systems #3",
    status: "draft",
  },
  {
    id: "data-viz",
    questions: ["how do you design charts", "data visualization approach", "your approach to dashboards"],
    answer: "Judge, don't just plot. Decision surfaces go through subtractive passes until the verdict lands before the numbers.",
    refs: ["project:spera-platform"],
    source: "MASTER-CAREER §5 Sep row + Spera bullet 4",
    status: "draft",
  },
  {
    id: "dense-ui",
    questions: ["how do you design dense interfaces", "pro tools design", "expert interfaces"],
    answer: "Named type roles, quiet chrome, side rails that stay out of the way, honest performance limits, and reduced motion respected. Dense screens stay readable when every pixel has a job.",
    refs: ["project:spera-platform"],
    source: "MASTER-CAREER §5 Dense workspace",
    status: "draft",
  },
  {
    id: "accessibility",
    questions: ["do you care about accessibility", "accessibility", "wcag"],
    answer: "Yes. Accessibility is on my weekly list at Spera, and I work to WCAG 2.1.",
    refs: ["role:spera-design-lead"],
    source: "MASTER-CAREER §5 Q2 (accessibility) + §11 Design",
    status: "draft",
  },

  // ── favourites and pride ──
  {
    id: "favourite-project",
    questions: ["whats your favourite project", "favorite project", "best project", "best work", "project you are proudest of"],
    answer: "Spera. It's zero-to-one product work and systems work at once: the screens are the product, and the repository is part of the product too.",
    refs: ["project:spera-platform", "role:spera-design-lead"],
    source: "MASTER-CAREER §5 Why this role is the lead story",
    status: "draft",
  },
  {
    id: "proud",
    questions: ["what are you proud of", "proudest moment", "biggest achievement"],
    answer:
      "Owning Spera's idea-to-interface from day one: the logo, the voice, the design system, the frontend, and the workflows that take a sketch, a spec or a feedback screenshot all the way to shipped UI.",
    refs: ["role:spera-design-lead"],
    source: "MASTER-CAREER §2 One sentence (Q1)",
    status: "draft",
  },
  {
    id: "favourite-tools",
    questions: ["favourite tools", "what tools do you love", "your favorite stack", "tools you cant live without"],
    answer: "Paper first. Then Figma, Next.js, TypeScript and Tailwind. GSAP and Three.js when a site should behave like an instrument.",
    refs: ["skill:figma", "tech:next.js", "project:prags-website"],
    source: "MASTER-CAREER §11 (bold skills) + §9 PRAGS",
    status: "draft",
  },
  {
    id: "hardest",
    questions: ["hardest problem you solved", "toughest challenge", "hardest thing you designed"],
    answer: "Making systematic trading approachable without dumbing it down, and designing AI help that speeds people up without hiding their own logic.",
    refs: ["project:spera-platform"],
    source: "portfolio-data spera-platform challenges",
    status: "draft",
  },

  // ── now and next ──
  {
    id: "next",
    questions: ["whats next for you", "what are you working on now", "current focus", "what are you building now"],
    answer: "Right now: the conversation UI in Spera's AI chat, and how it should look and behave alongside MCP UI. Alpha is launching.",
    refs: ["project:spera-platform", "role:spera-design-lead"],
    source: "MASTER-CAREER §5 Q6 + Sep row",
    status: "draft",
  },
  {
    id: "spera-one-line",
    questions: ["explain spera simply", "what does spera do", "spera in one sentence"],
    answer: "A platform to build, backtest, paper trade and deploy crypto strategies without hiring a developer, sharing your edge, or running your own servers.",
    refs: ["project:spera-platform"],
    source: "MASTER-CAREER §5 Product one-liner",
    status: "draft",
  },
  {
    id: "spera-lane",
    questions: ["what do you do at spera", "your part at spera", "did you start spera", "who runs spera"],
    answer: "I'm the Design Lead on a three-person founding team: everything in design and frontend, end to end. Praveen is CEO and leads the product and the idea; our third teammate runs marketing, growth and media.",
    refs: ["role:spera-design-lead"],
    source: "MASTER-CAREER §5 Q8 + Three-person team",
    status: "draft",
  },
  {
    id: "spera-users",
    questions: ["who uses spera", "spera users", "how many people use spera"],
    answer: "Serious traders, met at meetups and showcases. We watch them use it and fold what we see into the next UI pass. No public numbers yet: Alpha is launching.",
    refs: ["project:spera-platform"],
    source: "MASTER-CAREER §5 Q5 + Q6",
    status: "draft",
  },
  {
    id: "logic-deck",
    questions: ["what is the logic deck", "logic deck"],
    answer: "Spera's strategy builder as a vertical pipeline of cards: data, indicator, condition, entry and exit. Traders reason in ordered steps, so the builder reads that way.",
    refs: ["project:spera-platform"],
    source: "MASTER-CAREER §5 Product surfaces: Logic Deck; Maturation decision row",
    status: "draft",
  },

  // ── past chapters ──
  {
    id: "hp-chapter",
    questions: ["what was hp like", "your hp years", "three years at hp", "summary of hp"],
    answer: "Three years as the main design engineer on HP's Innovation for India team: HP Print AI, the Mudra design system, Get my Prints, Print Learn Center and onboarding. Design systems at org scale.",
    refs: ["role:hp-ux-designer", "project:hp-print-ai", "project:mudra-ai-stack"],
    source: "MASTER-CAREER §2 chapter 2 + §6",
    status: "draft",
  },
  {
    id: "nda",
    questions: ["why cant i see hp screens", "nda", "can you show hp work"],
    answer: "HP's internal case visuals are under NDA, so I describe the work and link what's public, like HP Print AI and Print Learn Center, instead of showing screens.",
    refs: ["project:hp-print-ai", "project:hp-print-learn-center"],
    source: "MASTER-CAREER §6 Constraint + Public links",
    status: "draft",
  },
  {
    id: "mudra",
    questions: ["tell me more about mudra", "mudra design system story"],
    answer: "Mudra is the design system and branding for HP's internal AI stack, built in Figma and Next.js. 500+ employees use it, with generative prompts for text-to-image assets inside the stack.",
    refs: ["project:mudra-ai-stack", "metric:design-system"],
    source: "MASTER-CAREER §6 HP bullet 2",
    status: "draft",
  },
  {
    id: "square-bridge-story",
    questions: ["square bridge story", "what happened at square bridge", "tell me about leading designers"],
    answer: "I set the UX strategy for a student recruitment platform across students, recruiters and placement officers, led three designers, and built one system of 150+ screens. Research with 200+ candidates led to a Portfolio Builder that lifted engagement 45%.",
    refs: ["project:square-bridge", "role:sns-square-product-designer", "metric:engagement"],
    source: "MASTER-CAREER §7 Recommended bullets + Metrics",
    status: "draft",
  },
  {
    id: "maker-years",
    questions: ["what did you do in college", "freelance years", "maker years"],
    answer: "2020 to 2023: freelance branding and product design while finishing Computer Science, an interaction design internship, my first case studies (Foodies Buddies, Desirable), and workshops for 100+ students.",
    refs: ["role:freelance-general", "project:foodies-buddies", "project:desirable", "education:engineering"],
    source: "MASTER-CAREER §2 chapter 1",
    status: "draft",
  },
  {
    id: "teaching",
    questions: ["do you teach", "have you mentored", "workshops", "mentoring students"],
    answer: "Yes. UX and UI workshops and guest lectures for 100+ students, plus Bangalore meetups and the design community.",
    refs: ["beat:systems-teaching"],
    source: "MASTER-CAREER §9 Teaching",
    status: "draft",
  },
  {
    id: "cs-degree",
    questions: ["does your cs degree help", "why computer science", "engineering background"],
    answer: "The CS foundation is real: algorithms, systems, networks. It's why I could ship Spring Boot as an intern at HP, and why design engineering at Spera can live in the repository.",
    refs: ["education:engineering"],
    source: "MASTER-CAREER §10 Education",
    status: "draft",
  },
  {
    id: "games-made",
    questions: ["have you made games", "your games", "play store games"],
    answer: "Yes. During lockdown my cousin and I made mobile games and put them on the Play Store.",
    refs: ["beat:playlab"],
    source: "about-story playlab skim; MASTER-CAREER §9 Games",
    status: "draft",
  },
  {
    id: "jobism",
    questions: ["what is jobism", "side projects", "open source work"],
    answer: "JOBISM is my local-first AI job search assistant: it finds roles, tailors resumes and cover letters, drafts outreach, and tracks it all from Gmail. Systems thinking pointed at my own job hunt.",
    refs: [],
    source: "MASTER-CAREER §9 JOBISM",
    status: "draft",
  },

  // ── this site ──
  {
    id: "this-site",
    questions: ["why does this site have eras", "why build a portfolio like this", "what is this website"],
    answer: "I wondered what my portfolio would look like if I'd made it in 1970, or 1995, or 2013. We are many things, so the site is too. You don't know best. You know one.",
    refs: ["project:portfolio-v3", "beat:off-hours"],
    source: "about-story off-hours deep + stuck",
    status: "draft",
  },
  {
    id: "the-pupil",
    questions: ["why a dot", "why is 2026 just a pupil", "what is this dot", "how does this site work"],
    answer: "2026 has no interface on purpose. You ask, the pupil looks through everything I've written down about my work and life, and answers only from that. The rings are a map of me: every dot is one real thing.",
    refs: ["project:portfolio-v3"],
    source: "2026 era concept (pupil-2026-decision); this one is new, please rewrite in your words",
    status: "draft",
  },

  // ── life ──
  {
    id: "off-hours",
    questions: ["what do you do outside work", "hobbies", "what do you do on weekends"],
    answer: "Mountains, a ukulele, the weirdest thing on the menu, and this site.",
    refs: ["beat:off-hours"],
    source: "about-story off-hours",
    status: "draft",
  },
  {
    id: "family-influence",
    questions: ["how did your family shape you", "where does your design come from", "your roots"],
    answer: "A joint family of about thirty people in Salem. The women made things with their hands, the men talked their ventures through over chai. I sat in both rooms. Now I'd call it a studio with a kitchen attached.",
    refs: ["beat:salem", "beat:family-studio"],
    source: "about-story salem deep",
    status: "draft",
  },
];

/** Answers in your own words. Move entries here from DRAFTS. */
const APPROVED: Curated[] = [];

/** Production serves only approved answers; drafts never reach the bundle. */
export const CURATED: Curated[] = process.env.NODE_ENV === "production" ? APPROVED : [...APPROVED, ...DRAFTS];
