"use client"

import { useState } from "react"
import { Bot, Sparkles } from "lucide-react"

import { WorkspaceNavbar } from "@/components/editor/workspace-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { CanvasRoom } from "@/components/editor/canvas/canvas-room"
import { ProjectActionsProvider } from "@/hooks/use-project-actions"
import { cn } from "@/lib/utils"
import type { ProjectSummary } from "@/lib/projects"

interface WorkspaceShellProps {
  projectId: string
  projectName: string
  isOwner: boolean
  ownedProjects: ProjectSummary[]
  sharedProjects: ProjectSummary[]
}

export function WorkspaceShell({
  projectId,
  projectName,
  isOwner,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  return (
    <ProjectActionsProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-base">
        <WorkspaceNavbar
          projectName={projectName}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
          isAiSidebarOpen={isAiSidebarOpen}
          onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
          onOpenShare={() => setIsShareOpen(true)}
        />
        <div className="relative flex flex-1 overflow-hidden">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            activeProjectId={projectId}
          />

          <main className="relative flex-1 overflow-hidden bg-base">
            <CanvasRoom roomId={projectId} />
          </main>

          <aside
            className={cn(
              "shrink-0 overflow-hidden border-l border-surface-border bg-surface transition-[width] duration-200 ease-out",
              isAiSidebarOpen ? "w-80" : "w-0"
            )}
          >
            <div className="flex h-full w-80 flex-col gap-4 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-copy-primary">
                    AI Copilot
                  </h3>
                  <p className="text-xs text-copy-muted">Placeholder panel</p>
                </div>
                <Sparkles className="size-4 text-ai" />
              </div>

              <div className="flex gap-3 rounded-2xl border border-surface-border bg-elevated p-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ai/15 text-ai">
                  <Bot className="size-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-copy-primary">
                    Chat surface pending
                  </p>
                  <p className="text-xs text-copy-muted">
                    The toggle is wired. Messaging and generation are
                    intentionally out of scope here.
                  </p>
                </div>
              </div>

              <div className="mt-auto rounded-2xl border border-dashed border-subtle-border p-4">
                <span className="text-[10px] font-medium tracking-widest text-copy-faint uppercase">
                  Future hooks
                </span>
                <p className="mt-1 text-xs text-copy-muted">
                  Prompt composer, run status, and architecture guidance will
                  attach to this sidebar.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <ProjectDialogs />
      <ShareDialog
        projectId={projectId}
        isOwner={isOwner}
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
      />
    </ProjectActionsProvider>
  )
}
