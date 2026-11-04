import { EraPageArchetype } from '@/components/era-shell/EraPageArchetype';
import { SITE_URL } from '@/lib/site';
import { IdentityFacts } from '@/components/seo/IdentityFacts';
import { PERSON_ID } from '@/lib/identity';

const LAST_MODIFIED = '2026-11-04';

// The FAQ lives, visible, on the entity home (/arun-kumaar-sreenivasan):
// Google asks that structured data match text a visitor can see.

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
  about: { '@id': PERSON_ID },
  mainEntity: { '@id': PERSON_ID },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <EraPageArchetype pageKey="home" />
      <IdentityFacts />
    </>
  );
}
