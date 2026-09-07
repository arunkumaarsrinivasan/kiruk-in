import { writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import { studioEnabled } from '@/lib/studio'
import { isCollection, isSafeSlug } from '@/lib/studio/posts'

/**
 * Screenshot / raster upload — lands under public/<collection>/<slug>/shot-NN.*
 * and returns a <Figure> snippet. No vectorizer pipeline.
 */
export const runtime = 'nodejs'

const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])

function nextShotId(dir: string): string {
  const nums = readdirSync(dir)
    .map((f) => f.match(/^shot-(\d+)\./)?.[1])
    .filter(Boolean)
    .map((n) => Number(n))
  const n = nums.length ? Math.max(...nums) + 1 : 1
  return `shot-${String(n).padStart(2, '0')}`
}

export async function POST(req: Request): Promise<Response> {
  if (!studioEnabled()) {
    return Response.json({ error: 'studio disabled' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as {
    collection?: unknown
    slug?: unknown
    dataUrl?: unknown
    filename?: unknown
  } | null

  if (
    !isCollection(body?.collection) ||
    !isSafeSlug(body?.slug) ||
    typeof body?.dataUrl !== 'string'
  ) {
    return Response.json({ error: 'collection, valid slug, dataUrl required' }, { status: 400 })
  }

  const match = body.dataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!match) {
    return Response.json({ error: 'invalid dataUrl' }, { status: 400 })
  }

  let ext = `.${match[1] === 'jpeg' ? 'jpg' : match[1]}`
  if (typeof body.filename === 'string') {
    const fromName = extname(body.filename).toLowerCase()
    if (ALLOWED.has(fromName)) ext = fromName
  }
  if (!ALLOWED.has(ext)) {
    return Response.json({ error: 'unsupported image type' }, { status: 400 })
  }

  const dir = join(process.cwd(), 'public', body.collection, body.slug)
  mkdirSync(dir, { recursive: true })
  const id = nextShotId(dir)
  const filename = `${id}${ext}`
  writeFileSync(join(dir, filename), Buffer.from(match[2], 'base64'))

  const src = `/${body.collection}/${body.slug}/${filename}`
  const snippet = `<Figure\n  src="${src}"\n  alt="Screenshot"\n/>`

  return Response.json({ ok: true, src, snippet })
}
