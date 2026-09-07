import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { studioEnabled } from '@/lib/studio'
import { Dashboard } from '@/components/studio/Dashboard'

// Author-only surface — never indexed, 404 in production unless ALLOW_STUDIO=1.
export const metadata: Metadata = {
  title: 'Studio',
  robots: { index: false, follow: false },
}

export default function StudioPage() {
  if (!studioEnabled()) notFound()
  return <Dashboard />
}
