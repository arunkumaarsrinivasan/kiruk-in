import { buildAboutMarkdown } from "@/lib/identity-text";

/** Built from src/lib/identity.ts at build time; edit the facts there. */
export const dynamic = "force-static";

export function GET() {
  return new Response(buildAboutMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=86400",
    },
  });
}
