import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MAKING_MDX } from "@/components/making/mdx";
import "@/app/making/making.css";
import { ReadSurface } from "@/components/read/ReadSurface";
import { renderMdx, type MdxComponentScope } from "@/lib/content";
import { getPracticeEntries, getPracticeEntry, practice } from "@/lib/content/practice";
import { readRail, sectionsOf } from "@/lib/content/read/rail";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

/** A practice page on Read's Work shelf: how the work is done (docs/READ_DIRECTORY_PLAN.md). */

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getPracticeEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPracticeEntry(slug);
  if (!entry) return {};
  const { title, summary, review } = entry.frontmatter;
  const path = practice.route(entry.slug);
  return {
    title: `${title} · Work`,
    description: summary,
    alternates: { canonical: path },
    openGraph: { type: "article", url: `${SITE_URL}${path}`, title, description: summary, images: [SHARE_IMAGE] },
    // a draft waits for Arun before search engines see it
    ...(review ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function PracticePage({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = getPracticeEntry(slug);
  if (!entry) notFound();
  const fm = entry.frontmatter;
  const body = await renderMdx(entry.body, MAKING_MDX as unknown as MdxComponentScope);
  const path = practice.route(entry.slug);

  return (
    <ReadSurface
      trail={[{ label: "Read", href: "/notebook" }, { label: "Work", href: "/notebook#work" }, { label: fm.title }]}
      rail={readRail({ shelf: "work", href: path, sections: sectionsOf(entry.body) })}
      blueprint="practice"
    >
      <header className="read-page-head">
        <p className="read-kicker">Work · How I work</p>
        <h1 className="read-page-title">{fm.title}</h1>
        <p className="read-page-lede">{fm.summary}</p>
        <ul className="read-meta">
          <li>Arun Kumaar Sreenivasan</li>
          {fm.updated ? <li>Updated {fm.updated}</li> : null}
          <li>
            <Link href="/work">See the work</Link>
          </li>
        </ul>
        {fm.review ? (
          <p className="read-draft" role="note">
            Draft. Written from my career notes and still to be edited in my own words. Not listed in search engines yet.
          </p>
        ) : null}
      </header>
      {body}
    </ReadSurface>
  );
}
