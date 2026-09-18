"use client"

import { useState } from "react"
import { Play, Pause, LogIn, Receipt, ArrowRightLeft, Wrench, Trophy, Clock, Wallet, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/primitives"
import { Badge } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { TableVisual } from "./table-visual"
import { CheckInModal } from "./check-in-modal"
import { CheckoutModal } from "./checkout-modal"
import { TransferModal } from "./transfer-modal"
import { useStore, sessionElapsedMs, sessionBill } from "@/lib/store"
import { formatClock, formatRs, matchTypeLabels } from "@/lib/format"
import type { SnookerTable, TableStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusMeta: Record<TableStatus, { label: string; tone: "green" | "gold" | "red" | "neutral"; dot: string }> = {
  running: { label: "In Play", tone: "green", dot: "bg-primary" },
  available: { label: "Available", tone: "neutral", dot: "bg-muted-foreground" },
  reserved: { label: "Reserved", tone: "gold", dot: "bg-gold" },
  maintenance: { label: "Maintenance", tone: "red", dot: "bg-destructive" },
}

export function TableCard({ table }: { table: SnookerTable }) {
  const { now, dispatch } = useStore()
  const [checkIn, setCheckIn] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [transfer, setTransfer] = useState(false)
  const meta = statusMeta[table.status]
  const s = table.session

  const elapsed = s ? sessionElapsedMs(s, now) : 0
  const bill = s ? sessionBill(s, now) : 0

  return (
    <>
      <Card className="flex flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-foreground">{table.name}</h3>
            <Badge tone={meta.tone}>
              <span className={cn("size-1.5 rounded-full", meta.dot, table.status === "running" && "animate-pulse")} />
              {meta.label}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{formatRs(table.ratePerMinute)}/min</span>
        </div>

        <div className="px-4 py-3">
          <TableVisual status={table.status} />
        </div>

        {/* body varies by status */}
        <div className="flex flex-1 flex-col px-4 pb-4">
          {table.status === "running" && s && (
            <div className="flex flex-1 flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-2.5">
                  <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="size-3" /> Elapsed
                  </p>
                  <p className="font-mono text-lg font-bold tabular-nums text-neon">{formatClock(elapsed)}</p>
                </div>
                <div className="rounded-xl border border-border bg-card/50 p-2.5">
                  <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Wallet className="size-3" /> Live Bill
                  </p>
                  <p className="font-display text-lg font-bold text-foreground">{formatRs(bill)}</p>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] text-muted-foreground">{matchTypeLabels[s.matchType]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.players.map((p) => {
                    const isWinner = s.winnerTeam && (p.team ? p.team === s.winnerTeam : p.playerId === s.winnerTeam)
                    return (
                      <span
                        key={p.playerId}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs",
                          isWinner
                            ? "border-gold/40 bg-[oklch(0.82_0.13_85_/_0.12)] text-gold"
                            : "border-border bg-secondary/50 text-foreground",
                        )}
                      >
                        {isWinner && <Trophy className="size-3" />}
                        {p.name}
                        {p.team && <span className="text-[9px] opacity-70">({p.team})</span>}
                      </span>
                    )
                  })}
                </div>
              </div>

              {!s.running && (
                <div className="flex items-center gap-1.5 rounded-lg border border-gold/30 bg-[oklch(0.82_0.13_85_/_0.1)] px-2.5 py-1.5 text-xs text-gold">
                  <Pause className="size-3.5" /> Session paused
                </div>
              )}

              <div className="mt-auto grid grid-cols-2 gap-2">
                {s.running ? (
                  <Button variant="secondary" size="sm" onClick={() => dispatch({ type: "PAUSE", tableId: table.id })}>
                    <Pause className="size-3.5" /> Pause
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => dispatch({ type: "RESUME", tableId: table.id })}>
                    <Play className="size-3.5" /> Resume
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setTransfer(true)}>
                  <ArrowRightLeft className="size-3.5" /> Transfer
                </Button>
                <Button size="sm" className="col-span-2 neon-glow" onClick={() => setCheckout(true)}>
                  <Receipt className="size-4" /> Checkout & Bill
                </Button>
              </div>
            </div>
          )}

          {table.status === "available" && (
            <div className="flex flex-1 flex-col">
              <p className="mb-3 text-sm text-muted-foreground">Table is free and ready for the next match.</p>
              <div className="mt-auto grid grid-cols-1 gap-2">
                <Button size="sm" className="neon-glow" onClick={() => setCheckIn(true)}>
                  <LogIn className="size-4" /> Check In Players
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: "SET_TABLE_STATUS", tableId: table.id, status: "maintenance" })}
                >
                  <Wrench className="size-3.5" /> Mark Maintenance
                </Button>
              </div>
            </div>
          )}

          {table.status === "reserved" && (
            <div className="flex flex-1 flex-col gap-2">
              <div className="rounded-xl border border-gold/30 bg-[oklch(0.82_0.13_85_/_0.08)] p-3">
                <p className="text-sm font-medium text-foreground">{table.reservedFor}</p>
                <p className="text-xs text-gold">{table.reservedAt}</p>
              </div>
              <div className="mt-auto grid grid-cols-1 gap-2">
                <Button size="sm" className="neon-glow" onClick={() => setCheckIn(true)}>
                  <Play className="size-4" /> Start Match Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: "SET_TABLE_STATUS", tableId: table.id, status: "available" })}
                >
                  Cancel Reservation
                </Button>
              </div>
            </div>
          )}

          {table.status === "maintenance" && (
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm text-muted-foreground">{table.notes ?? "Under maintenance."}</p>
              <div className="mt-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => dispatch({ type: "SET_TABLE_STATUS", tableId: table.id, status: "available" })}
                >
                  <CheckCircle2 className="size-4" /> Mark Available
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <CheckInModal table={table} open={checkIn} onClose={() => setCheckIn(false)} />
      {s && <CheckoutModal table={table} open={checkout} onClose={() => setCheckout(false)} />}
      <TransferModal table={table} open={transfer} onClose={() => setTransfer(false)} />
    </>
  )
}
