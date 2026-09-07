import type { Metadata } from 'next'
import Link from 'next/link'
import { getNotes } from '@/lib/content/notes'
import { StageChip } from '@/components/content/StageChip'
import { SketchInk } from '@/components/sketch-ink'

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Short thoughts, TILs, and seedlings — unfinished thinking, in the open.',
  alternates: { canonical: '/notes' },
}

export default function NotesPage() {
  const notes = getNotes()
  return (
    <main
      className="notebook-page min-h-screen px-4 py-8 md:py-12"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      <div className="relative z-10 mx-auto max-w-2xl md:max-w-3xl">
        <h1 className="mb-2 text-3xl md:text-4xl" style={{ color: 'var(--text-main)' }}>
          <SketchInk mode="print" intensity={0.55}>
            Notes
          </SketchInk>
        </h1>
        <p className="mb-8 text-base md:text-lg" style={{ color: 'var(--text-muted)' }}>
          <SketchInk mode="script" intensity={0.7}>
            Short thoughts and seedlings — unfinished thinking, in the open.
          </SketchInk>
        </p>

        {notes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            <SketchInk mode="script" intensity={0.45}>
              No notes yet.
            </SketchInk>
          </p>
        ) : (
          <ul className="space-y-8">
            {notes.map((n) => (
              <li key={n.slug} className="border-b pb-6" style={{ borderColor: 'var(--border-color)' }}>
                <div className="mb-2 flex items-center gap-3">
                  <StageChip stage={n.stage} />
                  {n.date && (
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      <SketchInk mode="script" intensity={0.35}>
                        {n.date}
                      </SketchInk>
                    </span>
                  )}
                </div>
                <Link
                  href={`/notes/${n.slug}`}
                  className="text-xl transition-opacity hover:opacity-70 md:text-2xl"
                  style={{ color: 'var(--text-main)' }}
                >
                  <SketchInk mode="auto" intensity={0.65}>
                    {n.title}
                  </SketchInk>
                </Link>
                {n.excerpt && (
                  <p className="mt-2 text-base leading-relaxed md:text-lg" style={{ color: 'var(--text-muted)' }}>
                    <SketchInk mode="script" intensity={0.7}>
                      {n.excerpt}
                    </SketchInk>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
