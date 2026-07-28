"use client"

import { useState } from "react"

import { NODE_COLORS, type NodeColorPair } from "@/types/canvas"

interface NodeColorToolbarProps {
  activeColor: string
  activeTextColor: string
  onSelect: (pair: NodeColorPair) => void
}

export function NodeColorToolbar({ activeColor, activeTextColor, onSelect }: NodeColorToolbarProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div
      className="nodrag nopan nowheel absolute -top-12 left-1/2 z-10 -translate-x-1/2"
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-surface-border bg-elevated px-2 py-1.5 shadow-lg">
        {NODE_COLORS.map((pair) => {
          const isActive = pair.background === activeColor && pair.text === activeTextColor
          const isHovered = hovered === pair.background
          const ring = isActive ? `0 0 0 2px ${pair.text}` : undefined
          const glow = isHovered ? `0 0 4px 1px ${pair.text}` : undefined

          return (
            <button
              key={pair.background}
              type="button"
              onClick={() => onSelect(pair)}
              onMouseEnter={() => setHovered(pair.background)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`Set node color to ${pair.background}`}
              aria-pressed={isActive}
              className="size-5 shrink-0 cursor-pointer rounded-full border border-black/20 transition-transform hover:scale-110"
              style={{
                backgroundColor: pair.background,
                boxShadow: [ring, glow].filter(Boolean).join(", ") || undefined,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
