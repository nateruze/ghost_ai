"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

import { useLatestAiStatus } from "@/hooks/use-ai-status-feed"
import { cn } from "@/lib/utils"

export function AiStatusBanner() {
  const latest = useLatestAiStatus()
  const [dismissedId, setDismissedId] = useState<string | null>(null)

  useEffect(() => {
    if (!latest || latest.status === "start" || latest.status === "processing") return

    const timer = setTimeout(() => setDismissedId(latest.id), 4000)
    return () => clearTimeout(timer)
  }, [latest])

  const current = latest && latest.id !== dismissedId ? latest : null

  if (!current) return null

  const Icon =
    current.status === "complete" ? CheckCircle2 : current.status === "error" ? AlertCircle : Loader2

  return (
    <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3 py-1.5 text-xs font-medium shadow-lg",
          current.status === "error"
            ? "text-error"
            : current.status === "complete"
              ? "text-success"
              : "text-ai-text"
        )}
      >
        <Icon
          className={cn(
            "size-3.5",
            (current.status === "start" || current.status === "processing") && "animate-spin"
          )}
        />
        {current.text}
      </div>
    </div>
  )
}
