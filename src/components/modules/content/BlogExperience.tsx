"use client";

/** Blog module → the real /blog experience (article list, search, domain
 * filter). Opens fullscreen from the Blog trigger; Close/Esc dismisses.
 *
 * This is a client island (rendered inside the module overlay), so it can't read
 * the filesystem directly like the /blog route does. It fetches MDX-backed
 * summaries from /api/blog and hands them to the same BlogListClient. */

import { useEffect, useState } from "react";
import { BlogListClient } from "@/components/blog/BlogListClient";
import type { BlogArticleSummary } from "@/types/blog";

export function BlogExperience() {
  const [articles, setArticles] = useState<BlogArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          if (active) setArticles(data.articles ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-y-auto">
      {loading ? (
        <div
          className="flex h-full w-full items-center justify-center text-sm"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
        >
          ✎ opening the journal…
        </div>
      ) : (
        <BlogListClient articles={articles} />
      )}
    </div>
  );
}

export default BlogExperience;
