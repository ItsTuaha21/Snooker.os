"use client"

import { LogIn, LogOut, Wallet, CalendarPlus, UserPlus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/primitives"
import { useStore } from "@/lib/store"
import { formatRs, timeAgo } from "@/lib/format"
import type { ActivityItem } from "@/lib/types"

const icons: Record<ActivityItem["type"], React.ComponentType<{ className?: string }>> = {
  "check-in": LogIn,
  "check-out": LogOut,
  payment: Wallet,
  booking: CalendarPlus,
  member: UserPlus,
}

const iconTone: Record<ActivityItem["type"], string> = {
  "check-in": "text-neon bg-primary/15",
  "check-out": "text-[oklch(0.78_0.12_220)] bg-[oklch(0.72_0.12_220_/_0.15)]",
  payment: "text-gold bg-[oklch(0.82_0.13_85_/_0.15)]",
  booking: "text-[oklch(0.78_0.14_300)] bg-[oklch(0.68_0.17_300_/_0.15)]",
  member: "text-neon bg-primary/15",
}

export function ActivityFeed() {
  const { activity } = useStore()
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardBody className="flex-1 overflow-hidden">
        <div className="space-y-1">
          {activity.slice(0, 8).map((a) => {
            const Icon = icons[a.type]
            return (
              <div key={a.id} className="flex items-start gap-3 rounded-xl px-1 py-2">
                <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${iconTone[a.type]}`}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <div className="text-right">
                  {a.amount != null && <p className="text-sm font-semibold text-neon">{formatRs(a.amount)}</p>}
                  <p className="text-[10px] text-muted-foreground">{timeAgo(a.at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}
