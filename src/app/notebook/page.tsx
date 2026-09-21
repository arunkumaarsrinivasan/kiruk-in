import type { Metadata } from "next";
import { getNotebookEntries } from "@/lib/content/notebook";
import { resolveRelated } from "@/lib/content/related";
import { NotebookList } from "@/components/blog/BlogListClient";

export const metadata: Metadata = {
  title: "Notebook",
  description: "Kiruk Studio notebook. Warp to a year you lived in, then read from that machine.",
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

  return <NotebookList entries={entries} query={query} />;
}
