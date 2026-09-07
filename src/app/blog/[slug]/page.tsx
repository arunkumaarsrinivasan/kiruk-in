import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getBlogPost, getBlogPosts } from '@/lib/content/blog'
import { renderMdx, readingTime } from '@/lib/content'
import { mdxComponents } from '@/components/blog/MdxComponents'
import { SketchInk } from '@/components/sketch-ink'
import { NotebookReaderBody, NotebookViewProvider } from '@/components/notebook'
import { parseNotebookView } from '@/lib/notebook'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): Array<{ slug: string }> {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return { title: 'Notebook' }
  const { title, excerpt, date, cover } = post.frontmatter
  const url = `/blog/${slug}`
  const images = cover ? [cover] : undefined
  return {
    title,
    description: excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description: excerpt,
      url,
      publishedTime: date,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt,
      images,
    },
  }
}

function formatDate(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const { summary } = post
  const readStats = readingTime(post.body)
  const content = await renderMdx(post.body, mdxComponents as never)
  const notebookFm = post.frontmatter as unknown as Record<string, unknown>
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
          href="/blog"
          className="mb-8 inline-block text-base opacity-55 transition-opacity hover:opacity-100"
          style={{ color: 'var(--text-muted)' }}
        >
          <SketchInk mode="script" intensity={0.35}>
            ← Notebook
          </SketchInk>
        </Link>

        <header className="mb-10">
          <h1 className="mb-4 text-3xl leading-tight md:text-5xl" style={{ color: 'var(--text-main)' }}>
            <SketchInk mode="auto" intensity={0.65}>
              {summary.title}
            </SketchInk>
          </h1>

          <div className="mb-6 flex flex-wrap gap-3 text-base" style={{ color: 'var(--text-muted)' }}>
            {summary.publishedDate && (
              <time>
                <SketchInk mode="script" intensity={0.35}>
                  {formatDate(summary.publishedDate)}
                </SketchInk>
              </time>
            )}
            <span>
              <SketchInk mode="script" intensity={0.35}>
                {readStats.text}
              </SketchInk>
            </span>
          </div>

          {summary.coverImage && (
            <div
              className="relative mb-8 aspect-[16/9] w-full overflow-hidden border"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
            >
              <Image
                src={summary.coverImage}
                alt={summary.title}
                fill
                priority
                className="object-contain object-top"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          {summary.excerpt && (
            <p
              className="border-l pl-4 text-lg leading-relaxed md:text-xl"
              style={{
                borderColor: 'var(--text-main)',
                color: 'var(--text-muted)',
              }}
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
            href="/blog"
            className="text-base transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-main)' }}
          >
            <SketchInk mode="script" intensity={0.35}>
              ← Back to notebook
            </SketchInk>
          </Link>
        </footer>
      </article>
    </main>
  )
}
