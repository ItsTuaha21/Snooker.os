"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useCallback,
} from "react"
import type {
  SnookerTable,
  Player,
  Invoice,
  Booking,
  ActivityItem,
  AppNotification,
  MatchType,
  SessionPlayer,
  PaymentSplit,
  MembershipTier,
} from "./types"
import { elapsedMs } from "./format"

const uid = () => Math.random().toString(36).slice(2, 10)

/* ---------------- seed data ---------------- */

const now = Date.now()

const seedPlayers: Player[] = [
  { id: "p1", name: "Ali Raza", mobile: "0300-1234567", membership: "vip", memberSince: "2023-01-12", expiresOn: "2026-01-12", discount: 15, totalVisits: 142, totalMinutes: 9820, totalSpent: 184300, matchesWon: 88, matchesPlayed: 120 },
  { id: "p2", name: "Hamza Sheikh", mobile: "0301-2345678", membership: "gold", memberSince: "2023-05-02", expiresOn: "2025-11-02", discount: 10, totalVisits: 98, totalMinutes: 6400, totalSpent: 118000, matchesWon: 54, matchesPlayed: 90 },
  { id: "p3", name: "Ahmed Khan", mobile: "0302-3456789", membership: "silver", memberSince: "2024-02-18", expiresOn: "2025-10-18", discount: 5, totalVisits: 61, totalMinutes: 3900, totalSpent: 71000, matchesWon: 30, matchesPlayed: 58 },
  { id: "p4", name: "Usman Tariq", mobile: "0303-4567890", membership: "gold", memberSince: "2023-09-09", expiresOn: "2026-03-09", discount: 10, totalVisits: 77, totalMinutes: 5100, totalSpent: 96500, matchesWon: 41, matchesPlayed: 70 },
  { id: "p5", name: "Bilal Anwar", mobile: "0304-5678901", membership: "basic", memberSince: "2024-06-20", expiresOn: "2025-12-20", discount: 0, totalVisits: 34, totalMinutes: 2100, totalSpent: 39000, matchesWon: 15, matchesPlayed: 33 },
  { id: "p6", name: "Zain Malik", mobile: "0305-6789012", membership: "vip", memberSince: "2022-11-01", expiresOn: "2025-09-25", discount: 20, totalVisits: 201, totalMinutes: 14200, totalSpent: 268000, matchesWon: 132, matchesPlayed: 180 },
  { id: "p7", name: "Fahad Iqbal", mobile: "0306-7890123", membership: "silver", memberSince: "2024-03-30", expiresOn: "2025-10-30", discount: 5, totalVisits: 45, totalMinutes: 2800, totalSpent: 52000, matchesWon: 22, matchesPlayed: 44 },
  { id: "p8", name: "Saad Qureshi", mobile: "0307-8901234", membership: "walk-in", discount: 0, totalVisits: 6, totalMinutes: 340, totalSpent: 6800, matchesWon: 2, matchesPlayed: 6 },
]

const seedTables: SnookerTable[] = [
  {
    id: 1,
    name: "Table 1",
    status: "running",
    ratePerMinute: 6,
    notes: "Championship cloth · recently re-clothed",
    session: {
      id: uid(),
      tableId: 1,
      matchType: "team",
      players: [
        { playerId: "p1", name: "Ali Raza", team: "A" },
        { playerId: "p2", name: "Hamza Sheikh", team: "A" },
        { playerId: "p3", name: "Ahmed Khan", team: "B" },
        { playerId: "p4", name: "Usman Tariq", team: "B" },
      ],
      startTime: now - 74 * 60 * 1000,
      accumulatedPausedMs: 0,
      running: true,
      ratePerMinute: 6,
      notes: "Doubles league fixture",
      winnerTeam: "A",
    },
  },
  {
    id: 2,
    name: "Table 2",
    status: "running",
    ratePerMinute: 5,
    notes: "Standard table",
    session: {
      id: uid(),
      tableId: 2,
      matchType: "single",
      players: [
        { playerId: "p6", name: "Zain Malik" },
        { playerId: "p5", name: "Bilal Anwar" },
      ],
      startTime: now - 32 * 60 * 1000,
      accumulatedPausedMs: 0,
      running: true,
      ratePerMinute: 5,
      winnerTeam: "p6",
    },
  },
  {
    id: 3,
    name: "Table 3",
    status: "reserved",
    ratePerMinute: 5,
    notes: "Tournament practice table",
    reservedFor: "Fahad Iqbal",
    reservedAt: "Today · 8:30 PM",
  },
  {
    id: 4,
    name: "Table 4",
    status: "maintenance",
    ratePerMinute: 5,
    notes: "Cushion replacement in progress",
  },
]

const seedInvoices: Invoice[] = [
  {
    id: uid(), tableId: 2, tableName: "Table 2", matchType: "single",
    players: [{ playerId: "p3", name: "Ahmed Khan" }, { playerId: "p4", name: "Usman Tariq" }],
    startTime: now - 5 * 3600_000, endTime: now - 4 * 3600_000, totalMinutes: 60, ratePerMinute: 5,
    subtotal: 300, discount: 0, total: 300, winnerTeam: "p3",
    billShares: [{ playerId: "p4", name: "Usman Tariq", amount: 300 }],
    payments: [{ method: "cash", amount: 300 }], paid: 300, status: "paid", createdAt: now - 4 * 3600_000,
  },
  {
    id: uid(), tableId: 1, tableName: "Table 1", matchType: "team",
    players: [{ playerId: "p1", name: "Ali Raza", team: "A" }, { playerId: "p6", name: "Zain Malik", team: "B" }],
    startTime: now - 8 * 3600_000, endTime: now - 6 * 3600_000, totalMinutes: 120, ratePerMinute: 6,
    subtotal: 720, discount: 72, total: 648, winnerTeam: "A",
    billShares: [{ playerId: "p6", name: "Zain Malik", amount: 648 }],
    payments: [{ method: "jazzcash", amount: 400 }, { method: "cash", amount: 248 }], paid: 648, status: "paid", createdAt: now - 6 * 3600_000,
  },
]

const seedBookings: Booking[] = [
  { id: uid(), tableId: 3, playerName: "Fahad Iqbal", mobile: "0306-7890123", date: todayISO(), time: "20:30", durationMins: 120, status: "confirmed", createdAt: now - 2 * 3600_000 },
  { id: uid(), tableId: 1, playerName: "Zain Malik", mobile: "0305-6789012", date: todayISO(1), time: "18:00", durationMins: 90, status: "confirmed", createdAt: now - 3600_000 },
  { id: uid(), tableId: 2, playerName: "Saad Qureshi", mobile: "0307-8901234", date: todayISO(2), time: "16:00", durationMins: 60, status: "pending", createdAt: now - 1800_000 },
]

function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const seedActivity: ActivityItem[] = [
  { id: uid(), type: "check-in", title: "Team match started", detail: "Table 1 · Ali & Hamza vs Ahmed & Usman", at: now - 74 * 60_000 },
  { id: uid(), type: "check-in", title: "Player checked in", detail: "Table 2 · Zain vs Bilal", at: now - 32 * 60_000 },
  { id: uid(), type: "payment", title: "Payment received", detail: "Table 2 · Cash", amount: 300, at: now - 4 * 3600_000 },
  { id: uid(), type: "check-out", title: "Match ended", detail: "Table 1 · Team A won", amount: 648, at: now - 6 * 3600_000 },
]

const seedNotifications: AppNotification[] = [
  { id: uid(), type: "membership", title: "Membership expiring soon", detail: "Zain Malik · VIP expires in 7 days", at: now - 3600_000, read: false },
  { id: uid(), type: "booking", title: "Upcoming reservation", detail: "Table 3 reserved for Fahad · 8:30 PM", at: now - 1800_000, read: false },
  { id: uid(), type: "table", title: "Maintenance scheduled", detail: "Table 4 · cushion replacement", at: now - 7200_000, read: true },
]

/* ---------------- state + reducer ---------------- */

interface State {
  tables: SnookerTable[]
  players: Player[]
  invoices: Invoice[]
  bookings: Booking[]
  activity: ActivityItem[]
  notifications: AppNotification[]
}

type Action =
  | { type: "CHECK_IN"; tableId: number; matchType: MatchType; players: SessionPlayer[]; rate: number; notes?: string }
  | { type: "PAUSE"; tableId: number }
  | { type: "RESUME"; tableId: number }
  | { type: "SET_WINNER"; tableId: number; winner: string }
  | { type: "END_MATCH"; invoice: Invoice; players: SessionPlayer[]; totalMinutes: number }
  | { type: "TRANSFER"; fromId: number; toId: number }
  | { type: "SET_TABLE_STATUS"; tableId: number; status: SnookerTable["status"] }
  | { type: "ADD_PLAYER"; player: Player }
  | { type: "UPDATE_PLAYER"; player: Player }
  | { type: "ADD_BOOKING"; booking: Booking }
  | { type: "UPDATE_BOOKING"; id: string; status: Booking["status"] }
  | { type: "ADD_NOTIFICATION"; notification: AppNotification }
  | { type: "MARK_NOTIFICATIONS_READ" }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "CHECK_IN": {
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === action.tableId
            ? {
                ...t,
                status: "running",
                reservedFor: undefined,
                reservedAt: undefined,
                session: {
                  id: uid(),
                  tableId: t.id,
                  matchType: action.matchType,
                  players: action.players,
                  startTime: Date.now(),
                  accumulatedPausedMs: 0,
                  running: true,
                  ratePerMinute: action.rate,
                  notes: action.notes,
                },
              }
            : t,
        ),
        activity: [
          {
            id: uid(),
            type: "check-in",
            title: "Players checked in",
            detail: `${state.tables.find((t) => t.id === action.tableId)?.name} · ${action.players.map((p) => p.name.split(" ")[0]).join(", ")}`,
            at: Date.now(),
          },
          ...state.activity,
        ],
      }
    }
    case "PAUSE":
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === action.tableId && t.session
            ? { ...t, session: { ...t.session, running: false, pausedAt: Date.now() } }
            : t,
        ),
      }
    case "RESUME":
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === action.tableId && t.session && t.session.pausedAt
            ? {
                ...t,
                session: {
                  ...t.session,
                  running: true,
                  accumulatedPausedMs: t.session.accumulatedPausedMs + (Date.now() - t.session.pausedAt),
                  pausedAt: undefined,
                },
              }
            : t,
        ),
      }
    case "SET_WINNER":
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === action.tableId && t.session
            ? { ...t, session: { ...t.session, winnerTeam: action.winner } }
            : t,
        ),
      }
    case "END_MATCH": {
      const inv = action.invoice
      // update player stats
      const winners = new Set(
        action.players
          .filter((p) => (p.team ? p.team === inv.winnerTeam : p.playerId === inv.winnerTeam))
          .map((p) => p.playerId),
      )
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === inv.tableId ? { ...t, status: "available", session: undefined } : t,
        ),
        invoices: [inv, ...state.invoices],
        players: state.players.map((pl) => {
          const inMatch = action.players.find((p) => p.playerId === pl.id)
          if (!inMatch) return pl
          const share = inv.billShares.find((b) => b.playerId === pl.id)?.amount ?? 0
          return {
            ...pl,
            totalMinutes: pl.totalMinutes + action.totalMinutes,
            totalSpent: pl.totalSpent + share,
            matchesPlayed: pl.matchesPlayed + 1,
            matchesWon: pl.matchesWon + (winners.has(pl.id) ? 1 : 0),
          }
        }),
        activity: [
          { id: uid(), type: "check-out", title: "Match ended", detail: `${inv.tableName} · ${inv.totalMinutes} min`, amount: inv.total, at: Date.now() },
          { id: uid(), type: "payment", title: "Payment received", detail: `${inv.tableName} · ${inv.payments.map((p) => p.method).join(", ")}`, amount: inv.paid, at: Date.now() },
          ...state.activity,
        ],
      }
    }
    case "TRANSFER": {
      const from = state.tables.find((t) => t.id === action.fromId)
      if (!from?.session) return state
      return {
        ...state,
        tables: state.tables.map((t) => {
          if (t.id === action.fromId) return { ...t, status: "available", session: undefined }
          if (t.id === action.toId)
            return {
              ...t,
              status: "running",
              reservedFor: undefined,
              session: { ...from.session!, tableId: t.id, ratePerMinute: t.ratePerMinute },
            }
          return t
        }),
        activity: [
          { id: uid(), type: "check-in", title: "Table transferred", detail: `${from.name} → ${state.tables.find((t) => t.id === action.toId)?.name}`, at: Date.now() },
          ...state.activity,
        ],
      }
    }
    case "SET_TABLE_STATUS":
      return {
        ...state,
        tables: state.tables.map((t) => (t.id === action.tableId ? { ...t, status: action.status } : t)),
      }
    case "ADD_PLAYER":
      return {
        ...state,
        players: [action.player, ...state.players],
        activity: action.player.membership !== "walk-in"
          ? [{ id: uid(), type: "member", title: "New member added", detail: `${action.player.name} · ${action.player.membership}`, at: Date.now() }, ...state.activity]
          : state.activity,
      }
    case "UPDATE_PLAYER":
      return { ...state, players: state.players.map((p) => (p.id === action.player.id ? action.player : p)) }
    case "ADD_BOOKING":
      return {
        ...state,
        bookings: [action.booking, ...state.bookings],
        activity: [{ id: uid(), type: "booking", title: "New booking", detail: `${action.booking.playerName} · Table ${action.booking.tableId}`, at: Date.now() }, ...state.activity],
      }
    case "UPDATE_BOOKING":
      return { ...state, bookings: state.bookings.map((b) => (b.id === action.id ? { ...b, status: action.status } : b)) }
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.notification, ...state.notifications] }
    case "MARK_NOTIFICATIONS_READ":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    default:
      return state
  }
}

const initialState: State = {
  tables: seedTables,
  players: seedPlayers,
  invoices: seedInvoices,
  bookings: seedBookings,
  activity: seedActivity,
  notifications: seedNotifications,
}

interface StoreContextValue extends State {
  now: number
  dispatch: React.Dispatch<Action>
  addPlayer: (p: Omit<Player, "id">) => Player
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [tick, setTick] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const addPlayer = useCallback((p: Omit<Player, "id">) => {
    const player: Player = { ...p, id: uid() }
    dispatch({ type: "ADD_PLAYER", player })
    return player
  }, [])

  return (
    <StoreContext.Provider value={{ ...state, now: tick, dispatch, addPlayer }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

/* ---------------- derived helpers ---------------- */

export function sessionElapsedMs(session: NonNullable<SnookerTable["session"]>, now: number): number {
  return elapsedMs(session.startTime, session.accumulatedPausedMs, session.pausedAt, session.running, now)
}

export function sessionMinutes(session: NonNullable<SnookerTable["session"]>, now: number): number {
  return sessionElapsedMs(session, now) / 60000
}

export function sessionBill(session: NonNullable<SnookerTable["session"]>, now: number): number {
  return sessionMinutes(session, now) * session.ratePerMinute
}

export type { PaymentSplit, MembershipTier }
