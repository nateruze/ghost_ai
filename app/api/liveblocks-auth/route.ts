import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { getCursorColor, getLiveblocksClient } from "@/lib/liveblocks"
import { prisma } from "@/lib/prisma"
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access"

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { room: roomId } = await request.json()

  const project = await prisma.project.findUnique({
    where: { id: roomId },
  })

  if (!project || !(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const liveblocks = getLiveblocksClient()

  try {
    await liveblocks.createRoom(roomId, {
      defaultAccesses: [],
      usersAccesses: {
        [identity.userId]: ["room:write"],
      },
    })
  } catch {
    await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [identity.userId]: ["room:write"],
      },
    })
  }

  const user = await currentUser()
  const name = user?.fullName ?? user?.username ?? "Anonymous"
  const avatar = user?.imageUrl ?? ""

  const { status, body } = await liveblocks.identifyUser(
    { userId: identity.userId, groupIds: [] },
    {
      userInfo: {
        name,
        avatar,
        color: getCursorColor(identity.userId),
      },
    }
  )

  return new Response(body, { status })
}
