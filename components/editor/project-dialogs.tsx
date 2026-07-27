"use client"

import { useEffect, useRef } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProjectActions } from "@/hooks/use-project-actions"

export function ProjectDialogs() {
  return (
    <>
      <CreateProjectDialog />
      <RenameProjectDialog />
      <DeleteProjectDialog />
    </>
  )
}

function CreateProjectDialog() {
  const {
    dialogType,
    name,
    slug,
    isLoading,
    error,
    setName,
    closeDialog,
    submitCreate,
  } = useProjectActions()
  const open = dialogType === "create"

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeDialog()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Give your new architecture workspace a name.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            submitCreate()
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-project-name" className="text-sm font-medium">
              Project name
            </label>
            <Input
              id="create-project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My architecture project"
              autoFocus
            />
            <p className="text-xs text-copy-muted">
              {slug ? `Room ID: ${slug}` : "Enter a name to preview the room ID"}
            </p>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RenameProjectDialog() {
  const {
    dialogType,
    activeProject,
    name,
    isLoading,
    error,
    setName,
    closeDialog,
    submitRename,
  } = useProjectActions()
  const open = dialogType === "rename"
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeDialog()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>
            Rename &ldquo;{activeProject?.name}&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            submitRename()
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rename-project-name" className="text-sm font-medium">
              Project name
            </label>
            <Input
              id="rename-project-name"
              ref={inputRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteProjectDialog() {
  const {
    dialogType,
    activeProject,
    isLoading,
    error,
    closeDialog,
    submitDelete,
  } = useProjectActions()
  const open = dialogType === "delete"

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeDialog()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{activeProject?.name}
            &rdquo;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={submitDelete}
            disabled={isLoading}
          >
            Delete project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
