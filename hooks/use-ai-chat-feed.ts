"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useCreateFeed, useCreateFeedMessage, useFeedMessages } from "@liveblocks/react"

import {
  AI_CHAT_FEED_ID,
  parseAiChatFeedMessage,
  type AiChatFeedMessage,
} from "@/types/tasks"

export interface AiChatMessage extends AiChatFeedMessage {
  id: string
}

/**
 * Validated messages on the shared "ai-chat" feed, oldest first (so a chat
 * view can render them top-to-bottom with new messages appearing at the
 * bottom). Sorted by each message's own `timestamp` field rather than the
 * feed's return order, since that order isn't guaranteed to be chronological.
 * Messages that fail schema validation are dropped rather than rendered.
 */
export function useAiChatMessages(): AiChatMessage[] {
  const result = useFeedMessages(AI_CHAT_FEED_ID)

  return useMemo(() => {
    if (result.isLoading || result.error) return []
    return result.messages
      .map((message) => {
        const data = parseAiChatFeedMessage(message.data)
        return data ? { id: message.id, ...data } : null
      })
      .filter((message): message is AiChatMessage => message !== null)
      .sort((a, b) => a.timestamp - b.timestamp)
  }, [result])
}

/**
 * Creates the "ai-chat" feed if it doesn't exist yet. Safe to call from
 * multiple mounted sidebars at once — a duplicate create is ignored, mirroring
 * the idempotent createFeed pattern trigger/design-agent.ts uses server-side
 * for "ai-status-feed".
 */
export function useEnsureAiChatFeed() {
  const createFeed = useCreateFeed()

  useEffect(() => {
    createFeed(AI_CHAT_FEED_ID).catch(() => {
      // Feed already exists — safe to ignore.
    })
  }, [createFeed])
}

/**
 * Returns a function that sends a chat message to the "ai-chat" feed, plus
 * whether the most recent send attempt failed.
 */
export function useSendAiChatMessage() {
  const createFeedMessage = useCreateFeedMessage()
  const [error, setError] = useState(false)

  const sendMessage = useCallback(
    async (message: Omit<AiChatFeedMessage, "timestamp">) => {
      try {
        await createFeedMessage(AI_CHAT_FEED_ID, { ...message, timestamp: Date.now() })
        setError(false)
        return true
      } catch {
        setError(true)
        return false
      }
    },
    [createFeedMessage]
  )

  return { sendMessage, error }
}
