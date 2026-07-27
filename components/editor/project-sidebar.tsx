"use client"

import Link from "next/link"
import { Pencil, Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { ProjectSummary } from "@/lib/projects"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  ownedProjects: ProjectSummary[]
  sharedProjects: ProjectSummary[]
  activeProjectId?: string
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  activeProjectId,
}: ProjectSidebarProps) {
  const { openCreateDialog, openRenameDialog, openDeleteDialog } =
    useProjectActions()

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
            {ownedProjects.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-copy-muted">
                No projects yet
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {ownedProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    canManage
                    isActive={project.id === activeProjectId}
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
                  <ProjectItem
                    key={project.id}
                    project={project}
                    isActive={project.id === activeProjectId}
                  />
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
  canManage,
  isActive,
  onRename,
  onDelete,
}: {
  project: ProjectSummary
  canManage?: boolean
  isActive?: boolean
  onRename?: () => void
  onDelete?: () => void
}) {
  return (
    <li
      className={cn(
        "group flex items-center justify-between gap-1 rounded-md text-sm text-copy-primary hover:bg-accent-dim",
        isActive && "bg-accent-dim"
      )}
    >
      <Link
        href={`/editor/${project.id}`}
        className="min-w-0 flex-1 truncate px-2 py-1.5"
      >
        {project.name}
      </Link>
      {canManage && (
        <div className="flex shrink-0 items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
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
