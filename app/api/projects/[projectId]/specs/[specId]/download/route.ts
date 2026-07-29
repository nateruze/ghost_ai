import { get } from "@vercel/blob"

import { prisma } from "@/lib/prisma"
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  const identity = await getCurrentIdentity()
  if (!identity.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId, specId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  if (!(await hasProjectAccess(project, identity))) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
  })

  if (!spec || spec.projectId !== projectId) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const result = await get(spec.filePath, { access: "private" })
  if (!result || !result.stream) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const content = await new Response(result.stream).text()

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
    },
  })
}
