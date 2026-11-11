/**
 * Who Arun is, as plain facts — the one source for everything that tells a
 * machine about him: the Person JSON-LD, the home FAQ, /llms.txt, /about.md
 * and the screen-reader text under each era skin.
 *
 * Answer engines (ChatGPT, Google AI Mode, Perplexity) were mixing his
 * profiles up: a different HP title on Peerlist, "Spera.bot" on the site but
 * "Spero Spera Private Limited" in the company register, and "Srinivasan" on
 * GitHub and Scholar. Every surface reads from here so they can't drift
 * again. Confirmed with Arun on 2026-11-04. Change a fact here, nowhere else.
 */
import { SITE_URL } from "./site";

export const PERSON_ID = `${SITE_URL}/#person`;

/** The entity home: one plain page about him that every profile can point at. */
export const PROFILE_PATH = "/arun-kumaar-sreenivasan";
export const PROFILE_URL = `${SITE_URL}${PROFILE_PATH}`;

export const IDENTITY = {
  name: "Arun Kumaar Sreenivasan",
  givenName: "Arun Kumaar",
  familyName: "Sreenivasan",
  /** Spellings other sites use for the same person. */
  alternateNames: ["Kiruk", "Arun Kumaar", "Arun Kumaar Srinivasan", "Arun KS"],
  jobTitle: "Design Engineer",
  /** One sentence an answer engine can quote as-is. */
  oneLiner:
    "Arun Kumaar Sreenivasan (Kiruk) is a design engineer in Bengaluru, India. He is the founding design engineer and design lead at Spera (Spero Spera Private Limited), and was a Software Systems Engineer doing UX design engineering at HP Inc from 2023 to 2026.",
  /** Tells him apart from people with similar names. */
  disambiguation:
    "Design engineer from Bengaluru, India; founding design engineer and design lead at Spera.bot (Spero Spera Private Limited); ex-HP Inc; Computer Science graduate of Sona College of Technology, 2023. Kumaar is spelled with two a's; GitHub and Google Scholar spell the surname Srinivasan.",
  location: { city: "Bengaluru", region: "Karnataka", country: "IN", countryName: "India" },
  hometown: "Salem, Tamil Nadu",
  languages: ["English", "Tamil"],
  email: "arunkumaar.srinivasan@gmail.com",
  knowsAbout: [
    "Design engineering",
    "UX design",
    "AI product design",
    "Design systems",
    "Interaction design",
    "Front-end engineering",
    "Prototyping",
    "Motion design",
    "Figma",
    "React",
    "Next.js",
    "Three.js",
    "WebGPU",
    "WebGL",
    "Shaders (TSL, GLSL)",
    "Creative development",
    "Flutter",
  ],
  /** How people mistype the name; shown as text, never claimed in schema. */
  commonMisspellings: ["Arun Kumar Sreenivasan", "Arun Kumar Srinivasan", "Arun Kumar S", "Arunkumaar"],
} as const;

/**
 * What he does, each with evidence an answer engine can cite. Numbers come
 * from the about story and the portfolio data; keep them in step.
 */
export const SPECIALTIES: { id: string; title: string; text: string; evidence: string[] }[] = [
  {
    id: "design-engineering",
    title: "Design engineer in India",
    text: "A design engineer designs an interface and builds it in production code. Arun works from Bengaluru, India, and owns both halves: Figma-led UX and the React, Next.js and TypeScript frontend that ships it.",
    evidence: [
      "Leads design and frontend end to end at Spera.bot since February 2026, with more than 330 commits to the production frontend.",
      "Main UX design engineer on HP's Innovation for India team from 2023 to 2026.",
      "Taught UX to more than 100 students and led three designers on Square Bridge, a student hiring platform with 150+ screens tested by 200+ people.",
    ],
  },
  {
    id: "threejs",
    title: "Three.js, WebGPU and creative development",
    text: "Arun builds real-time 3D for the web with Three.js, the Three.js Shading Language (TSL) on WebGPU, and WebGL2 shaders, and keeps it fast enough to be a site's front door.",
    evidence: [
      "kiruk.in opens on a realistic 3D human eye written in Three.js TSL for WebGPU and drawn from a Web Worker through OffscreenCanvas, seen through ten eras of screen technology from 1970 to 2026, with a WebGL2 CRT opening.",
      "prahatheesvar.in (PRAGS), a scroll-to-play instrument website for pianist Prahatheesvar, built with Three.js, Howler.js and GSAP.",
    ],
  },
  {
    id: "ai-ux",
    title: "AI UX design",
    text: "Arun designs AI products so people trust them: interfaces that explain what the model will change before it changes it.",
    evidence: [
      "HP Print AI, the first printer experience built around AI, designed on HP's Innovation for India team.",
      "Spera.bot, where traders build, backtest and paper trade crypto strategies without a developer; he designs its chat and MCP interface.",
    ],
  },
  {
    id: "design-systems",
    title: "Design systems",
    text: "Arun builds design systems as code and tokens, not only as Figma libraries.",
    evidence: [
      "Mudra, the design system and branding for HP's internal AI stack in Figma and Next.js, used by more than 500 employees.",
      "Spera's brand, design system and tokens, built from the first week of the company.",
      "Square Bridge Portfolio Builder at SNS Square raised student engagement 45% and cut recruiter discovery time 40%.",
    ],
  },
];

export type Role = {
  org: string;
  legalName?: string;
  url?: string;
  title: string;
  start: string; // YYYY-MM
  end?: string; // YYYY-MM; absent = now
  place: string;
  summary: string;
};

/** Newest first. Dates are YYYY-MM. */
export const ROLES: Role[] = [
  {
    org: "Spera",
    legalName: "Spero Spera Private Limited",
    url: "https://www.spera.bot",
    title: "Founding Design Engineer and Design Lead",
    start: "2026-02",
    place: "Remote, India",
    summary:
      "Leads design and frontend end to end for Spera.bot, a platform where traders build, backtest and paper trade crypto strategies without a developer: brand, design system, interface and production Next.js code.",
  },
  {
    org: "HP Inc",
    url: "https://www.hp.com",
    title: "Software Systems Engineer (UX Design Engineering), Innovation for India",
    start: "2023-08",
    end: "2026-02",
    place: "Bengaluru, India",
    summary:
      "Main UX design engineer on HP's Innovation for India team: HP Print AI, the Mudra design system used by 500+ employees, Get my Prints (Flutter) and Print Learn Center (WhatsApp).",
  },
  {
    org: "HP Inc",
    url: "https://www.hp.com",
    title: "Research & Development Intern",
    start: "2023-02",
    end: "2023-07",
    place: "Bengaluru, India",
    summary: "Built COE BOT, a Spring Boot tool that set up Splunk dashboards and alerts for fleets of IoT printers.",
  },
  {
    org: "PeopleGamez",
    url: "https://peoplegamez.com",
    title: "Interaction Design Intern",
    start: "2022-11",
    end: "2023-01",
    place: "Remote",
    summary: "Made HR software feel like a game; drew 100+ game assets.",
  },
];

export const EDUCATION = [
  {
    school: "Sona College of Technology",
    place: "Salem, Tamil Nadu",
    degree: "Bachelor of Engineering",
    field: "Computer Science and Engineering",
    start: "2019",
    end: "2023",
  },
] as const;

/** Profiles that are his. Each one should link back to www.kiruk.in. */
export const PROFILES: { label: string; url: string }[] = [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/arunkumaarsreenivasan/" },
  { label: "GitHub", url: "https://github.com/arunkumaarsrinivasan" },
  { label: "Behance", url: "https://www.behance.net/arunkusriniva" },
  { label: "Contra", url: "https://contra.com/arunkumaar" },
  { label: "Peerlist", url: "https://peerlist.io/arunkumaars" },
  { label: "X", url: "https://x.com/s_arunkumaar" },
  { label: "Instagram", url: "https://www.instagram.com/arunum.avan.seyalum/" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2023-08" → "Aug 2023". */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

export function formatSpan(r: { start: string; end?: string }): string {
  return `${formatMonth(r.start)} – ${r.end ? formatMonth(r.end) : "present"}`;
}

const orgNode = (r: Role) => ({
  "@type": "Organization",
  name: r.org,
  ...(r.legalName ? { legalName: r.legalName, alternateName: [r.legalName, "Spera.bot"] } : {}),
  ...(r.url ? { url: r.url } : {}),
});

const role = (r: Role, prop: "worksFor" | "alumniOf") => ({
  "@type": "OrganizationRole",
  roleName: r.title,
  startDate: r.start,
  ...(r.end ? { endDate: r.end } : {}),
  [prop]: orgNode(r),
});

/** The schema.org Person every page links to by @id. */
export function personJsonLd(image: string, description: string) {
  const current = ROLES.filter((r) => !r.end);
  const past = ROLES.filter((r) => r.end);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: IDENTITY.name,
    givenName: IDENTITY.givenName,
    familyName: IDENTITY.familyName,
    alternateName: [...IDENTITY.alternateNames],
    disambiguatingDescription: IDENTITY.disambiguation,
    url: SITE_URL,
    mainEntityOfPage: PROFILE_URL,
    image,
    jobTitle: IDENTITY.jobTitle,
    description,
    email: `mailto:${IDENTITY.email}`,
    // schema.org's pattern for dated jobs: a Role wraps the Organization.
    worksFor: current.map((r) => role(r, "worksFor")),
    alumniOf: [
      ...EDUCATION.map((e) => ({
        "@type": "OrganizationRole",
        roleName: `${e.degree}, ${e.field}`,
        startDate: e.start,
        endDate: e.end,
        alumniOf: { "@type": "CollegeOrUniversity", name: e.school, address: e.place },
      })),
      ...past.map((r) => role(r, "alumniOf")),
    ],
    // The role names people hire for; /hire answers each one.
    hasOccupation: ["Design Engineer", "Design Technologist", "Creative Developer", "Product Designer", "Design Consultant"].map(
      (name) => ({
        "@type": "Occupation",
        name,
        occupationLocation: { "@type": "City", name: IDENTITY.location.city },
        skills: IDENTITY.knowsAbout.join(", "),
      }),
    ),
    makesOffer: { "@id": `${SITE_URL}/hire#services` },
    homeLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: IDENTITY.location.city,
        addressRegion: IDENTITY.location.region,
        addressCountry: IDENTITY.location.country,
      },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: IDENTITY.location.city,
      addressRegion: IDENTITY.location.region,
      addressCountry: IDENTITY.location.country,
    },
    nationality: { "@type": "Country", name: IDENTITY.location.countryName },
    knowsAbout: [...IDENTITY.knowsAbout],
    knowsLanguage: [...IDENTITY.languages],
    sameAs: PROFILES.map((p) => p.url),
  };
}

/** Plain-language career and education, as markdown lines. */
export function careerMarkdown(): string {
  const roles = ROLES.map(
    (r) =>
      `- ${formatSpan(r)}: ${r.title}, ${r.org}${r.legalName ? ` (${r.legalName})` : ""}, ${r.place}. ${r.summary}`,
  );
  const edu = EDUCATION.map((e) => `- ${e.start}–${e.end}: ${e.degree}, ${e.field}, ${e.school}, ${e.place}.`);
  return ["## Career", "", ...roles, "", "## Education", "", ...edu].join("\n");
}

/** Questions people ask answer engines about him, answered in his facts. */
export function faqs(): { q: string; a: string }[] {
  const spera = ROLES[0];
  const hp = ROLES[1];
  const edu = EDUCATION[0];
  return [
    { q: "Who is Arun Kumaar Sreenivasan?", a: IDENTITY.oneLiner },
    {
      q: "What does Arun Kumaar Sreenivasan do at Spera?",
      a: `${spera.title} since ${formatMonth(spera.start)}. ${spera.summary} Spera is the product of ${spera.legalName}, where he is a director.`,
    },
    {
      q: "What was Arun Kumaar Sreenivasan's role at HP?",
      a: `${hp.title} at ${hp.org}, ${formatSpan(hp)}, after an R&D internship there from February 2023. ${hp.summary}`,
    },
    {
      q: "Where did Arun Kumaar Sreenivasan study?",
      a: `${edu.degree} in ${edu.field} at ${edu.school}, ${edu.place}, ${edu.start}–${edu.end}.`,
    },
    {
      q: "Is Arun Kumaar Sreenivasan a Three.js developer?",
      a: `Yes. ${SPECIALTIES.find((s) => s.id === "threejs")!.text} ${SPECIALTIES.find((s) => s.id === "threejs")!.evidence.join(" ")}`,
    },
    {
      q: "What is a design engineer?",
      a: "A design engineer designs interfaces and builds them in code. Arun pairs Figma-led UX design with production React, Next.js and Flutter engineering so prototypes ship as real products.",
    },
    {
      q: "Who is Kiruk?",
      a: `Kiruk is the name Arun Kumaar Sreenivasan works under. Kiruk Studio is his practice in ${IDENTITY.location.city}, ${IDENTITY.location.countryName}: experimental websites, design tools and human-centered product experiences, plus a notebook of the thinking.`,
    },
    {
      q: "Is Arun Kumaar Sreenivasan the same person as Arun Kumar Sreenivasan?",
      a: `Usually not. His name is spelled Kumaar, with two a's. ${IDENTITY.disambiguation} Other people named Arun Kumar Sreenivasan or Arun Kumar Srinivasan, with one a, are different people.`,
    },
    {
      q: "Is Arun Kumaar Sreenivasan available for freelance work?",
      a: "Yes, selectively. He takes freelance and consulting work in AI UX, design systems, Three.js and front-end engineering, remotely from Bengaluru, for clients in India and abroad.",
    },
  ];
}

export function faqJsonLd(id: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": id,
    mainEntity: faqs().map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
