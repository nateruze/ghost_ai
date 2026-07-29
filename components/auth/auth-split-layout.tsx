import { FileText, Share2, Sparkles } from "lucide-react"

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
]

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col border-r border-surface-border bg-elevated px-16 py-16 lg:flex">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-brand" />
          <span className="font-semibold text-copy-primary">Architect AI</span>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <h1 className="text-4xl leading-tight font-bold text-copy-primary">
            Design systems at the speed of thought.
          </h1>
          <p className="mt-4 max-w-md text-copy-secondary">
            Describe your architecture in plain English. Architect AI maps it to a
            shared canvas your whole team can refine in real time.
          </p>

          <ul className="mt-10 space-y-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-surface-border bg-subtle">
                  <Icon className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="font-medium text-copy-primary">{title}</p>
                  <p className="text-sm text-copy-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-copy-faint">
          © {new Date().getFullYear()} Architect AI. All rights reserved.
        </p>
      </div>
      <div className="flex w-full items-center justify-center bg-base px-6 py-12 lg:w-1/2">
        {children}
      </div>
    </div>
  )
}
