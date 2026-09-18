"use client"

import { useMemo, useState } from "react"
import { Search, UserPlus, Pencil, Trophy, Clock, Wallet, Phone } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { PlayerModal } from "@/components/players/player-modal"
import { Card, Badge, Input, Select, Progress } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { formatRs, formatHours } from "@/lib/format"
import type { MembershipTier, Player } from "@/lib/types"

const tierTone: Record<MembershipTier, "gold" | "neutral" | "blue" | "purple" | "green"> = {
  vip: "gold",
  gold: "gold",
  silver: "blue",
  basic: "neutral",
  "walk-in": "neutral",
}

export default function PlayersPage() {
  const { players } = useStore()
  const [query, setQuery] = useState("")
  const [tier, setTier] = useState<MembershipTier | "all">("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Player | null>(null)

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) || p.mobile.includes(query)
      const matchesTier = tier === "all" || p.membership === tier
      return matchesQuery && matchesTier
    })
  }, [players, query, tier])

  return (
    <div>
      <PageHeader
        title="Players & Members"
        subtitle="Directory of members and walk-ins with lifetime stats and win rates."
        action={
          <Button
            size="lg"
            className="neon-glow"
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
          >
            <UserPlus className="size-4" /> Add Member
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or mobile..."
            className="pl-9"
          />
        </div>
        <Select value={tier} onChange={(e) => setTier(e.target.value as MembershipTier | "all")} className="sm:w-44">
          <option value="all">All Tiers</option>
          <option value="vip">VIP</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="basic">Basic</option>
          <option value="walk-in">Walk-In</option>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const winRate = p.matchesPlayed ? Math.round((p.matchesWon / p.matchesPlayed) * 100) : 0
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl felt-surface font-display text-sm font-bold text-white">
                  {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">{p.name}</p>
                    <Badge tone={tierTone[p.membership]} className="shrink-0 capitalize">
                      {p.membership}
                    </Badge>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="size-3" /> {p.mobile}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditing(p)
                    setModalOpen(true)
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label={`Edit ${p.name}`}
                >
                  <Pencil className="size-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-secondary/50 py-2">
                  <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Wallet className="size-3" /> Spent
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{formatRs(p.totalSpent)}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 py-2">
                  <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> Played
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{formatHours(p.totalMinutes)}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 py-2">
                  <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Trophy className="size-3" /> Wins
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{p.matchesWon}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Win rate</span>
                  <span className="font-medium text-neon">{winRate}%</span>
                </div>
                <Progress value={winRate} tone={winRate >= 50 ? "green" : "gold"} />
              </div>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No players match your search.
        </div>
      )}

      <PlayerModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  )
}
