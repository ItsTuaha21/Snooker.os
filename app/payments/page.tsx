"use client"

import { useMemo } from "react"
import { CreditCard, Wallet, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardHeader, CardTitle, CardBody, Badge } from "@/components/ui/primitives"
import { AreaChart } from "@/components/shared/charts"
import { useStore } from "@/lib/store"
import { formatRs, paymentLabels } from "@/lib/format"
import type { PaymentMethod } from "@/lib/types"

export default function PaymentsPage() {
  const { invoices } = useStore()

  const byMethod = useMemo(() => {
    const map = new Map<PaymentMethod, number>()
    for (const inv of invoices) {
      for (const p of inv.payments) {
        map.set(p.method, (map.get(p.method) ?? 0) + p.amount)
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [invoices])

  const totalRevenue = invoices.reduce((s, i) => s + i.paid, 0)
  const totalDiscount = invoices.reduce((s, i) => s + i.discount, 0)
  const partialCount = invoices.filter((i) => i.status !== "paid").length

  const trend = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return days.map((label, idx) => ({
      label,
      value: invoices.filter((i) => {
        const d = new Date(i.createdAt)
        const dayIdx = (d.getDay() + 6) % 7
        return dayIdx === idx
      }).reduce((s, i) => s + i.paid, 0) || (idx + 1) * 5000,
    }))
  }, [invoices])

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Revenue breakdown, payment methods and transaction history."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
              <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{formatRs(totalRevenue)}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-neon">
              <Wallet className="size-[18px]" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Discounts Given</p>
              <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{formatRs(totalDiscount)}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.82_0.13_85_/_0.15)] text-gold">
              <TrendingUp className="size-[18px]" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Invoices</p>
              <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{invoices.length}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <CreditCard className="size-[18px]" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Partial / Unpaid</p>
              <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{partialCount}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <CreditCard className="size-[18px]" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardBody>
            <AreaChart data={trend} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Payment Method</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {byMethod.map(([method, amount]) => {
                const pct = totalRevenue ? (amount / totalRevenue) * 100 : 0
                return (
                  <div key={method}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{paymentLabels[method]}</span>
                      <span className="font-medium text-foreground">{formatRs(amount)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {byMethod.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-bold text-foreground">Transaction History</h2>
      <div className="space-y-2">
        {invoices.map((inv) => (
          <Card key={inv.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 font-display text-sm font-bold text-neon">
                {inv.tableName.replace("Table ", "")}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {inv.players.map((p) => p.name.split(" ")[0]).join(" vs ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {inv.totalMinutes} min · {inv.payments.map((p) => paymentLabels[p.method]).join(", ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-display text-sm font-bold text-foreground">{formatRs(inv.paid)}</p>
                {inv.discount > 0 && <p className="text-[10px] text-gold">−{formatRs(inv.discount)}</p>}
              </div>
              <Badge tone={inv.status === "paid" ? "green" : inv.status === "partial" ? "gold" : "red"} className="capitalize">
                {inv.status}
              </Badge>
            </div>
          </Card>
        ))}
        {invoices.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No transactions yet.
          </div>
        )}
      </div>
    </div>
  )
}
