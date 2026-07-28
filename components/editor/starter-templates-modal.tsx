"use client"

import { Download, LayoutTemplate } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CANVAS_TEMPLATES, type CanvasTemplate, type CanvasTemplateNode } from "@/components/editor/starter-templates"

const PREVIEW_WIDTH = 260
const PREVIEW_HEIGHT = 140
const PREVIEW_PADDING = 16

interface PreviewLayout {
  scale: number
  offsetX: number
  offsetY: number
  minX: number
  minY: number
}

function computePreviewLayout(nodes: CanvasTemplateNode[]): PreviewLayout {
  const minX = Math.min(...nodes.map((n) => n.position.x))
  const minY = Math.min(...nodes.map((n) => n.position.y))
  const maxX = Math.max(...nodes.map((n) => n.position.x + n.width))
  const maxY = Math.max(...nodes.map((n) => n.position.y + n.height))

  const boundsWidth = Math.max(maxX - minX, 1)
  const boundsHeight = Math.max(maxY - minY, 1)

  const availableWidth = PREVIEW_WIDTH - PREVIEW_PADDING * 2
  const availableHeight = PREVIEW_HEIGHT - PREVIEW_PADDING * 2
  const scale = Math.min(availableWidth / boundsWidth, availableHeight / boundsHeight, 1)

  const offsetX = PREVIEW_PADDING + (availableWidth - boundsWidth * scale) / 2
  const offsetY = PREVIEW_PADDING + (availableHeight - boundsHeight * scale) / 2

  return { scale, offsetX, offsetY, minX, minY }
}

function toScreenPoint(x: number, y: number, layout: PreviewLayout) {
  return {
    x: layout.offsetX + (x - layout.minX) * layout.scale,
    y: layout.offsetY + (y - layout.minY) * layout.scale,
  }
}

function shapeRadiusClass(shape: CanvasTemplateNode["shape"]) {
  switch (shape) {
    case "circle":
    case "pill":
      return "rounded-full"
    case "diamond":
      return "rounded-[2px] rotate-45"
    default:
      return "rounded-[3px]"
  }
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const layout = computePreviewLayout(template.nodes)

  return (
    <div
      className="relative overflow-hidden rounded-lg bg-elevated"
      style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
    >
      <svg width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} className="absolute inset-0">
        {template.edges.map((edge) => {
          const source = template.nodes.find((n) => n.id === edge.source)
          const target = template.nodes.find((n) => n.id === edge.target)
          if (!source || !target) return null

          const from = toScreenPoint(
            source.position.x + source.width / 2,
            source.position.y + source.height / 2,
            layout
          )
          const to = toScreenPoint(
            target.position.x + target.width / 2,
            target.position.y + target.height / 2,
            layout
          )

          return (
            <line
              key={edge.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--border-subtle)"
              strokeWidth={1.5}
            />
          )
        })}
      </svg>

      {template.nodes.map((templateNode) => {
        const point = toScreenPoint(templateNode.position.x, templateNode.position.y, layout)
        const width = templateNode.width * layout.scale
        const height = templateNode.height * layout.scale

        return (
          <div
            key={templateNode.id}
            className={`absolute border ${shapeRadiusClass(templateNode.shape)}`}
            style={{
              left: point.x,
              top: point.y,
              width,
              height,
              backgroundColor: templateNode.color,
              borderColor: templateNode.textColor,
            }}
          />
        )
      })}
    </div>
  )
}

interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({ open, onOpenChange, onImport }: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="size-4" />
            Starter templates
          </DialogTitle>
          <DialogDescription>
            Start from a pre-built diagram. Importing a template replaces the current canvas.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-1 gap-4 pr-3 sm:grid-cols-2">
            {CANVAS_TEMPLATES.map((template) => (
              <Card key={template.id} className="gap-3">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <TemplatePreview template={template} />
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleImport(template)}>
                    <Download />
                    Import
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
