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
  const pendingSaveRef = useRef<Promise<void> | null>(null)
  const latestSnapshotRef = useRef<{ nodes: CanvasNode[]; edges: CanvasEdge[] } | null>(null)

  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false
      return
    }

    latestSnapshotRef.current = { nodes, edges }

    const timeoutId = setTimeout(() => {
      async function runSave() {
        while (latestSnapshotRef.current) {
          const snapshot = latestSnapshotRef.current
          latestSnapshotRef.current = null
          setStatus("saving")
          try {
            const response = await fetch(`/api/projects/${projectId}/canvas`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(snapshot),
            })
            if (!response.ok) throw new Error("Failed to save canvas")
            setStatus("saved")
          } catch {
            setStatus("error")
          }
        }
      }

      if (!pendingSaveRef.current) {
        pendingSaveRef.current = runSave().finally(() => {
          pendingSaveRef.current = null
        })
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [projectId, nodes, edges])

  return status
}
