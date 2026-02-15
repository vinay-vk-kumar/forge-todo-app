import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/theme-toggle"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Forge",
  description: "Todo App",
  icons: {
    icon: "/forge-logo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Use next-themes to control dark mode via class on html */}
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <header className="sticky top-0 z-40 w-full backdrop-blur bg-background/70 border-b">
              <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
                <a href="/" className="font-medium">
                  Forge
                </a>
                <ThemeToggle />
              </div>
            </header>
            {children}
            <Toaster />
          </Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
