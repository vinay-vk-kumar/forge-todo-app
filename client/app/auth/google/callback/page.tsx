"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setToken, setUser } from "@/lib/auth-storage"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function GoogleCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    useEffect(() => {
        const token = searchParams.get("token")
        const email = searchParams.get("email")
        const name = searchParams.get("name")
        const id = searchParams.get("id")

        if (token && email && id) {
            setToken(token)
            setUser({ id, email, name: name || undefined })
            localStorage.setItem("email", email) // Legacy support if needed

            toast({
                title: "Login Successful",
                description: `Welcome back${name ? `, ${name}` : ""}!`,
            })

            router.replace("/dashboard")
        } else {
            toast({
                title: "Login Failed",
                description: "Could not authenticate with Google.",
                variant: "destructive",
            })
            router.replace("/login")
        }
    }, [searchParams, router, toast])

    return (
        <div className="flex min-h-screen items-center justify-center flex-col gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Authenticating with Google...</p>
        </div>
    )
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <GoogleCallbackContent />
        </Suspense>
    )
}
