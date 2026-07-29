import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { MutableFlow } from "@liveblocks/react-flow/node"
import { mutateFlow } from "@liveblocks/react-flow/node"
import { logger, task } from "@trigger.dev/sdk"
import { generateText, stepCountIs, tool } from "ai"
import { z } from "zod"

import { getLiveblocksClient } from "@/lib/liveblocks"
import {
  CANVAS_SHAPES,
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas"
import { AI_STATUS_FEED_ID, type AiStatus } from "@/types/tasks"

const AI_USER_ID = "ghost-ai"
const AI_COLOR = "#6457f9" // --accent-ai, see context/ui-context.md

const SYSTEM_PROMPT = `You are Ghost AI, a system design assistant that edits a shared collaborative canvas of nodes and edges representing a software architecture.

You make changes by calling the provided tools (addNode, moveNode, resizeNode, updateNodeData, deleteNode, addEdge, deleteEdge). Call as many tools as needed, in the order they should be applied. If the request doesn't require any change, don't call any tool.

Rules:
- Only use these node shapes: ${CANVAS_SHAPES.join(", ")}.
  - rectangle: default general-purpose node
  - diamond: decision / gateway
  - circle: event / endpoint
  - pill: service / process
  - cylinder: database / storage
  - hexagon: external system / boundary
- Only use colorIndex 0-${NODE_COLORS.length - 1}, one per node color pair (0 = neutral default, 1 = blue, 2 = purple, 3 = orange, 4 = red, 5 = pink, 6 = green, 7 = teal). Use color to group related nodes (e.g. all databases the same color), not randomly.
- Lay nodes out left-to-right or top-to-bottom following the natural data flow. Space nodes at least 220px apart horizontally and 160px apart vertically so they never overlap. Typical node sizes: rectangle ${SHAPE_DEFAULT_SIZES.rectangle.width}x${SHAPE_DEFAULT_SIZES.rectangle.height}, circle ${SHAPE_DEFAULT_SIZES.circle.width}x${SHAPE_DEFAULT_SIZES.circle.height}, cylinder ${SHAPE_DEFAULT_SIZES.cylinder.width}x${SHAPE_DEFAULT_SIZES.cylinder.height}.
- Reference existing nodes/edges by the exact id given in "Current canvas". Never invent an id for an existing element.
- IDs for new nodes/edges must be short, unique, kebab-case, and not collide with any existing id.
- Only touch what the user's request implies. If the canvas already has relevant nodes, extend or edit them instead of duplicating.`

function buildPrompt(
  userPrompt: string,
  currentGraph: { nodes: readonly CanvasNode[]; edges: readonly CanvasEdge[] }
) {
  const nodesSummary = currentGraph.nodes.map((node) => ({
    id: node.id,
    shape: node.data.shape,
    label: node.data.label,
    position: node.position,
    width: node.width,
    height: node.height,
  }))
  const edgesSummary = currentGraph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.data?.label,
  }))

  return `Current canvas:
${JSON.stringify({ nodes: nodesSummary, edges: edgesSummary }, null, 2)}

User request: ${userPrompt}`
}

function buildTools(
  flow: MutableFlow<CanvasNode, CanvasEdge>,
  onApplied: (position?: { x: number; y: number }) => void
) {
  return {
    addNode: tool({
      description: "Add a new node to the canvas.",
      inputSchema: z.object({
        id: z.string().describe("New short kebab-case id, must not collide with any existing id."),
        shape: z.enum(CANVAS_SHAPES),
        label: z.string(),
        colorIndex: z.number().int().min(0).max(NODE_COLORS.length - 1),
        x: z.number(),
        y: z.number(),
      }),
      execute: async ({ id, shape, label, colorIndex, x, y }) => {
        const size = SHAPE_DEFAULT_SIZES[shape]
        const pair = NODE_COLORS[colorIndex]!
        flow.addNode({
          id,
          type: "canvasNode",
          position: { x, y },
          width: size.width,
          height: size.height,
          data: {
            label,
            color: pair.background,
            textColor: pair.text,
            shape,
          },
        })
        onApplied({ x, y })
        return { ok: true }
      },
    }),
    moveNode: tool({
      description: "Move an existing node to a new position.",
      inputSchema: z.object({
        id: z.string().describe("Id of the existing node to move."),
        x: z.number(),
        y: z.number(),
      }),
      execute: async ({ id, x, y }) => {
        flow.updateNode(id, (node) => ({ ...node, position: { x, y } }))
        onApplied({ x, y })
        return { ok: true }
      },
    }),
    resizeNode: tool({
      description: "Resize an existing node.",
      inputSchema: z.object({
        id: z.string().describe("Id of the existing node to resize."),
        width: z.number().positive(),
        height: z.number().positive(),
      }),
      execute: async ({ id, width, height }) => {
        flow.updateNode(id, (node) => ({ ...node, width, height }))
        onApplied()
        return { ok: true }
      },
    }),
    updateNodeData: tool({
      description: "Update an existing node's label and/or color.",
      inputSchema: z.object({
        id: z.string().describe("Id of the existing node to update."),
        label: z.string().optional(),
        colorIndex: z.number().int().min(0).max(NODE_COLORS.length - 1).optional(),
      }),
      execute: async ({ id, label, colorIndex }) => {
        flow.updateNodeData(id, (data) => {
          const pair = colorIndex !== undefined ? NODE_COLORS[colorIndex] : undefined
          return {
            ...data,
            ...(label !== undefined ? { label } : {}),
            ...(pair ? { color: pair.background, textColor: pair.text } : {}),
          }
        })
        onApplied()
        return { ok: true }
      },
    }),
    deleteNode: tool({
      description: "Delete a node and its connected edges.",
      inputSchema: z.object({
        id: z.string().describe("Id of the existing node to delete."),
      }),
      execute: async ({ id }) => {
        flow.removeNode(id)
        onApplied()
        return { ok: true }
      },
    }),
    addEdge: tool({
      description: "Add a new edge between two nodes.",
      inputSchema: z.object({
        id: z.string().describe("New short kebab-case id, must not collide with any existing id."),
        source: z.string().describe("Id of the source node (existing or created earlier in this response)."),
        target: z.string().describe("Id of the target node (existing or created earlier in this response)."),
        label: z.string().optional(),
      }),
      execute: async ({ id, source, target, label }) => {
        flow.addEdge({
          id,
          type: "canvasEdge",
          source,
          target,
          data: label ? { label } : {},
        })
        onApplied()
        return { ok: true }
      },
    }),
    deleteEdge: tool({
      description: "Delete an edge.",
      inputSchema: z.object({
        id: z.string().describe("Id of the existing edge to delete."),
      }),
      execute: async ({ id }) => {
        flow.removeEdge(id)
        onApplied()
        return { ok: true }
      },
    }),
  }
}

export const designAgent = task({
  id: "design-agent",
  run: async (payload: { prompt: string; roomId: string }) => {
    const { prompt, roomId } = payload
    if (!roomId) {
      throw new Error(
        `design-agent payload is missing "roomId" (received: ${JSON.stringify(payload)})`
      )
    }
    const client = getLiveblocksClient()

    await client
      .createFeed({ roomId, feedId: AI_STATUS_FEED_ID, metadata: {} })
      .catch(() => {
        // Feed already exists — safe to ignore, messages can still be added to it.
      })

    async function publishStatus(status: AiStatus, message: string) {
      await client.createFeedMessage({
        roomId,
        feedId: AI_STATUS_FEED_ID,
        data: { status, text: message },
      })
    }

    async function setAiPresence(
      thinking: boolean,
      cursor: { x: number; y: number } | null,
      ttl?: number
    ) {
      await client.setPresence(roomId, {
        userId: AI_USER_ID,
        data: { cursor, thinking },
        userInfo: { name: "Ghost AI", avatar: "", color: AI_COLOR },
        ttl,
      })
    }

    let appliedCount = 0

    try {
      await publishStatus("start", "Ghost AI is reading your prompt…")
      await setAiPresence(true, null)

      const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY })
      const model = google("gemini-flash-latest")

      await mutateFlow<CanvasNode, CanvasEdge>({ client, roomId }, async (flow) => {
        await publishStatus("processing", "Ghost AI is designing your system…")

        const currentGraph = flow.toJSON()
        const applyPresenceUpdates: Promise<unknown>[] = []
        const tools = buildTools(flow, (position) => {
          appliedCount++
          if (position) {
            applyPresenceUpdates.push(setAiPresence(true, position))
          }
        })

        await generateText({
          model,
          system: SYSTEM_PROMPT,
          prompt: buildPrompt(prompt, currentGraph),
          tools,
          stopWhen: stepCountIs(20),
        })

        await Promise.all(applyPresenceUpdates)
      })

      await publishStatus(
        "complete",
        appliedCount > 0
          ? `Ghost AI updated the canvas (${appliedCount} change${appliedCount === 1 ? "" : "s"}).`
          : "Ghost AI didn't find any changes to make."
      )
    } catch (error) {
      logger.error("design-agent failed", { error, prompt, roomId })
      await publishStatus("error", "Ghost AI couldn't finish that request. Please try again.")
      throw error
    } finally {
      await setAiPresence(false, null, 2)
    }

    return { roomId, prompt, appliedCount }
  },
})
