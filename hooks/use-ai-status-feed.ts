"use client"

import { useMemo } from "react"
import { useFeedMessages } from "@liveblocks/react"

import {
  AI_STATUS_FEED_ID,
  parseAiStatusFeedMessage,
  type AiStatusFeedMessage,
} from "@/types/tasks"

export interface AiStatusFeedEntry extends AiStatusFeedMessage {
  id: string
}

/**
 * Latest validated message on the shared "ai-status-feed", or null while
 * loading / on error / if the feed has no messages yet. Feed message return
 * order isn't guaranteed to be chronological, so the newest message is
 * picked by its `createdAt` timestamp rather than assumed to be first/last.
 */
export function useLatestAiStatus(): AiStatusFeedEntry | null {
  const result = useFeedMessages(AI_STATUS_FEED_ID)

  return useMemo(() => {
    if (result.isLoading || result.error) return null

    let latest: (typeof result.messages)[number] | null = null
    for (const message of result.messages) {
      if (!latest || message.createdAt > latest.createdAt) latest = message
    }
    if (!latest) return null

    const data = parseAiStatusFeedMessage(latest.data)
    return data ? { id: latest.id, ...data } : null
  }, [result])
}
