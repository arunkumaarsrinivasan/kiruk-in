import Link from 'next/link';
import { FigmaEmbed } from './FigmaEmbed';

export default function PortfolioSlidesPage() {
  return (
    <main
      className="min-h-screen px-4 py-6"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-xl font-mono font-black uppercase" style={{ color: 'var(--accent-color)' }}>
            Portfolio
          </h1>
          <Link
            href="/"
            className="text-xs font-mono font-bold uppercase tracking-wider transition-colors hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Home
          </Link>
        </div>

        <div className="border-2 p-2 md:p-3" style={{ borderColor: 'var(--border-color)' }}>
          <FigmaEmbed />
        </div>
      </div>
    </main>
  );
}
