import { readFileSync, existsSync } from 'node:fs'
import { notFound } from 'next/navigation'
import { studioEnabled } from '@/lib/studio'
import { renderMdx } from '@/lib/content'
import { mdxComponents } from '@/components/blog/MdxComponents'
import { PREVIEW_FILE } from '@/lib/studio/preview-path'

// Always re-read the stashed body; never cache.
export const dynamic = 'force-dynamic'

export default async function StudioPreviewPage() {
  if (!studioEnabled()) notFound()

  const source = existsSync(PREVIEW_FILE) ? readFileSync(PREVIEW_FILE, 'utf8') : ''
  let content: React.ReactNode
  try {
    content = await renderMdx(source, mdxComponents as never)
  } catch (err) {
    content = (
      <pre style={{ color: 'crimson', whiteSpace: 'pre-wrap' }} className="font-mono text-xs">
        {(err as Error).message}
      </pre>
    )
  }

  return (
    <main
      className="min-h-screen px-6 py-8"
      style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
    >
      <div className="mx-auto max-w-3xl">{content}</div>
    </main>
  )
}
