import Link from "next/link";
import { FigmaEmbed } from "@/app/portfolio/FigmaEmbed";
import { EraHandoff } from "@/components/era-shell/EraHandoff";
import { SITE_URL } from "@/lib/site";
import { WorkDesktop } from "./components/WorkDesktop";

const DESCRIPTION =
  "Selected design engineering work from Kiruk Studio — Spera.bot, HP Print AI, Mudra Stack, Square Bridge, PeopleGamez, and experimental web work from Bengaluru.";

const workJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/work#page`,
  url: `${SITE_URL}/work`,
  name: "Work — selected projects by Kiruk Studio",
  description: DESCRIPTION,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#person` },
};

export default function WorkPage() {
  return (
    <>
      <p className="sr-only">{DESCRIPTION}</p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workJsonLd) }}
      />
    <EraHandoff ask="work">
      <div
        className="relative z-10 min-h-dvh overflow-y-auto"
        style={{
          backgroundColor: "var(--bg-main)",
          color: "var(--text-main)",
          paddingTop: "var(--simple-game-nav-bottom, 4.5rem)",
        }}
      >
        <WorkDesktop title="Work" />

        <section
          id="deck"
          data-blueprint="deck"
          className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8"
        >
          <div
            className="mb-6 border-t pt-10"
            style={{ borderColor: "var(--border-color)" }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: "var(--accent-color)" }}
            >
              Portfolio deck
            </p>
            <h2
              className="mt-1 text-lg font-bold sm:text-xl"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--text-main)",
              }}
            >
              The slides
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Same work, in a Figma deck if you want to flip through it that
              way.
            </p>
          </div>
          <div
            className="border-2 p-2 md:p-3"
            style={{ borderColor: "var(--border-color)" }}
          >
            <FigmaEmbed />
          </div>
        </section>

        <nav
          className="relative z-10 mx-auto flex max-w-6xl flex-wrap gap-6 px-4 pb-20 text-sm sm:px-6 lg:px-8"
          aria-label="More work"
          style={{ color: "var(--text-muted)" }}
        >
          <Link
            href="/"
            className="site-crumb-link underline decoration-dotted underline-offset-4"
          >
            Home
          </Link>
          <Link
            href="/work/observatory"
            className="site-crumb-link underline decoration-dotted underline-offset-4"
          >
            Skills observatory
          </Link>
          <Link
            href="/notebook"
            className="site-crumb-link underline decoration-dotted underline-offset-4"
          >
            Notebook
          </Link>
        </nav>
      </div>
    </EraHandoff>
    </>
  );
}
