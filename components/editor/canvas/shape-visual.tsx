import type { CanvasShape } from "@/types/canvas"

interface ShapeVisualProps {
  shape: CanvasShape
  color: string
  textColor?: string
  selected?: boolean
  label?: string
  hideLabel?: boolean
}

function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`
}

function LabelText({ label }: { label: string }) {
  return label ? (
    <span className="truncate">{label}</span>
  ) : (
    <span className="truncate text-copy-muted">Label</span>
  )
}

export function ShapeVisual({ shape, color, textColor, selected, label, hideLabel }: ShapeVisualProps) {
  const accent = textColor ?? color
  const borderColor = selected ? accent : withAlpha(accent, "4d")
  const strokeWidth = selected ? 2.5 : 1.5

  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    return (
      <div
        className={`flex h-full w-full items-center justify-center border-2 px-3 text-center text-sm ${
          shape === "rectangle" ? "rounded-md" : "rounded-full"
        }`}
        style={{
          backgroundColor: color,
          borderColor,
          color: textColor,
          boxShadow: selected ? `0 0 0 1px ${accent}` : undefined,
        }}
      >
        {label !== undefined && !hideLabel && <LabelText label={label} />}
      </div>
    )
  }

  const shapePaths: Record<"diamond" | "hexagon", string> = {
    diamond: "50,2 98,50 50,98 2,50",
    hexagon: "27,4 73,4 98,50 73,96 27,96 2,50",
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        style={{ filter: selected ? `drop-shadow(0 0 0.5px ${accent})` : undefined }}
      >
        {shape === "cylinder" ? (
          <>
            <path
              d="M 2 15 A 48 15 0 1 1 98 15 L 98 85 A 48 15 0 1 1 2 85 Z"
              fill={color}
              stroke={borderColor}
              strokeWidth={strokeWidth}
            />
            <path
              d="M 2 15 A 48 15 0 1 1 98 15 A 48 15 0 1 1 2 15"
              fill="none"
              stroke={borderColor}
              strokeWidth={strokeWidth}
            />
          </>
        ) : (
          <polygon
            points={shapePaths[shape]}
            fill={color}
            stroke={borderColor}
            strokeWidth={strokeWidth}
          />
        )}
      </svg>
      {label !== undefined && !hideLabel && (
        <div className="relative truncate px-4 text-center text-sm" style={{ color: textColor }}>
          <LabelText label={label} />
        </div>
      )}
    </div>
  )
}
