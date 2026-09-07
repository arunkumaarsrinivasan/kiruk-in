/**
 * Serialize a flat frontmatter object to the YAML subset the kernel parser
 * understands (scalars, inline arrays, quoted strings). Always LF — the kernel
 * parser normalizes CRLF on read, but we write clean.
 */
function needsQuote(value) {
  return /[:#[\]"']/.test(value) || /^\s|\s$/.test(value) || value === "";
}

function scalar(value) {
  if (typeof value === "string") return needsQuote(value) ? JSON.stringify(value) : value;
  return String(value);
}

export function stringifyFrontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map(scalar).join(", ")}]`);
    } else {
      lines.push(`${key}: ${scalar(value)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

/** Build a full MDX document from frontmatter + body. */
export function mdxDocument(frontmatter, body = "") {
  return `${stringifyFrontmatter(frontmatter)}\n\n${body}\n`;
}

/** Local date as YYYY-MM-DD. */
export function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Local time as HH:MM. */
export function nowTime() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}
