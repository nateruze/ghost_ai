"use client"

import { useRef, useState } from "react"
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense"

import { AiSidebar } from "@/components/editor/ai-sidebar"
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import { CanvasRoom } from "@/components/editor/canvas/canvas-room"
import type { CanvasHandle } from "@/components/editor/canvas/canvas"
import { ProjectActionsProvider } from "@/hooks/use-project-actions"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"
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
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const canvasRef = useRef<CanvasHandle>(null)

  return (
    <ProjectActionsProvider>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider id={projectId} initialPresence={{ cursor: null, thinking: false }}>
          <div className="flex h-screen flex-col overflow-hidden bg-base">
            <WorkspaceNavbar
              projectName={projectName}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
              isAiSidebarOpen={isAiSidebarOpen}
              onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
              onOpenShare={() => setIsShareOpen(true)}
              onOpenTemplates={() => setIsTemplatesOpen(true)}
              saveStatus={saveStatus}
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
                <CanvasRoom ref={canvasRef} projectId={projectId} onSaveStatusChange={setSaveStatus} />
              </main>

              <AiSidebar
                projectId={projectId}
                isOpen={isAiSidebarOpen}
                onClose={() => setIsAiSidebarOpen(false)}
              />
            </div>
          </div>
        </RoomProvider>
      </LiveblocksProvider>
      <ProjectDialogs />
      <ShareDialog
        projectId={projectId}
        isOwner={isOwner}
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
      />
      <StarterTemplatesModal
        open={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
        onImport={(template) => canvasRef.current?.importTemplate(template)}
      />
    </ProjectActionsProvider>
  )
}
