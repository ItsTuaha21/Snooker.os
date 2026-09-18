"use client"

import { Wallet, LayoutGrid, Users, Trophy, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { LiveTables } from "@/components/dashboard/live-tables"
import { AreaChart, BarChart, DonutChart } from "@/components/shared/charts"
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/primitives"
import { useStore, sessionBill } from "@/lib/store"
import { formatRs } from "@/lib/format"

const revenueTrend = [
  { label: "Mon", value: 42000 },
  { label: "Tue", value: 38500 },
  { label: "Wed", value: 51000 },
  { label: "Thu", value: 47800 },
  { label: "Fri", value: 68200 },
  { label: "Sat", value: 91500 },
  { label: "Sun", value: 84300 },
]

const peakHours = [
  { label: "2PM", value: 3 },
  { label: "4PM", value: 5 },
  { label: "6PM", value: 8 },
  { label: "8PM", value: 12 },
  { label: "10PM", value: 15 },
  { label: "12AM", value: 9 },
]

export default function DashboardPage() {
  const { tables, players, invoices, now } = useStore()

  const activeTables = tables.filter((t) => t.status === "running").length
  const liveBill = tables.reduce((s, t) => s + (t.session ? sessionBill(t.session, now) : 0), 0)
  const todayRevenue = invoices.reduce((s, i) => s + i.paid, 0) + liveBill
  const members = players.filter((p) => p.membership !== "walk-in").length
  const matchesToday = invoices.length + activeTables

  const occupancy = [
    { label: "In Play", value: tables.filter((t) => t.status === "running").length, color: "oklch(0.86 0.22 148)" },
    { label: "Available", value: tables.filter((t) => t.status === "available").length, color: "oklch(0.45 0.02 160)" },
    { label: "Reserved", value: tables.filter((t) => t.status === "reserved").length, color: "oklch(0.82 0.13 85)" },
    { label: "Maintenance", value: tables.filter((t) => t.status === "maintenance").length, color: "oklch(0.6 0.2 25)" },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Your club at a glance — live tables, revenue and today's momentum."
        action={
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2">
            <p className="text-[11px] text-muted-foreground">Live floor revenue</p>
            <p className="font-display text-lg font-bold text-neon">{formatRs(liveBill)}</p>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Today's Revenue" value={formatRs(todayRevenue)} icon={Wallet} tone="green" hint="Incl. live bills" />
        <StatCard label="Active Tables" value={`${activeTables} / ${tables.length}`} icon={LayoutGrid} tone="blue" hint="Currently in play" />
        <StatCard label="Members" value={String(members)} icon={Users} tone="purple" hint={`${players.length} total players`} />
        <StatCard label="Matches Today" value={String(matchesToday)} icon={Trophy} tone="gold" hint="Played + ongoing" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue · Last 7 Days</CardTitle>
            <span className="flex items-center gap-1 text-xs text-neon">
              <TrendingUp className="size-3.5" /> +18.2%
            </span>
          </CardHeader>
          <CardBody>
            <AreaChart data={revenueTrend} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table Occupancy</CardTitle>
          </CardHeader>
          <CardBody>
            <DonutChart segments={occupancy} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <LiveTables />
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours · Tables Active</CardTitle>
          </CardHeader>
          <CardBody>
            <BarChart data={peakHours} tone="gold" />
          </CardBody>
        </Card>
        <ActivityFeed />
      </div>
    </div>
  )
}
