import type { Edge, Node } from "@xyflow/react"

export const CANVAS_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const

export type CanvasShape = (typeof CANVAS_SHAPES)[number]

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color: string
  shape: CanvasShape
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">
export type CanvasEdge = Edge<Record<string, never>, "canvasEdge">

export interface CanvasShapeSize {
  width: number
  height: number
}

export const SHAPE_DEFAULT_SIZES: Record<CanvasShape, CanvasShapeSize> = {
  rectangle: { width: 160, height: 80 },
  diamond: { width: 180, height: 180 },
  circle: { width: 120, height: 120 },
  pill: { width: 160, height: 60 },
  cylinder: { width: 120, height: 140 },
  hexagon: { width: 170, height: 110 },
}

export const DEFAULT_NODE_COLOR = "#00c8d4"

export const CANVAS_SHAPE_DRAG_TYPE = "application/x-ghost-canvas-shape"

export interface CanvasShapeDragPayload {
  shape: CanvasShape
  width: number
  height: number
}
