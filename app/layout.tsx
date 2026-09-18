import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter, Sora } from "next/font/google"
import "./globals.css"
import { StoreProvider } from "@/lib/store"
import { ToastProvider } from "@/components/ui/toast"
import { AppShell } from "@/components/layout/app-shell"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" })

export const metadata: Metadata = {
  title: "Break & Run · Snooker Club ERP",
  description:
    "Premium snooker club management system — table management, per-minute billing, winner/loser billing, memberships, bookings and reports.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a1410",
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <StoreProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </StoreProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
