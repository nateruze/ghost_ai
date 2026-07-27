"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { initialProjects, slugify, type Project } from "@/lib/mock-projects"

type DialogType = "create" | "rename" | "delete" | null

interface ProjectDialogsContextValue {
  projects: Project[]
  dialogType: DialogType
  activeProject: Project | null
  name: string
  slug: string
  isLoading: boolean
  setName: (value: string) => void
  openCreateDialog: () => void
  openRenameDialog: (project: Project) => void
  openDeleteDialog: (project: Project) => void
  closeDialog: () => void
  submitCreate: () => void
  submitRename: () => void
  submitDelete: () => void
}

const ProjectDialogsContext = createContext<ProjectDialogsContextValue | null>(
  null
)

const MOCK_DELAY_MS = 400

export function ProjectDialogsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const slug = useMemo(() => slugify(name), [name])

  useEffect(() => {
    return () => {
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current)
    }
  }, [])

  function clearPendingTimeout() {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current)
      pendingTimeoutRef.current = null
    }
  }

  function openCreateDialog() {
    setActiveProject(null)
    setName("")
    setDialogType("create")
  }

  function openRenameDialog(project: Project) {
    setActiveProject(project)
    setName(project.name)
    setDialogType("rename")
  }

  function openDeleteDialog(project: Project) {
    setActiveProject(project)
    setName("")
    setDialogType("delete")
  }

  function closeDialog() {
    clearPendingTimeout()
    setDialogType(null)
    setActiveProject(null)
    setName("")
    setIsLoading(false)
  }

  function submitCreate() {
    const trimmed = name.trim()
    if (!trimmed) return

    clearPendingTimeout()
    setIsLoading(true)
    pendingTimeoutRef.current = setTimeout(() => {
      pendingTimeoutRef.current = null
      setProjects((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: trimmed,
          slug: slugify(trimmed),
          owner: "me",
        },
      ])
      closeDialog()
    }, MOCK_DELAY_MS)
  }

  function submitRename() {
    const trimmed = name.trim()
    if (!trimmed || !activeProject) return

    clearPendingTimeout()
    setIsLoading(true)
    pendingTimeoutRef.current = setTimeout(() => {
      pendingTimeoutRef.current = null
      setProjects((prev) =>
        prev.map((project) =>
          project.id === activeProject.id
            ? { ...project, name: trimmed, slug: slugify(trimmed) }
            : project
        )
      )
      closeDialog()
    }, MOCK_DELAY_MS)
  }

  function submitDelete() {
    if (!activeProject) return

    clearPendingTimeout()
    setIsLoading(true)
    pendingTimeoutRef.current = setTimeout(() => {
      pendingTimeoutRef.current = null
      setProjects((prev) =>
        prev.filter((project) => project.id !== activeProject.id)
      )
      closeDialog()
    }, MOCK_DELAY_MS)
  }

  const value: ProjectDialogsContextValue = {
    projects,
    dialogType,
    activeProject,
    name,
    slug,
    isLoading,
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
    <ProjectDialogsContext.Provider value={value}>
      {children}
    </ProjectDialogsContext.Provider>
  )
}

export function useProjectDialogs() {
  const context = useContext(ProjectDialogsContext)
  if (!context) {
    throw new Error(
      "useProjectDialogs must be used within a ProjectDialogsProvider"
    )
  }
  return context
}
