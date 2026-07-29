"use client"

import { memo, useCallback, useState } from "react"
import type { ChangeEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react"

import type { CanvasEdge } from "@/types/canvas"

export const CanvasEdgeRenderer = memo(function CanvasEdgeRenderer({
  id,
  data,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow()
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  })

  const label = data?.label ?? ""
  const isActive = selected || isHovered

  const handleDoubleClick = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setIsEditing(true)
  }, [])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateEdgeData(id, { label: event.target.value })
    },
    [id, updateEdgeData]
  )

  const handleBlur = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Escape") {
      event.currentTarget.blur()
    }
  }, [])

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <path
          d={path}
          fill="none"
          strokeOpacity={0}
          strokeWidth={20}
          className="cursor-pointer"
        />
        <BaseEdge
          id={id}
          path={path}
          markerEnd={markerEnd}
          style={{
            stroke: isActive ? "var(--accent-primary)" : "var(--border-subtle)",
            strokeWidth: 1.5,
            strokeLinecap: "round",
            opacity: isActive ? 1 : 0.6,
            transition: "stroke 150ms, opacity 150ms",
          }}
        />
      </g>
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan nowheel absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDoubleClick={handleDoubleClick}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {isEditing ? (
            <input
              autoFocus
              value={label}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onMouseDown={(event) => event.stopPropagation()}
              className="rounded-full border border-surface-border bg-surface px-2 py-0.5 text-center text-xs text-copy-primary outline-none"
              style={{ width: `${Math.max(label.length, 1)}ch` }}
            />
          ) : label ? (
            <span className="rounded-full border border-surface-border bg-surface px-2 py-0.5 text-xs text-copy-primary">
              {label}
            </span>
          ) : isActive ? (
            <span className="rounded-full border border-dashed border-surface-border px-2 py-0.5 text-xs text-copy-faint">
              Double-click to label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
})
