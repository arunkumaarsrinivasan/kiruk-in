'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudioIcon } from '@/components/studio/icons'
import { SketchInk } from '@/components/sketch-ink'

/**
 * Author dashboard — white paper desk (digital/black skin comes later).
 */
type Collection = 'blog' | 'notes'
interface PostItem {
  collection: Collection
  fileSlug: string
  title: string
  draft: boolean
  stage: string
  date: string
}

export function Dashboard() {
  const router = useRouter()
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [collection, setCollection] = useState<Collection>('blog')
  const [title, setTitle] = useState('')

  async function refresh() {
    setLoading(true)
    const data = await fetch('/api/studio/posts').then((r) => r.json())
    setPosts(data.posts ?? [])
    setLoading(false)
  }
  useEffect(() => {
    refresh()
  }, [])

  async function create() {
    if (!title.trim()) return
    const res = await fetch('/api/studio/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, title }),
    })
    const json = await res.json()
    if (json.slug) router.push(`/studio/edit/${collection}/${json.slug}`)
  }

  async function remove(p: PostItem) {
    if (!confirm(`Delete ${p.collection}/${p.fileSlug}? (MDX only; assets kept)`)) return
    await fetch('/api/studio/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: p.collection, slug: p.fileSlug }),
    })
    refresh()
  }

  return (
    <div className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-lg" style={{ color: 'var(--text-muted)' }}>
          <SketchInk mode="script" intensity={0.4}>
            paper
          </SketchInk>
        </p>
        <h1 className="studio-title mb-3 text-4xl md:text-5xl" style={{ color: 'var(--ink-line)' }}>
          <SketchInk mode="print" intensity={0.55}>
            STUDIO
          </SketchInk>
        </h1>
        <p className="mb-12 max-w-sm text-xl leading-snug" style={{ color: 'var(--text-muted)' }}>
          <SketchInk mode="script" intensity={0.7}>
            one white page. type, ink, screenshots — publish in black.
          </SketchInk>
        </p>

        <div className="studio-paper mb-10 flex flex-wrap items-center gap-2 p-3">
          <select
            value={collection}
            onChange={(e) => setCollection(e.target.value as Collection)}
            className="border px-2.5 py-1.5 text-sm outline-none"
            style={{
              borderColor: 'var(--border-color)',
              background: 'var(--bg-paper)',
              color: 'var(--text-main)',
            }}
          >
            <option value="blog">blog</option>
            <option value="notes">notes</option>
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
            placeholder="New page title…"
            className="min-w-[12rem] flex-1 border px-2.5 py-1.5 text-sm outline-none"
            style={{
              borderColor: 'var(--border-color)',
              background: 'var(--bg-paper)',
              color: 'var(--text-main)',
            }}
          />
          <button
            type="button"
            onClick={create}
            className="studio-btn studio-btn-active inline-flex items-center gap-1.5 px-4 py-1.5 font-medium"
          >
            <StudioIcon name="addText" size={18} />
            <SketchInk mode="script" intensity={0.45}>
              new page
            </SketchInk>
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading…
          </p>
        ) : posts.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No pages yet. Start one above.
          </p>
        ) : (
          <ul className="studio-paper divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {posts.map((p) => (
              <li
                key={`${p.collection}/${p.fileSlug}`}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span
                  className="w-12 shrink-0 text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {p.collection}
                </span>
                {p.draft && (
                  <span
                    className="border px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                  >
                    draft
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => router.push(`/studio/edit/${p.collection}/${p.fileSlug}`)}
                  className="flex-1 text-left text-lg transition-opacity hover:opacity-60"
                  style={{ color: 'var(--text-main)' }}
                >
                  <SketchInk mode="auto" intensity={0.6}>
                    {p.title}
                  </SketchInk>
                </button>
                <button
                  type="button"
                  onClick={() => remove(p)}
                  className="text-[11px] uppercase tracking-wider transition-opacity hover:opacity-100"
                  style={{ color: 'var(--text-muted)', opacity: 0.55 }}
                >
                  delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
