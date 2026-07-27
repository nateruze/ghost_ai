import { clerkClient } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

export interface CollaboratorSummary {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

export async function listCollaborators(
  projectId: string
): Promise<CollaboratorSummary[]> {
  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  })

  if (collaborators.length === 0) return []

  const emails = [...new Set(collaborators.map((c) => c.email))]
  const client = await clerkClient()
  const { data: users } = await client.users.getUserList({
    emailAddress: emails,
    limit: emails.length,
  })

  const userByEmail = new Map<string, (typeof users)[number]>()
  for (const user of users) {
    for (const address of user.emailAddresses) {
      userByEmail.set(address.emailAddress.toLowerCase(), user)
    }
  }

  return collaborators.map((collaborator) => {
    const user = userByEmail.get(collaborator.email.toLowerCase())
    const name = user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
      : null

    return {
      id: collaborator.id,
      email: collaborator.email,
      name,
      avatarUrl: user?.imageUrl ?? null,
    }
  })
}
