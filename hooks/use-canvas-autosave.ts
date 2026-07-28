"use client"

import { useEffect, useRef, useState } from "react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

const DEBOUNCE_MS = 1500

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
}: {
  projectId: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const isFirstRunRef = useRef(true)

  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false
      return
    }

    const timeoutId = setTimeout(async () => {
      setStatus("saving")
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        })
        if (!response.ok) throw new Error("Failed to save canvas")
        setStatus("saved")
      } catch {
        setStatus("error")
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [projectId, nodes, edges])

  return status
}
