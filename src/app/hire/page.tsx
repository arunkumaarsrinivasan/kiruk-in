import type { Metadata } from "next";
import Link from "next/link";
import { DocFaq, DocHeader, DocPage, DocSection, JsonLd, docHeading, docLink, docMuted } from "@/components/seo/DocPage";
import { ENGAGEMENTS, HIRE_PATH, HIRE_ROLES, HIRE_TERMS, HIRE_URL, SERVICES, hireFaqs, servicesJsonLd } from "@/lib/hire";
import { IDENTITY, PERSON_ID, PROFILE_PATH } from "@/lib/identity";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

/**
 * /hire — for people who search a role, not a name. One page that answers
 * "design engineer", "design technologist", "creative developer", "product
 * designer who codes" and "freelance design consultant" for India, with the
 * ways to work together (freelance, contract, full-time) and the proof.
 * Facts come from src/lib/hire.ts and src/lib/identity.ts.
 */

const TITLE = "Hire a Design Engineer & Creative Developer in India | Kiruk";
const DESCRIPTION =
  "Freelance, contract or full-time design engineer, design technologist, creative developer and product designer who codes in Bengaluru, India. Three.js, React.";
const UPDATED = "2026-11-04";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: HIRE_PATH },
  openGraph: { type: "website", url: HIRE_URL, title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${HIRE_URL}#page`,
  url: HIRE_URL,
  name: TITLE,
  description: DESCRIPTION,
  dateModified: UPDATED,
  inLanguage: "en-IN",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": PERSON_ID },
  mainEntity: { "@id": `${HIRE_URL}#services` },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Hire", item: HIRE_URL },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${HIRE_URL}#faq`,
  mainEntity: hireFaqs().map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function Hire() {
  return (
    <>
      <JsonLd data={[pageJsonLd, breadcrumbJsonLd, servicesJsonLd(), faqJsonLd]} />
      <DocPage crumb="Hire" blueprint="hire">
        <DocHeader
          kicker={`Freelance · Contract · Full-time · ${IDENTITY.location.city}, ${IDENTITY.location.countryName}`}
          title="Hire a design engineer, creative developer and product designer who codes"
        >
          <p className="mt-4 text-lg leading-relaxed">
            I&apos;m{" "}
            <Link href={PROFILE_PATH} className={docLink}>
              {IDENTITY.name}
            </Link>{" "}
            (Kiruk), a design engineer in Bengaluru, India. I design the interface and build it in production code,
            from product UX and design systems to Three.js and WebGPU experiences. I take freelance projects and
            contract work, and I&apos;m open to full-time roles.
          </p>
          <p className="mt-3 text-sm" style={docMuted}>
            {HIRE_TERMS.where}. {HIRE_TERMS.response}. Time zone {HIRE_TERMS.timezone}.
          </p>
          <p className="mt-5">
            <Link href="/contact" className={`${docLink} font-bold`} style={{ color: "var(--accent-color)" }}>
              Start a conversation →
            </Link>{" "}
            <span style={docMuted}>
              or email <a href={`mailto:${IDENTITY.email}`} className={docLink}>{IDENTITY.email}</a>
            </span>
          </p>
        </DocHeader>

        <DocSection id="roles" title="Roles I work in">
          {HIRE_ROLES.map((r) => (
            <div key={r.id} id={r.id} className="scroll-mt-24">
              <h3 className="mt-6 text-lg font-bold" style={docHeading}>
                {r.title}
              </h3>
              <p className="mt-2">{r.definition}</p>
              <p className="mt-2">{r.asHim}</p>
            </div>
          ))}
        </DocSection>

        <DocSection id="engagements" title="Ways to work together">
          {ENGAGEMENTS.map((e) => (
            <div key={e.id} id={e.id} className="scroll-mt-24">
              <h3 className="font-bold" style={docHeading}>
                {e.title}
              </h3>
              <p className="mt-1">{e.text}</p>
            </div>
          ))}
        </DocSection>

        <DocSection id="services" title="What I can do for you">
          <ul className="list-disc space-y-1 pl-5">
            {SERVICES.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>: {s.detail}
              </li>
            ))}
          </ul>
        </DocSection>

        <DocSection id="proof" title="Proof">
          <ul className="list-disc space-y-1 pl-5">
            <li>HP Print AI, the first printer experience built around AI (HP Inc, Innovation for India).</li>
            <li>Mudra, HP&apos;s internal design system in Figma and Next.js, used by 500+ employees.</li>
            <li>Square Bridge Portfolio Builder: student engagement up 45%, recruiter discovery time down 40%.</li>
            <li>Spera.bot: brand, design system and production frontend since February 2026, 330+ commits.</li>
            <li>15+ hackathon solutions at HP; UX taught to 100+ students.</li>
            <li>kiruk.in itself: a 3D eye in Three.js TSL on WebGPU, seen through ten eras of screens.</li>
          </ul>
          <p>
            Case studies are on the{" "}
            <Link href="/work" className={docLink}>
              work page
            </Link>
            ; the full background is on{" "}
            <Link href={PROFILE_PATH} className={docLink}>
              my profile
            </Link>
            .
          </p>
        </DocSection>

        <DocSection id="process" title="How I work">
          <p>
            We sit together, ideate and start from a sketch. I take it to a working version quickly, test it with real
            people, then encode what we learned as a spec, a token or a component so the next pass doesn&apos;t start
            from zero. You get the design files and the code, documented so your team can run them after I leave.
          </p>
        </DocSection>

        <DocSection id="faq" title="Questions from people hiring">
          <DocFaq items={hireFaqs()} />
        </DocSection>

        <DocSection id="contact" title="Get in touch">
          <p>
            Tell me what you need, the timeline, and whether it&apos;s freelance, contract or full-time:{" "}
            <a href={`mailto:${IDENTITY.email}`} className={docLink}>
              {IDENTITY.email}
            </a>{" "}
            or the{" "}
            <Link href="/contact" className={docLink}>
              contact page
            </Link>
            . {HIRE_TERMS.response}.
          </p>
        </DocSection>
      </DocPage>
    </>
  );
}
