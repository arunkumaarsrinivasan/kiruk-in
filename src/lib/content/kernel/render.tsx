import "server-only";
import type { ReactNode } from "react";
import { compile, run } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import * as jsxRuntime from "react/jsx-runtime";

/**
 * MDX renderer (server-only).
 *
 * We compile + run MDX ourselves rather than route `.mdx` as pages, so content
 * can live in a plain `content/` directory and be loaded by the kernel loader.
 * This is the official MDX compiler (`@mdx-js/mdx`) with:
 *   - `remark-gfm`               — GitHub-flavored markdown
 *   - `rehype-slug`              — stable `id`s on headings
 *   - `rehype-autolink-headings` — wrap each heading in a self-link anchor
 *   - `rehype-pretty-code`       — Shiki syntax highlighting at build time
 *
 * All plugins run at build time under static generation, so there is no
 * per-request cost and nothing new ships to the visitor JS bundle. The Shiki
 * theme is a single stable panel for now (era-matched dual themes are a later
 * polish); `keepBackground` lets the theme own the code surface.
 *
 * Security: `run` evaluates compiled MDX on the SERVER only (no client eval).
 * Content is first-party, in-repo, and code-reviewed, so executing author JSX
 * is safe. Authors may only reference components present in the provided
 * `components` scope.
 */

export type MdxComponentScope = Record<string, React.ComponentType<never>>;

export async function renderMdx(
  body: string,
  components: MdxComponentScope,
): Promise<ReactNode> {
  const compiled = await compile(body, {
    outputFormat: "function-body",
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        { behavior: "wrap", properties: { "data-heading-anchor": "" } },
      ],
      [rehypePrettyCode, { theme: "github-dark-dimmed", keepBackground: true }],
    ],
    development: false,
  });

  const { default: MDXContent } = await run(String(compiled), {
    ...(jsxRuntime as unknown as Record<string, unknown>),
    baseUrl: import.meta.url,
  } as never);

  return <MDXContent components={components as never} />;
}
