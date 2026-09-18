"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Grid2x2,
  Users,
  CalendarDays,
  BadgeCheck,
  CreditCard,
  Trophy,
  BarChart3,
  Circle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tables", label: "Tables", icon: Grid2x2 },
  { href: "/players", label: "Players", icon: Users },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/memberships", label: "Memberships", icon: BadgeCheck },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { tables } = useStore()
  const running = tables.filter((t) => t.status === "running").length

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative flex size-10 items-center justify-center rounded-xl felt-surface neon-glow">
          <Circle className="size-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <p className="font-display text-base font-bold text-foreground">Break & Run</p>
          <p className="text-[11px] tracking-wide text-muted-foreground">SNOOKER CLUB ERP</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary neon-glow" />
              )}
              <Icon className={cn("size-[18px]", active && "text-neon")} />
              <span>{item.label}</span>
              {item.href === "/tables" && running > 0 && (
                <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-semibold text-neon">
                  {running}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
          <p className="text-xs font-medium text-foreground">Club Live</p>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {running} of {tables.length} tables in play right now.
        </p>
      </div>
    </aside>
  )
}
