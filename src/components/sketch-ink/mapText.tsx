import { Children, Fragment, cloneElement, isValidElement, type ReactNode } from 'react'
import { SketchInk } from '@/components/sketch-ink/SketchInk'
import type { SketchAction, SketchMode } from '@/lib/sketch-ink'

/** Walk React nodes and wrap plain text in SketchInk (keeps links/components). */
export function sketchTextNodes(
  children: ReactNode,
  mode: SketchMode = 'script',
  intensity = 0.7,
  action: SketchAction = 'type',
): ReactNode {
  return Children.map(children, (child, i) => {
    if (child == null || typeof child === 'boolean') return child
    if (typeof child === 'string' || typeof child === 'number') {
      const text = String(child)
      if (!text.trim()) return text
      return (
        <SketchInk key={`sk-${i}`} mode={mode} intensity={intensity} action={action}>
          {text}
        </SketchInk>
      )
    }
    if (Array.isArray(child)) {
      return (
        <Fragment key={`sk-arr-${i}`}>
          {sketchTextNodes(child, mode, intensity, action)}
        </Fragment>
      )
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children != null) {
      return cloneElement(child, {
        ...child.props,
        children: sketchTextNodes(child.props.children, mode, intensity, action),
      })
    }
    return child
  })
}
