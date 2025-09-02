// Simple storage helpers for tokens/user. Supports httpOnly cookie mode and localStorage fallback.
export type StoredUser = { id: string; email: string; name?: string } | null

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}

export function getUser(): StoredUser {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(USER_KEY)
  try {
    return raw ? (JSON.parse(raw) as StoredUser) : null
  } catch {
    return null
  }
}

export function setUser(user: StoredUser) {
  if (typeof window === "undefined") return
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  else window.localStorage.removeItem(USER_KEY)
}

export function clearAuth() {
  setToken(null)
  setUser(null)
}
