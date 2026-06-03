"use client";

/** Blog module → the real /blog experience (article list, search, domain
 * filter). Opens fullscreen from the Blog trigger; Close/Esc dismisses. */

import React from "react";
import dynamic from "next/dynamic";

const BlogPage = dynamic(() => import("@/app/blog/page"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center text-sm"
      style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
    >
      ✎ opening the journal…
    </div>
  ),
});

export function BlogExperience() {
  return (
    <div className="relative h-full w-full overflow-y-auto">
      <BlogPage />
    </div>
  );
}

export default BlogExperience;
