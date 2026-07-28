import { auth, clerkClient } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"
import { listCollaborators, type CollaboratorSummary } from "@/lib/collaborators"

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

  const canAccess = await hasProjectAccess(project, identity)
  if (!canAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const collaborators = await listCollaborators(projectId)
  return Response.json(collaborators)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { error: "Enter a valid email address" },
      { status: 400 }
    )
  }

  let collaborator
  try {
    collaborator = await prisma.projectCollaborator.create({
      data: { projectId, email },
    })
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return Response.json(
        { error: "This person already has access" },
        { status: 409 }
      )
    }
    throw err
  }

  const client = await clerkClient()
  const { data: users } = await client.users.getUserList({
    emailAddress: [email],
    limit: 1,
  })
  const user = users[0]
  const created: CollaboratorSummary = {
    id: collaborator.id,
    email: collaborator.email,
    name: user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null
      : null,
    avatarUrl: user?.imageUrl ?? null,
  }

  return Response.json(created, { status: 201 })
}
