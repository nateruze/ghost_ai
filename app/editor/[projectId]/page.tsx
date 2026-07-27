import { notFound } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const { userId } = await auth()
  if (!userId) notFound()

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })
  if (!project) notFound()

  const isOwner = project.ownerId === userId
  const email = (await currentUser())?.primaryEmailAddress?.emailAddress
  const isCollaborator = email
    ? await prisma.projectCollaborator.findFirst({
        where: { projectId, email },
      })
    : null

  if (!isOwner && !isCollaborator) notFound()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-lg font-medium text-copy-primary">
        {project.name}
      </h1>
      <p className="text-sm text-copy-muted">Workspace ID: {project.id}</p>
    </div>
  )
}
