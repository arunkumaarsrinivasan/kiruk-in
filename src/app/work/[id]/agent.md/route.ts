import { buildWorkMarkdown, workIds } from "@/lib/content/work/markdown";

/** One project as Markdown: the text version of what the era desktop shows. */
export const dynamic = "force-static";

export function generateStaticParams() {
  return workIds().map((id) => ({ id }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const markdown = buildWorkMarkdown(id);
  if (!markdown) return new Response("Not found", { status: 404 });
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=86400",
    },
  });
}
