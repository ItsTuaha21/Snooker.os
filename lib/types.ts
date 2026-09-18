export type TableStatus = "available" | "running" | "reserved" | "maintenance"

export type MatchType = "single" | "three" | "team"

export type MembershipTier = "walk-in" | "basic" | "silver" | "gold" | "vip"

export type PaymentMethod =
  | "cash"
  | "jazzcash"
  | "easypaisa"
  | "bank"
  | "debit"
  | "credit"

export interface Player {
  id: string
  name: string
  mobile: string
  membership: MembershipTier
  memberSince?: string
  expiresOn?: string
  discount: number // percentage
  totalVisits: number
  totalMinutes: number
  totalSpent: number
  matchesWon: number
  matchesPlayed: number
}

export interface SessionPlayer {
  playerId: string
  name: string
  team?: "A" | "B"
}

export interface TableSession {
  id: string
  tableId: number
  matchType: MatchType
  players: SessionPlayer[]
  startTime: number // epoch ms
  pausedAt?: number
  accumulatedPausedMs: number
  running: boolean
  ratePerMinute: number
  notes?: string
  winnerTeam?: "A" | "B" | string // team letter or playerId
}

export interface SnookerTable {
  id: number
  name: string
  status: TableStatus
  ratePerMinute: number
  notes?: string
  session?: TableSession
  reservedFor?: string
  reservedAt?: string
}

export interface PaymentSplit {
  method: PaymentMethod
  amount: number
}

export interface BillShare {
  playerId: string
  name: string
  amount: number
}

export interface Invoice {
  id: string
  tableId: number
  tableName: string
  matchType: MatchType
  players: SessionPlayer[]
  startTime: number
  endTime: number
  totalMinutes: number
  ratePerMinute: number
  subtotal: number
  discount: number
  total: number
  winnerTeam?: string
  billShares: BillShare[]
  payments: PaymentSplit[]
  paid: number
  status: "paid" | "partial" | "unpaid"
  createdAt: number
}

export interface Booking {
  id: string
  tableId: number
  playerName: string
  mobile: string
  date: string
  time: string
  durationMins: number
  status: "confirmed" | "pending" | "cancelled" | "completed"
  createdAt: number
}

export interface ActivityItem {
  id: string
  type: "check-in" | "check-out" | "payment" | "booking" | "member"
  title: string
  detail: string
  amount?: number
  at: number
}

export interface AppNotification {
  id: string
  type: "membership" | "booking" | "payment" | "table"
  title: string
  detail: string
  at: number
  read: boolean
}
