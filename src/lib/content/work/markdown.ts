import "server-only";
import { portfolioData } from "@/data/portfolio-data";
import { getProjectCoverLabel, isProjectNda } from "@/data/project-media";
import { WORK_SHOW } from "@/data/work-show";
import { SITE_URL } from "@/lib/site";
import { getWorkCaseDigests } from "./digest";

/**
 * Every work as Markdown, generated from the same data the era desktops draw:
 * the project record, the full case it belongs to, and how it is shown
 * (data/work-show.ts). This is the version for anyone the 1970 tube cannot
 * serve: screen readers, text browsers, search and answer engines.
 *
 * Each page opens with `title` and `description` frontmatter, the page schema
 * of Fumadocs and Fumapress, so the same pages could be fed to such a site as
 * they are. Inside this site they are also rendered as era-styled pages at
 * /work/read and /work/<id>/read.
 */

const KIND: Record<string, string> = { ai: "AI", web: "Web", mobile: "Mobile", design: "Design", other: "Other" };
const STATE: Record<string, string> = { completed: "Completed", "in-progress": "In progress", planned: "Planned" };
const LINK: Record<string, string> = {
  live: "Live site",
  demo: "Demo",
  figma: "Figma",
  behance: "Behance",
  github: "Source",
};

const projects = portfolioData.projects;
const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");
const cell = (text: string) => text.replace(/\|/g, "\\|");

export function workIds(): string[] {
  return projects.map((p) => p.id);
}

export function workMarkdownPath(id: string): string {
  return `/work/${id}/agent.md`;
}

function frontmatter(title: string, description: string): string {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---`;
}

/**
 * `plain` (the default) is the whole work in words, for readers that take only
 * text. With `plain: false` the parts a page can show better are left out:
 * the case's numbers, versions and facts, and the pictures. The reading page
 * draws those with the case's own charts and scenes.
 */
export function buildWorkMarkdown(id: string, { plain = true }: { plain?: boolean } = {}): string | null {
  const p = projects.find((project) => project.id === id);
  if (!p) return null;
  const name = getProjectCoverLabel(p.id, p.title);
  const nda = isProjectNda(p.id);
  const kase = getWorkCaseDigests().find((c) => c.project === p.id || c.also.includes(p.id));
  const show = WORK_SHOW[p.id];
  const year = p.timeline.startDate.slice(0, 4);
  const out: string[] = [frontmatter(name, p.description), `# ${name}`, `> ${p.description}`];

  out.push(
    [
      "| | |",
      "| --- | --- |",
      `| Role | ${cell(p.role)} |`,
      `| When | ${year}, ${cell(p.timeline.duration)} |`,
      `| Kind | ${KIND[p.category] ?? p.category} |`,
      `| State | ${STATE[p.status] ?? p.status}${nda ? ", under NDA" : ""} |`,
    ].join("\n"),
  );
  if (p.longDescription) out.push(p.longDescription);

  if (p.features.length) out.push("## What I built", list(p.features));
  if (p.metrics?.impact || p.challenges.length || p.learnings.length) {
    out.push("## Impact");
    if (p.metrics?.impact) out.push(p.metrics.impact);
    if (p.challenges.length) out.push("### Hard parts", list(p.challenges));
    if (p.learnings.length) out.push("### What it taught", list(p.learnings));
  }
  if (p.technologies.length) out.push("## Stack", p.technologies.join(", "));

  if (kase && plain) {
    out.push("## Numbers", `From the full case, ${kase.title} (${kase.when}). ${kase.pitch}`);
    const lead = kase.lead ?? kase.headline;
    out.push(
      list([
        `**${lead.value}** ${lead.label}`,
        ...kase.stats.map((s) => `**${s.value}** ${s.label}${s.delta ? ` (${s.delta})` : ""}`),
        ...kase.meters.map((m) => `**${m.value} of ${m.max}** ${m.label}`),
      ]),
    );
    if (kase.trend?.values.length) {
      const t = kase.trend;
      out.push(
        `### ${t.label}`,
        [`| ${t.ticks.join(" | ")} |`, `| ${t.ticks.map(() => "---").join(" | ")} |`, `| ${t.values.join(" | ")} |`].join("\n"),
      );
      if (t.note) out.push(t.note);
    }
    if (kase.spans?.rows.length) {
      out.push(
        `### ${kase.spans.label}`,
        ["| Product | From | To |", "| --- | --- | --- |", ...kase.spans.rows.map((r) => `| ${cell(r.name)} | ${r.from} | ${r.to} |`)].join("\n"),
      );
    }
    if (kase.iterations.length) {
      out.push(
        "## Versions",
        kase.iterations
          .map((it, i) => `${i + 1}. **${it.tag}, ${it.when}: ${it.title}.** ${it.note}${it.best ? " (the one that shipped best)" : ""}`)
          .join("\n"),
      );
    }
    if (kase.facts) {
      const f = kase.facts;
      const rows: [string, string | undefined][] = [
        ["Role", f.role],
        ["Team", f.team],
        ["Where", f.platform],
        ["Stack", f.stack],
        ["When", f.when],
      ];
      out.push("## Facts of the case", list(rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)));
    }
  }

  if (show?.media.length && plain) {
    out.push("## Pictures", show.media.map((m) => `![${m.alt}](${SITE_URL}${m.src})\n\n${m.caption}`).join("\n\n"));
  }
  if (show) out.push("## On the 1970 tube", `In the site's 1970 era this work plays as a small moving picture. ${show.plays}`);

  const links = Object.entries(p.links ?? {}).filter(([, href]) => typeof href === "string" && href) as [string, string][];
  out.push(
    "## Links",
    list([
      ...links.map(([kind, href]) => `[${LINK[kind] ?? kind}](${href})`),
      ...(kase?.links ?? []).filter((l) => !links.some(([, href]) => href === l.href)).map((l) => `[${l.label}](${l.href})`),
      `[This work on the site](${SITE_URL}/work/${p.id})`,
      `[All work, as markdown](${SITE_URL}/work.md)`,
    ]),
  );
  if (nda) out.push("Internal screens are under NDA, so no captures are shown.");

  return `${out.join("\n\n")}\n`;
}

export function buildWorkIndexMarkdown(): string {
  const out: string[] = [
    frontmatter("Work", "Selected design engineering work by Arun Kumaar Sreenivasan, one page per project."),
    "# Work",
    `Every project on ${SITE_URL}/work, as plain Markdown. Each line links to the project's own page, with its role, what was built, its numbers and its links.`,
  ];
  const kinds = [...new Set(projects.map((p) => p.category))];
  for (const kind of kinds) {
    out.push(
      `## ${KIND[kind] ?? kind}`,
      list(
        projects
          .filter((p) => p.category === kind)
          .map(
            (p) =>
              `[${getProjectCoverLabel(p.id, p.title)}](${SITE_URL}${workMarkdownPath(p.id)}) (${p.timeline.startDate.slice(0, 4)}, ${p.role}): ${p.description}`,
          ),
      ),
    );
  }
  return `${out.join("\n\n")}\n`;
}
