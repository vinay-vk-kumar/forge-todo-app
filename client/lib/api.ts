"use client"

import axios, { type AxiosError, type AxiosInstance } from "axios"
import { getToken, setToken, clearAuth } from "./auth-storage"

// Set your API base URL; if absent, we'll operate in mock mode for Todos.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ""

let client: AxiosInstance | null = null

export function getApiClient() {
  if (client) return client
  client = axios.create({
    baseURL: API_BASE,
    withCredentials: true, // allow httpOnly cookie-based auth
  })

  client.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  let isRefreshing = false
  let pendingQueue: Array<() => void> = []

  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as any
      if (error.response?.status === 401 && !original?._retry) {
        if (isRefreshing) {
          await new Promise<void>((resolve) => pendingQueue.push(resolve))
          return client!(original)
        }
        original._retry = true
        isRefreshing = true
        try {
          // Attempt refresh; works if server uses cookies or returns new tokens.
          const { data } = await client!.post("/auth/refresh")
          const newToken = (data as any)?.token
          if (newToken) {
            setToken(newToken)
          }
          pendingQueue.forEach((fn) => fn())
          pendingQueue = []
          return client!(original)
        } catch (e) {
          clearAuth()
          return Promise.reject(e)
        } finally {
          isRefreshing = false
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export function hasRemoteApi() {
  return !!API_BASE
}
