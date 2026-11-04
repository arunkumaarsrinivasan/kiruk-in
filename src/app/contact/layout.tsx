import type { Metadata } from "next";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";
import { IdentityFacts } from "@/components/seo/IdentityFacts";

const TITLE = "Hire or contact Arun Kumaar Sreenivasan — design engineer, Bengaluru";
const DESCRIPTION =
  "Get in touch for AI UX, design systems, and front-end engineering work. Selective freelance and consulting with Kiruk in Bengaluru, India.";

export const metadata: Metadata = {
  title: "Contact & hire",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    images: [SHARE_IMAGE],
    type: "website",
    url: `${SITE_URL}/contact`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${SITE_URL}/contact#page`,
  url: `${SITE_URL}/contact`,
  name: TITLE,
  description: DESCRIPTION,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#person` },
  mainEntity: { "@id": `${SITE_URL}/#person` },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <p className="sr-only">{DESCRIPTION}</p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <h1 className="sr-only">Contact Arun Kumaar Sreenivasan, design engineer in Bengaluru</h1>
      {children}
      <IdentityFacts heading="Contact Arun Kumaar Sreenivasan" />
    </>
  );
}
