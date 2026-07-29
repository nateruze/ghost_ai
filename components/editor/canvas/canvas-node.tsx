"use client"

import { memo, useCallback, useEffect, useState } from "react"
import type { ChangeEvent, KeyboardEvent, MouseEvent } from "react"
import { Handle, NodeResizer, Position, useReactFlow, type NodeProps } from "@xyflow/react"

import { NodeColorToolbar } from "@/components/editor/canvas/node-color-toolbar"
import { ShapeVisual } from "@/components/editor/canvas/shape-visual"
import { MIN_NODE_SIZE, type CanvasNode, type NodeColorPair } from "@/types/canvas"

export const CanvasNodeRenderer = memo(function CanvasNodeRenderer({
  id,
  data,
  selected,
}: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow()
  const [isEditing, setIsEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data.label)

  useEffect(() => {
    if (!isEditing) setDraftLabel(data.label)
  }, [data.label, isEditing])

  const handleDoubleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setDraftLabel(data.label)
    setIsEditing(true)
  }, [data.label])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setDraftLabel(event.target.value)
      updateNodeData(id, { label: event.target.value })
    },
    [id, updateNodeData]
  )

  const handleBlur = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.currentTarget.blur()
    }
  }, [])

  const handleColorSelect = useCallback(
    (pair: NodeColorPair) => {
      updateNodeData(id, { color: pair.background, textColor: pair.text })
    },
    [id, updateNodeData]
  )

  const handleClassName =
    "!size-2 !rounded-full !border !border-[#1f1f1f] !bg-white !opacity-0 transition-opacity duration-150 group-hover:!opacity-100"

  return (
    <div className="group relative h-full w-full" onDoubleClick={handleDoubleClick}>
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_SIZE.width}
        minHeight={MIN_NODE_SIZE.height}
        color="var(--accent-primary)"
        handleClassName="!size-2 !rounded-sm !border !border-[var(--accent-primary)]/60 !bg-surface"
        lineClassName="!border-[var(--accent-primary)]/30"
      />
      {selected && (
        <NodeColorToolbar
          activeColor={data.color}
          activeTextColor={data.textColor}
          onSelect={handleColorSelect}
        />
      )}
      <Handle type="source" position={Position.Top} id="top" className={handleClassName} />
      <Handle type="source" position={Position.Right} id="right" className={handleClassName} />
      <Handle type="source" position={Position.Left} id="left" className={handleClassName} />
      <ShapeVisual
        shape={data.shape}
        color={data.color}
        textColor={data.textColor}
        selected={selected}
        label={data.label}
        hideLabel={isEditing}
      />
      {isEditing && (
        <div className="nodrag nopan nowheel absolute inset-0 z-10 flex items-center justify-center px-4">
          <textarea
            autoFocus
            rows={1}
            value={draftLabel}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onMouseDown={(event) => event.stopPropagation()}
            placeholder="Label"
            className="w-full resize-none overflow-hidden border-none bg-transparent text-center text-sm text-copy-primary outline-none placeholder:text-copy-muted"
          />
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClassName} />
    </div>
  )
})
