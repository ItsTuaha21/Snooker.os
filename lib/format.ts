import type { PaymentMethod, MembershipTier, MatchType } from "./types"

export function formatRs(amount: number): string {
  return "Rs. " + Math.round(amount).toLocaleString("en-PK")
}

export function formatHours(totalMinutes: number): string {
  return formatMinutes(totalMinutes)
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = Math.floor(totalMinutes % 60)
  if (h <= 0) return `${m}m`
  return `${h}h ${m}m`
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function formatTime(epoch: number): string {
  return new Date(epoch).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatDate(epoch: number): string {
  return new Date(epoch).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function timeAgo(epoch: number): string {
  const diff = Date.now() - epoch
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export const paymentLabels: Record<PaymentMethod, string> = {
  cash: "Cash",
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  bank: "Bank Transfer",
  debit: "Debit Card",
  credit: "Credit Card",
}

export const membershipLabels: Record<MembershipTier, string> = {
  "walk-in": "Walk-In",
  basic: "Basic",
  silver: "Silver",
  gold: "Gold",
  vip: "VIP",
}

export const matchTypeLabels: Record<MatchType, string> = {
  single: "Single Match",
  three: "3 Player Rotation",
  team: "Team vs Team",
}

export function elapsedMs(
  startTime: number,
  accumulatedPausedMs: number,
  pausedAt: number | undefined,
  running: boolean,
  now: number,
): number {
  const end = running ? now : pausedAt ?? now
  return Math.max(0, end - startTime - accumulatedPausedMs)
}
