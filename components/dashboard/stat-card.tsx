import React from "react"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "green",
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  hint?: string
  tone?: "green" | "gold" | "blue" | "purple" | "red"
}) {
  const tones = {
    green: "text-neon bg-primary/15",
    gold: "text-gold bg-[oklch(0.82_0.13_85_/_0.15)]",
    blue: "text-[oklch(0.78_0.12_220)] bg-[oklch(0.72_0.12_220_/_0.15)]",
    purple: "text-[oklch(0.78_0.14_300)] bg-[oklch(0.68_0.17_300_/_0.15)]",
    red: "text-destructive bg-destructive/15",
  }
  return (
    <div className="glass group relative overflow-hidden rounded-2xl border border-border p-4 transition-all hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {hint && <p className="mt-1 text-[11px] text-muted-foreground/80">{hint}</p>}
        </div>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-[18px]" />
        </div>
      </div>
    </div>
  )
}
