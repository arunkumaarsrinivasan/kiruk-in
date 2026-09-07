import { requireArg, writeNew, ensureDir } from "./_lib/io.mjs";
import { entryFile, assetDir } from "./_lib/paths.mjs";
import { slugify, warnIfIgnoredSlug } from "./_lib/slugify.mjs";
import { mdxDocument, today } from "./_lib/frontmatter.mjs";

/**
 * `npm run newpost -- "Title"` — scaffold a notebook post under content/blog/
 * plus public/blog/<slug>/. Draft by default. Thin frontmatter on purpose.
 */
const title = requireArg('npm run newpost -- "Post title"');
const slug = slugify(title);
warnIfIgnoredSlug(slug);

const file = entryFile("blog", slug);
const body = [
  "Start writing…",
  "",
  `{/* Draw in /studio → <InkPage src="/blog/${slug}/ink-01.svg" /> */}`,
  `{/* Drop a screenshot → <Figure src="/blog/${slug}/shot-01.png" /> */}`,
].join("\n");

const doc = mdxDocument(
  {
    title,
    slug,
    excerpt: "",
    date: today(),
    draft: true,
  },
  body,
);
writeNew(file, doc);
ensureDir(assetDir("blog", slug));
console.log(`✎ content/blog/${slug}.mdx (draft) + public/blog/${slug}/`);
