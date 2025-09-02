"use client"

import LoginForm from "@/components/forms/login-form"
import { GlassCard } from "@/components/surfaces/glass-card"
import { motion } from "framer-motion"
import { AuthProvider } from "@/components/auth/auth-context"
import { useEffect } from "react"
import { clearAuth, getToken } from "@/lib/auth-storage"
import axios from "axios"

import { useRouter } from "next/navigation"


export default function LoginPage() {
const router = useRouter();
const BACKNED_URL = process.env.BACKNED_URL
useEffect(() => {
  // 1. Create an AbortController to cancel the request if the component unmounts
  const controller = new AbortController();

  // 2. Define an async function inside the effect
  const validateToken = async () => {
    const token = getToken();
    // Only proceed if a token exists
    if (token) {
      try {
        const response = await axios.get(
          `${BACKNED_URL}/api/v1/user/validate-token`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Standard practice to include "Bearer"
            signal: controller.signal, // Pass the signal to axios
          }
        );

        // If the API call is successful and the token is valid
        if (response.data.success) {
          router.replace("/dashboard"); // Redirect to dashboard
        } else {
          // The server responded but said the token is not valid
          clearAuth();
        }
      } catch (error) {
        // 3. Handle errors, including the cancellation error
        if (axios.isCancel(error)) {
          // This is expected if the component unmounts. No action needed.
          console.log("Request canceled: Token validation aborted.");
        } else {
          // Any other error (e.g., 401 Unauthorized, 500 server error) means the token is invalid
          console.error("Token validation failed:", error);
          clearAuth();
        }
      }
    }
  };

  validateToken();

  // 4. Return a cleanup function
  return () => {
    // This function runs when the component unmounts
    controller.abort();
  };
}, []);

  return (
    <AuthProvider>
      <main className="mx-auto max-w-xl px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6 md:p-8">
            <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>
            <LoginForm />
          </GlassCard>
        </motion.div>
      </main>
    </AuthProvider>
  )
}
