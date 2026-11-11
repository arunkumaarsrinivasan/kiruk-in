import { buildWorkIndexMarkdown } from "@/lib/content/work/markdown";

/** Every project in one Markdown page, built from the same data the desktops draw. */
export const dynamic = "force-static";

export function GET() {
  return new Response(buildWorkIndexMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=86400",
    },
  });
}
