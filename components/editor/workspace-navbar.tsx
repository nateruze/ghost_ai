"use client"

import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

interface WorkspaceNavbarProps {
  projectName: string
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  isAiSidebarOpen: boolean
  onToggleAiSidebar: () => void
  onOpenShare: () => void
}

export function WorkspaceNavbar({
  projectName,
  isSidebarOpen,
  onToggleSidebar,
  isAiSidebarOpen,
  onToggleAiSidebar,
  onOpenShare,
}: WorkspaceNavbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border bg-surface px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
        <div className="flex flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-copy-primary">
            {projectName}
          </span>
          <span className="text-xs text-copy-muted">Workspace</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onOpenShare}>
          <Share2 />
          Share
        </Button>
        <Button
          variant={isAiSidebarOpen ? "default" : "outline"}
          size="sm"
          onClick={onToggleAiSidebar}
          aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
          aria-pressed={isAiSidebarOpen}
        >
          <Sparkles />
          AI
        </Button>
        <UserButton />
      </div>
    </header>
  )
}
