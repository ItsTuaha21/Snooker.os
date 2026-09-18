"use client"

import { BadgeCheck, Crown, Medal, Award, User } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card, Badge, Progress } from "@/components/ui/primitives"
import { useStore } from "@/lib/store"
import { formatRs } from "@/lib/format"
import type { MembershipTier } from "@/lib/types"

const tierMeta: Record<MembershipTier, { icon: typeof Crown; tone: "gold" | "blue" | "neutral"; discount: number }> = {
  vip: { icon: Crown, tone: "gold", discount: 15 },
  gold: { icon: Medal, tone: "gold", discount: 10 },
  silver: { icon: Award, tone: "blue", discount: 5 },
  basic: { icon: BadgeCheck, tone: "neutral", discount: 0 },
  "walk-in": { icon: User, tone: "neutral", discount: 0 },
}

export default function MembershipsPage() {
  const { players } = useStore()

  const tiers = (["vip", "gold", "silver", "basic", "walk-in"] as MembershipTier[]).map((tier) => ({
    tier,
    members: players.filter((p) => p.membership === tier),
  }))

  const expiringSoon = players
    .filter((p) => p.expiresOn && new Date(p.expiresOn).getTime() - Date.now() < 30 * 86400_000 && p.membership !== "walk-in")
    .sort((a, b) => (a.expiresOn ?? "").localeCompare(b.expiresOn ?? ""))

  return (
    <div>
      <PageHeader
        title="Memberships"
        subtitle="Track member tiers, discounts and upcoming expirations."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tiers.map(({ tier, members }) => {
          const meta = tierMeta[tier]
          const Icon = meta.icon
          const totalSpent = members.reduce((s, p) => s + p.totalSpent, 0)
          return (
            <Card key={tier} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${meta.tone === "gold" ? "bg-[oklch(0.82_0.13_85_/_0.15)] text-gold" : meta.tone === "blue" ? "bg-[oklch(0.72_0.12_220_/_0.15)] text-[oklch(0.78_0.12_220)]" : "bg-secondary text-muted-foreground"}`}>
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-display text-base font-bold capitalize text-foreground">{tier}</p>
                    <p className="text-xs text-muted-foreground">{members.length} members</p>
                  </div>
                </div>
                {meta.discount > 0 && <Badge tone="gold">{meta.discount}% off</Badge>}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total spent</span>
                  <span className="font-medium text-foreground">{formatRs(totalSpent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg per member</span>
                  <span className="font-medium text-foreground">{members.length ? formatRs(totalSpent / members.length) : "—"}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {expiringSoon.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-display text-lg font-bold text-foreground">Expiring Soon</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {expiringSoon.map((p) => {
              const daysLeft = p.expiresOn ? Math.ceil((new Date(p.expiresOn).getTime() - Date.now()) / 86400_000) : 0
              return (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.membership} · since {p.memberSince}</p>
                    </div>
                    <Badge tone={daysLeft <= 7 ? "red" : "gold"}>
                      {daysLeft <= 0 ? "Expired" : `${daysLeft}d left`}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <Progress value={Math.max(0, Math.min(100, (daysLeft / 30) * 100))} tone={daysLeft <= 7 ? "gold" : "green"} />
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
