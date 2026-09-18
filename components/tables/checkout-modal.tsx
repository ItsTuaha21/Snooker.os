"use client"

import { useMemo, useState } from "react"
import { Trophy, Plus, Trash2, Receipt, CheckCircle2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input, Label, Select, Badge } from "@/components/ui/primitives"
import { useStore, sessionMinutes } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import { formatRs, formatMinutes, paymentLabels } from "@/lib/format"
import type { PaymentMethod, PaymentSplit, SnookerTable, Invoice, BillShare } from "@/lib/types"
import { cn } from "@/lib/utils"
import { InvoiceReceipt } from "@/components/shared/invoice-receipt"

type BillMode = "loser-pays" | "split-equal" | "custom"
const methods: PaymentMethod[] = ["cash", "jazzcash", "easypaisa", "bank", "debit", "credit"]

export function CheckoutModal({
  table,
  open,
  onClose,
}: {
  table: SnookerTable
  open: boolean
  onClose: () => void
}) {
  const { now, dispatch } = useStore()
  const toast = useToast()
  const session = table.session

  const [winner, setWinner] = useState<string>(session?.winnerTeam ?? "")
  const [billMode, setBillMode] = useState<BillMode>("loser-pays")
  const [discountPct, setDiscountPct] = useState(0)
  const [customShares, setCustomShares] = useState<Record<string, number>>({})
  const [payments, setPayments] = useState<PaymentSplit[]>([])
  const [receipt, setReceipt] = useState<Invoice | null>(null)

  const minutes = session ? sessionMinutes(session, now) : 0
  const subtotal = session ? minutes * session.ratePerMinute : 0
  const discount = (subtotal * discountPct) / 100
  const total = Math.max(0, subtotal - discount)

  const isTeam = session?.matchType === "team"

  const payers = useMemo(() => {
    if (!session) return []
    if (billMode === "split-equal") return session.players
    if (billMode === "custom") return session.players
    // loser-pays
    if (!winner) return session.players
    return session.players.filter((p) => (p.team ? p.team !== winner : p.playerId !== winner))
  }, [session, billMode, winner])

  const billShares: BillShare[] = useMemo(() => {
    if (!session) return []
    if (billMode === "custom") {
      return session.players
        .map((p) => ({ playerId: p.playerId, name: p.name, amount: customShares[p.playerId] ?? 0 }))
        .filter((s) => s.amount > 0)
    }
    const list = payers.length ? payers : session.players
    const per = total / list.length
    return list.map((p) => ({ playerId: p.playerId, name: p.name, amount: per }))
  }, [session, billMode, payers, total, customShares])

  const paid = payments.reduce((s, p) => s + p.amount, 0)
  const remaining = total - paid
  const customSum = Object.values(customShares).reduce((s, v) => s + (v || 0), 0)

  if (!session) return null

  function addPayment(method: PaymentMethod) {
    setPayments((prev) => [...prev, { method, amount: Math.max(0, Math.round(remaining)) }])
  }

  function confirm() {
    if (!session) return
    if (!winner) {
      toast({ tone: "warning", title: "Select a winner", detail: "Choose the winning player or team first." })
      return
    }
    if (billMode === "custom" && Math.abs(customSum - total) > 1) {
      toast({ tone: "warning", title: "Shares must equal total", detail: `Assigned ${formatRs(customSum)} of ${formatRs(total)}.` })
      return
    }
    const finalPayments = payments.length ? payments : [{ method: "cash" as PaymentMethod, amount: Math.round(total) }]
    const paidTotal = finalPayments.reduce((s, p) => s + p.amount, 0)
    const invoice: Invoice = {
      id: Math.random().toString(36).slice(2, 10),
      tableId: table.id,
      tableName: table.name,
      matchType: session.matchType,
      players: session.players,
      startTime: session.startTime,
      endTime: now,
      totalMinutes: Math.round(minutes),
      ratePerMinute: session.ratePerMinute,
      subtotal: Math.round(subtotal),
      discount: Math.round(discount),
      total: Math.round(total),
      winnerTeam: winner,
      billShares: billShares.map((b) => ({ ...b, amount: Math.round(b.amount) })),
      payments: finalPayments,
      paid: paidTotal,
      status: paidTotal >= total - 1 ? "paid" : "partial",
      createdAt: now,
    }
    dispatch({ type: "END_MATCH", invoice, players: session.players, totalMinutes: Math.round(minutes) })
    toast({ tone: "success", title: "Match closed", detail: `${table.name} · ${formatRs(paidTotal)} collected` })
    setReceipt(invoice)
  }

  function handleClose() {
    setReceipt(null)
    setPayments([])
    setDiscountPct(0)
    setCustomShares({})
    setBillMode("loser-pays")
    onClose()
  }

  const winnerOptions = isTeam
    ? [
        { value: "A", label: "Team A" },
        { value: "B", label: "Team B" },
      ]
    : session.players.map((p) => ({ value: p.playerId, label: p.name }))

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={receipt ? "Invoice" : `Checkout · ${table.name}`}
      description={receipt ? undefined : "Confirm winner, split the bill and collect payment."}
      className="max-w-xl"
    >
      {receipt ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-neon">
            <CheckCircle2 className="size-5" />
            Payment recorded successfully.
          </div>
          <InvoiceReceipt invoice={receipt} />
          <div className="flex justify-end">
            <Button size="lg" onClick={handleClose} className="neon-glow">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* summary */}
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Duration" value={formatMinutes(minutes)} />
            <Stat label="Rate" value={`${formatRs(session.ratePerMinute)}/min`} />
            <Stat label="Subtotal" value={formatRs(subtotal)} accent />
          </div>

          {/* winner */}
          <div>
            <Label>
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="size-3.5 text-gold" /> Winner
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {winnerOptions.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setWinner(o.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                    winner === o.value
                      ? "border-gold/60 bg-[oklch(0.82_0.13_85_/_0.12)] text-gold"
                      : "border-border bg-card/40 text-muted-foreground hover:border-gold/30",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* billing mode */}
          <div>
            <Label>Billing Method</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { m: "loser-pays", t: "Loser Pays", d: "Losing side splits" },
                  { m: "split-equal", t: "Split Equal", d: "Everyone shares" },
                  { m: "custom", t: "Custom", d: "Set each share" },
                ] as { m: BillMode; t: string; d: string }[]
              ).map((x) => (
                <button
                  key={x.m}
                  onClick={() => setBillMode(x.m)}
                  className={cn(
                    "rounded-xl border p-2.5 text-left transition-all",
                    billMode === x.m ? "border-primary/50 bg-primary/10" : "border-border bg-card/40 hover:border-primary/30",
                  )}
                >
                  <p className="text-xs font-semibold text-foreground">{x.t}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{x.d}</p>
                </button>
              ))}
            </div>
          </div>

          {/* discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Discount (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={discountPct}
                onChange={(e) => setDiscountPct(Math.min(100, Math.max(0, Number(e.target.value))))}
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="rounded-lg border border-border bg-card/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Total </span>
                <span className="float-right font-display text-base font-bold text-neon">{formatRs(total)}</span>
              </div>
            </div>
          </div>

          {/* shares */}
          <div>
            <Label>Bill Breakdown</Label>
            <div className="space-y-1.5">
              {billMode === "custom"
                ? session.players.map((p) => (
                    <div key={p.playerId} className="flex items-center gap-3 rounded-lg border border-border bg-card/40 px-3 py-2">
                      <span className="flex-1 text-sm text-foreground">
                        {p.name} {p.team && <Badge tone={p.team === "A" ? "green" : "gold"} className="ml-1">Team {p.team}</Badge>}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={customShares[p.playerId] ?? 0}
                        onChange={(e) => setCustomShares((prev) => ({ ...prev, [p.playerId]: Number(e.target.value) }))}
                        className="w-28"
                      />
                    </div>
                  ))
                : billShares.map((s) => (
                    <div key={s.playerId} className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-3 py-2 text-sm">
                      <span className="text-foreground">{s.name}</span>
                      <span className="font-medium text-foreground">{formatRs(s.amount)}</span>
                    </div>
                  ))}
              {billShares.length === 0 && billMode !== "custom" && (
                <p className="text-xs text-muted-foreground/60">Select a winner to compute the split.</p>
              )}
            </div>
            {billMode === "custom" && (
              <p className={cn("mt-1.5 text-xs", Math.abs(customSum - total) > 1 ? "text-destructive" : "text-muted-foreground")}>
                Assigned {formatRs(customSum)} of {formatRs(total)}
              </p>
            )}
          </div>

          {/* payments */}
          <div>
            <Label>Payment Split</Label>
            <div className="space-y-1.5">
              {payments.map((p, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card/40 px-2 py-1.5">
                  <Select
                    value={p.method}
                    onChange={(e) =>
                      setPayments((prev) => prev.map((x, j) => (j === i ? { ...x, method: e.target.value as PaymentMethod } : x)))
                    }
                    className="w-36"
                  >
                    {methods.map((m) => (
                      <option key={m} value={m}>
                        {paymentLabels[m]}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    value={p.amount}
                    onChange={(e) => setPayments((prev) => prev.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => setPayments((prev) => prev.filter((_, j) => j !== i))}
                    className="rounded-md p-2 text-muted-foreground hover:text-destructive"
                    aria-label="Remove payment"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => addPayment("cash")}>
                <Plus className="size-3.5" /> Add Payment
              </Button>
              {remaining > 0.5 && payments.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Remaining <span className="font-medium text-gold">{formatRs(remaining)}</span>
                </span>
              )}
              {payments.length === 0 && (
                <span className="text-xs text-muted-foreground">Defaults to full cash payment if left empty.</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Collecting </span>
              <span className="font-display text-lg font-bold text-neon">{formatRs(total)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="lg" onClick={handleClose}>
                Cancel
              </Button>
              <Button size="lg" onClick={confirm} className="neon-glow">
                <Receipt className="size-4" />
                Generate Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-display text-base font-bold", accent ? "text-neon" : "text-foreground")}>{value}</p>
    </div>
  )
}
