import { z } from "zod"

export const AI_STATUS_FEED_ID = "ai-status-feed"

export const AI_STATUS_VALUES = ["start", "processing", "complete", "error"] as const
export type AiStatus = (typeof AI_STATUS_VALUES)[number]

export const aiStatusFeedMessageSchema = z.object({
  status: z.enum(AI_STATUS_VALUES),
  text: z.string().optional(),
})

export type AiStatusFeedMessage = z.infer<typeof aiStatusFeedMessageSchema>

export function parseAiStatusFeedMessage(data: unknown): AiStatusFeedMessage | null {
  const result = aiStatusFeedMessageSchema.safeParse(data)
  return result.success ? result.data : null
}

export const AI_CHAT_FEED_ID = "ai-chat"

export const AI_CHAT_ROLES = ["user", "assistant"] as const
export type AiChatRole = (typeof AI_CHAT_ROLES)[number]

export const aiChatFeedMessageSchema = z.object({
  sender: z.string(),
  role: z.enum(AI_CHAT_ROLES),
  content: z.string(),
  timestamp: z.number(),
})

export type AiChatFeedMessage = z.infer<typeof aiChatFeedMessageSchema>

export function parseAiChatFeedMessage(data: unknown): AiChatFeedMessage | null {
  const result = aiChatFeedMessageSchema.safeParse(data)
  return result.success ? result.data : null
}

export const specChatMessageSchema = z.object({
  sender: z.string(),
  role: z.enum(AI_CHAT_ROLES),
  content: z.string(),
  timestamp: z.number(),
})

export const specCanvasNodeSchema = z
  .object({
    id: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z
      .object({
        label: z.string(),
        color: z.string().optional(),
        textColor: z.string().optional(),
        shape: z.string().optional(),
      })
      .passthrough(),
  })
  .passthrough()

export const specCanvasEdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    data: z.object({ label: z.string().optional() }).passthrough().optional(),
  })
  .passthrough()

export const generateSpecPayloadSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(specChatMessageSchema),
  nodes: z.array(specCanvasNodeSchema),
  edges: z.array(specCanvasEdgeSchema),
})

export type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>
