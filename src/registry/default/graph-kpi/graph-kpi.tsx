import type { ReactNode } from "react"

import {
  Graph,
  GraphBody,
  GraphTick,
  firstToken,
  GraphTrack,
  linesOf,
  numbers,
  splitDash,
  type GraphFrame,
} from "@/registry/default/graph-frame/graph-frame"
import {
  DIM_OPACITY,
  isMonoPalette,
  resolveGlyphs,
  toneClass,
  type Glyphs,
  type GraphPalette,
} from "@/registry/default/graph-frame/graph-motion"
import { cn } from "@/lib/utils"

const SPARK_DEFAULT = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]

type GraphKpiProps = {
  title?: string
  value?: string
  label?: string
  hint?: string
  /** `[4, 5, 6]` or `"4 5 6"`. Sparkline under the number. */
  data?: number[] | string
  /**
   * Markdown. First line `12,400 this week — +18%` (value, label, hint),
   * then a line of numbers for the sparkline.
   */
  children?: ReactNode
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  frame?: GraphFrame
  className?: string
}

function GraphKpi({
  title,
  value: valueProp,
  label: labelProp,
  hint: hintProp,
  data: dataProp,
  children,
  glyphs,
  palette,
  corner,
  frame,
  className,
}: GraphKpiProps) {
  const [head = "", ...tail] = linesOf(children)
  const { token, rest } = firstToken(head)
  const written = splitDash(rest)
  const value = valueProp ?? token
  const label = labelProp ?? written.label
  const hint = hintProp ?? (written.rest || undefined)
  const data = numbers(dataProp ?? tail.join(" "))
  const max = Math.max(...data, 1)
  const last = data.length - 1
  const set = glyphs == null ? SPARK_DEFAULT : resolveGlyphs(glyphs)
  const points = data.map((entry) => {
    const index = Math.round((entry / max) * (set.length - 1))
    return set[index] ?? set[0] ?? "▁"
  })

  return (
    <Graph title={title} className={className} corner={corner} frame={frame}>
      <GraphBody className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p
            className={cn(
              "text-3xl tracking-tight tabular-nums sm:text-4xl",
              toneClass(palette, "primary")
            )}
          >
            {value}
          </p>
          <div className="flex items-baseline gap-3">
            <p className="text-graph-muted">{label}</p>
            {hint ? (
              <p className="text-graph-muted tabular-nums">{hint}</p>
            ) : null}
          </div>
        </div>
        {points.length > 0 ? (
          <GraphTrack className="justify-start gap-0.5">
            {points.map((glyph, index) => {
              const live = index === last

              return (
                <GraphTick className="flex-none" key={`${glyph}-${index}`}>
                  <span
                    className={cn(
                      live
                        ? toneClass(palette, "primary")
                        : toneClass(palette, "secondary")
                    )}
                    style={
                      live || !isMonoPalette(palette)
                        ? undefined
                        : { opacity: DIM_OPACITY }
                    }
                  >
                    {glyph}
                  </span>
                </GraphTick>
              )
            })}
          </GraphTrack>
        ) : null}
        <span className="sr-only">
          {value} {label}
          {hint ? `. ${hint}` : ""}
        </span>
      </GraphBody>
    </Graph>
  )
}

export { GraphKpi }
export type { GraphKpiProps }
