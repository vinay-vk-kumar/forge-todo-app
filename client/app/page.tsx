import Link from "next/link"
import { GlassCard } from "@/components/surfaces/glass-card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <section className="mx-auto max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold text-balance">Engineered for productivity</h1>
        <p className="text-muted-foreground text-pretty">
          Experience the difference of a meticulously crafted task manager: secure, swift, and stripped to the essential.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12">
        <GlassCard className="mx-auto max-w-xl p-6">
          <h2 className="text-lg font-medium mb-2">Why this?</h2>
          <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1 text-left">
            <li>"Uncomplicated Productivity" is a strong promise that resonates with users tired of bloated software.</li>
            <li>An end-to-end secured task manager that works seamlessly online</li>
            <li>Optimistic UI, undo delete, and offline resilience</li>
            <li>Dark mode and subtle motion interactions</li>
          </ul>
        </GlassCard>
      </section>
    </main>
  )
}
