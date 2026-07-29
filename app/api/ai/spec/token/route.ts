import { auth } from "@trigger.dev/sdk"

import { prisma } from "@/lib/prisma"
import { getCurrentIdentity } from "@/lib/project-access"

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object" || typeof body.runId !== "string") {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }

  const { runId } = body

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } })
  if (!taskRun) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  if (taskRun.userId !== identity.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const token = await auth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "1h",
  })

  return Response.json({ token })
}
