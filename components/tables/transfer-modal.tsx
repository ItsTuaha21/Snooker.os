"use client"

import { useState } from "react"
import { ArrowRightLeft } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import { formatRs } from "@/lib/format"
import type { SnookerTable } from "@/lib/types"
import { cn } from "@/lib/utils"

export function TransferModal({
  table,
  open,
  onClose,
}: {
  table: SnookerTable
  open: boolean
  onClose: () => void
}) {
  const { tables, dispatch } = useStore()
  const toast = useToast()
  const [target, setTarget] = useState<number | null>(null)

  const candidates = tables.filter((t) => t.id !== table.id && (t.status === "available" || t.status === "reserved"))

  function transfer() {
    if (target == null) return
    dispatch({ type: "TRANSFER", fromId: table.id, toId: target })
    toast({ tone: "success", title: "Match transferred", detail: `${table.name} → Table ${target}` })
    setTarget(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Transfer · ${table.name}`}
      description="Move the active match to another free table. The timer keeps running."
    >
      <div className="space-y-4">
        {candidates.length === 0 ? (
          <p className="rounded-xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
            No free tables available for transfer.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {candidates.map((t) => (
              <button
                key={t.id}
                onClick={() => setTarget(t.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  target === t.id ? "border-primary/50 bg-primary/10" : "border-border bg-card/40 hover:border-primary/30",
                )}
              >
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">
                  {t.status} · {formatRs(t.ratePerMinute)}/min
                </p>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" onClick={transfer} disabled={target == null}>
            <ArrowRightLeft className="size-4" />
            Transfer Match
          </Button>
        </div>
      </div>
    </Modal>
  )
}
