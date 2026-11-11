import "server-only";
import { cleanNotebookMdx } from "@/lib/notebook/agent-markdown";
import { SITE_URL } from "@/lib/site";
import { KIND_LABEL, getLineage, making, type MakingEntry } from "./index";

/**
 * A making-of entry as plain markdown, for answer engines and for pasting into
 * an assistant (served at /making/<slug>/agent.md). The entry's blocks become
 * ordinary markdown, and its lineage, which the page draws as a map, is written
 * out as lists of links so the graph survives without the page.
 */

const attr = (attrs: string, name: string) => attrs.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`))?.[1];
const abs = (href: string) => (href.startsWith("/") ? `${SITE_URL}${href}` : href);

/** Turn the making-of's own MDX blocks into markdown; the notebook cleaner does the rest. */
function blocksToMarkdown(body: string): string {
  let s = body.replace(/\r\n/g, "\n");

  s = s.replace(/<Figure\b([^>]*)>([\s\S]*?)<\/Figure>/g, (_m, attrs: string, inner: string) => {
    const src = attr(attrs, "src");
    const img = src ? `![${attr(attrs, "alt") ?? ""}](${abs(src)})` : "";
    return `\n\n${img}\n\n${inner.trim()}\n\n`;
  });

  s = s.replace(/<Verdict\b([^>]*)>([\s\S]*?)<\/Verdict>/g, (_m, attrs: string, inner: string) => {
    const quote = inner.trim().split("\n").map((l) => `> ${l.trim()}`).join("\n");
    return `\n\n${quote}\n>\n> Arun, reviewing ${attr(attrs, "on") ?? "the round"}\n\n`;
  });

  s = s.replace(/<Gen\b([^>]*)>/g, (_m, attrs: string) => {
    const head = [attr(attrs, "when"), attr(attrs, "how")].filter(Boolean).join(", ");
    return `\n\n**${attr(attrs, "n") ?? ""} ${attr(attrs, "name") ?? ""}** (${head})\n\n`;
  });

  s = s.replace(/<Spec\b[^>]*rows="([^"]*)"[^>]*\/>/g, (_m, rows: string) => {
    const list = rows.split(";").map((r) => r.split("|").map((p) => p.trim()));
    return `\n\n${list.map(([k, v]) => `- ${k}: ${v}`).join("\n")}\n\n`;
  });

  return s;
}

export function buildMakingMarkdown(entry: MakingEntry): string {
  const fm = entry.frontmatter;
  const url = `${SITE_URL}${making.route(entry.slug)}`;
  const lines = [
    `# ${fm.title}`,
    "",
    `> ${fm.tldr}`,
    "",
    `- URL: ${url}`,
    `- Kind: ${KIND_LABEL[fm.kind]}`,
    `- Made: ${fm.made}`,
    "- Author: Arun Kumaar Sreenivasan",
    `- Part of: How this was made (${SITE_URL}/making)`,
    `- Agent file: ${url}/agent.md`,
    "",
    cleanNotebookMdx(blocksToMarkdown(entry.body), SITE_URL),
  ];

  const groups = getLineage(entry.slug);
  if (groups.length) {
    lines.push("", "## Lineage", "");
    for (const g of groups) {
      lines.push(`### ${g.label}`, "", ...g.nodes.map((n) => `- [${n.title}](${SITE_URL}${n.href}) (${n.kindLabel}, ${n.made}): ${n.tldr}`), "");
    }
  }

  if (fm.sources.length) {
    lines.push("## Further reading", "", ...fm.sources.map((s) => `- [${s.label}](${s.href})`));
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
