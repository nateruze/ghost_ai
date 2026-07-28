"use client"

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"
import { ErrorBoundary } from "react-error-boundary"

import { Canvas } from "@/components/editor/canvas/canvas"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

interface CanvasRoomProps {
  roomId: string
}

export function CanvasRoom({ roomId }: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
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
            <Canvas />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
