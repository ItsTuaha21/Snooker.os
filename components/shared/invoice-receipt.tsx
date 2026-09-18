import { Circle, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/primitives"
import { formatRs, formatTime, formatDate, paymentLabels, matchTypeLabels } from "@/lib/format"
import type { Invoice } from "@/lib/types"

export function InvoiceReceipt({ invoice }: { invoice: Invoice }) {
  const winnerLabel =
    invoice.matchType === "team"
      ? `Team ${invoice.winnerTeam}`
      : invoice.players.find((p) => p.playerId === invoice.winnerTeam)?.name ?? "—"

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/60">
      {/* header */}
      <div className="felt-surface flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
            <Circle className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">Break & Run</p>
            <p className="text-[10px] text-white/70">Snooker Club · Invoice</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-white/90">#{invoice.id.toUpperCase()}</p>
          <p className="text-[10px] text-white/70">
            {formatDate(invoice.createdAt)} · {formatTime(invoice.createdAt)}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">{invoice.tableName}</span>
            <span className="mx-2 text-border">·</span>
            <span className="text-foreground">{matchTypeLabels[invoice.matchType]}</span>
          </div>
          <Badge tone="gold">
            <Trophy className="size-3" /> {winnerLabel}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Cell label="Duration" value={`${invoice.totalMinutes} min`} />
          <Cell label="Rate" value={`${formatRs(invoice.ratePerMinute)}/min`} />
          <Cell label="Players" value={String(invoice.players.length)} />
        </div>

        {/* shares */}
        <div className="rounded-lg border border-border/60 bg-background/40 p-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Bill Breakdown</p>
          <div className="space-y-1.5">
            {invoice.billShares.map((s) => (
              <div key={s.playerId} className="flex justify-between text-sm">
                <span className="text-foreground">{s.name}</span>
                <span className="font-medium text-foreground">{formatRs(s.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* totals */}
        <div className="space-y-1.5 border-t border-border/60 pt-3 text-sm">
          <Row label="Subtotal" value={formatRs(invoice.subtotal)} />
          {invoice.discount > 0 && <Row label="Discount" value={`− ${formatRs(invoice.discount)}`} accent="gold" />}
          <div className="flex justify-between pt-1 text-base">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-display font-bold text-neon">{formatRs(invoice.total)}</span>
          </div>
        </div>

        {/* payments */}
        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
          {invoice.payments.map((p, i) => (
            <Badge key={i} tone="green">
              {paymentLabels[p.method]} · {formatRs(p.amount)}
            </Badge>
          ))}
          <Badge tone={invoice.status === "paid" ? "green" : invoice.status === "partial" ? "gold" : "red"} className="ml-auto capitalize">
            {invoice.status}
          </Badge>
        </div>
      </div>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-2.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: "gold" }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent === "gold" ? "text-gold" : "text-foreground"}>{value}</span>
    </div>
  )
}
