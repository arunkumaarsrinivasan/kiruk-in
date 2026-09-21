"use client";

import type { RelatedHit } from "@/lib/content/related";
import { NotebookLink } from "@/components/notebook/NotebookLink";

export function RelatedLinks({ items }: { items: RelatedHit[] }) {
  const pages = items.filter((item) => item.kind !== "work");
  const work = items.filter((item) => item.kind === "work");
  if (pages.length === 0 && work.length === 0) return null;

  return (
    <div className="mt-10 space-y-8">
      {pages.length > 0 ? (
        <nav aria-label="Related pages">
          <p className="mb-3 text-base" style={{ color: "var(--text-muted)" }}>
            Also in this notebook
          </p>
          <ul className="space-y-2">
            {pages.map((item) => (
              <li key={item.href}>
                <NotebookLink
                  href={item.href}
                  className="text-lg transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-main)" }}
                >
                  {item.title}
                </NotebookLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {work.length > 0 ? (
        <nav aria-label="Related work">
          <p className="mb-3 text-base" style={{ color: "var(--text-muted)" }}>
            From the studio
          </p>
          <ul className="space-y-2">
            {work.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-lg transition-opacity hover:opacity-70"
                  style={{ color: "var(--text-main)" }}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
