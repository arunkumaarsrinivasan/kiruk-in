import type { Metadata } from "next";
import Link from "next/link";
import {
  EDUCATION,
  IDENTITY,
  PERSON_ID,
  PROFILE_PATH,
  PROFILE_URL,
  PROFILES,
  ROLES,
  SPECIALTIES,
  faqJsonLd,
  faqs,
  formatSpan,
} from "@/lib/identity";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

/**
 * The entity home: one plain, server-rendered page that says who Arun is,
 * for people who search his name and for the answer engines that read the
 * page for them. Every fact comes from src/lib/identity.ts. It wears the
 * active era's tokens like /work, but it is a document first: no skin, no
 * client-only content, nothing a crawler without JavaScript would miss.
 */

const TITLE = "Arun Kumaar Sreenivasan — Design Engineer, Bengaluru, India";
const DESCRIPTION =
  "Arun Kumaar Sreenivasan (Kiruk): design engineer in Bengaluru, India. Founding design engineer and design lead at Spera.bot, ex-HP Inc. AI UX, design systems, React, Three.js and WebGPU.";
const UPDATED = "2026-11-04";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PROFILE_PATH },
  openGraph: {
    type: "profile",
    url: PROFILE_URL,
    title: TITLE,
    description: DESCRIPTION,
    firstName: IDENTITY.givenName,
    lastName: IDENTITY.familyName,
    username: "kiruk",
    images: [SHARE_IMAGE],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${PROFILE_URL}#page`,
  url: PROFILE_URL,
  name: TITLE,
  description: DESCRIPTION,
  dateModified: UPDATED,
  inLanguage: "en-IN",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": PERSON_ID },
  mainEntity: { "@id": PERSON_ID },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: IDENTITY.name, item: PROFILE_URL },
  ],
};

const muted = { color: "var(--text-muted)" } as const;
const heading = { fontFamily: "var(--font-heading)", color: "var(--text-main)" } as const;
const rule = { borderColor: "var(--border-color)" } as const;

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t pt-8 mt-10" style={rule}>
      <h2 id={`${id}-h`} className="text-xl font-bold sm:text-2xl" style={heading}>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed sm:text-base">{children}</div>
    </section>
  );
}

export default function ArunKumaarSreenivasan() {
  const json = [profilePageJsonLd, breadcrumbJsonLd, faqJsonLd(`${PROFILE_URL}#faq`)];
  return (
    <>
      {json.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
      <div
        className="relative z-10 min-h-dvh"
        style={{
          backgroundColor: "var(--bg-main)",
          color: "var(--text-main)",
          paddingTop: "var(--simple-game-nav-bottom, 4.5rem)",
        }}
      >
        <article className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6" data-blueprint="entity-home">
          <nav aria-label="Breadcrumb" className="text-sm" style={muted}>
            <Link href="/" className="site-crumb-link underline decoration-dotted underline-offset-4">
              Home
            </Link>{" "}
            / {IDENTITY.name}
          </nav>

          <header className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--accent-color)" }}>
              Design engineer · {IDENTITY.location.city}, {IDENTITY.location.countryName}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl" style={heading}>
              {IDENTITY.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed">{IDENTITY.oneLiner}</p>
            <p className="mt-3 text-sm" style={muted}>
              Also known as Kiruk. Often typed as {IDENTITY.commonMisspellings.slice(0, 3).join(", ")}: the name is
              spelled Kumaar, with two a&apos;s. Updated <time dateTime={UPDATED}>4 November 2026</time>.
            </p>
          </header>

          <Section id="facts" title="Quick facts">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
              <dt style={muted}>Role</dt>
              <dd>{IDENTITY.jobTitle}</dd>
              <dt style={muted}>Works as</dt>
              <dd>
                Design engineer, design technologist, creative developer, product designer who codes and freelance
                design consultant.{" "}
                <Link href="/hire" className="underline underline-offset-4">
                  Freelance, contract or full-time
                </Link>
              </dd>
              <dt style={muted}>Now</dt>
              <dd>
                {ROLES[0].title}, <a href={ROLES[0].url} className="underline underline-offset-4">Spera.bot</a> (
                {ROLES[0].legalName}), since February 2026
              </dd>
              <dt style={muted}>Before</dt>
              <dd>
                {ROLES[1].title}, {ROLES[1].org}, {formatSpan(ROLES[1])}
              </dd>
              <dt style={muted}>Education</dt>
              <dd>
                {EDUCATION[0].degree}, {EDUCATION[0].field}, {EDUCATION[0].school}, {EDUCATION[0].start}–{EDUCATION[0].end}
              </dd>
              <dt style={muted}>Based in</dt>
              <dd>
                {IDENTITY.location.city}, {IDENTITY.location.countryName}. From {IDENTITY.hometown}. Works remotely.
              </dd>
              <dt style={muted}>Languages</dt>
              <dd>{IDENTITY.languages.join(", ")}</dd>
              <dt style={muted}>Works with</dt>
              <dd>{IDENTITY.knowsAbout.join(", ")}</dd>
            </dl>
          </Section>

          <Section id="what" title="What he does">
            {SPECIALTIES.map((s) => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <h3 className="mt-6 text-lg font-bold" style={heading}>
                  {s.title}
                </h3>
                <p className="mt-2">{s.text}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {s.evidence.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          <Section id="career" title="Career">
            <ol className="space-y-5">
              {ROLES.map((r) => (
                <li key={`${r.org}-${r.start}`}>
                  <p className="font-bold" style={heading}>
                    {r.title}
                  </p>
                  <p style={muted}>
                    {r.org}
                    {r.legalName ? ` (${r.legalName})` : ""} · {r.place} · {formatSpan(r)}
                  </p>
                  <p className="mt-1">{r.summary}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="education" title="Education">
            {EDUCATION.map((e) => (
              <p key={e.school}>
                {e.degree} in {e.field}, {e.school}, {e.place}, {e.start}–{e.end}.
              </p>
            ))}
          </Section>

          <Section id="work" title="Selected work">
            <p>
              Case studies for Spera.bot, HP Print AI, the Mudra design system, Square Bridge and PeopleGamez are on the{" "}
              <Link href="/work" className="underline underline-offset-4">
                work page
              </Link>
              . His story, from Salem to Spera, is in the{" "}
              <Link href="/#about" className="underline underline-offset-4">
                About box on the home page
              </Link>{" "}
              and{" "}
              <a href="/about.md" className="underline underline-offset-4">
                as plain markdown
              </a>
              . Essays live in the{" "}
              <Link href="/notebook" className="underline underline-offset-4">
                notebook
              </Link>
              .
            </p>
          </Section>

          <Section id="faq" title="Questions people ask">
            {faqs().map((f) => (
              <div key={f.q}>
                <h3 className="font-bold" style={heading}>
                  {f.q}
                </h3>
                <p className="mt-1">{f.a}</p>
              </div>
            ))}
          </Section>

          <Section id="profiles" title="Profiles and contact">
            <ul className="space-y-1">
              <li>
                Email: <a href={`mailto:${IDENTITY.email}`} className="underline underline-offset-4">{IDENTITY.email}</a>
              </li>
              {PROFILES.map((p) => (
                <li key={p.url}>
                  {p.label}:{" "}
                  <a href={p.url} rel="me" className="underline underline-offset-4">
                    {p.url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              For freelance, contract or full-time work, see{" "}
              <Link href="/hire" className="underline underline-offset-4">
                how to hire him
              </Link>{" "}
              or use the{" "}
              <Link href="/contact" className="underline underline-offset-4">
                contact page
              </Link>
              .
            </p>
          </Section>
        </article>
      </div>
    </>
  );
}
