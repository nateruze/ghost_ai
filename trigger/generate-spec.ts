import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { logger, metadata, schemaTask } from "@trigger.dev/sdk"
import { put } from "@vercel/blob"
import { generateText } from "ai"
import type { z } from "zod"

import { prisma } from "@/lib/prisma"
import { generateSpecPayloadSchema } from "@/types/tasks"

const SYSTEM_PROMPT = `You are Architect AI, a technical writer that turns a software architecture diagram (nodes and edges) and its design conversation into a clear, well-organized Markdown technical specification.

Write the spec in Markdown with sections such as: Overview, Architecture (describe each component and its shape/role), Data Flow (describe how components connect via the edges), and Key Decisions (drawn from the chat history, if relevant). Reference components by their labels, not their internal ids. Be concise but complete. Output only the Markdown document, with no surrounding commentary or code fences.`

function buildPrompt(payload: z.infer<typeof generateSpecPayloadSchema>) {
  const nodesSummary = payload.nodes.map((node) => ({
    id: node.id,
    label: node.data.label,
    shape: node.data.shape,
  }))
  const edgesSummary = payload.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    label: edge.data?.label,
  }))
  const chatSummary = payload.chatHistory.map((message) => ({
    role: message.role,
    content: message.content,
  }))

  return `Canvas nodes:
${JSON.stringify(nodesSummary, null, 2)}

Canvas edges:
${JSON.stringify(edgesSummary, null, 2)}

Design conversation:
${JSON.stringify(chatSummary, null, 2)}

Generate the Markdown technical spec for this system design.`
}

export const generateSpec = schemaTask({
  id: "generate-spec",
  schema: generateSpecPayloadSchema,
  run: async (payload) => {
    metadata.set("status", "start")

    try {
      const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY })
      const model = google("gemini-flash-latest")

      metadata.set("status", "generating")

      const { text } = await generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt: buildPrompt(payload),
      })

      const specId = crypto.randomUUID()

      const blob = await put(`specs/${payload.projectId}/${specId}.md`, text, {
        access: "private",
        contentType: "text/markdown",
        addRandomSuffix: false,
        allowOverwrite: true,
      })

      const projectSpec = await prisma.projectSpec.create({
        data: { id: specId, projectId: payload.projectId, filePath: blob.url },
      })

      metadata.set("status", "complete")

      return { content: text, specId: projectSpec.id }
    } catch (error) {
      logger.error("generate-spec failed", {
        error,
        projectId: payload.projectId,
        roomId: payload.roomId,
      })
      metadata.set("status", "error")
      throw error
    }
  },
})
