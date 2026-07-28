"use client"

import { useEffect } from "react"
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react"

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  )
}

interface UseKeyboardShortcutsOptions<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
> {
  reactFlowInstance: ReactFlowInstance<NodeType, EdgeType>
  onUndo: () => void
  onRedo: () => void
}

export function useKeyboardShortcuts<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
>({
  reactFlowInstance,
  onUndo,
  onRedo,
}: UseKeyboardShortcutsOptions<NodeType, EdgeType>) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return

      const isModPressed = event.metaKey || event.ctrlKey

      if (isModPressed && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) {
          onRedo()
        } else {
          onUndo()
        }
        return
      }

      if (isModPressed && event.key.toLowerCase() === "y") {
        event.preventDefault()
        onRedo()
        return
      }

      if (!isModPressed && (event.key === "+" || event.key === "=")) {
        event.preventDefault()
        reactFlowInstance.zoomIn({ duration: 200 })
        return
      }

      if (!isModPressed && event.key === "-") {
        event.preventDefault()
        reactFlowInstance.zoomOut({ duration: 200 })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [reactFlowInstance, onUndo, onRedo])
}
