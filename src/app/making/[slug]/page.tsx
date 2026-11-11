import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LineageMap } from "@/components/making/LineageMap";
import { MakingSurface } from "@/components/making/MakingSurface";
import { MAKING_MDX } from "@/components/making/mdx";
import { renderMdx, type MdxComponentScope } from "@/lib/content";
import { KIND_LABEL, MAKING_PATH, getLineage, getLineageEdges, getMakingEntries, getMakingEntry, getMakingNode, getTrail, making } from "@/lib/content/making";
import { JsonLd } from "@/components/seo/DocPage";
import { IDENTITY, PERSON_ID } from "@/lib/identity";
import { readRail, sectionsOf } from "@/lib/content/read/rail";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getMakingEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getMakingEntry(slug);
  if (!entry) return {};
  const { title, tldr } = entry.frontmatter;
  const path = making.route(entry.slug);
  return {
    title: `${title} · Making`,
    description: tldr,
    alternates: { canonical: path, types: { "text/markdown": `${path}/agent.md` } },
    openGraph: { type: "article", url: `${SITE_URL}${path}`, title, description: tldr, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description: tldr },
  };
}

/** One making-of entry, laid out like a notebook post: title, meta, lede, body, then its lineage. */
export default async function MakingEntryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = getMakingEntry(slug);
  if (!entry) notFound();

  const fm = entry.frontmatter;
  const here = getMakingNode(entry.slug);
  const groups = getLineage(entry.slug);
  const edges = getLineageEdges(entry.slug);
  const linked = groups.reduce((n, g) => n + g.nodes.length, 0);
  const { prev, next } = getTrail(entry.slug);
  const body = await renderMdx(entry.body, MAKING_MDX as unknown as MdxComponentScope);

  const url = `${SITE_URL}${making.route(entry.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    url,
    headline: fm.title,
    description: fm.tldr,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    ...(fm.updated ? { dateModified: fm.updated } : {}),
    ...(fm.image ? { image: `${SITE_URL}${fm.image}` } : {}),
    isPartOf: { "@id": `${SITE_URL}${MAKING_PATH}#collection` },
    // The lineage, for engines: every entry this one is linked to.
    mentions: groups.flatMap((g) => g.nodes).map((n) => ({ "@type": "TechArticle", name: n.title, url: `${SITE_URL}${n.href}` })),
    citation: fm.sources.map((s) => ({ "@type": "CreativeWork", name: s.label, url: s.href })),
  };

  return (
    <MakingSurface era={fm.era} blueprint="making-entry" title={fm.title} rail={readRail({ shelf: "making", href: making.route(entry.slug), sections: sectionsOf(entry.body) })}>
      <JsonLd data={[jsonLd]} />
      <header className="mb-10">
        <p className="mk-label mk-crumb mb-3">
          <Link href="/notebook">Read</Link> / <Link href={MAKING_PATH}>Making</Link> / {KIND_LABEL[fm.kind]}
        </p>
        <h1
          className="era-blog-title mb-4 text-4xl leading-[1.08] md:text-6xl"
          style={{ color: "var(--text-main)", fontFamily: "var(--font-heading)" }}
        >
          {fm.title}
        </h1>
        <div className="mk-meta">
          <span>Made {fm.made}</span>
          <span>{IDENTITY.name}</span>
          {linked ? (
            <a href="#mk-lineage-h" className="mk-meta__jump">
              Linked to {linked} {linked === 1 ? "entry" : "entries"} ↓
            </a>
          ) : null}
        </div>
        <p
          className="era-lede border-l pl-4 text-lg leading-relaxed text-pretty md:text-xl"
          style={{ borderColor: "var(--text-main)", color: "var(--text-muted)" }}
        >
          {fm.tldr}
        </p>
      </header>

      {body}

      {fm.sources.length ? (
        <section className="mk-section" aria-labelledby="mk-sources-h">
          <h2 id="mk-sources-h" className="mk-label">
            Further reading
          </h2>
          <ul className="mk-sources">
            {fm.sources.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {here && groups.length ? (
        <section className="mk-section mk-wide" aria-labelledby="mk-lineage-h">
          <h2 id="mk-lineage-h" className="mk-label">
            Lineage
          </h2>
          <LineageMap groups={groups} here={here} edges={edges} />
        </section>
      ) : null}

      {prev || next ? (
        <nav className="mk-trail" aria-label="Making-of entries">
          {prev ? (
            <Link href={prev.href} className="mk-trail__link">
              <span className="mk-trail__dir">Previous · {prev.kindLabel}</span>
              {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={next.href} className="mk-trail__link mk-trail__link--next">
              <span className="mk-trail__dir">Next · {next.kindLabel}</span>
              {next.title}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </MakingSurface>
  );
}
