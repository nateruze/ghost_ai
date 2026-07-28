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
  textColor: string
  shape: CanvasShape
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string
}

export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">

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

// Predefined node background/text color pairs — see context/ui-context.md "Node Color Palette"
export interface NodeColorPair {
  background: string
  text: string
}

export const NODE_COLORS: NodeColorPair[] = [
  { background: "#1F1F1F", text: "#EDEDED" },
  { background: "#10233D", text: "#52A8FF" },
  { background: "#2E1938", text: "#BF7AF0" },
  { background: "#331B00", text: "#FF990A" },
  { background: "#3C1618", text: "#FF6166" },
  { background: "#3A1726", text: "#F75F8F" },
  { background: "#0F2E18", text: "#62C073" },
  { background: "#062822", text: "#0AC7B4" },
]

export const DEFAULT_NODE_COLOR = NODE_COLORS[0].background
export const DEFAULT_NODE_TEXT_COLOR = NODE_COLORS[0].text

export const MIN_NODE_SIZE: CanvasShapeSize = { width: 40, height: 40 }

export const CANVAS_SHAPE_DRAG_TYPE = "application/x-ghost-canvas-shape"

export interface CanvasShapeDragPayload {
  shape: CanvasShape
  width: number
  height: number
}
