import type { Metadata } from "next";
import Link from "next/link";
import { DocHeader, DocPage, DocSection, docLink, docMuted } from "@/components/seo/DocPage";
import { portfolioData } from "@/data/portfolio-data";
import { getProjectCoverLabel } from "@/data/project-media";
import "../styles/read.css";

/** Every work as a list of plain pages, in the active era's design. */

export const metadata: Metadata = {
  title: "Work, in words",
  description: "Every project by Arun Kumaar Sreenivasan as a plain page: role, what was built, numbers and links.",
  alternates: { canonical: "/work", types: { "text/markdown": "/work.md" } },
};

const KIND: Record<string, string> = { ai: "AI", web: "Web", mobile: "Mobile", design: "Design", other: "Other" };

export default function WorkReadIndex() {
  const projects = portfolioData.projects;
  const kinds = [...new Set(projects.map((p) => p.category))];
  return (
    <DocPage crumb="Work, in words" blueprint="work-read">
      <DocHeader kicker="Work, in words" title="Every project, as a page">
        <p className="mt-3 text-lg" style={docMuted}>
          The same work the era desktops show, to read instead of drive.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/work" className={docLink}>
            See it on the desktop
          </Link>
          <a href="/work.md" className={docLink}>
            As Markdown
          </a>
        </p>
      </DocHeader>
      {kinds.map((kind) => (
        <DocSection key={kind} id={kind} title={KIND[kind] ?? kind}>
          <ul className="work-read-list">
            {projects
              .filter((p) => p.category === kind)
              .map((p) => (
                <li key={p.id}>
                  <Link href={`/work/${p.id}/read`}>{getProjectCoverLabel(p.id, p.title)}</Link>{" "}
                  <span>
                    {p.timeline.startDate.slice(0, 4)}, {p.role}
                  </span>
                  <br />
                  {p.description}
                </li>
              ))}
          </ul>
        </DocSection>
      ))}
    </DocPage>
  );
}
