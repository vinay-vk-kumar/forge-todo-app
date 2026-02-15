"use client"

import Link from "next/link"
import { GlassCard } from "@/components/surfaces/glass-card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 mx-auto max-w-5xl px-4 py-16">
        <section className="mx-auto max-w-3xl text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-semibold text-balance bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              Engineered for productivity
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto"
          >
            Experience the difference of a meticulously crafted task manager: secure, swift, and stripped to the essential.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="rounded-full px-8 transition-transform active:scale-95">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full px-8 transition-transform active:scale-95">
              <Link href="/signup">Create Account</Link>
            </Button>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20"
        >
          <GlassCard className="mx-auto max-w-2xl p-8 md:p-10 backdrop-blur-xl bg-card/50 border-white/10 dark:border-white/5">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Why this?
            </h2>
            <ul className="space-y-4 text-muted-foreground">
              {[
                "\"Uncomplicated Productivity\" — a promise for users tired of bloat.",
                "End-to-end secured task manager working seamlessly online.",
                "Optimistic UI, undo support, and offline resilience.",
                "Dark mode and subtle motion interactions built-in."
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </GlassCard>
        </motion.section>
      </main>
      <Footer />
    </div>
  )
}
