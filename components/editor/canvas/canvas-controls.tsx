"use client"

import { Maximize, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react"

interface CanvasControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

function ControlButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-full text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function CanvasControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlsProps) {
  return (
    <div className="pointer-events-none absolute bottom-24 left-6 z-10">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-surface-border bg-surface p-2 shadow-lg">
        <ControlButton onClick={onZoomOut} label="Zoom out">
          <ZoomOut className="size-4" />
        </ControlButton>
        <ControlButton onClick={onFitView} label="Fit view">
          <Maximize className="size-4" />
        </ControlButton>
        <ControlButton onClick={onZoomIn} label="Zoom in">
          <ZoomIn className="size-4" />
        </ControlButton>
        <div className="mx-1 h-5 w-px bg-surface-border" />
        <ControlButton onClick={onUndo} disabled={!canUndo} label="Undo">
          <Undo2 className="size-4" />
        </ControlButton>
        <ControlButton onClick={onRedo} disabled={!canRedo} label="Redo">
          <Redo2 className="size-4" />
        </ControlButton>
      </div>
    </div>
  )
}
