"use client"

import { useState } from "react"
import { Bot, Compass, Sparkles } from "lucide-react"

import { WorkspaceNavbar } from "@/components/editor/workspace-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
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

          <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-base text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-subtle)_1px,transparent_1px)] [background-size:40px_40px]"
            />
            <div className="relative flex max-w-md flex-col items-center gap-4 px-6">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-surface-border bg-surface text-brand">
                <Compass className="size-6" />
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium tracking-widest text-copy-muted uppercase">
                  Workspace Shell
                </span>
                <h2 className="text-2xl font-semibold text-copy-primary">
                  Canvas and collaboration tooling land here next.
                </h2>
                <p className="text-sm text-copy-muted">
                  This room is ready for the shared architecture canvas,
                  durable AI workflows, and real-time presence. For now, the
                  shell is wired with project context and navigation only.
                </p>
              </div>
            </div>
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
