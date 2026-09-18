"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { TableCard } from "@/components/tables/table-card"
import { useStore, sessionBill } from "@/lib/store"
import { formatRs } from "@/lib/format"
import type { TableStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const filters: { key: TableStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "running", label: "In Play" },
  { key: "available", label: "Available" },
  { key: "reserved", label: "Reserved" },
  { key: "maintenance", label: "Maintenance" },
]

export default function TablesPage() {
  const { tables, now } = useStore()
  const [filter, setFilter] = useState<TableStatus | "all">("all")

  const shown = filter === "all" ? tables : tables.filter((t) => t.status === filter)
  const running = tables.filter((t) => t.status === "running")
  const liveRevenue = running.reduce((sum, t) => sum + (t.session ? sessionBill(t.session, now) : 0), 0)

  const counts = {
    running: tables.filter((t) => t.status === "running").length,
    available: tables.filter((t) => t.status === "available").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    maintenance: tables.filter((t) => t.status === "maintenance").length,
  }

  return (
    <div>
      <PageHeader
        title="Table Management"
        subtitle="Live view of every table, timer and running bill across the club."
        action={
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2">
            <p className="text-[11px] text-muted-foreground">Live floor revenue</p>
            <p className="font-display text-lg font-bold text-neon">{formatRs(liveRevenue)}</p>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const count = f.key === "all" ? tables.length : counts[f.key as keyof typeof counts]
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all",
                filter === f.key
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border bg-card/40 text-muted-foreground hover:border-primary/30",
              )}
            >
              {f.label}
              <span className="rounded-full bg-secondary px-1.5 text-[10px] font-semibold text-muted-foreground">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((t) => (
          <TableCard key={t.id} table={t} />
        ))}
      </div>

      {shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No tables in this category.
        </div>
      )}
    </div>
  )
}
