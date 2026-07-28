import { AlertCircle, Check, Loader2 } from "lucide-react"

import type { SaveStatus } from "@/hooks/use-canvas-autosave"

interface SaveStatusIndicatorProps {
  status: SaveStatus
}

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  if (status === "idle") return null

  const config = {
    saving: { icon: Loader2, label: "Saving…", className: "text-copy-muted" },
    saved: { icon: Check, label: "Saved", className: "text-copy-muted" },
    error: { icon: AlertCircle, label: "Error saving", className: "text-red-400" },
  }[status]

  const Icon = config.icon

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-2.5 py-1 text-xs ${config.className}`}
    >
      <Icon className={status === "saving" ? "size-3.5 animate-spin" : "size-3.5"} />
      {config.label}
    </div>
  )
}
