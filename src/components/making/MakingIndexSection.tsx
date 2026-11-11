/**
 * "How this was made" as a section of the notebook index, so the making-of is
 * reached from Read like any other writing. Two forms, matching the index's
 * own two: records in the 1970 research file, rows in the token index.
 */
import Link from "next/link";
import type { MakingIndex } from "@/lib/content/making";
import { GazeHit, GazeTitle } from "@/components/notebook/gaze/GazeTitle";

const mapLine = (m: MakingIndex) => `All ${m.total} entries and the ${m.links} links between them.`;

/** Inside `.era-index-feed`, under the posts: the same record rows. */
export function MakingTerminalRecords({ making }: { making: MakingIndex }) {
  return (
    <section aria-label="How this was made" data-blueprint="making" style={{ marginTop: "2.75rem" }}>
      <p className="era-index-count">How this was made · {making.total} entries</p>
      <ol className="era-records">
        {making.items.map((n) => (
          <li key={n.slug}>
            <Link href={n.href} className="era-record">
              <GazeHit regular="regular/eye.svg" solid="solid/eye-solid.svg">
                <span className="era-record-copy">
                  <GazeTitle className="era-record-title">{n.title}</GazeTitle>
                  <span className="era-dim era-excerpt">{n.tldr}</span>
                </span>
              </GazeHit>
              <span className="era-record-meta">{n.kindLabel}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link href={making.href} className="era-record">
            <GazeHit regular="regular/chart-network.svg" solid="solid/chart-network-solid.svg">
              <span className="era-record-copy">
                <GazeTitle className="era-record-title">The whole map</GazeTitle>
                <span className="era-dim era-excerpt">{mapLine(making)}</span>
              </span>
            </GazeHit>
            <span className="era-record-meta">Map</span>
          </Link>
        </li>
      </ol>
    </section>
  );
}

/** Under the posts in the token index: a headed list in the same rhythm. */
export function MakingTokensSection({ making }: { making: MakingIndex }) {
  return (
    <section className="mt-16" aria-labelledby="notebook-making-h" data-blueprint="making">
      <h2
        id="notebook-making-h"
        className="mb-3 text-3xl leading-tight md:text-4xl"
        style={{ color: "var(--text-main)", fontFamily: "var(--font-heading)" }}
      >
        How this was made
      </h2>
      <p className="mb-8 max-w-xl text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
        The loader eye and each era, taken apart: what each one came from, what it is built with, and what was thrown
        away to reach it.
      </p>
      <ol className="space-y-0">
        {making.items.map((n) => (
          <li
            key={n.slug}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 border-b py-6 first:pt-0"
            style={{ borderColor: "var(--border-color)" }}
          >
            <span className="pt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              {n.made.replace(/^.* (\d{4})$/, "$1")}
            </span>
            <Link href={n.href} className="group block transition-opacity hover:opacity-70">
              <h3
                className="mb-2 text-xl md:text-2xl group-hover:underline"
                style={{ color: "var(--text-main)", fontFamily: "var(--font-heading)" }}
              >
                {n.title}
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {n.tldr}
              </p>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-lg">
        <Link
          href={making.href}
          className="underline underline-offset-4 transition-opacity hover:opacity-70"
          style={{ color: "var(--accent-color)" }}
        >
          See the whole map
        </Link>
        <span style={{ color: "var(--text-muted)" }}> · {mapLine(making)}</span>
      </p>
    </section>
  );
}
