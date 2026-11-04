import { buildLlmsTxt } from "@/lib/identity-text";

/** Built from src/lib/identity.ts at build time; edit the facts there. */
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=86400",
    },
  });
}
