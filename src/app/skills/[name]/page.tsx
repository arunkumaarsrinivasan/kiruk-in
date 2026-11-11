import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MAKING_MDX } from "@/components/making/mdx";
import "@/app/making/making.css";
import { ReadSurface } from "@/components/read/ReadSurface";
import { renderMdx, type MdxComponentScope } from "@/lib/content";
import { readRail, sectionsOf } from "@/lib/content/read/rail";
import { getSkill, getSkills, skillToMdx } from "@/lib/content/skills";
import { SHARE_IMAGE, SITE_URL } from "@/lib/site";

/**
 * One skill, as a page on Read's Skills shelf: the same SKILL.md an agent
 * reads before it touches the loader eye, rendered for people.
 */

type Params = Promise<{ name: string }>;

export function generateStaticParams() {
  return getSkills().map((s) => ({ name: s.name }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { name } = await params;
  const skill = getSkill(name);
  if (!skill) return {};
  const title = `${skill.name} · Skills`;
  return {
    title,
    description: skill.summary,
    alternates: { canonical: skill.href },
    openGraph: { type: "article", url: `${SITE_URL}${skill.href}`, title, description: skill.summary, images: [SHARE_IMAGE] },
  };
}

export default async function SkillPage({ params }: { params: Params }) {
  const { name } = await params;
  const skill = getSkill(name);
  if (!skill) notFound();
  const mdx = skillToMdx(skill.body);
  const body = await renderMdx(mdx, MAKING_MDX as unknown as MdxComponentScope);
  const hub = name === "eye-loader-system";

  return (
    <ReadSurface
      trail={[{ label: "Read", href: "/notebook" }, { label: "Skills", href: "/notebook#skills" }, { label: skill.name }]}
      rail={readRail({ shelf: "skills", href: skill.href, sections: sectionsOf(mdx) })}
      blueprint="skill"
    >
      <header className="read-page-head">
        <p className="read-kicker">Skill{hub ? " · the hub: read first" : ""}</p>
        <h1 className="read-page-title read-page-title--code">{skill.name}</h1>
        <p className="read-page-lede">{skill.summary}.</p>
        <ul className="read-meta">
          <li>
            From <code>.claude/skills/{skill.name}/SKILL.md</code>
          </li>
          {hub ? null : (
            <li>
              <Link href="/skills/eye-loader-system">The hub</Link>
            </li>
          )}
          <li>
            <Link href="/making/loader-eye">What it built</Link>
          </li>
        </ul>
      </header>
      <div className="read-skill">{body}</div>
    </ReadSurface>
  );
}
