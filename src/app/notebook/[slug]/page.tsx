import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNotebookEntries, getNotebookEntry, getNotebookNeighbors } from "@/lib/content/notebook";
import { renderMdx, readingTime } from "@/lib/content";
import { mdxComponents } from "@/components/blog/MdxComponents";
import { NotebookArticle, NotebookReaderBody, NotebookViewProvider } from "@/components/notebook";
import { buildAgentMarkdown, parseNotebookView } from "@/lib/notebook";
import { resolveRelated } from "@/lib/content/related";
import { SITE_URL } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): Array<{ slug: string }> {
  return getNotebookEntries().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getNotebookEntry(slug);
  if (!post) return { title: "Notebook" };
  const { title, excerpt, date, coverImage } = post.summary;
  const url = `/notebook/${slug}`;
  const images = coverImage ? [coverImage] : undefined;
  return {
    title,
    description: excerpt,
    alternates: {
      canonical: url,
      types: {
        "text/markdown": `${url}/agent.md`,
      },
    },
    openGraph: {
      type: "article",
      title,
      description: excerpt,
      url,
      publishedTime: date,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt,
      images,
    },
  };
}

export default async function NotebookArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = getNotebookEntry(slug);
  if (!post) notFound();

  const { summary } = post;
  const readStats = readingTime(post.body);
  const content = await renderMdx(post.body, mdxComponents as never);
  const notebookFm = post.frontmatter as unknown as Record<string, unknown>;
  const notebookView = parseNotebookView(notebookFm);
  const { prev, next } = getNotebookNeighbors(slug);
  const related = resolveRelated(post.frontmatter.related);
  const tags = [...summary.domain, ...summary.tags.filter((tag) => !summary.domain.includes(tag))];
  const wide = notebookView.layout === "spread" || notebookView.fit;
  const substackUrl =
    "substack" in post.frontmatter ? post.frontmatter.substack : undefined;
  const agentMarkdown = buildAgentMarkdown({
    title: summary.title,
    excerpt: summary.excerpt,
    date: summary.date,
    slug: summary.slug,
    body: post.body,
    siteUrl: SITE_URL,
    substackUrl,
  });

  return (
    <NotebookArticle
      summary={summary}
      minutes={readStats.text}
      wide={wide}
      prev={prev}
      next={next}
      related={related}
      tags={tags}
      agentMarkdown={agentMarkdown}
      substackUrl={substackUrl}
    >
      <NotebookViewProvider view={notebookView}>
        <NotebookReaderBody frontmatter={notebookFm}>{content}</NotebookReaderBody>
      </NotebookViewProvider>
    </NotebookArticle>
  );
}
