import { get, put } from "@vercel/blob"

import { prisma } from "@/lib/prisma"
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const identity = await getCurrentIdentity()
  if (!identity.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid canvas payload" }, { status: 400 })
  }

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(body), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  })

  return Response.json({ url: blob.url })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const identity = await getCurrentIdentity()
  if (!identity.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!project.canvasJsonPath) {
    return Response.json({ nodes: [], edges: [] })
  }

  const result = await get(project.canvasJsonPath, { access: "private" })
  if (!result || !result.stream) {
    return Response.json({ nodes: [], edges: [] })
  }

  const text = await new Response(result.stream).text()
  const canvasState = JSON.parse(text)
  return Response.json(canvasState)
}
