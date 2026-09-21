import { NextResponse } from "next/server";
import { getNotebookEntry } from "@/lib/content/notebook";
import { buildAgentMarkdown } from "@/lib/notebook/agent-markdown";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const post = getNotebookEntry(slug);
  if (!post) {
    return new NextResponse("Not found", { status: 404 });
  }

  const markdown = buildAgentMarkdown({
    title: post.summary.title,
    excerpt: post.summary.excerpt,
    date: post.summary.date,
    slug: post.summary.slug,
    body: post.body,
    siteUrl: SITE_URL,
    substackUrl: "substack" in post.frontmatter ? post.frontmatter.substack : undefined,
  });

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
