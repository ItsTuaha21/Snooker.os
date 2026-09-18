"use client"

import React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, glass = true, ...props }: React.HTMLAttributes<HTMLDivElement> & { glass?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border shadow-lg shadow-black/30",
        glass ? "glass" : "bg-card",
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between gap-3 p-5 pb-3", className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold tracking-wide text-foreground/90", className)} {...props} />
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />
}

type BadgeTone = "neutral" | "green" | "gold" | "red" | "blue" | "purple"
const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-secondary text-secondary-foreground border-border",
  green: "bg-primary/15 text-neon border-primary/30",
  gold: "bg-[oklch(0.82_0.13_85_/_0.15)] text-gold border-[oklch(0.82_0.13_85_/_0.35)]",
  red: "bg-destructive/15 text-destructive border-destructive/30",
  blue: "bg-[oklch(0.72_0.12_220_/_0.15)] text-[oklch(0.78_0.12_220)] border-[oklch(0.72_0.12_220_/_0.3)]",
  purple: "bg-[oklch(0.68_0.17_300_/_0.15)] text-[oklch(0.78_0.14_300)] border-[oklch(0.68_0.17_300_/_0.3)]",
}

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  )
}

export function Progress({ value, className, tone = "green" }: { value: number; className?: string; tone?: "green" | "gold" }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full rounded-full transition-all", tone === "green" ? "bg-primary" : "bg-gold")}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-medium text-muted-foreground", className)} {...props} />
}

const fieldBase =
  "w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-20 resize-none", className)} {...props} />
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, "appearance-none bg-card", className)} {...props}>
      {children}
    </select>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />
}
