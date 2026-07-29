"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import type { DragEvent } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import {
  useCanRedo,
  useCanUndo,
  useRedo,
  useRoom,
  useUndo,
  useUpdateMyPresence,
} from "@liveblocks/react"

import { AiStatusBanner } from "@/components/editor/canvas/ai-status-banner"
import { CanvasControls } from "@/components/editor/canvas/canvas-controls"
import { CanvasEdgeRenderer } from "@/components/editor/canvas/canvas-edge"
import { CanvasNodeRenderer } from "@/components/editor/canvas/canvas-node"
import { LiveCursors } from "@/components/editor/canvas/live-cursors"
import { PresenceAvatars } from "@/components/editor/canvas/presence-avatars"
import { ShapeDragPreview } from "@/components/editor/canvas/shape-drag-preview"
import { ShapePanel } from "@/components/editor/canvas/shape-panel"
import { useCanvasAutosave, type SaveStatus } from "@/hooks/use-canvas-autosave"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import {
  CANVAS_SHAPE_DRAG_TYPE,
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_TEXT_COLOR,
  type CanvasEdge,
  type CanvasNode,
  type CanvasShapeDragPayload,
} from "@/types/canvas"

export interface CanvasHandle {
  importTemplate: (template: CanvasTemplate) => void
}

export interface CanvasProps {
  projectId: string
  onSaveStatusChange?: (status: SaveStatus) => void
}

const nodeTypes = { canvasNode: CanvasNodeRenderer }
const edgeTypes = { canvasEdge: CanvasEdgeRenderer }

const defaultEdgeOptions = {
  type: "canvasEdge" as const,
  markerEnd: { type: MarkerType.ArrowClosed, color: "var(--border-subtle)" },
}

const CanvasInner = forwardRef<CanvasHandle, CanvasProps>(function CanvasInner(
  { projectId, onSaveStatusChange },
  ref
) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })
  const reactFlowInstance = useReactFlow<CanvasNode, CanvasEdge>()
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = reactFlowInstance
  const nodeCounterRef = useRef(0)
  const updateMyPresence = useUpdateMyPresence()
  const room = useRoom()

  const saveStatus = useCanvasAutosave({ projectId, nodes, edges })
  useEffect(() => {
    onSaveStatusChange?.(saveStatus)
  }, [saveStatus, onSaveStatusChange])

  const [initialNodeCount] = useState(() => nodes.length)
  const [initialEdgeCount] = useState(() => edges.length)
  useEffect(() => {
    if (initialNodeCount > 0 || initialEdgeCount > 0) return

    let cancelled = false
    async function loadSavedCanvas() {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`)
        if (!response.ok || cancelled) return

        const saved = (await response.json()) as {
          nodes?: CanvasNode[]
          edges?: CanvasEdge[]
        }
        if (cancelled) return

        const savedNodes = saved.nodes ?? []
        const savedEdges = saved.edges ?? []
        if (savedNodes.length > 0) {
          onNodesChange(savedNodes.map((item) => ({ type: "add", item })))
        }
        if (savedEdges.length > 0) {
          onEdgesChange(savedEdges.map((item) => ({ type: "add", item })))
        }
      } catch {
        // Ignore load errors; user starts with an empty canvas.
      }
    }

    loadSavedCanvas()
    return () => {
      cancelled = true
    }
  }, [projectId, initialNodeCount, initialEdgeCount, onNodesChange, onEdgesChange])

  const handleCanvasMouseMove = useCallback(
    (event: { clientX: number; clientY: number }) => {
      updateMyPresence({
        cursor: screenToFlowPosition({ x: event.clientX, y: event.clientY }),
      })
    },
    [screenToFlowPosition, updateMyPresence]
  )

  const handleCanvasMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const handleZoomIn = useCallback(() => zoomIn({ duration: 200 }), [zoomIn])
  const handleZoomOut = useCallback(() => zoomOut({ duration: 200 }), [zoomOut])
  const handleFitView = useCallback(() => fitView({ duration: 200 }), [fitView])

  useKeyboardShortcuts({ reactFlowInstance, onUndo: undo, onRedo: redo })

  const [dragPayload, setDragPayload] = useState<CanvasShapeDragPayload | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })

  const handleShapeDragStart = useCallback(
    (payload: CanvasShapeDragPayload, x: number, y: number) => {
      setDragPayload(payload)
      setDragPos({ x, y })
    },
    []
  )

  const handleShapeDragEnd = useCallback(() => {
    setDragPayload(null)
  }, [])

  useEffect(() => {
    if (!dragPayload) return

    function handleDocumentDragOver(event: globalThis.DragEvent) {
      setDragPos({ x: event.clientX, y: event.clientY })
    }

    document.addEventListener("dragover", handleDocumentDragOver)
    return () => document.removeEventListener("dragover", handleDocumentDragOver)
  }, [dragPayload])

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
        data: { label: "", color: DEFAULT_NODE_COLOR, textColor: DEFAULT_NODE_TEXT_COLOR, shape },
      }

      onNodesChange([{ type: "add", item: newNode }])
    },
    [onNodesChange]
  )

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragPayload(null)

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

  const importTemplate = useCallback(
    (template: CanvasTemplate) => {
      room.batch(() => {
        const currentNodes = reactFlowInstance.getNodes()
        const currentEdges = reactFlowInstance.getEdges()

        if (currentNodes.length > 0) {
          onNodesChange(currentNodes.map((existing) => ({ type: "remove", id: existing.id })))
        }
        if (currentEdges.length > 0) {
          onEdgesChange(currentEdges.map((existing) => ({ type: "remove", id: existing.id })))
        }

        const newNodes: CanvasNode[] = template.nodes.map((templateNode) => ({
          id: templateNode.id,
          type: "canvasNode",
          position: templateNode.position,
          width: templateNode.width,
          height: templateNode.height,
          data: {
            label: templateNode.label,
            color: templateNode.color,
            textColor: templateNode.textColor,
            shape: templateNode.shape,
          },
        }))
        const newEdges: CanvasEdge[] = template.edges.map((templateEdge) => ({
          id: templateEdge.id,
          type: "canvasEdge",
          source: templateEdge.source,
          target: templateEdge.target,
          data: templateEdge.label ? { label: templateEdge.label } : {},
        }))

        onNodesChange(newNodes.map((item) => ({ type: "add", item })))
        onEdgesChange(newEdges.map((item) => ({ type: "add", item })))
      })

      window.requestAnimationFrame(() => fitView({ duration: 200 }))
    },
    [room, reactFlowInstance, onNodesChange, onEdgesChange, fitView]
  )

  useImperativeHandle(ref, () => ({ importTemplate }), [importTemplate])

  return (
    <div className="relative h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <LiveCursors />
      <PresenceAvatars />
      <AiStatusBanner />
      <CanvasControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <ShapePanel
        onCreateShape={onCreateShape}
        onDragStart={handleShapeDragStart}
        onDragEnd={handleShapeDragEnd}
      />
      {dragPayload && (
        <ShapeDragPreview payload={dragPayload} x={dragPos.x} y={dragPos.y} />
      )}
    </div>
  )
})

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas(props, ref) {
  return (
    <ReactFlowProvider>
      <CanvasInner ref={ref} {...props} />
    </ReactFlowProvider>
  )
})
