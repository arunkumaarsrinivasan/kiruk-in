import { requireArg, writeNew } from "./_lib/io.mjs";
import { entryFile } from "./_lib/paths.mjs";
import { slugify, warnIfIgnoredSlug } from "./_lib/slugify.mjs";
import { mdxDocument, today } from "./_lib/frontmatter.mjs";

/**
 * `npm run note -- "Title"` — scaffold a seedling note under content/notes/.
 * Draft by default (hidden until you flip draft:false). Passes the kernel's
 * notes schema so it validates on the next build.
 */
const title = requireArg('npm run note -- "Note title"');
const slug = slugify(title);
warnIfIgnoredSlug(slug);

const file = entryFile("notes", slug);
const doc = mdxDocument(
  {
    title,
    excerpt: "",
    date: today(),
    stage: "seedling",
    source: "thought",
    draft: true,
    tags: [],
  },
  "Start writing…",
);
writeNew(file, doc);
console.log(`✎ content/notes/${slug}.mdx (draft) — edit, then set draft: false`);
