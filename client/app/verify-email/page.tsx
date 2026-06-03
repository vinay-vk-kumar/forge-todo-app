"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { GlassCard } from "@/components/surfaces/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Loader2, ShieldCheck } from "lucide-react"
import axios from "axios"
import { setToken, setUser } from "@/lib/auth-storage"

function VerifyEmailForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email")

    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (otp.length !== 6) {
            toast({
                title: "Invalid OTP",
                description: "OTP must be 6 digits.",
                variant: "destructive",
            })
            return
        }

        if (!email) {
            toast({
                title: "Missing email",
                description: "Please sign up again.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/verify-email`, { email, otp })

            if (response.data.token) {
                setToken(response.data.token)
                if (response.data.user) {
                    setUser(response.data.user)
                }
                localStorage.setItem("email", email)
                toast({
                    title: "Email verified",
                    description: "Welcome to Todo App!",
                })
                router.replace("/dashboard")
            }
        } catch (error: any) {
            toast({
                title: "Verification failed",
                description: error.response?.data?.error || "Invalid OTP",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!email) {
        return (
            <div className="flex flex-col items-center justify-center p-4 min-h-[50vh] space-y-4">
                <div className="text-center text-muted-foreground">
                    Invalid or missing email in the verification link.
                </div>
                <Button variant="outline" onClick={() => router.push("/signup")}>
                    Go to Signup
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h3 className="text-lg font-medium">Enter Verification Code</h3>
                <p className="text-sm text-muted-foreground">
                    We have sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        className="text-center text-lg tracking-widest"
                        maxLength={6}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify Email
                </Button>
            </form>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <GlassCard className="p-8">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                    </div>

                    <Suspense fallback={<div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}>
                        <VerifyEmailForm />
                    </Suspense>
                </GlassCard>
            </motion.div>
        </main>
    )
}
