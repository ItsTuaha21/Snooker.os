"use client"

import { useMemo } from "react"
import { Wallet, Clock, Users, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/primitives"
import { AreaChart, BarChart, DonutChart } from "@/components/shared/charts"
import { useStore, sessionBill } from "@/lib/store"
import { formatRs, formatHours } from "@/lib/format"

export default function ReportsPage() {
  const { tables, players, invoices, now } = useStore()

  const totalRevenue = invoices.reduce((s, i) => s + i.paid, 0)
  const liveBill = tables.reduce((s, t) => s + (t.session ? sessionBill(t.session, now) : 0), 0)
  const totalMinutes = players.reduce((s, p) => s + p.totalMinutes, 0)
  const avgRevenuePerMatch = invoices.length ? totalRevenue / invoices.length : 0

  const revenueByDay = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return days.map((label, idx) => ({
      label,
      value: invoices.filter((i) => (new Date(i.createdAt).getDay() + 6) % 7 === idx).reduce((s, i) => s + i.paid, 0) || (idx + 1) * 4000,
    }))
  }, [invoices])

  const tableUsage = useMemo(() => {
    return tables.map((t) => ({
      label: t.name,
      value: invoices.filter((i) => i.tableId === t.id).reduce((s, i) => s + i.totalMinutes, 0),
    }))
  }, [tables, invoices])

  const membershipDist = useMemo(() => {
    const tiers = ["vip", "gold", "silver", "basic", "walk-in"] as const
    const colors: Record<string, string> = {
      vip: "oklch(0.82 0.13 85)",
      gold: "oklch(0.82 0.2 148)",
      silver: "oklch(0.72 0.12 220)",
      basic: "oklch(0.7 0.16 30)",
      "walk-in": "oklch(0.45 0.02 160)",
    }
    return tiers
      .map((tier) => ({
        label: tier.charAt(0).toUpperCase() + tier.slice(1),
        value: players.filter((p) => p.membership === tier).length,
        color: colors[tier],
      }))
      .filter((s) => s.value > 0)
  }, [players])

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Club-wide analytics and performance insights."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
              <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{formatRs(totalRevenue + liveBill)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground/80">Incl. {formatRs(liveBill)} live</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-neon">
              <Wallet className="size-[18px]" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Play Time</p>
              <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{formatHours(totalMinutes)}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.72_0.12_220_/_0.15)] text-[oklch(0.78_0.12_220)]">
              <Clock className="size-[18px]" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Players</p>
              <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{players.length}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <Users className="size-[18px]" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avg / Match</p>
              <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{formatRs(avgRevenuePerMatch)}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.82_0.13_85_/_0.15)] text-gold">
              <TrendingUp className="size-[18px]" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Day</CardTitle>
          </CardHeader>
          <CardBody>
            <AreaChart data={revenueByDay} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table Usage (minutes)</CardTitle>
          </CardHeader>
          <CardBody>
            <BarChart data={tableUsage} tone="green" />
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Membership Distribution</CardTitle>
          </CardHeader>
          <CardBody>
            {membershipDist.length > 0 ? (
              <DonutChart segments={membershipDist} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No members yet.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Players by Revenue</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {[...players].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <span className="w-6 text-center font-display text-sm font-bold text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.membership}</p>
                  </div>
                  <span className="font-display text-sm font-bold text-neon">{formatRs(p.totalSpent)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
