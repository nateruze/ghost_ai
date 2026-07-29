import { tasks } from "@trigger.dev/sdk"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import type { generateSpec } from "@/trigger/generate-spec"
import { specCanvasEdgeSchema, specCanvasNodeSchema, specChatMessageSchema } from "@/types/tasks"

const requestSchema = z.object({
  roomId: z.string(),
  chatHistory: z.array(specChatMessageSchema),
  nodes: z.array(specCanvasNodeSchema),
  edges: z.array(specCanvasEdgeSchema),
})

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }

  const { roomId, chatHistory, nodes, edges } = parsed.data

  const project = await prisma.project.findUnique({ where: { id: roomId } })
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory,
    nodes,
    edges,
  })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: project.id,
      userId: identity.userId,
    },
  })

  return Response.json({ runId: handle.id })
}
