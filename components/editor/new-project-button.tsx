"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProjectActions } from "@/hooks/use-project-actions"

export function NewProjectButton() {
  const { openCreateDialog } = useProjectActions()

  return (
    <Button onClick={openCreateDialog}>
      <Plus />
      New Project
    </Button>
  )
}
