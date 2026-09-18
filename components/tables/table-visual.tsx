import { cn } from "@/lib/utils"
import type { TableStatus } from "@/lib/types"

const statusFelt: Record<TableStatus, string> = {
  running: "from-[oklch(0.5_0.11_150)] to-[oklch(0.34_0.09_155)]",
  available: "from-[oklch(0.46_0.1_158)] to-[oklch(0.3_0.08_160)]",
  reserved: "from-[oklch(0.5_0.09_85)] to-[oklch(0.34_0.07_90)]",
  maintenance: "from-[oklch(0.4_0.02_260)] to-[oklch(0.26_0.01_260)]",
}

function Pocket({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute size-3.5 rounded-full bg-black/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] ring-1 ring-black/40",
        className,
      )}
    />
  )
}

const balls = [
  { c: "bg-red-600", x: "62%", y: "50%" },
  { c: "bg-red-600", x: "68%", y: "42%" },
  { c: "bg-red-600", x: "68%", y: "58%" },
  { c: "bg-red-600", x: "74%", y: "34%" },
  { c: "bg-red-600", x: "74%", y: "50%" },
  { c: "bg-yellow-400", x: "30%", y: "62%" },
  { c: "bg-green-500", x: "30%", y: "38%" },
  { c: "bg-[#8b4513]", x: "30%", y: "50%" },
  { c: "bg-blue-500", x: "50%", y: "50%" },
  { c: "bg-pink-400", x: "58%", y: "50%" },
  { c: "bg-black", x: "82%", y: "50%" },
  { c: "bg-white ring-1 ring-black/20", x: "22%", y: "56%" },
]

export function TableVisual({
  status,
  className,
  showBalls = true,
}: {
  status: TableStatus
  className?: string
  showBalls?: boolean
}) {
  return (
    <div
      className={cn(
        "relative aspect-[2/1] w-full rounded-xl p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
        "bg-gradient-to-b from-[#5a3a1e] to-[#3a2412]",
        status === "running" && "ring-1 ring-primary/40",
        className,
      )}
    >
      {/* cushion / felt */}
      <div className={cn("relative size-full rounded-md bg-gradient-to-b shadow-inner", statusFelt[status])}>
        {/* baulk line + D */}
        <div className="absolute left-[25%] top-0 h-full w-px bg-white/20" />
        <div className="absolute left-[25%] top-1/2 h-[38%] w-[9%] -translate-x-full -translate-y-1/2 rounded-l-full border border-r-0 border-white/20" />

        {/* pockets */}
        <Pocket className="-left-1.5 -top-1.5" />
        <Pocket className="-right-1.5 -top-1.5" />
        <Pocket className="-bottom-1.5 -left-1.5" />
        <Pocket className="-bottom-1.5 -right-1.5" />
        <Pocket className="-top-1.5 left-1/2 -translate-x-1/2" />
        <Pocket className="-bottom-1.5 left-1/2 -translate-x-1/2" />

        {status === "maintenance" && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30 text-[10px] font-semibold uppercase tracking-widest text-white/70">
            Under maintenance
          </div>
        )}

        {showBalls &&
          status !== "maintenance" &&
          balls.map((b, i) => (
            <span
              key={i}
              className={cn(
                "absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.6)]",
                b.c,
              )}
              style={{ left: b.x, top: b.y }}
            >
              <span className="absolute left-1/2 top-0.5 size-0.5 -translate-x-1/2 rounded-full bg-white/50" />
            </span>
          ))}
      </div>
    </div>
  )
}
