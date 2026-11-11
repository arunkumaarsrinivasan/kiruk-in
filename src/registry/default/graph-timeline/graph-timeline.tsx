import type { ReactNode } from "react"

import {
  childItems,
  defineItem,
  Graph,
  GraphBody,
  GraphProse,
  hasHost,
  itemParts,
  listItems,
  splitDash,
  splitLabel,
  textOf,
  type GraphFrame,
} from "@/registry/default/graph-frame/graph-frame"
import {
  toneClass,
  type GraphPalette,
} from "@/registry/default/graph-frame/graph-motion"
import { cn } from "@/lib/utils"

type TimelineState = "done" | "now" | "next"

type TimelineEvent = {
  date: string
  /** Falls back to the child text: `<Event date="14:02">p95 crossed</Event>`. */
  label?: string
  state?: TimelineState
  /** Muted, under the label. `— note` in a list item, or its body paragraphs. */
  note?: ReactNode
}

type GraphTimelineProps = {
  title?: string
  /** Data form. Or write `<Event />` children. */
  events?: TimelineEvent[]
  children?: ReactNode
  palette?: GraphPalette
  corner?: string
  frame?: GraphFrame
  className?: string
}

/** `<Event date="Mar 18" state="now">Docs, live previews</Event>`. */
const Event = defineItem<TimelineEvent>("Event")

const mark: Record<TimelineState, string> = {
  done: "●",
  now: "●",
  next: "○",
}

function GraphTimeline({
  title,
  events: eventsProp,
  children,
  palette,
  corner,
  frame,
  className,
}: GraphTimelineProps) {
  const listed = listItems(children).map((item) => {
    const { head, body } = itemParts(item)
    const text = textOf(head).replace(/\s+/g, " ").trim()
    const { label: date, rest } = splitLabel(text)
    const { label, rest: aside } = splitDash(rest || date)
    const now = hasHost(head, ["strong", "b"])
    const next = !now && hasHost(head, ["em", "i"])
    return {
      date,
      label,
      note: body.length > 0 ? body : aside || undefined,
      state: (now ? "now" : next ? "next" : "done") as TimelineState,
    }
  })
  const tagged = childItems(children, Event).map((entry) => ({
    ...entry,
    label: entry.label ?? textOf(entry.children),
  }))
  const events = (eventsProp ?? (listed.length > 0 ? listed : tagged)).map(
    (entry) => ({ ...entry, label: entry.label ?? "" })
  )

  return (
    <Graph title={title} className={className} corner={corner} frame={frame}>
      <GraphBody>
        <ol
          className="flex flex-col"
          role="list"
        >
          {events.map((event, index) => {
            const state = event.state ?? "done"
            const last = index === events.length - 1
            const live = state === "now"

            return (
              <li
                key={`${event.date}-${event.label}`}
                className="flex flex-col"
              >
                <div className="grid grid-cols-[1.25rem_7rem_minmax(0,1fr)] items-baseline gap-x-4">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "text-center leading-none select-none",
                      live && toneClass(palette, "primary"),
                      state === "done" && "text-foreground",
                      state === "next" && toneClass(palette, "secondary")
                    )}
                  >
                    {mark[state]}
                  </span>
                  <span
                    className={cn(
                      "tabular-nums",
                      state === "next"
                        ? toneClass(palette, "secondary")
                        : "text-foreground"
                    )}
                  >
                    {event.date}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span
                      className={cn(
                        live && toneClass(palette, "primary"),
                        state === "done" && "text-foreground",
                        state === "next" && toneClass(palette, "secondary")
                      )}
                    >
                      {event.label}
                    </span>
                    {event.note ? (
                      <GraphProse className="text-graph-muted">
                        {event.note}
                      </GraphProse>
                    ) : null}
                  </span>
                </div>
                {last ? null : (
                  <div
                    aria-hidden="true"
                    className="grid grid-cols-[1.25rem_7rem_minmax(0,1fr)] gap-x-4 py-1 select-none"
                  >
                    <span className="text-center text-graph-frame">│</span>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </GraphBody>
    </Graph>
  )
}

export { Event, GraphTimeline }
export type { GraphTimelineProps, TimelineEvent, TimelineState }
