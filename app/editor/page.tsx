"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"

export default function EditorPage() {
  const { openCreateDialog } = useProjectDialogs()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-medium text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-copy-muted">
          Start a new architecture workspace, or choose a project from the
          sidebar.
        </p>
      </div>
      <Button onClick={openCreateDialog}>
        <Plus />
        New Project
      </Button>
    </div>
  )
}
