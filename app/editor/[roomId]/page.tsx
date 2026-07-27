import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import { getOwnedProjects, getSharedProjects } from "@/lib/projects"
import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceShell } from "@/components/editor/workspace-shell"

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  const identity = await getCurrentIdentity()

  if (!identity.userId) {
    redirect("/sign-in")
  }

  const project = await prisma.project.findUnique({ where: { id: roomId } })
  if (!project) {
    return <AccessDenied />
  }

  const canAccess = await hasProjectAccess(project, identity)
  if (!canAccess) {
    return <AccessDenied />
  }

  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(identity.userId),
    getSharedProjects(identity.email),
  ])

  return (
    <WorkspaceShell
      projectId={project.id}
      projectName={project.name}
      isOwner={project.ownerId === identity.userId}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  )
}
