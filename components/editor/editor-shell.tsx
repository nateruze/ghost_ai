"use client"

import { useState } from "react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectActionsProvider } from "@/hooks/use-project-actions"
import type { ProjectSummary } from "@/lib/projects"

interface EditorShellProps {
  children: React.ReactNode
  ownedProjects: ProjectSummary[]
  sharedProjects: ProjectSummary[]
}

export function EditorShell({
  children,
  ownedProjects,
  sharedProjects,
}: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <ProjectActionsProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-base">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
        <div className="relative flex-1 overflow-hidden">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
          />
          <main className="h-full overflow-auto">{children}</main>
        </div>
      </div>
      <ProjectDialogs />
    </ProjectActionsProvider>
  )
}
