import type { Metadata } from "next";
import Link from "next/link";
import { LineageMap } from "@/components/making/LineageMap";
import { MakingSurface } from "@/components/making/MakingSurface";
import { JsonLd } from "@/components/seo/DocPage";
import { MAKING_PATH, getKindGroups, getMakingGraph } from "@/lib/content/making";
import { PERSON_ID } from "@/lib/identity";
import { readRail } from "@/lib/content/read/rail";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

const TITLE = "How this was made";
const DESCRIPTION =
  "The making of kiruk.in as a lineage: the loader eye, each era, the patterns they are built with, the principles they obey and the rounds that were thrown away.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: MAKING_PATH },
  openGraph: { type: "website", url: `${SITE_URL}${MAKING_PATH}`, title: TITLE, description: DESCRIPTION, images: [SHARE_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function MakingHubPage() {
  const { nodes, edges } = getMakingGraph();
  const groups = getKindGroups();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${MAKING_PATH}#collection`,
    url: `${SITE_URL}${MAKING_PATH}`,
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    isPartOf: { "@id": `${SITE_URL}/notebook#page` },
    hasPart: nodes.map((n) => ({ "@type": "TechArticle", name: n.title, description: n.tldr, url: `${SITE_URL}${n.href}` })),
  };

  return (
    <MakingSurface blueprint="making-hub" rail={readRail({ shelf: "making", href: MAKING_PATH })}>
      <JsonLd data={[jsonLd]} />
      <header className="mb-10">
        <p className="mk-label mk-crumb mb-3">
          <Link href="/notebook">Read</Link> / Making
        </p>
        <h1
          className="era-blog-title mb-4 text-4xl leading-[1.08] md:text-6xl"
          style={{ color: "var(--text-main)", fontFamily: "var(--font-heading)" }}
        >
          How this was made
        </h1>
        <p
          className="era-lede border-l pl-4 text-lg leading-relaxed text-pretty md:text-xl"
          style={{ borderColor: "var(--text-main)", color: "var(--text-muted)" }}
        >
          This site opens on one eye, seen through ten eras of screens. Nothing about it arrived in one go. Every part
          below has its own page, and every page ends in a map of what it came from, what it is built with, what it
          obeys and what was thrown away to reach it.
        </p>
        <p className="mk-hub__count">
          {nodes.length} entries, {edges.length} links. Point at a card to see what it touches.
        </p>
        <Link href={`${MAKING_PATH}/loader-eye`} className="mk-hub__start">
          Start with the eye
        </Link>
      </header>
      <div className="mk-wide">
        <LineageMap groups={groups} edges={edges} />
      </div>
      <p className="mt-12">
        <Link href="/notebook" className="mk-back">
          ← Notebook
        </Link>
      </p>
    </MakingSurface>
  );
}
