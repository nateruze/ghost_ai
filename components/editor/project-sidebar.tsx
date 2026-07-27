"use client"

import { Pencil, Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import type { Project } from "@/lib/mock-projects"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { projects, openCreateDialog, openRenameDialog, openDeleteDialog } =
    useProjectDialogs()

  const myProjects = projects.filter((project) => project.owner === "me")
  const sharedProjects = projects.filter(
    (project) => project.owner === "collaborator"
  )

  return (
    <>
      <div
        className={cn(
          "absolute inset-0 z-30 bg-black/40 transition-opacity duration-200 md:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={cn(
          "absolute top-0 left-0 z-40 flex h-full w-72 flex-col border-r border-surface-border bg-surface shadow-xl transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-surface-border px-3">
          <span className="text-sm font-medium text-copy-primary">
            Projects
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X />
          </Button>
        </div>

        <Tabs
          defaultValue="my-projects"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="px-3 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="my-projects" className="flex-1">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">
                Shared
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="my-projects"
            className="min-h-0 flex-1 overflow-y-auto px-3 py-2"
          >
            {myProjects.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-copy-muted">
                No projects yet
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {myProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onRename={() => openRenameDialog(project)}
                    onDelete={() => openDeleteDialog(project)}
                  />
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent
            value="shared"
            className="min-h-0 flex-1 overflow-y-auto px-3 py-2"
          >
            {sharedProjects.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-copy-muted">
                Nothing shared yet
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {sharedProjects.map((project) => (
                  <ProjectItem key={project.id} project={project} />
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-surface-border p-3">
          <Button className="w-full" onClick={openCreateDialog}>
            <Plus />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}

function ProjectItem({
  project,
  onRename,
  onDelete,
}: {
  project: Project
  onRename?: () => void
  onDelete?: () => void
}) {
  const canManage = project.owner === "me"

  return (
    <li className="group flex items-center justify-between gap-1 rounded-md px-2 py-1.5 text-sm text-copy-primary hover:bg-accent-dim">
      <span className="truncate">{project.name}</span>
      {canManage && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Rename ${project.name}`}
            onClick={onRename}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Delete ${project.name}`}
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </li>
  )
}
