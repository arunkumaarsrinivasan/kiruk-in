import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import sharp from "sharp";
import { notFound } from "next/navigation";
import { ReadSurface } from "@/components/read/ReadSurface";
import { readRail, sectionsOf } from "@/lib/content/read/rail";
import { portfolioData } from "@/data/portfolio-data";
import { getProjectCoverLabel } from "@/data/project-media";
import { WORK_MDX } from "@/components/work-showcase/mdx";
import { RealAssets } from "@/components/work-showcase/ShowcaseScene";
import "@/components/work-showcase/showcase.css";
import { WORK_SHOW } from "@/data/work-show";
import { renderMdx, type MdxComponentScope } from "@/lib/content";
import { getWorkCases } from "@/lib/content/work";
import { buildWorkMarkdown, workIds, workMarkdownPath } from "@/lib/content/work/markdown";
import { markdownToMdxText } from "@/lib/content/read/escape";
import "../../styles/read.css";

/**
 * A work as a plain page in the active era's design: the same generated
 * Markdown the site serves at /work/<id>/agent.md, rendered here as HTML in
 * the era's tokens. For anyone who would rather read than drive a desktop.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return workIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = portfolioData.projects.find((p) => p.id === id);
  if (!project) return { title: "Project not found" };
  return {
    title: `${getProjectCoverLabel(project.id, project.title)}, in words`,
    description: project.description,
    // the desktop page is the one to index; this is its reading edition
    alternates: { canonical: `/work/${project.id}`, types: { "text/markdown": workMarkdownPath(project.id) } },
  };
}

/**
 * Real pictures of a work. Two ways in:
 *   - drop image files into `public/work/<project id>/`; they show in name
 *     order, each captioned from its file name (`02-checkout-flow.webp` →
 *     "Checkout flow");
 *   - or list them in data/work-show.ts, with a written caption and alt text.
 * Listed pictures come first; a file that is listed is not shown twice.
 * Each is measured at build time so the page reserves its box before it
 * loads; a listed file that is missing from `public/` is left out.
 */
type Picture = { src: string; alt: string; caption: string; width: number; height: number };

async function pictures(id: string): Promise<Picture[]> {
  const listed = WORK_SHOW[id]?.media ?? [];
  const dir = join(process.cwd(), "public", "work", id);
  const found = existsSync(dir)
    ? readdirSync(dir)
        .filter((file) => /\.(webp|avif|png|jpe?g|gif)$/i.test(file))
        .sort()
        .map((file) => {
          const words = file.replace(/\.[^.]+$/, "").replace(/^\d+[-_ ]*/, "").replace(/[-_]+/g, " ").trim();
          const caption = words ? words[0].toUpperCase() + words.slice(1) : "";
          return { src: `/work/${id}/${file}`, alt: caption || file, caption };
        })
    : [];
  const all = [...listed, ...found.filter((f) => !listed.some((l) => l.src === f.src))];
  const measured = await Promise.all(
    all.map(async (picture) => {
      const file = join(process.cwd(), "public", picture.src);
      if (!existsSync(file)) return null;
      const { width, height } = await sharp(file).metadata();
      return width && height ? { ...picture, width, height } : null;
    }),
  );
  return measured.filter((p): p is Picture => p !== null);
}

/** The page body: the Markdown without its frontmatter, title and pitch, which the header shows. */
function body(markdown: string): string {
  return markdownToMdxText(
    markdown
      .replace(/^---\n[\s\S]*?\n---\n+/, "")
      .replace(/^# .*\n+/, "")
      .replace(/^> .*\n+/, ""),
  );
}

export default async function WorkReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = portfolioData.projects.find((p) => p.id === id);
  // the words; the numbers, versions and pictures are drawn below with the case's own charts and scenes
  const markdown = buildWorkMarkdown(id, { plain: false });
  if (!project || !markdown) notFound();
  const name = getProjectCoverLabel(project.id, project.title);
  const text = body(markdown);
  const content = await renderMdx(text, {});
  const kase = getWorkCases().find((c) => c.frontmatter.project === id || c.frontmatter.also?.includes(id));
  const presentation = kase ? await renderMdx(kase.body, WORK_MDX as unknown as MdxComponentScope) : null;
  const media = await pictures(id);

  return (
    <ReadSurface
      trail={[{ label: "Read", href: "/notebook" }, { label: "Work", href: "/notebook#work" }, { label: name }]}
      rail={readRail({ shelf: "work", href: `/work/${project.id}/read`, sections: sectionsOf(text) })}
      blueprint="work-read"
    >
      <header className="read-page-head">
        <p className="read-kicker">
          Work · {kase ? kase.frontmatter.when : project.timeline.startDate.slice(0, 4)}
        </p>
        <h1 className="read-page-title">{name}</h1>
        <p className="read-page-lede">{project.description}</p>
        <ul className="read-meta">
          <li>{project.role}</li>
          <li>
            <Link href={`/work/${project.id}`}>See it on the desktop</Link>
          </li>
          <li>
            <a href={workMarkdownPath(project.id)}>As Markdown</a>
          </li>
        </ul>
      </header>
      {/* the work itself first: the case's scenes, charts and versions, or the project's cover */}
      {kase && presentation ? (
        <section className="work-read-wide" aria-labelledby="case-h">
          <p id="case-h" className="work-read-kicker">
            The case: {kase.frontmatter.title} · {kase.frontmatter.when}
          </p>
          <div className="ws ws-case work-read-case" data-sector={kase.frontmatter.sector}>
            {/* the page is the era's; the work keeps its own colours */}
            <RealAssets>
              <div className="wp-body">{presentation}</div>
            </RealAssets>
          </div>
        </section>
      ) : media.length ? null : (
        <figure className="work-read-cover">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small local SVG cover */}
          <img src={project.images.thumbnail} alt={`Cover for ${name}`} width={840} height={480} />
        </figure>
      )}

      {media.length ? (
        <section className="work-read-gallery" aria-label="Pictures">
          {media.map((m) => (
            <figure key={m.src}>
              {/* the grid is auto-fit, min 240px, inside a column of at most 60rem */}
              <Image
                src={m.src}
                alt={m.alt}
                width={m.width}
                height={m.height}
                sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 30rem"
              />
              <figcaption>{m.caption}</figcaption>
            </figure>
          ))}
        </section>
      ) : null}

      <div className="work-read">{content}</div>
    </ReadSurface>
  );
}
