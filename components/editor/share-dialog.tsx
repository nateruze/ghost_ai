"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Check, Copy, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CollaboratorSummary } from "@/lib/collaborators"

interface ShareDialogProps {
  projectId: string
  isOwner: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({
  projectId,
  isOwner,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<CollaboratorSummary[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function loadCollaborators() {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators`
        )
        if (!response.ok) throw new Error("Failed to load collaborators")
        const data = (await response.json()) as CollaboratorSummary[]
        if (!cancelled) setCollaborators(data)
      } catch {
        if (!cancelled) setCollaborators([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadCollaborators()

    return () => {
      cancelled = true
    }
  }, [open, projectId])

  function handleOpenChange(next: boolean) {
    if (!next) {
      setEmail("")
      setInviteError(null)
      setCopied(false)
    }
    onOpenChange(next)
  }

  async function submitInvite() {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return

    setIsInviting(true)
    setInviteError(null)
    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        }
      )
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to invite collaborator")
      }
      if (!data || typeof data.id !== "string" || typeof data.email !== "string") {
        throw new Error("Received an invalid response while inviting")
      }

      setCollaborators((current) => [...current, data as CollaboratorSummary])
      setEmail("")
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Something went wrong"
      )
    } finally {
      setIsInviting(false)
    }
  }

  async function removeCollaborator(collaboratorId: string) {
    setRemovingId(collaboratorId)
    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" }
      )
      if (!response.ok) throw new Error("Failed to remove collaborator")

      setCollaborators((current) =>
        current.filter((c) => c.id !== collaboratorId)
      )
    } finally {
      setRemovingId(null)
    }
  }

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/editor/${projectId}`
      : ""

  async function copyLink() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            {isOwner
              ? "Invite people by email and manage who has access."
              : "People with access to this project."}
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submitInvite()
            }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="teammate@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button
                type="submit"
                disabled={!email.trim() || isInviting}
              >
                Invite
              </Button>
            </div>
            {inviteError && (
              <p className="text-xs text-destructive">{inviteError}</p>
            )}
          </form>
        )}

        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {isLoading ? (
            <p className="px-1 py-2 text-sm text-copy-muted">Loading…</p>
          ) : collaborators.length === 0 ? (
            <p className="px-1 py-2 text-sm text-copy-muted">
              No collaborators yet.
            </p>
          ) : (
            collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between gap-2 rounded-lg px-1 py-1.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {collaborator.avatarUrl ? (
                    <Image
                      src={collaborator.avatarUrl}
                      alt=""
                      width={28}
                      height={28}
                      className="size-7 shrink-0 rounded-full"
                    />
                  ) : (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-medium text-copy-muted">
                      {(collaborator.name ?? collaborator.email)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-copy-primary">
                      {collaborator.name ?? collaborator.email}
                    </p>
                    {collaborator.name && (
                      <p className="truncate text-xs text-copy-muted">
                        {collaborator.email}
                      </p>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${collaborator.email}`}
                    disabled={removingId === collaborator.id}
                    onClick={() => removeCollaborator(collaborator.id)}
                  >
                    <X />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Input readOnly value={link} className="flex-1" />
            <Button type="button" variant="outline" onClick={copyLink}>
              {copied ? (
                <>
                  <Check />
                  Copied!
                </>
              ) : (
                <>
                  <Copy />
                  Copy link
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
