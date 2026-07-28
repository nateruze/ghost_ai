"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"

import type { CanvasNode } from "@/types/canvas"

export function CanvasNodeRenderer({ data, selected }: NodeProps<CanvasNode>) {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-md border-2 bg-surface px-3 text-center text-sm text-copy-primary"
      style={{ borderColor: data.color, boxShadow: selected ? `0 0 0 1px ${data.color}` : undefined }}
    >
      <Handle type="target" position={Position.Top} />
      <span className="truncate">{data.label}</span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
