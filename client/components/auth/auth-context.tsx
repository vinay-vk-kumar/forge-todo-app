"use client"

import React from "react"
import { getApiClient, hasRemoteApi } from "@/lib/api"
import { clearAuth, getUser, setToken, setUser, type StoredUser } from "@/lib/auth-storage"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type AuthState = {
  user: StoredUser
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<StoredUser>(getUser())
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Restore user from storage
  React.useEffect(() => {
    setUserState(getUser())
  }, [])

  async function login(email: string, password: string) {
    setLoading(true)
    try {
      if (hasRemoteApi()) {
        const api = getApiClient()
        const { data } = await api.post("/auth/login", { email, password })
        const token = (data as any)?.token as string | undefined
        const userObj = (data as any)?.user as StoredUser
        if (token) setToken(token)
        if (userObj) {
          setUser(userObj)
          setUserState(userObj)
        }
        toast({ title: "Signed in", description: "Welcome back!" })
      } 
    } catch (e: any) {
      toast({
        title: "Sign in failed",
        description: e?.response?.data?.message ?? "Invalid credentials",
        variant: "destructive" as any,
      })
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function signup(email: string, password: string, name?: string) {
    setLoading(true)
    try {
      if (hasRemoteApi()) {
        const api = getApiClient()
        await api.post("/auth/signup", { email, password, name })
      } else {
        // Mock just pretends success
      }
      toast({ title: "Signup successful", description: "Please login to continue" })
    } catch (e: any) {
      toast({
        title: "Signup failed",
        description: e?.response?.data?.message ?? "Please check your input",
        variant: "destructive" as any,
      })
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setLoading(true)
    try {
      router.push("/")
      clearAuth()
    } finally {
      clearAuth()
      setUserState(null)
      setLoading(false)
    }
  }

  const value: AuthState = { user, loading, login, signup, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
