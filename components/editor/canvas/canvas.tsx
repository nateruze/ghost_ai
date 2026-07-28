"use client"

import { useCallback, useRef } from "react"
import type { DragEvent } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"

import { CanvasNodeRenderer } from "@/components/editor/canvas/canvas-node"
import { ShapePanel } from "@/components/editor/canvas/shape-panel"
import {
  CANVAS_SHAPE_DRAG_TYPE,
  DEFAULT_NODE_COLOR,
  type CanvasEdge,
  type CanvasNode,
  type CanvasShapeDragPayload,
} from "@/types/canvas"

const nodeTypes = { canvasNode: CanvasNodeRenderer }

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>()
  const nodeCounterRef = useRef(0)

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const addNode = useCallback(
    (payload: CanvasShapeDragPayload, position: { x: number; y: number }) => {
      const { shape, width, height } = payload
      const id = `${shape}-${Date.now()}-${nodeCounterRef.current++}`

      const newNode: CanvasNode = {
        id,
        type: "canvasNode",
        position,
        width,
        height,
        data: { label: "", color: DEFAULT_NODE_COLOR, shape },
      }

      onNodesChange([{ type: "add", item: newNode }])
    },
    [onNodesChange]
  )

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const raw = event.dataTransfer.getData(CANVAS_SHAPE_DRAG_TYPE)
      if (!raw) return

      const payload = JSON.parse(raw) as CanvasShapeDragPayload

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(payload, position)
    },
    [addNode, screenToFlowPosition]
  )

  const onCreateShape = useCallback(
    (payload: CanvasShapeDragPayload) => {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })
      addNode(payload, position)
    },
    [addNode, screenToFlowPosition]
  )

  return (
    <div className="relative h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
      >
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <ShapePanel onCreateShape={onCreateShape} />
    </div>
  )
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  )
}
