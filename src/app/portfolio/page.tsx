import Link from 'next/link';

export default function PortfolioSlidesPage() {
  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>
              Portfolio Slides
            </p>
            <h1 className="text-3xl md:text-4xl font-mono font-black uppercase mt-2">
              Arun&apos;s Portfolio Deck
            </h1>
            <p className="text-sm md:text-base font-mono mt-3 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
              A curated walkthrough of recent UX and product design work. Use the deck controls to navigate or
              go full screen for a focused view.
            </p>
          </div>

          <Link
            href="/"
            className="px-5 py-3 border-2 font-mono font-bold uppercase text-xs md:text-sm transition-transform hover:-translate-y-0.5"
            style={{
              borderColor: 'var(--accent-color)',
              color: 'var(--accent-color)',
              backgroundColor: 'transparent',
            }}
          >
            ← Back to Home
          </Link>
        </div>

        <div className="mt-8 border-2 p-3 md:p-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-full aspect-video">
            <iframe
              title="Arun's portfolio slides"
              src="https://embed.figma.com/slides/XnfXOP7nWMgUIWv9MbEK26/Arun-s-portfolio?node-id=1-655&embed-host=share"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
          <p className="text-xs md:text-sm font-mono mt-3" style={{ color: 'var(--text-muted)' }}>
            Tip: Use the full-screen button inside the deck for the best viewing experience.
          </p>
        </div>
      </div>
    </main>
  );
}
