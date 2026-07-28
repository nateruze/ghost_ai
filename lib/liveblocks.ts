import { Liveblocks } from "@liveblocks/node"

const globalForLiveblocks = global as unknown as {
  liveblocks: Liveblocks | undefined
}

export function getLiveblocksClient(): Liveblocks {
  if (!globalForLiveblocks.liveblocks) {
    globalForLiveblocks.liveblocks = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY!,
    })
  }
  return globalForLiveblocks.liveblocks
}

const CURSOR_COLORS = [
  "#00C8D4",
  "#6457F9",
  "#F97316",
  "#EC4899",
  "#22C55E",
  "#EAB308",
  "#3B82F6",
  "#EF4444",
]

export function getCursorColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length
  return CURSOR_COLORS[index]
}
