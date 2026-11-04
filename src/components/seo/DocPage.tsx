/**
 * Plain document pages for search (the entity home, /hire): server-rendered
 * text in the active era's tokens, like /work. No skin and no client-only
 * content, so a crawler without JavaScript reads everything a visitor sees.
 */
import Link from "next/link";

export const docMuted = { color: "var(--text-muted)" } as const;
export const docHeading = { fontFamily: "var(--font-heading)", color: "var(--text-main)" } as const;
const rule = { borderColor: "var(--border-color)" } as const;

export function JsonLd({ data }: { data: object[] }) {
  return (
    <>
      {data.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
    </>
  );
}

export function DocPage({ crumb, blueprint, children }: { crumb: string; blueprint: string; children: React.ReactNode }) {
  return (
    <div
      className="relative z-10 min-h-dvh"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
        paddingTop: "var(--simple-game-nav-bottom, 4.5rem)",
      }}
    >
      <article className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6" data-blueprint={blueprint}>
        <nav aria-label="Breadcrumb" className="text-sm" style={docMuted}>
          <Link href="/" className="site-crumb-link underline decoration-dotted underline-offset-4">
            Home
          </Link>{" "}
          / {crumb}
        </nav>
        {children}
      </article>
    </div>
  );
}

export function DocHeader({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <header className="mt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--accent-color)" }}>
        {kicker}
      </p>
      <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl" style={docHeading}>
        {title}
      </h1>
      {children}
    </header>
  );
}

export function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-10 scroll-mt-24 border-t pt-8" style={rule}>
      <h2 id={`${id}-h`} className="text-xl font-bold sm:text-2xl" style={docHeading}>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed sm:text-base">{children}</div>
    </section>
  );
}

export function DocFaq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <>
      {items.map((f) => (
        <div key={f.q}>
          <h3 className="font-bold" style={docHeading}>
            {f.q}
          </h3>
          <p className="mt-1">{f.a}</p>
        </div>
      ))}
    </>
  );
}

export const docLink = "underline underline-offset-4";
