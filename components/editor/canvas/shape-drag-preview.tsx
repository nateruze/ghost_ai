"use client"

import { ShapeVisual } from "@/components/editor/canvas/shape-visual"
import { DEFAULT_NODE_COLOR, DEFAULT_NODE_TEXT_COLOR, type CanvasShapeDragPayload } from "@/types/canvas"

interface ShapeDragPreviewProps {
  payload: CanvasShapeDragPayload
  x: number
  y: number
}

export function ShapeDragPreview({ payload, x, y }: ShapeDragPreviewProps) {
  return (
    <div
      className="pointer-events-none fixed z-50 opacity-60"
      style={{
        left: x,
        top: y,
        width: payload.width,
        height: payload.height,
        transform: "translate(-50%, -50%)",
      }}
    >
      <ShapeVisual
        shape={payload.shape}
        color={DEFAULT_NODE_COLOR}
        textColor={DEFAULT_NODE_TEXT_COLOR}
        selected={false}
      />
    </div>
  )
}
