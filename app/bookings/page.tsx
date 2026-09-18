"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Clock, Phone, Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card, Badge, Input, Select, Label } from "@/components/ui/primitives"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import type { Booking } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusTone: Record<Booking["status"], "green" | "gold" | "red" | "neutral"> = {
  confirmed: "green",
  pending: "gold",
  cancelled: "red",
  completed: "neutral",
}

function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export default function BookingsPage() {
  const { bookings, tables, dispatch } = useStore()
  const toast = useToast()
  const [filter, setFilter] = useState<Booking["status"] | "all">("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    tableId: tables[0]?.id ?? 1,
    playerName: "",
    mobile: "",
    date: todayISO(),
    time: "18:00",
    durationMins: 60,
  })

  const filtered = useMemo(() => {
    return bookings.filter((b) => filter === "all" || b.status === filter)
  }, [bookings, filter])

  function createBooking() {
    if (!form.playerName.trim()) {
      toast({ tone: "warning", title: "Player name required" })
      return
    }
    const booking: Booking = {
      id: Math.random().toString(36).slice(2, 10),
      tableId: form.tableId,
      playerName: form.playerName.trim(),
      mobile: form.mobile || "—",
      date: form.date,
      time: form.time,
      durationMins: form.durationMins,
      status: "pending",
      createdAt: Date.now(),
    }
    dispatch({ type: "ADD_BOOKING", booking })
    toast({ tone: "success", title: "Booking created", detail: `${booking.playerName} · Table ${booking.tableId}` })
    setModalOpen(false)
    setForm({ tableId: tables[0]?.id ?? 1, playerName: "", mobile: "", date: todayISO(), time: "18:00", durationMins: 60 })
  }

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="Manage table reservations and upcoming bookings."
        action={
          <Button size="lg" className="neon-glow" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" /> New Booking
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", "confirmed", "pending", "cancelled", "completed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all capitalize",
              filter === s
                ? "border-primary/50 bg-primary/10 text-foreground"
                : "border-border bg-card/40 text-muted-foreground hover:border-primary/30",
            )}
          >
            {s === "all" ? "All" : s}
            <span className="rounded-full bg-secondary px-1.5 text-[10px] font-semibold text-muted-foreground">
              {s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((b) => {
          const table = tables.find((t) => t.id === b.tableId)
          return (
            <Card key={b.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-neon">
                    <CalendarDays className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{b.playerName}</p>
                    <p className="text-xs text-muted-foreground">{table?.name ?? `Table ${b.tableId}`}</p>
                  </div>
                </div>
                <Badge tone={statusTone[b.status]} className="capitalize">{b.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-secondary/50 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{b.date}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Time</p>
                  <p className="flex items-center gap-1 font-medium text-foreground">
                    <Clock className="size-3" /> {b.time}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Duration</p>
                  <p className="font-medium text-foreground">{b.durationMins} min</p>
                </div>
                <div className="rounded-lg bg-secondary/50 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Mobile</p>
                  <p className="flex items-center gap-1 font-medium text-foreground">
                    <Phone className="size-3" /> {b.mobile}
                  </p>
                </div>
              </div>
              {b.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => dispatch({ type: "UPDATE_BOOKING", id: b.id, status: "confirmed" })}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dispatch({ type: "UPDATE_BOOKING", id: b.id, status: "cancelled" })}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No bookings found.
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Booking" description="Create a table reservation.">
        <div className="space-y-4">
          <div>
            <Label>Player Name</Label>
            <Input value={form.playerName} onChange={(e) => setForm({ ...form, playerName: e.target.value })} placeholder="e.g. Ali Raza" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Mobile</Label>
              <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="0300-1234567" />
            </div>
            <div>
              <Label>Table</Label>
              <Select value={form.tableId} onChange={(e) => setForm({ ...form, tableId: Number(e.target.value) })}>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input type="number" min={30} step={30} value={form.durationMins} onChange={(e) => setForm({ ...form, durationMins: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="lg" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="lg" onClick={createBooking} className="neon-glow">Create Booking</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
