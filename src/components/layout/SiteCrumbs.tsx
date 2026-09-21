"use client";

import Link from "next/link";
import type { ComponentProps, ComponentType } from "react";

export type SiteCrumb = {
  href?: string;
  label: string;
};

type CrumbLinkProps = ComponentProps<typeof Link>;

/**
 * Wayfinding that does not depend on the bar. Home is always first.
 */
export function SiteCrumbs({
  items,
  link: CrumbLink = Link,
  className,
}: Readonly<{
  items: readonly SiteCrumb[];
  link?: ComponentType<CrumbLinkProps>;
  className?: string;
}>) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <li>
          <Link
            href="/"
            className="site-crumb-link inline-flex min-h-11 items-center"
            style={{ color: "var(--text-muted)" }}
          >
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              <span aria-hidden style={{ color: "var(--text-muted)" }}>
                /
              </span>
              {item.href && !last ? (
                <CrumbLink
                  href={item.href}
                  className="site-crumb-link inline-flex min-h-11 items-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.label}
                </CrumbLink>
              ) : (
                <span
                  aria-current="page"
                  className="inline-flex min-h-11 items-center"
                  style={{ color: "var(--text-main)" }}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
