import WireframeManualLayout from '@/components/layout/WireframeManualLayout';
import { EraPageArchetype } from '@/components/era-shell/EraPageArchetype';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://kiruk.in');

const LAST_MODIFIED = '2026-05-19';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is Kiruk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kiruk is the studio name of Arun Kumaar Sreenivasan, a design engineer and AI UX designer based in Bengaluru, India. He works on AI product design at HP Print AI and takes on independent design engineering projects.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a design engineer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A design engineer is a hybrid professional who designs interfaces and builds them in code. Kiruk pairs Figma-led UX design with production React, Next.js, and Flutter engineering so prototypes ship as real products.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Kiruk available for freelance design work in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Kiruk takes on selective freelance and consulting engagements for AI UX, design systems, and front-end engineering, working remotely from Bengaluru with clients across India and abroad.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the Kiruk portfolio cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The portfolio covers AI UX flows for HP Print AI, design systems for SNS Square, gamified onboarding for PeopleGamez, and personal experiments in motion, illustration, and design engineering.',
      },
    },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
  ],
};

const profileJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/#profilepage`,
  url: SITE_URL,
  dateModified: LAST_MODIFIED,
  about: { '@id': `${SITE_URL}/#person` },
  mainEntity: { '@id': `${SITE_URL}/#person` },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <EraPageArchetype pageKey="home">
        <WireframeManualLayout />
      </EraPageArchetype>
    </>
  );
}
