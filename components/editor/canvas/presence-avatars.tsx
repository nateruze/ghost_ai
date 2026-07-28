"use client"

import Image from "next/image"
import { useUser, UserButton } from "@clerk/nextjs"
import { useOthers } from "@liveblocks/react"

const AVATAR_SIZE = 28
const MAX_VISIBLE = 5

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

export function PresenceAvatars() {
  const { user } = useUser()
  const others = useOthers()

  const collaborators = others.filter((other) => other.id !== user?.id)
  const visible = collaborators.slice(0, MAX_VISIBLE)
  const overflowCount = collaborators.length - visible.length

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
      {collaborators.length > 0 && (
        <>
          <div className="flex items-center -space-x-2">
            {visible.map((other) => {
              const name = other.info?.name ?? "Anonymous"
              const avatar = other.info?.avatar
              const color = other.info?.color ?? "var(--accent-primary)"

              return (
                <div
                  key={other.connectionId}
                  title={name}
                  className="flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-base"
                  style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    backgroundColor: color,
                  }}
                >
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={name}
                      width={AVATAR_SIZE}
                      height={AVATAR_SIZE}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-semibold text-white">
                      {getInitials(name)}
                    </span>
                  )}
                </div>
              )
            })}
            {overflowCount > 0 && (
              <div
                className="flex shrink-0 items-center justify-center rounded-full bg-elevated text-[10px] font-semibold text-copy-primary ring-2 ring-base"
                style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              >
                +{overflowCount}
              </div>
            )}
          </div>
          <div
            className="h-6 w-px bg-surface-border"
            aria-hidden="true"
          />
        </>
      )}
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: {
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
            },
          },
        }}
      />
    </div>
  )
}
