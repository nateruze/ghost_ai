"use client"

import { Loader2, MousePointer2 } from "lucide-react"
import { useOthers } from "@liveblocks/react"
import { useReactFlow } from "@xyflow/react"

export function LiveCursors() {
  const others = useOthers()
  const { flowToScreenPosition } = useReactFlow()

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {others.map((other) => {
        if (!other.presence.cursor) return null

        const { x, y } = flowToScreenPosition(other.presence.cursor)
        const name = other.info?.name ?? "Anonymous"
        const color = other.info?.color ?? "var(--accent-primary)"

        return (
          <div
            key={other.connectionId}
            className="absolute top-0 left-0"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <MousePointer2
              className="size-4"
              style={{ color, fill: color }}
            />
            <span
              className="ml-3 -mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap text-white"
              style={{ backgroundColor: color }}
            >
              {name}
              {other.presence.thinking ? (
                <Loader2 className="size-3 shrink-0 animate-spin" aria-label="thinking" />
              ) : null}
            </span>
          </div>
        )
      })}
    </div>
  )
}
