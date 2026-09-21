"use client";

import Link from "next/link";
import { KirukEye, KirukWordmark } from "@/components/brand/KirukLogo";

/**
 * Brand mark is always Home — the kiruk.in landing page.
 * Era travel lives on Time Machine; site sections live on Work / Read / About / Contact.
 */
export function SiteHomeLink({
  showWordmark = true,
  className,
  wordmarkColor = "var(--nav-text)",
}: Readonly<{
  showWordmark?: boolean;
  className?: string;
  wordmarkColor?: string;
}>) {
  return (
    <Link
      href="/"
      aria-label="Kiruk home — landing page"
      title="Home — kiruk.in landing"
      className={`site-home-link pointer-events-auto inline-flex min-h-11 min-w-11 shrink-0 items-center gap-2.5 outline-none ${className ?? ""}`}
    >
      <KirukEye bare gaze />
      {showWordmark ? (
        <span className="hidden items-start sm:flex">
          <KirukWordmark size={19} color={wordmarkColor} />
          <sup className="ml-0.5 text-[9px]" style={{ color: "var(--nav-text-muted, var(--text-muted))" }}>
            ®
          </sup>
        </span>
      ) : null}
    </Link>
  );
}
