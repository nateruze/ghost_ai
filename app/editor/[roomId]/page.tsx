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
  const [identity, project] = await Promise.all([
    getCurrentIdentity(),
    prisma.project.findUnique({ where: { id: roomId } }),
  ])

  if (!identity.userId) {
    redirect("/sign-in")
  }

  if (!project) {
    return <AccessDenied />
  }

  const [canAccess, ownedProjects, sharedProjects] = await Promise.all([
    hasProjectAccess(project, identity),
    getOwnedProjects(identity.userId),
    getSharedProjects(identity.email),
  ])

  if (!canAccess) {
    return <AccessDenied />
  }

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
