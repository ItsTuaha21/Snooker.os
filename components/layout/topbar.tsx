"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Search, Menu, BadgeCheck, CalendarDays, CreditCard, Grid2x2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"

const iconFor = {
  membership: BadgeCheck,
  booking: CalendarDays,
  payment: CreditCard,
  table: Grid2x2,
} as const

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { notifications, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden flex-1 items-center sm:flex">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search players, mobile number, table…"
          className="w-full max-w-md rounded-xl border border-input bg-card/60 py-2 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <div className="mr-1 hidden items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-1.5 md:flex">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => {
              setOpen((o) => !o)
              if (!open && unread > 0) dispatch({ type: "MARK_NOTIFICATIONS_READ" })
            }}
            className="relative rounded-xl border border-border bg-card/50 p-2.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-[18px]" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unread}
              </span>
            )}
          </button>

          {open && (
            <div className="glass-strong absolute right-0 mt-2 w-80 rounded-2xl border border-border p-2 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-sm font-semibold">Notifications</p>
                <span className="text-xs text-muted-foreground">{notifications.length} total</span>
              </div>
              <div className="max-h-80 space-y-1 overflow-y-auto scrollbar-thin">
                {notifications.map((n) => {
                  const Icon = iconFor[n.type]
                  return (
                    <div key={n.id} className={cn("flex gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/60", !n.read && "bg-secondary/30")}>
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-neon">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{n.detail}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/70">{timeAgo(n.at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card/50 py-1.5 pl-1.5 pr-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.6_0.15_155)] text-sm font-bold text-primary-foreground">
            MG
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold text-foreground">Manager</p>
            <p className="text-[11px] text-muted-foreground">Front Desk</p>
          </div>
        </div>
      </div>
    </header>
  )
}
