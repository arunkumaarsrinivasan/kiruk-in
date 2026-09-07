'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Reader for MDX `<InkLayer src="..." />`.
 * Positions itself as a transparent overlay over the previous sibling
 * (the paragraph the author drew on in the studio).
 */
export function InkLayer({ src, alt }: { src: string; alt?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(
    null,
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const parent = el.parentElement
    if (!parent) return

    const sync = () => {
      const prev = el.previousElementSibling as HTMLElement | null
      if (!prev) {
        setBox(null)
        return
      }
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative'
      }
      const parentBox = parent.getBoundingClientRect()
      const prevBox = prev.getBoundingClientRect()
      setBox({
        top: prevBox.top - parentBox.top + parent.scrollTop,
        left: prevBox.left - parentBox.left + parent.scrollLeft,
        width: prevBox.width,
        height: Math.max(prevBox.height, 48),
      })
    }

    sync()
    const ro = new ResizeObserver(sync)
    if (el.previousElementSibling) ro.observe(el.previousElementSibling)
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [src])

  return (
    <span ref={ref} className="ink-layer" aria-hidden style={{ display: 'block', height: 0, lineHeight: 0 }}>
      {box && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || ''}
          draggable={false}
          style={{
            position: 'absolute',
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
            objectFit: 'fill',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}
    </span>
  )
}
