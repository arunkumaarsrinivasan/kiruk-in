import { SITE_URL } from "@/lib/site";

export type AgentMarkdownInput = {
  title: string;
  excerpt?: string;
  date?: string;
  slug: string;
  body: string;
  siteUrl?: string;
};

function attr(attrs: string, name: string): string | undefined {
  const dq = attrs.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`));
  if (dq) return dq[1];
  const sq = attrs.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`));
  return sq?.[1];
}

function absUrl(href: string, siteUrl: string): string {
  if (!href) return href;
  if (/^(https?:|mailto:|data:|#)/i.test(href)) return href;
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("/")) return `${siteUrl}${href}`;
  return href;
}

function unwrapMarks(text: string): string {
  return text.replace(
    /<(Mark|Zig|Hit)\b[^>]*>([\s\S]*?)<\/\1>/g,
    (_m, _tag, inner: string) => `**${String(inner).trim()}**`,
  );
}

function notesToQuotes(text: string): string {
  return text.replace(/<Note\b[^>]*>([\s\S]*?)<\/Note>/g, (_m, inner: string) => {
    const body = unwrapMarks(String(inner))
      .replace(/\r\n/g, "\n")
      .trim()
      .split("\n")
      .map((line) => `> ${line.trim() || ""}`)
      .join("\n");
    return `\n\n${body}\n\n`;
  });
}

function fullBleedToMarkdown(text: string, siteUrl: string): string {
  const fromAttrs = (attrs: string, inner = ""): string => {
    const src = attr(attrs, "src");
    const alt = attr(attrs, "alt") ?? "";
    const caption = attr(attrs, "caption");
    const parts: string[] = [];
    if (src) parts.push(`![${alt}](${absUrl(src, siteUrl)})`);
    if (caption) parts.push(`*${caption}*`);
    const cleaned = notesToQuotes(unwrapMarks(inner)).trim();
    if (cleaned) parts.push(cleaned);
    return parts.length ? `\n\n${parts.join("\n\n")}\n\n` : "\n\n";
  };

  let s = text.replace(
    /<FullBleed\b([^>]*)>([\s\S]*?)<\/FullBleed>/g,
    (_m, attrs: string, inner: string) => fromAttrs(attrs, inner),
  );
  s = s.replace(/<FullBleed\b([^>]*)\/>/g, (_m, attrs: string) => fromAttrs(attrs));
  return s;
}

/** Strip notebook MDX chrome into clean Markdown for AI paste / agent.md. */
export function cleanNotebookMdx(body: string, siteUrl = SITE_URL): string {
  let s = body.replace(/\r\n/g, "\n");

  s = fullBleedToMarkdown(s, siteUrl);
  s = notesToQuotes(s);
  s = unwrapMarks(s);

  s = s.replace(
    /<div\s+className=["']era-sign["']\s*>([\s\S]*?)<\/div>/g,
    "\n\n$1\n\n",
  );

  // Drop remaining React/MDX tags; keep their text children.
  s = s.replace(/<\/?[A-Z][A-Za-z0-9.]*\b[^>]*\/?>/g, "");
  s = s.replace(/<\/?(?:div|span|p|br)\b[^>]*\/?>/gi, "\n");

  s = s.replace(/\]\(([^)]+)\)/g, (_m, href: string) => `](${absUrl(href, siteUrl)})`);

  s = s
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return s;
}

/**
 * Craft / Thoughtbot style: title + meta + clean body, ready to paste into
 * Claude, ChatGPT, Cursor, Perplexity, etc.
 */
export function buildAgentMarkdown(input: AgentMarkdownInput): string {
  const siteUrl = (input.siteUrl ?? SITE_URL).replace(/\/$/, "");
  const url = `${siteUrl}/notebook/${input.slug}`;
  const agentUrl = `${url}/agent.md`;
  const body = cleanNotebookMdx(input.body, siteUrl);

  const lines: string[] = [`# ${input.title}`, ""];
  if (input.excerpt?.trim()) {
    lines.push(`> ${input.excerpt.trim()}`, "");
  }
  lines.push(`- URL: ${url}`);
  if (input.date?.trim()) lines.push(`- Published: ${input.date.trim()}`);
  lines.push(`- Agent file: ${agentUrl}`);
  lines.push(
    "- How to read: paste this into Claude, ChatGPT, Cursor, Perplexity, or any AI - read at your own pace.",
    "",
    body,
    "",
  );

  return lines.join("\n").trim() + "\n";
}
