import { join } from "node:path";
import { requireArg, appendLine } from "./_lib/io.mjs";
import { THOUGHTS_DIR } from "./_lib/paths.mjs";
import { today, nowTime } from "./_lib/frontmatter.mjs";

/**
 * `npm run thought -- "…"` — capture a fleeting text thought in < 10s.
 * Appends a timestamped bullet to inbox/thoughts/YYYY-MM-DD.md (tracked in git;
 * this is the raw notebook). Zero frontmatter, zero ceremony.
 */
const text = requireArg('npm run thought -- "your thought"');
const file = join(THOUGHTS_DIR, `${today()}.md`);
appendLine(file, `- ${nowTime()} ${text}`, `# Thoughts — ${today()}`);
console.log(`✎ inbox/thoughts/${today()}.md`);
