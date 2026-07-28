import { auth, clerkClient } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import { getLiveblocksClient } from "@/lib/liveblocks"

export async function DELETE(
  _request: Request,
  {
    params,
  }: { params: Promise<{ projectId: string; collaboratorId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId, collaboratorId } = await params
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const collaborator = await prisma.projectCollaborator.findUnique({
    where: { id: collaboratorId },
  })
  if (!collaborator || collaborator.projectId !== projectId) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.projectCollaborator.delete({ where: { id: collaboratorId } })

  const client = await clerkClient()
  const { data: users } = await client.users.getUserList({
    emailAddress: [collaborator.email],
    limit: 1,
  })
  const removedUserId = users[0]?.id
  if (removedUserId) {
    await getLiveblocksClient()
      .updateRoom(projectId, { usersAccesses: { [removedUserId]: null } })
      .catch(() => {})
  }

  return new Response(null, { status: 204 })
}
