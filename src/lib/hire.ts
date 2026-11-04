/**
 * Hiring facts — for people who search a role, not a name: employers,
 * recruiters and businesses looking for a design engineer, design
 * technologist, creative developer, product designer who codes, or a
 * freelance design consultant. Shown on /hire, in /llms.txt and in the
 * Person schema. Every claim below is drawn from the about story and the
 * portfolio data; keep them in step with src/lib/identity.ts.
 */
import { IDENTITY, PERSON_ID } from "./identity";
import { SITE_URL } from "./site";

export const HIRE_PATH = "/hire";
export const HIRE_URL = `${SITE_URL}${HIRE_PATH}`;
export const SERVICES_ID = `${HIRE_URL}#services`;

/** The role names people search, each answered in his own work. */
export const HIRE_ROLES: { id: string; title: string; definition: string; asHim: string }[] = [
  {
    id: "design-engineer",
    title: "Design engineer",
    definition:
      "A design engineer designs a product's interface and builds it in production code, so nothing is lost between the mock-up and what ships.",
    asHim:
      "Arun has worked this way since 2023: the main UX design engineer on HP's Innovation for India team, then founding design engineer at Spera.bot, where he leads design and the Next.js frontend end to end.",
  },
  {
    id: "design-technologist",
    title: "Design technologist",
    definition:
      "A design technologist sits between design and engineering: prototypes that run, design systems in code, and the tooling that lets a team ship design faster.",
    asHim:
      "He built Mudra, HP's internal design system in Figma and Next.js used by 500+ employees, and at Spera a feedback loop that turns an in-app UI report into a prompt wired to the team's specs.",
  },
  {
    id: "creative-developer",
    title: "Creative developer",
    definition:
      "A creative developer builds expressive, interactive web experiences, such as 3D, motion, sound and shaders, that still load fast.",
    asHim:
      "kiruk.in opens on a realistic 3D eye written in Three.js TSL for WebGPU and drawn from a Web Worker. He also built prahatheesvar.in, a scroll-to-play instrument site in Three.js, Howler.js and GSAP.",
  },
  {
    id: "product-designer-who-codes",
    title: "Product designer who codes",
    definition:
      "A product designer who codes does the research, flows and UI, then builds the real thing instead of handing off a file.",
    asHim:
      "On Square Bridge he led three designers across 150+ screens tested with 200+ people; its Portfolio Builder raised student engagement 45% and shipped at 98% design-to-code accuracy.",
  },
  {
    id: "freelance-design-consultant",
    title: "Freelance design consultant for creative work",
    definition:
      "A freelance design consultant joins for a project or a fixed time: product and brand direction, creative websites, design reviews or a design system, handed over in a state the team can run.",
    asHim:
      "He has freelanced since 2018, for studios, resorts and musicians, wrote his first design systems for clients, and has taught UX to 100+ students.",
  },
];

export const ENGAGEMENTS: { id: string; title: string; text: string }[] = [
  {
    id: "freelance",
    title: "Freelance projects",
    text: "A fixed scope with a clear end: a creative or marketing website, a product's UX and UI, a Three.js experience, a design system or a design audit. Remote, for businesses in India and abroad.",
  },
  {
    id: "contract",
    title: "Contract and part-time",
    text: "Embedded in your team for a set number of weeks, or a few days a week, as design engineer or design technologist, working in your Figma, repo and rituals.",
  },
  {
    id: "full-time",
    title: "Full-time roles",
    text: "Open to conversations about full-time design engineer, design technologist, creative developer and senior product designer roles, remote or in Bengaluru.",
  },
];

export const SERVICES: { name: string; detail: string }[] = [
  { name: "Product and UX design", detail: "research, flows, wireframes and UI" },
  { name: "Design systems", detail: "components and design tokens, in Figma and in code" },
  { name: "Front-end engineering", detail: "React, Next.js and TypeScript, production-ready" },
  { name: "Creative and interactive websites", detail: "Three.js, WebGPU, WebGL shaders, motion and sound" },
  { name: "AI product UX", detail: "chat, agent and MCP interfaces people trust" },
  { name: "Working prototypes", detail: "for user testing and for pitching" },
  { name: "Brand identity", detail: "logo, voice and visual direction for products" },
  { name: "Design consulting", detail: "design reviews, UX audits and design-engineering process" },
];

export const HIRE_TERMS = {
  timezone: "IST (GMT+5:30), with overlap for Europe and US mornings",
  response: "Replies within 24 hours",
  where: "Remote from Bengaluru, India, for clients in India and abroad",
} as const;

const role = (id: string) => HIRE_ROLES.find((r) => r.id === id)!;

export function hireFaqs(): { q: string; a: string }[] {
  return [
    {
      q: "Can I hire Arun Kumaar Sreenivasan as a freelance design engineer?",
      a: `Yes. He takes freelance projects and contract work as a design engineer, design technologist, creative developer and product designer who codes. ${HIRE_TERMS.where}. ${HIRE_TERMS.response}.`,
    },
    {
      q: "Is Arun Kumaar Sreenivasan open to full-time roles?",
      a: ENGAGEMENTS.find((e) => e.id === "full-time")!.text,
    },
    {
      q: "What is the difference between a design engineer and a creative developer?",
      a: "A design engineer owns a product's interface from design to production code. A creative developer builds expressive web experiences such as 3D, motion and sound. Arun works as both: product interfaces at HP and Spera.bot, and Three.js and WebGPU work like the kiruk.in eye.",
    },
    {
      q: "What does a design technologist do?",
      a: `${role("design-technologist").definition} ${role("design-technologist").asHim}`,
    },
    {
      q: "Who is a Three.js creative developer in India I can hire?",
      a: `Arun Kumaar Sreenivasan, a design engineer and creative developer in Bengaluru. ${role("creative-developer").asHim}`,
    },
    {
      q: "Does he work with clients outside India?",
      a: `Yes. ${HIRE_TERMS.where}. Time zone: ${HIRE_TERMS.timezone}.`,
    },
    {
      q: "How do I start a project or a hiring conversation?",
      a: `Email ${IDENTITY.email} or use ${SITE_URL}/contact with what you need, the timeline, and whether it is freelance, contract or full-time. ${HIRE_TERMS.response}.`,
    },
  ];
}

/** The services as schema.org, offered by the Person (linked from Person.makesOffer). */
export function servicesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": SERVICES_ID,
    name: `Design engineering services by ${IDENTITY.name}`,
    itemListElement: SERVICES.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.name,
        description: `${s.name}: ${s.detail}.`,
        provider: { "@id": PERSON_ID },
        areaServed: [
          { "@type": "Country", name: "India" },
          { "@type": "Place", name: "Worldwide" },
        ],
        availableChannel: { "@type": "ServiceChannel", serviceUrl: `${SITE_URL}/contact` },
      },
    })),
  };
}
