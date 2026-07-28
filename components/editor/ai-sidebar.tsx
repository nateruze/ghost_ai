"use client"

import { useCallback, useState } from "react"
import type { KeyboardEvent } from "react"
import { Bot, Download, FileText, Send, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
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
              Collaborate with Ghost AI
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
          <ArchitectTab />
        </TabsContent>
        <TabsContent value="specs" className="min-h-0 flex-1 overflow-y-auto">
          <SpecsTab />
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

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

function ArchitectTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")

  const sendMessage = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
    ])
    setInput("")
  }, [])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      sendMessage(input)
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
              Describe the system you want to build and Ghost AI will help
              sketch it out.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-accent-dim"
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
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto border-2 border-brand/50 bg-accent-dim text-copy-primary"
                    : "border border-surface-border bg-elevated text-brand"
                )}
              >
                {message.content}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-surface-border p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Ghost AI to design something..."
            className="min-h-[72px] max-h-[160px] resize-none"
          />
          <Button
            size="icon"
            className="shrink-0 bg-brand text-white hover:bg-brand/90"
            disabled={!input.trim()}
            onClick={() => sendMessage(input)}
            aria-label="Send message"
          >
            <Send />
          </Button>
        </div>
      </div>
    </div>
  )
}

function SpecsTab() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <Button className="w-full bg-brand text-white hover:bg-brand/90">
        <Sparkles />
        Generate Spec
      </Button>

      <div className="rounded-xl border border-surface-border bg-elevated p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-brand">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-copy-primary">
              01-design-system.md
            </p>
            <p className="mt-1 text-xs text-copy-muted">
              Dark-only design tokens, shadcn/ui components, and the base
              color mapping for the workspace.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled
            aria-label="Download spec"
          >
            <Download />
          </Button>
        </div>
      </div>
    </div>
  )
}
