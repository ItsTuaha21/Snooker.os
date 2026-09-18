"use client"

import { useMemo, useState } from "react"
import { Search, UserPlus, X, Play } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input, Label, Textarea, Badge } from "@/components/ui/primitives"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import { matchTypeLabels, membershipLabels } from "@/lib/format"
import type { MatchType, SessionPlayer, SnookerTable } from "@/lib/types"
import { cn } from "@/lib/utils"

const matchConfig: Record<MatchType, { count: number; teams: boolean }> = {
  single: { count: 2, teams: false },
  three: { count: 3, teams: false },
  team: { count: 4, teams: true },
}

export function CheckInModal({
  table,
  open,
  onClose,
}: {
  table: SnookerTable
  open: boolean
  onClose: () => void
}) {
  const { players, dispatch, addPlayer } = useStore()
  const toast = useToast()
  const [matchType, setMatchType] = useState<MatchType>("single")
  const [selected, setSelected] = useState<SessionPlayer[]>([])
  const [rate, setRate] = useState(table.ratePerMinute)
  const [notes, setNotes] = useState("")
  const [query, setQuery] = useState("")
  const [quickName, setQuickName] = useState("")

  const cfg = matchConfig[matchType]

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    return players
      .filter((p) => !selected.some((s) => s.playerId === p.id))
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.mobile.includes(q))
      .slice(0, 6)
  }, [players, selected, query])

  function reset() {
    setSelected([])
    setNotes("")
    setQuery("")
    setQuickName("")
    setMatchType("single")
    setRate(table.ratePerMinute)
  }

  function assignTeam(index: number): "A" | "B" | undefined {
    if (!cfg.teams) return undefined
    return index % 2 === 0 ? "A" : "B"
  }

  function addExisting(id: string, name: string) {
    if (selected.length >= cfg.count) return
    setSelected((prev) => [...prev, { playerId: id, name, team: assignTeam(prev.length) }])
  }

  function addWalkIn() {
    if (!quickName.trim() || selected.length >= cfg.count) return
    const p = addPlayer({
      name: quickName.trim(),
      mobile: "—",
      membership: "walk-in",
      discount: 0,
      totalVisits: 1,
      totalMinutes: 0,
      totalSpent: 0,
      matchesWon: 0,
      matchesPlayed: 0,
    })
    setSelected((prev) => [...prev, { playerId: p.id, name: p.name, team: assignTeam(prev.length) }])
    setQuickName("")
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((s) => s.playerId !== id).map((s, i) => ({ ...s, team: assignTeam(i) })))
  }

  function start() {
    if (selected.length !== cfg.count) {
      toast({ tone: "warning", title: "Add all players", detail: `${matchTypeLabels[matchType]} needs ${cfg.count} players.` })
      return
    }
    dispatch({ type: "CHECK_IN", tableId: table.id, matchType, players: selected, rate, notes })
    toast({ tone: "success", title: "Players checked in", detail: `${table.name} · match started` })
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Check In · ${table.name}`}
      description="Select match type, add players and start the session."
      className="max-w-xl"
    >
      <div className="space-y-5">
        <div>
          <Label>Match Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(matchConfig) as MatchType[]).map((mt) => (
              <button
                key={mt}
                onClick={() => {
                  setMatchType(mt)
                  setSelected([])
                }}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  matchType === mt
                    ? "border-primary/50 bg-primary/10"
                    : "border-border bg-card/40 hover:border-primary/30",
                )}
              >
                <p className="text-sm font-semibold text-foreground">{matchTypeLabels[mt]}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{matchConfig[mt].count} players</p>
              </button>
            ))}
          </div>
        </div>

        {/* selected players */}
        <div>
          <Label>
            Players ({selected.length}/{cfg.count})
          </Label>
          {cfg.teams ? (
            <div className="grid grid-cols-2 gap-3">
              {(["A", "B"] as const).map((team) => (
                <div key={team} className="rounded-xl border border-border bg-card/40 p-3">
                  <p className={cn("mb-2 text-xs font-semibold", team === "A" ? "text-neon" : "text-gold")}>
                    Team {team}
                  </p>
                  <div className="space-y-1.5">
                    {selected.filter((s) => s.team === team).map((s) => (
                      <PlayerChip key={s.playerId} name={s.name} onRemove={() => remove(s.playerId)} />
                    ))}
                    {selected.filter((s) => s.team === team).length === 0 && (
                      <p className="text-[11px] text-muted-foreground/60">No players yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((s) => (
                <PlayerChip key={s.playerId} name={s.name} onRemove={() => remove(s.playerId)} />
              ))}
              {selected.length === 0 && <p className="text-xs text-muted-foreground/60">No players added yet.</p>}
            </div>
          )}
        </div>

        {/* search + add */}
        {selected.length < cfg.count && (
          <div className="space-y-3 rounded-xl border border-border bg-card/30 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search member by name or mobile…"
                className="pl-9"
              />
            </div>
            <div className="space-y-1">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addExisting(p.id, p.name)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-secondary/60"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{p.mobile}</p>
                  </div>
                  <Badge tone={p.membership === "vip" ? "gold" : p.membership === "walk-in" ? "neutral" : "green"}>
                    {membershipLabels[p.membership]}
                  </Badge>
                </button>
              ))}
              {results.length === 0 && <p className="px-2 py-1 text-xs text-muted-foreground/60">No matches.</p>}
            </div>
            <div className="flex gap-2 border-t border-border/60 pt-3">
              <Input
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) addWalkIn()
                }}
                placeholder="Quick add walk-in player"
              />
              <Button variant="secondary" onClick={addWalkIn} size="lg">
                <UserPlus className="size-4" />
                Add
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Rate (Rs. / minute)</Label>
            <Input type="number" min={1} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional session notes" className="min-h-10" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" onClick={start} className="neon-glow">
            <Play className="size-4" />
            Start Match
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function PlayerChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1.5 text-xs font-medium text-foreground">
      {name}
      <button onClick={onRemove} className="text-muted-foreground hover:text-destructive" aria-label={`Remove ${name}`}>
        <X className="size-3.5" />
      </button>
    </span>
  )
}
