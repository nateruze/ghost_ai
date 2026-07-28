"use client"

import type { DragEvent } from "react"
import {
  Circle,
  Diamond,
  Hexagon,
  Pill as PillIcon,
  RectangleHorizontal,
  Cylinder as CylinderIcon,
} from "lucide-react"

import {
  CANVAS_SHAPE_DRAG_TYPE,
  SHAPE_DEFAULT_SIZES,
  type CanvasShape,
  type CanvasShapeDragPayload,
} from "@/types/canvas"

const SHAPE_ICONS: Record<CanvasShape, typeof RectangleHorizontal> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: PillIcon,
  cylinder: CylinderIcon,
  hexagon: Hexagon,
}

const SHAPE_LABELS: Record<CanvasShape, string> = {
  rectangle: "Rectangle",
  diamond: "Diamond",
  circle: "Circle",
  pill: "Pill",
  cylinder: "Cylinder",
  hexagon: "Hexagon",
}

const SHAPES = Object.keys(SHAPE_DEFAULT_SIZES) as CanvasShape[]

const EMPTY_DRAG_IMAGE = typeof Image !== "undefined" ? new Image() : undefined
if (EMPTY_DRAG_IMAGE) {
  EMPTY_DRAG_IMAGE.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7"
}

interface ShapePanelProps {
  onCreateShape: (payload: CanvasShapeDragPayload) => void
  onDragStart: (payload: CanvasShapeDragPayload, x: number, y: number) => void
  onDragEnd: () => void
}

export function ShapePanel({ onCreateShape, onDragStart, onDragEnd }: ShapePanelProps) {
  function handleDragStart(event: DragEvent<HTMLButtonElement>, shape: CanvasShape) {
    const { width, height } = SHAPE_DEFAULT_SIZES[shape]
    const payload: CanvasShapeDragPayload = { shape, width, height }
    event.dataTransfer.setData(CANVAS_SHAPE_DRAG_TYPE, JSON.stringify(payload))
    event.dataTransfer.effectAllowed = "move"
    if (EMPTY_DRAG_IMAGE) {
      event.dataTransfer.setDragImage(EMPTY_DRAG_IMAGE, 0, 0)
    }
    onDragStart(payload, event.clientX, event.clientY)
  }

  function handleClick(shape: CanvasShape) {
    const { width, height } = SHAPE_DEFAULT_SIZES[shape]
    onCreateShape({ shape, width, height })
  }

  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-surface-border bg-surface p-2 shadow-lg">
        {SHAPES.map((shape) => {
          const Icon = SHAPE_ICONS[shape]
          return (
            <button
              key={shape}
              type="button"
              draggable
              onDragStart={(event) => handleDragStart(event, shape)}
              onDragEnd={onDragEnd}
              onClick={() => handleClick(shape)}
              aria-label={SHAPE_LABELS[shape]}
              title={SHAPE_LABELS[shape]}
              className="flex size-9 cursor-grab items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary active:cursor-grabbing"
            >
              <Icon className="size-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
