import { NextResponse } from "next/server";
import { getMakingEntries, getMakingEntry } from "@/lib/content/making";
import { buildMakingMarkdown } from "@/lib/content/making/markdown";

/** A making-of entry as markdown, lineage included (the notebook's agent.md pattern). */

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-static";

export function generateStaticParams() {
  return getMakingEntries().map((e) => ({ slug: e.slug }));
}

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const entry = getMakingEntry(slug);
  if (!entry) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(buildMakingMarkdown(entry), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
