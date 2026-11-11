/**
 * Plain Markdown made safe for MDX: outside code fences, braces and angle
 * brackets are text, not JSX. Fenced code is left as written. `line` may
 * rewrite each prose line further (links, for instance).
 */
export function markdownToMdxText(markdown: string, line: (text: string) => string = (t) => t): string {
  let fenced = false;
  return markdown
    .split("\n")
    .map((text) => {
      if (/^\s*```/.test(text)) {
        fenced = !fenced;
        return text;
      }
      if (fenced) return text;
      return line(text.replace(/[{}]/g, (c) => `\\${c}`).replace(/<(?!https?:)/g, "&lt;"));
    })
    .join("\n");
}
