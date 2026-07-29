"use client"

import { useCallback, useEffect, useState } from "react"
import type { KeyboardEvent } from "react"
import { useSelf } from "@liveblocks/react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import ReactMarkdown from "react-markdown"
import { Bot, Download, FileText, Loader2, Send, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  useAiChatMessages,
  useEnsureAiChatFeed,
  useSendAiChatMessage,
} from "@/hooks/use-ai-chat-feed"
import { useLatestAiStatus } from "@/hooks/use-ai-status-feed"
import { cn } from "@/lib/utils"
import type { designAgent } from "@/trigger/design-agent"
import type { generateSpec } from "@/trigger/generate-spec"

const TERMINAL_RUN_STATUSES = new Set([
  "COMPLETED",
  "CANCELED",
  "FAILED",
  "CRASHED",
  "INTERRUPTED",
  "SYSTEM_FAILURE",
  "EXPIRED",
  "TIMED_OUT",
])

interface AiSidebarProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export function AiSidebar({ projectId, isOpen, onClose }: AiSidebarProps) {
  return (
    <aside
      inert={!isOpen}
      aria-hidden={!isOpen}
      className={cn(
        "absolute top-0 right-0 z-40 flex h-full w-96 flex-col border-l border-surface-border bg-base/95 shadow-xl transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-dim text-brand">
            <Bot className="size-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-copy-primary">
              AI Workspace
            </span>
            <span className="text-xs text-copy-muted">
              Collaborate with Architect AI
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close AI sidebar"
        >
          <X />
        </Button>
      </div>

      <Tabs
        defaultValue="architect"
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="px-4 pt-3">
          <TabsList className="w-full">
            <TabsTrigger
              value="architect"
              className="flex-1 text-copy-muted data-active:bg-accent-dim data-active:text-brand"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="flex-1 text-copy-muted data-active:bg-accent-dim data-active:text-brand"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="architect" className="flex min-h-0 flex-1 flex-col">
          <ArchitectTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="specs" className="min-h-0 flex-1 overflow-y-auto">
          <SpecsTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </aside>
  )
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

function ArchitectTab({ projectId }: { projectId: string }) {
  useEnsureAiChatFeed()
  const self = useSelf()
  const messages = useAiChatMessages()
  const { sendMessage, error: sendError } = useSendAiChatMessage()
  const latestStatus = useLatestAiStatus()
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)

  const senderName = self?.info?.name ?? "You"

  const { run } = useRealtimeRun<typeof designAgent>(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: !!runId && !!publicToken,
    onComplete: async (completedRun, err) => {
      const succeeded = !err && completedRun.status === "COMPLETED"
      if (!succeeded) {
        await sendMessage({
          sender: "Architect AI",
          role: "assistant",
          content: "Something went wrong while generating that design. Please try again.",
        })
      }
      setRunId(null)
      setPublicToken(null)
    },
  })

  const isRunActive =
    !!runId && (!run || !TERMINAL_RUN_STATUSES.has(run.status))
  const isGenerating = isSubmitting || isRunActive

  const submit = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isGenerating) return

      const sent = await sendMessage({
        sender: senderName,
        role: "user",
        content: trimmed,
      })
      if (!sent) return

      setInput("")
      setIsSubmitting(true)

      try {
        const response = await fetch("/api/ai/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: trimmed, roomId: projectId, projectId }),
        })
        if (!response.ok) throw new Error("Request failed")

        const data = (await response.json()) as { runId?: string; publicToken?: string }
        if (!data.runId || !data.publicToken) throw new Error("Invalid response")
        setRunId(data.runId)
        setPublicToken(data.publicToken)
      } catch {
        await sendMessage({
          sender: "Architect AI",
          role: "assistant",
          content: "Couldn't start that request. Please try again.",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [isGenerating, projectId, senderName, sendMessage]
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submit(input)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-accent-dim text-brand">
              <Bot className="size-5" />
            </div>
            <p className="max-w-[220px] text-sm text-copy-muted">
              Describe the system you want to build and Architect AI will help
              sketch it out.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => submit(prompt)}
                  className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-subtle"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm text-copy-primary",
                  message.role === "user"
                    ? "ml-auto border-2 border-brand/50 bg-accent-dim"
                    : "border border-surface-border bg-elevated"
                )}
              >
                <div className="mb-1 flex items-baseline gap-2 text-xs text-copy-muted">
                  <span className="font-medium text-copy-primary">
                    {message.sender}
                  </span>
                  <span>{formatTimestamp(message.timestamp)}</span>
                </div>
                {message.content}
              </div>
            ))}
          </div>
        )}
      </div>

      {isRunActive ? (
        <div className="flex shrink-0 items-center gap-2 border-t border-surface-border bg-accent-dim/40 px-4 py-2 text-xs font-medium text-brand">
          <Loader2 className="size-3.5 shrink-0 animate-spin" />
          <span className="truncate">
            {latestStatus?.text ?? "Architect AI is working…"}
          </span>
        </div>
      ) : null}

      <div className="shrink-0 border-t border-surface-border p-3">
        {sendError ? (
          <p className="mb-2 text-xs text-error">
            Couldn&apos;t send your message. Please try again.
          </p>
        ) : null}
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Architect AI to design something..."
            disabled={isGenerating}
            className="min-h-[72px] max-h-[160px] resize-none"
          />
          <Button
            size="icon"
            className="shrink-0 bg-brand text-white hover:bg-brand/90"
            disabled={!input.trim() || isGenerating}
            onClick={() => submit(input)}
            aria-label="Send message"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface SpecSummary {
  id: string
  createdAt: string
  filename: string
}

interface SpecContent extends SpecSummary {
  content: string
}

function formatSpecDate(iso: string) {
  return new Date(iso).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function downloadSpec(projectId: string, specId: string) {
  window.open(`/api/projects/${projectId}/specs/${specId}/download`, "_blank")
}

function SpecsTab({ projectId }: { projectId: string }) {
  useEnsureAiChatFeed()
  const chatHistory = useAiChatMessages()

  const [specs, setSpecs] = useState<SpecSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSpecs() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/projects/${projectId}/specs`)
        if (!response.ok) throw new Error(`Request failed (${response.status})`)
        const data = await response.json()
        if (!cancelled) {
          setSpecs(data)
          setLoadError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setSpecs([])
          setLoadError(error instanceof Error ? error.message : "Request failed")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadSpecs()
    return () => {
      cancelled = true
    }
  }, [projectId, reloadToken])

  useRealtimeRun<typeof generateSpec>(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: !!runId && !!publicToken,
    onComplete: (completedRun, err) => {
      setRunId(null)
      setPublicToken(null)
      setIsGenerating(false)
      if (err || completedRun.status !== "COMPLETED") {
        setGenError(true)
        return
      }
      setReloadToken((token) => token + 1)
    },
  })

  const handleGenerate = useCallback(async () => {
    if (isGenerating) return
    setIsGenerating(true)
    setGenError(false)

    try {
      const canvasResponse = await fetch(`/api/projects/${projectId}/canvas`)
      if (!canvasResponse.ok) throw new Error("Request failed")
      const canvas = await canvasResponse.json()

      const specResponse = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: projectId,
          chatHistory,
          nodes: canvas.nodes ?? [],
          edges: canvas.edges ?? [],
        }),
      })
      if (!specResponse.ok) throw new Error("Request failed")
      const specData = (await specResponse.json()) as { runId?: string }
      if (!specData.runId) throw new Error("Invalid response")
      const newRunId = specData.runId

      const tokenResponse = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      })
      if (!tokenResponse.ok) throw new Error("Request failed")
      const tokenData = (await tokenResponse.json()) as { token?: string }
      if (!tokenData.token) throw new Error("Invalid response")
      const token = tokenData.token

      setRunId(newRunId)
      setPublicToken(token)
    } catch {
      setIsGenerating(false)
      setGenError(true)
    }
  }, [chatHistory, isGenerating, projectId])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Button
          className="w-full bg-brand text-white hover:bg-brand/90"
          disabled={isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {isGenerating ? "Generating..." : "Generate Spec"}
        </Button>
        {genError ? (
          <p className="text-xs text-error">
            Couldn&apos;t generate a spec. Please try again.
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-copy-muted">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : loadError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <FileText className="size-8 text-error" />
          <p className="max-w-[220px] text-sm text-error">
            Couldn&apos;t load specs: {loadError}
          </p>
        </div>
      ) : specs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <FileText className="size-8 text-copy-muted" />
          <p className="max-w-[220px] text-sm text-copy-muted">
            No specs yet. Generate one to see it here.
          </p>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-2 pr-2">
            {specs.map((spec) => (
              <div
                key={spec.id}
                className="flex items-start gap-3 rounded-xl border border-surface-border bg-elevated p-4 text-left transition-colors hover:border-border-subtle hover:bg-subtle"
              >
                <button
                  type="button"
                  onClick={() => setSelectedSpecId(spec.id)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-brand">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-copy-primary">
                      {spec.filename}
                    </p>
                    <p className="mt-1 text-xs text-copy-muted">
                      {formatSpecDate(spec.createdAt)}
                    </p>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Download spec"
                  onClick={() => downloadSpec(projectId, spec.id)}
                >
                  <Download />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <SpecPreviewDialog
        key={selectedSpecId ?? "none"}
        projectId={projectId}
        specId={selectedSpecId}
        onOpenChange={(open) => {
          if (!open) setSelectedSpecId(null)
        }}
      />
    </div>
  )
}

function SpecPreviewDialog({
  projectId,
  specId,
  onOpenChange,
}: {
  projectId: string
  specId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const [spec, setSpec] = useState<SpecContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!specId) return

    let cancelled = false

    async function loadSpec() {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/projects/${projectId}/specs/${specId}`
        )
        if (!response.ok) throw new Error("Request failed")
        const data = await response.json()
        if (!cancelled) setSpec(data)
      } catch {
        if (!cancelled) setSpec(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadSpec()
    return () => {
      cancelled = true
    }
  }, [projectId, specId])

  return (
    <Dialog open={!!specId} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">
            {spec?.filename ?? "Loading spec..."}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full min-h-0 flex-1 overflow-hidden">
          <div className="pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-copy-muted">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : spec ? (
              <div className="markdown-body text-sm text-copy-primary">
                <ReactMarkdown>{spec.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-copy-muted">
                Couldn&apos;t load this spec.
              </p>
            )}
          </div>
        </ScrollArea>

        {spec ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => downloadSpec(projectId, spec.id)}
          >
            <Download />
            Download
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
