"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { getToken } from "@/lib/auth-storage"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    const token = getToken()
    if (!user && !token) {
      router.replace("/")
    }
  }, [user, router])

  if (!user && !getToken()) {
    return <div className="mx-auto max-w-md p-6 text-center text-muted-foreground">Checking authentication...</div>
  }

  return <>{children}</>
}
