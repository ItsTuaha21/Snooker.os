"use client"

import { Trophy, Medal, Award } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card, Badge, Progress } from "@/components/ui/primitives"
import { useStore } from "@/lib/store"
import { formatRs, formatHours } from "@/lib/format"

export default function LeaderboardPage() {
  const { players } = useStore()

  const ranked = [...players]
    .filter((p) => p.matchesPlayed > 0)
    .sort((a, b) => {
      const aRate = a.matchesWon / a.matchesPlayed
      const bRate = b.matchesWon / b.matchesPlayed
      if (bRate !== aRate) return bRate - aRate
      return b.matchesWon - a.matchesWon
    })

  const topThree = ranked.slice(0, 3)
  const rest = ranked.slice(3)
  const podiumMeta = [
    { icon: Trophy, tone: "gold" as const, label: "1st" },
    { icon: Medal, tone: "blue" as const, label: "2nd" },
    { icon: Award, tone: "neutral" as const, label: "3rd" },
  ]

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        subtitle="Top players ranked by win rate and total wins."
      />

      {topThree.length > 0 && (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {topThree.map((p, i) => {
            const meta = podiumMeta[i]
            const Icon = meta.icon
            const winRate = p.matchesPlayed ? Math.round((p.matchesWon / p.matchesPlayed) * 100) : 0
            return (
              <Card key={p.id} className="p-5 text-center">
                <div className={`mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl ${meta.tone === "gold" ? "bg-[oklch(0.82_0.13_85_/_0.15)] text-gold" : meta.tone === "blue" ? "bg-[oklch(0.72_0.12_220_/_0.15)] text-[oklch(0.78_0.12_220)]" : "bg-secondary text-muted-foreground"}`}>
                  <Icon className="size-7" />
                </div>
                <p className="font-display text-lg font-bold text-foreground">{p.name}</p>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <span className="text-xs text-muted-foreground">{winRate}% win rate</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Wins</p>
                    <p className="font-semibold text-neon">{p.matchesWon}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Played</p>
                    <p className="font-semibold text-foreground">{p.matchesPlayed}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Spent</p>
                    <p className="font-semibold text-foreground">{formatRs(p.totalSpent)}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="p-5">
        <div className="space-y-3">
          {rest.map((p, rank) => {
            const winRate = p.matchesPlayed ? Math.round((p.matchesWon / p.matchesPlayed) * 100) : 0
            return (
              <div key={p.id} className="flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-secondary/40">
                <span className="w-8 text-center font-display text-sm font-bold text-muted-foreground">{rank + 4}</span>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl felt-surface font-display text-xs font-bold text-white">
                  {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{formatHours(p.totalMinutes)} played · {formatRs(p.totalSpent)} spent</p>
                </div>
                <div className="hidden w-32 sm:block">
                  <Progress value={winRate} tone={winRate >= 50 ? "green" : "gold"} />
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neon">{winRate}%</p>
                  <p className="text-[10px] text-muted-foreground">{p.matchesWon}W / {p.matchesPlayed}P</p>
                </div>
              </div>
            )
          })}
          {ranked.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No matches played yet.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
