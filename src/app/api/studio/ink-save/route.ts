import { writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { studioEnabled } from '@/lib/studio'
import { isCollection, isSafeSlug } from '@/lib/studio/posts'
import {
  type InkDocument,
  deserialize,
  exportSvg,
  serialize,
} from '@/lib/ink'

/**
 * Save Kiruk Ink page — writes ink-NN.json + ink-NN.svg and returns an
 * <InkPage> MDX snippet. Author-only.
 */
export const runtime = 'nodejs'

function nextInkId(dir: string): string {
  const nums = readdirSync(dir)
    .map((f) => f.match(/^ink-(\d+)\.(json|svg)$/)?.[1])
    .filter(Boolean)
    .map((n) => Number(n))
  const n = nums.length ? Math.max(...nums) + 1 : 1
  return `ink-${String(n).padStart(2, '0')}`
}

export async function POST(req: Request): Promise<Response> {
  if (!studioEnabled()) {
    return Response.json({ error: 'studio disabled' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as {
    collection?: unknown
    slug?: unknown
    doc?: unknown
    id?: unknown
  } | null

  if (!isCollection(body?.collection) || !isSafeSlug(body?.slug)) {
    return Response.json({ error: 'collection + valid slug required' }, { status: 400 })
  }

  let doc: InkDocument
  try {
    doc =
      typeof body.doc === 'string'
        ? deserialize(body.doc)
        : (body.doc as InkDocument)
    if (!doc?.version || !doc.size || !Array.isArray(doc.strokes)) {
      throw new Error('bad doc')
    }
  } catch {
    return Response.json({ error: 'valid InkDocument required' }, { status: 400 })
  }

  const collection = body.collection
  const slug = body.slug
  const dir = join(process.cwd(), 'public', collection, slug)
  mkdirSync(dir, { recursive: true })

  const id =
    typeof body.id === 'string' && /^ink-\d+$/.test(body.id)
      ? body.id
      : nextInkId(dir)

  const jsonPath = join(dir, `${id}.json`)
  const svgPath = join(dir, `${id}.svg`)
  writeFileSync(jsonPath, serialize(doc), 'utf8')
  writeFileSync(svgPath, exportSvg(doc), 'utf8')

  const src = `/${collection}/${slug}/${id}.svg`
  const snippet = `<InkPage src="${src}" alt="Handwritten page" />`

  return Response.json({
    ok: true,
    id,
    src,
    json: `/${collection}/${slug}/${id}.json`,
    snippet,
  })
}
