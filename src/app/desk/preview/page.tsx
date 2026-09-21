import { readFileSync, existsSync } from "node:fs";
import { notFound } from "next/navigation";
import { deskEnabled } from "@/lib/studio";
import { renderMdx } from "@/lib/content";
import { mdxComponents } from "@/components/blog/MdxComponents";
import { PREVIEW_FILE } from "@/lib/studio/preview-path";
import { NotebookEraRoot } from "@/components/notebook";

export const dynamic = "force-dynamic";

export default async function DeskPreviewPage() {
  if (!deskEnabled()) notFound();

  const source = existsSync(PREVIEW_FILE) ? readFileSync(PREVIEW_FILE, "utf8") : "";
  let content: React.ReactNode;
  try {
    content = await renderMdx(source, mdxComponents as never);
  } catch (err) {
    content = (
      <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }} className="font-mono text-xs">
        {(err as Error).message}
      </pre>
    );
  }

  return (
    <NotebookEraRoot chrome="preview">
      <div className="relative z-10 mx-auto w-full max-w-[72ch] px-6 py-8">{content}</div>
    </NotebookEraRoot>
  );
}
