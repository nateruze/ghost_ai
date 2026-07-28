"use client"

import { forwardRef } from "react"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"
import { ErrorBoundary } from "react-error-boundary"

import { Canvas, type CanvasHandle } from "@/components/editor/canvas/canvas"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

interface CanvasRoomProps {
  roomId: string
  onSaveStatusChange?: (status: SaveStatus) => void
}

export const CanvasRoom = forwardRef<CanvasHandle, CanvasRoomProps>(function CanvasRoom(
  { roomId, onSaveStatusChange },
  ref
) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, thinking: false }}
      >
        <ErrorBoundary
          fallback={
            <div className="flex h-full w-full items-center justify-center text-sm text-copy-muted">
              Couldn&apos;t connect to the canvas. Please refresh the page.
            </div>
          }
        >
          <ClientSideSuspense
            fallback={
              <div className="flex h-full w-full items-center justify-center text-sm text-copy-muted">
                Loading canvas…
              </div>
            }
          >
            <Canvas ref={ref} projectId={roomId} onSaveStatusChange={onSaveStatusChange} />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
})
