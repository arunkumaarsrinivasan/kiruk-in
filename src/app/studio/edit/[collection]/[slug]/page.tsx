import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { studioEnabled } from '@/lib/studio'
import { Editor } from '@/components/studio/Editor'

export const metadata: Metadata = {
  title: 'Studio — Edit',
  robots: { index: false, follow: false },
}

export default async function StudioEditPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>
}) {
  if (!studioEnabled()) notFound()
  const { collection, slug } = await params
  if (collection !== 'blog' && collection !== 'notes') notFound()
  return <Editor collection={collection} slug={slug} />
}
