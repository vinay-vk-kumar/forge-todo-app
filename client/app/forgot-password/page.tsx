"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/surfaces/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import axios from "axios"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [step, setStep] = useState<"email" | "reset">("email")
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [show, setShow] = React.useState(false)


    const router = useRouter()
    const { toast } = useToast()
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            await axios.post(`${BACKEND_URL}/api/v1/user/forgot-password`, { email })
            setStep("reset")
            toast({
                title: "OTP Sent",
                description: "Check your server console for the code.",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "User not found",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            await axios.post(`${BACKEND_URL}/api/v1/user/reset-password`, { email, otp, newPassword: password })
            toast({
                title: "Password Reset Successful",
                description: "You can now login with your new password.",
            })
            router.push("/login")
        } catch (error: any) {
            toast({
                title: "Reset Failed",
                description: error.response?.data?.error || "Invalid OTP or Expired",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <GlassCard className="p-8">
                    <div className="mb-6 flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 -ml-2">
                            <Link href="/login">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <h1 className="text-xl font-semibold">Reset Password</h1>
                    </div>

                    {step === "reset" ? (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <div className="p-3 bg-primary/5 rounded-md text-sm text-center mb-4">
                                    OTP sent to <span className="font-semibold">{email}</span>
                                </div>
                                <Label htmlFor="otp">Enter OTP</Label>
                                <Input
                                    id="otp"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    maxLength={6}
                                    className="text-center tracking-widest"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={show ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShow((s) => !s)}
                                        aria-label="Toggle password visibility"
                                        aria-pressed={show}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Password
                            </Button>
                            <div className="text-center">
                                <button type="button" onClick={() => setStep("email")} className="text-xs text-muted-foreground hover:underline">
                                    Change email
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        </form>
                    )}
                </GlassCard>
            </motion.div>
        </main>
    )
}
