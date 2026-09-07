import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getNote, getNotes } from '@/lib/content/notes'
import { renderMdx, readingTime } from '@/lib/content'
import { mdxComponents } from '@/components/blog/MdxComponents'
import { StageChip } from '@/components/content/StageChip'
import { SketchInk } from '@/components/sketch-ink'
import { NotebookReaderBody, NotebookViewProvider } from '@/components/notebook'
import { parseNotebookView } from '@/lib/notebook'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): Array<{ slug: string }> {
  return getNotes().map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const note = getNote(slug)
  if (!note) return { title: 'Notes' }
  const { title, excerpt, date } = note.frontmatter
  const url = `/notes/${slug}`
  return {
    title,
    description: excerpt,
    alternates: { canonical: url },
    openGraph: { type: 'article', title, description: excerpt, url, publishedTime: date },
  }
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params
  const note = getNote(slug)
  if (!note) notFound()

  const { summary } = note
  const readStats = readingTime(note.body)
  const content = await renderMdx(note.body, mdxComponents as never)
  const notebookFm = note.frontmatter as unknown as Record<string, unknown>
  const notebookView = parseNotebookView(notebookFm)

  return (
    <main
      className="notebook-page min-h-screen px-4 py-8 md:py-12"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      <article
        className={`relative z-10 mx-auto ${
          notebookView.layout === 'spread' || notebookView.fit
            ? 'w-full max-w-none px-3 md:px-5'
            : 'max-w-2xl md:max-w-3xl'
        }`}
      >
        <Link
          href="/notes"
          className="mb-8 inline-block text-base opacity-55 transition-opacity hover:opacity-100"
          style={{ color: 'var(--text-muted)' }}
        >
          <SketchInk mode="script" intensity={0.35}>
            ← Notes
          </SketchInk>
        </Link>

        <header className="mb-10">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <StageChip stage={summary.stage} />
            {summary.date && (
              <span className="text-base" style={{ color: 'var(--text-muted)' }}>
                <SketchInk mode="script" intensity={0.35}>
                  {summary.date}
                </SketchInk>
              </span>
            )}
            <span className="text-base" style={{ color: 'var(--text-muted)' }}>
              <SketchInk mode="script" intensity={0.35}>
                {readStats.text}
              </SketchInk>
            </span>
          </div>

          <h1 className="mb-4 text-3xl leading-tight md:text-4xl" style={{ color: 'var(--text-main)' }}>
            <SketchInk mode="auto" intensity={0.65}>
              {summary.title}
            </SketchInk>
          </h1>

          {summary.excerpt && (
            <p
              className="border-l pl-4 text-lg leading-relaxed md:text-xl"
              style={{ borderColor: 'var(--text-main)', color: 'var(--text-muted)' }}
            >
              <SketchInk mode="script" intensity={0.7}>
                {summary.excerpt}
              </SketchInk>
            </p>
          )}
        </header>

        <NotebookViewProvider view={notebookView}>
          <NotebookReaderBody frontmatter={notebookFm}>{content}</NotebookReaderBody>
        </NotebookViewProvider>

        <footer className="mt-12 border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
          <Link
            href="/notes"
            className="text-base transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-main)' }}
          >
            <SketchInk mode="script" intensity={0.35}>
              ← Back to notes
            </SketchInk>
          </Link>
        </footer>
      </article>
    </main>
  )
}
