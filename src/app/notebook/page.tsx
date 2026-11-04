import type { Metadata } from "next";
import { getNotebookEntries } from "@/lib/content/notebook";
import { resolveRelated } from "@/lib/content/related";
import { NotebookList } from "@/components/blog/BlogListClient";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Notebook",
  description: "Essays by Arun Kumaar Sreenivasan (Kiruk), a design engineer in Bengaluru, on design, code and a life of variation. Pick a year, then read from that machine.",
  alternates: { canonical: "/notebook" },
};

function matchesQuery(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query);
}

export default async function NotebookPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const needle = query.toLowerCase();

  const entries = getNotebookEntries()
    .filter((entry) =>
      needle
        ? matchesQuery(
            `${entry.title} ${entry.excerpt} ${entry.tags.join(" ")} ${entry.domain.join(" ")}`,
            needle,
          )
        : true,
    )
    .map((entry) => ({
      ...entry,
      work: resolveRelated(entry.related).filter((hit) => hit.kind === "work"),
    }));

  const notebookJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/notebook#page`,
    url: `${SITE_URL}/notebook`,
    name: "Notebook — Kiruk Studio",
    description:
      "Notebook of Arun Kumaar Sreenivasan (Kiruk), a design engineer in Bengaluru. Essays on craft, variation, and how the work gets made.",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#person` },
  };

  return (
    <>
      <p className="sr-only">
        Notebook of Arun Kumaar Sreenivasan (Kiruk), a design engineer in
        Bengaluru. Essays on craft, variation, and how the work gets made.
      </p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(notebookJsonLd) }}
      />
      <NotebookList entries={entries} query={query} />
    </>
  );
}
