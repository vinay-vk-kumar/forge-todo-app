"use client"

import SignupForm from "@/components/forms/signup-form"
import { GlassCard } from "@/components/surfaces/glass-card"
import { motion } from "framer-motion"
import { AuthProvider } from "@/components/auth/auth-context"

export default function SignupPage() {
  return (
    <AuthProvider>
      <main className="mx-auto max-w-xl px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6 md:p-8">
            <h1 className="text-2xl font-semibold mb-1">Create an account</h1>
            <p className="text-sm text-muted-foreground mb-6">It only takes a minute</p>
            <SignupForm />
          </GlassCard>
        </motion.div>
      </main>
    </AuthProvider>
  )
}
