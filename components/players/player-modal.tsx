"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input, Label, Select } from "@/components/ui/primitives"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import type { MembershipTier, Player } from "@/lib/types"

const tierDiscount: Record<MembershipTier, number> = { "walk-in": 0, basic: 0, silver: 5, gold: 10, vip: 15 }

export function PlayerModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing?: Player | null
}) {
  const { addPlayer, dispatch } = useStore()
  const toast = useToast()
  const [name, setName] = useState(editing?.name ?? "")
  const [mobile, setMobile] = useState(editing?.mobile ?? "")
  const [membership, setMembership] = useState<MembershipTier>(editing?.membership ?? "basic")
  const [discount, setDiscount] = useState(editing?.discount ?? 0)

  function save() {
    if (!name.trim()) {
      toast({ tone: "warning", title: "Name required" })
      return
    }
    if (editing) {
      dispatch({ type: "UPDATE_PLAYER", player: { ...editing, name, mobile, membership, discount } })
      toast({ tone: "success", title: "Member updated", detail: name })
    } else {
      addPlayer({
        name: name.trim(),
        mobile: mobile || "—",
        membership,
        discount,
        memberSince: new Date().toISOString().slice(0, 10),
        expiresOn: new Date(Date.now() + 365 * 86400_000).toISOString().slice(0, 10),
        totalVisits: 0,
        totalMinutes: 0,
        totalSpent: 0,
        matchesWon: 0,
        matchesPlayed: 0,
      })
      toast({ tone: "success", title: "Member added", detail: name })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Member" : "Add Member"} description="Manage member details and tier.">
      <div className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ali Raza" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Mobile</Label>
            <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="0300-1234567" />
          </div>
          <div>
            <Label>Membership Tier</Label>
            <Select
              value={membership}
              onChange={(e) => {
                const t = e.target.value as MembershipTier
                setMembership(t)
                setDiscount(tierDiscount[t])
              }}
            >
              <option value="basic">Basic</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="vip">VIP</option>
              <option value="walk-in">Walk-In</option>
            </Select>
          </div>
        </div>
        <div>
          <Label>Discount (%)</Label>
          <Input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" onClick={save} className="neon-glow">
            <Save className="size-4" /> {editing ? "Save Changes" : "Add Member"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
