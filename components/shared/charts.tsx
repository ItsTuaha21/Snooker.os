"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

export function AreaChart({
  data,
  height = 180,
  className,
}: {
  data: { label: string; value: number }[]
  height?: number
  className?: string
}) {
  const id = useId()
  const w = 100
  const h = 100
  const max = Math.max(...data.map((d) => d.value), 1)
  const min = Math.min(...data.map((d) => d.value), 0)
  const range = max - min || 1
  const step = w / (data.length - 1 || 1)
  const points = data.map((d, i) => [i * step, h - ((d.value - min) / range) * (h * 0.85) - h * 0.08])
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ")
  const area = `${line} L ${w} ${h} L 0 ${h} Z`

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.2 148)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="oklch(0.82 0.2 148)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" y1={h * g} x2={w} y2={h * g} stroke="oklch(0.85 0.12 150 / 0.08)" strokeWidth="0.4" />
        ))}
        <path d={area} fill={`url(#grad-${id})`} />
        <path d={line} fill="none" stroke="oklch(0.86 0.22 148)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1.4" fill="oklch(0.86 0.22 148)" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between px-1 text-[10px] text-muted-foreground">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

export function BarChart({
  data,
  height = 180,
  className,
  tone = "green",
}: {
  data: { label: string; value: number }[]
  height?: number
  className?: string
  tone?: "green" | "gold"
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className={cn("flex w-full items-end gap-2", className)} style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className={cn(
                "w-full rounded-t-md transition-all",
                tone === "green"
                  ? "bg-gradient-to-t from-primary/30 to-primary"
                  : "bg-gradient-to-t from-[oklch(0.82_0.13_85_/_0.3)] to-gold",
              )}
              style={{ height: `${(d.value / max) * 100}%` }}
              title={String(d.value)}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({
  segments,
  size = 160,
}: {
  segments: { label: string; value: number; color: string }[]
  size?: number
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const radius = 42
  const circ = 2 * Math.PI * radius
  let offset = 0
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        {segments.map((seg, i) => {
          const len = (seg.value / total) * circ
          const el = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
            />
          )
          offset += len
          return el
        })}
        <circle cx="50" cy="50" r="30" fill="oklch(0.19 0.018 162)" />
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <span className="size-3 rounded-full" style={{ background: seg.color }} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="ml-auto font-medium text-foreground">
              {Math.round((seg.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
