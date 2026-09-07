/**
 * Scribble icons — Lucide geometry redrawn with Rough.js.
 *
 * Market pick for this notebook (vs Khushmeen Doodle / Streamline Freehand):
 * - True scribble strokes, not filled sticker doodles
 * - Full verb coverage (pen, eraser, undo, camera…)
 * - Tunable roughness for white paper / black ink
 * - ISC (Lucide) + MIT (Rough.js); swap NODES when kiruk icons land
 */
'use client'

import { useEffect, useState } from 'react'
import type { Options as RoughOptions } from 'roughjs/bin/core'
import rough from 'roughjs/bin/rough'

type SvgNode =
  | ['path', { d: string }]
  | ['circle', { cx: number; cy: number; r: number }]
  | ['line', { x1: number; y1: number; x2: number; y2: number }]

/** Lucide icon nodes (24×24) for studio verbs. */
const NODES: Record<string, SvgNode[]> = {
  type: [
    ['path', { d: 'M12 4v16' }],
    ['path', { d: 'M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2' }],
    ['path', { d: 'M9 20h6' }],
  ],
  ink: [
    ['path', { d: 'M12 20h9' }],
    [
      'path',
      {
        d: 'M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z',
      },
    ],
  ],
  pencil: [
    [
      'path',
      {
        d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z',
      },
    ],
    ['path', { d: 'm15 5 4 4' }],
  ],
  eraser: [
    [
      'path',
      {
        d: 'm7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21',
      },
    ],
    ['path', { d: 'M22 21H7' }],
    ['path', { d: 'm5 11 9 9' }],
  ],
  addText: [
    ['path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }],
    ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }],
    ['path', { d: 'M9 15h6' }],
    ['path', { d: 'M12 18v-6' }],
  ],
  addDraw: [
    ['path', { d: 'm14.622 17.897-10.68-2.913' }],
    [
      'path',
      {
        d: 'M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z',
      },
    ],
    [
      'path',
      {
        d: 'M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15',
      },
    ],
  ],
  addShot: [
    [
      'path',
      {
        d: 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z',
      },
    ],
    ['circle', { cx: 12, cy: 13, r: 3 }],
  ],
  save: [
    [
      'path',
      {
        d: 'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
      },
    ],
    ['path', { d: 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7' }],
    ['path', { d: 'M7 3v4a1 1 0 0 0 1 1h7' }],
  ],
  publish: [
    [
      'path',
      {
        d: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z',
      },
    ],
    ['path', { d: 'm21.854 2.147-10.94 10.939' }],
  ],
  remove: [
    ['path', { d: 'M18 6 6 18' }],
    ['path', { d: 'm6 6 12 12' }],
  ],
  clear: [
    ['path', { d: 'M3 6h18' }],
    ['path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }],
    ['path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }],
    ['line', { x1: 10, x2: 10, y1: 11, y2: 17 }],
    ['line', { x1: 14, x2: 14, y1: 11, y2: 17 }],
  ],
  undo: [
    ['path', { d: 'M9 14 4 9l5-5' }],
    ['path', { d: 'M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11' }],
  ],
  pen: [
    ['path', { d: 'M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2' }],
    ['path', { d: 'M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2' }],
    ['path', { d: 'M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8' }],
    [
      'path',
      {
        d: 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
      },
    ],
  ],
  back: [
    ['path', { d: 'm12 19-7-7 7-7' }],
    ['path', { d: 'M19 12H5' }],
  ],
}

export type StudioIconName = keyof typeof NODES

const ROUGH: RoughOptions = {
  roughness: 1.2,
  bowing: 1.05,
  strokeWidth: 1.4,
  fillStyle: 'solid',
  seed: 11,
}

function cleanMarkup(nodes: SvgNode[]): string {
  return nodes
    .map((node) => {
      if (node[0] === 'path') {
        return `<path d="${node[1].d}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
      }
      if (node[0] === 'circle') {
        const { cx, cy, r } = node[1]
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.5"/>`
      }
      const { x1, y1, x2, y2 } = node[1]
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`
    })
    .join('')
}

function scribbleMarkup(nodes: SvgNode[]): string {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const rc = rough.svg(svg, { options: { ...ROUGH, stroke: 'currentColor' } })
  const parts: string[] = []

  for (const node of nodes) {
    let drawable: SVGGElement
    if (node[0] === 'path') {
      drawable = rc.path(node[1].d, { stroke: 'currentColor', fill: 'none' })
    } else if (node[0] === 'circle') {
      const { cx, cy, r } = node[1]
      drawable = rc.circle(cx, cy, r * 2, { stroke: 'currentColor', fill: 'none' })
    } else {
      const { x1, y1, x2, y2 } = node[1]
      drawable = rc.line(x1, y1, x2, y2, { stroke: 'currentColor' })
    }
    // Force currentColor so active (white-on-black) buttons invert correctly.
    drawable.querySelectorAll('[stroke]').forEach((el) => {
      el.setAttribute('stroke', 'currentColor')
    })
    parts.push(drawable.outerHTML)
  }

  return parts.join('')
}

export function StudioIcon({
  name,
  size = 16,
  className,
}: {
  name: StudioIconName
  size?: number
  className?: string
}) {
  const nodes = NODES[name]
  const [html, setHtml] = useState(() => cleanMarkup(nodes))

  useEffect(() => {
    try {
      setHtml(scribbleMarkup(nodes))
    } catch {
      setHtml(cleanMarkup(nodes))
    }
  }, [nodes])

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      style={{ display: 'inline-block', flexShrink: 0, color: 'inherit' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
