"use client"

import { useMemo } from "react"
import { useFeedMessages } from "@liveblocks/react"

import {
  AI_STATUS_FEED_ID,
  parseAiStatusFeedMessage,
  type AiStatusFeedMessage,
} from "@/types/tasks"

/**
 * Latest validated message on the shared "ai-status-feed", or null while
 * loading / on error / if the feed has no messages yet. Feed messages are
 * sorted newest-first by Liveblocks, so the first entry is the latest.
 */
export function useLatestAiStatus(): AiStatusFeedMessage | null {
  const result = useFeedMessages(AI_STATUS_FEED_ID)

  return useMemo(() => {
    if (result.isLoading || result.error) return null
    const latest = result.messages[0]
    return latest ? parseAiStatusFeedMessage(latest.data) : null
  }, [result])
}
