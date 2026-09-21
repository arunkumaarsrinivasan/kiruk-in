import type { ReactNode } from 'react'

/**
 * MDX `<Pretext>` used to paint SketchInk. The public notebook is clean type now;
 * keep the tag so old posts do not break, but render children as ordinary copy.
 */
export function Pretext({
  children,
}: {
  children?: ReactNode
  align?: string
  lineAligns?: string[]
  flow?: unknown
  action?: string
  intensity?: number
  seedKey?: string
}) {
  return <div className="pretext-block">{children}</div>
}
