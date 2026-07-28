import { auth, currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

export interface CurrentIdentity {
  userId: string | null
  email: string | null
}

export async function getCurrentIdentity(): Promise<CurrentIdentity> {
  const { userId } = await auth()
  if (!userId) return { userId: null, email: null }

  const user = await currentUser()
  return {
    userId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
  }
}

export async function hasProjectAccess(
  project: { id: string; ownerId: string },
  identity: CurrentIdentity
): Promise<boolean> {
  if (!identity.userId) return false
  if (project.ownerId === identity.userId) return true
  if (!identity.email) return false

  const collaborator = await prisma.projectCollaborator.findFirst({
    where: { projectId: project.id, email: identity.email.toLowerCase() },
  })
  return Boolean(collaborator)
}
