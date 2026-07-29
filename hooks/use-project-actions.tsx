"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react"
import { useParams, useRouter } from "next/navigation"

import { randomSuffix, slugify } from "@/lib/utils"
import type { ProjectSummary } from "@/lib/projects"

type DialogType = "create" | "rename" | "delete" | null

interface ProjectActionsContextValue {
  dialogType: DialogType
  activeProject: ProjectSummary | null
  name: string
  slug: string
  isLoading: boolean
  error: string | null
  setName: (value: string) => void
  openCreateDialog: () => void
  openRenameDialog: (project: ProjectSummary) => void
  openDeleteDialog: (project: ProjectSummary) => void
  closeDialog: () => void
  submitCreate: () => Promise<void>
  submitRename: () => Promise<void>
  submitDelete: () => Promise<void>
}

const ProjectActionsContext =
  createContext<ProjectActionsContextValue | null>(null)

export function ProjectActionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams<{ roomId?: string }>()

  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [activeProject, setActiveProject] = useState<ProjectSummary | null>(
    null
  )
  const [name, setName] = useState("")
  const [slugSuffix, setSlugSuffix] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const slug = useMemo(() => {
    const base = slugify(name)
    return base ? `${base}-${slugSuffix}` : ""
  }, [name, slugSuffix])

  function openCreateDialog() {
    setActiveProject(null)
    setName("")
    setSlugSuffix(randomSuffix())
    setError(null)
    setDialogType("create")
  }

  function openRenameDialog(project: ProjectSummary) {
    setActiveProject(project)
    setName(project.name)
    setError(null)
    setDialogType("rename")
  }

  function openDeleteDialog(project: ProjectSummary) {
    setActiveProject(project)
    setName("")
    setError(null)
    setDialogType("delete")
  }

  function closeDialog() {
    setDialogType(null)
    setActiveProject(null)
    setName("")
    setIsLoading(false)
    setError(null)
  }

  async function submitCreate() {
    const trimmed = name.trim()
    if (!trimmed) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!response.ok) throw new Error("Failed to create project")

      const project = (await response.json()) as ProjectSummary
      closeDialog()
      router.push(`/editor/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsLoading(false)
    }
  }

  async function submitRename() {
    const trimmed = name.trim()
    if (!trimmed || !activeProject) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!response.ok) throw new Error("Failed to rename project")

      closeDialog()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsLoading(false)
    }
  }

  async function submitDelete() {
    if (!activeProject) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete project")

      const wasActiveWorkspace = params?.roomId === activeProject.id
      closeDialog()

      if (wasActiveWorkspace) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsLoading(false)
    }
  }

  const value: ProjectActionsContextValue = {
    dialogType,
    activeProject,
    name,
    slug,
    isLoading,
    error,
    setName,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  }

  return (
    <ProjectActionsContext.Provider value={value}>
      {children}
    </ProjectActionsContext.Provider>
  )
}

export function useProjectActions() {
  const context = useContext(ProjectActionsContext)
  if (!context) {
    throw new Error(
      "useProjectActions must be used within a ProjectActionsProvider"
    )
  }
  return context
}
