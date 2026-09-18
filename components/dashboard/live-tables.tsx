"use client"

import Link from "next/link"
import { Clock, ChevronRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardBody, Badge } from "@/components/ui/primitives"
import { useStore, sessionElapsedMs, sessionBill } from "@/lib/store"
import { formatClock, formatRs } from "@/lib/format"

export function LiveTables() {
  const { tables, now } = useStore()
  const running = tables.filter((t) => t.status === "running" && t.session)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Live Tables</CardTitle>
        <Link href="/tables" className="flex items-center gap-0.5 text-xs text-neon hover:underline">
          View all <ChevronRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardBody className="space-y-2">
        {running.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No active tables right now.</p>}
        {running.map((t) => {
          const s = t.session!
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-3"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <span className="font-display text-sm font-bold text-neon">{t.id}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.players.map((p) => p.name.split(" ")[0]).join(", ")}
                  </p>
                  <Badge tone="green" className="shrink-0">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" /> live
                  </Badge>
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" /> {formatClock(sessionElapsedMs(s, now))}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-bold text-foreground">{formatRs(sessionBill(s, now))}</p>
                <p className="text-[10px] text-muted-foreground">{formatRs(s.ratePerMinute)}/min</p>
              </div>
            </div>
          )
        })}
      </CardBody>
    </Card>
  )
}
