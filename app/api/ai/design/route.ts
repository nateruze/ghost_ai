import { auth, tasks } from "@trigger.dev/sdk"

import { prisma } from "@/lib/prisma"
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import type { designAgent } from "@/trigger/design-agent"

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (
    !body ||
    typeof body !== "object" ||
    typeof body.prompt !== "string" ||
    typeof body.roomId !== "string" ||
    typeof body.projectId !== "string"
  ) {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }

  const { prompt, roomId, projectId } = body

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const handle = await tasks.trigger<typeof designAgent>("design-agent", {
    prompt,
    roomId,
  })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId: identity.userId,
    },
  })

  const publicToken = await auth.createPublicToken({
    scopes: { read: { runs: [handle.id] } },
  })

  return Response.json({ runId: handle.id, publicToken })
}
