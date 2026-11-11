import type { Metadata } from "next";
import { ReadHome } from "@/components/read/ReadHome";
import { getReadDirectory, getReadFeatured, searchReadDirectory } from "@/lib/content/read/directory";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Read",
  description: "Everything by Arun Kumaar Sreenivasan (Kiruk) that is written to be read: essays, how this site was made, the work in words, and the skills he builds with.",
  alternates: { canonical: "/notebook" },
};

/** Read's home: the directory of every shelf (docs/READ_DIRECTORY_PLAN.md). */
export default async function NotebookPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const all = getReadDirectory();
  const shelves = query ? searchReadDirectory(query) : all;

  const notebookJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/notebook#page`,
    url: `${SITE_URL}/notebook`,
    name: "Read — Kiruk Studio",
    description:
      "Everything by Arun Kumaar Sreenivasan (Kiruk), a design engineer in Bengaluru, that is written to be read: essays, how this site was made, the work in words, and the skills he builds with.",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
    hasPart: all.map((s) => ({ "@type": "CreativeWorkSeries", name: s.title, description: s.blurb, url: `${SITE_URL}/notebook#${s.id}` })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(notebookJsonLd) }} />
      <ReadHome shelves={shelves} all={all} featured={getReadFeatured()} query={query} />
    </>
  );
}
