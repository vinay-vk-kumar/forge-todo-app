"use client"
import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FloatingInput } from "./floating-input"
import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { setToken, setUser } from "@/lib/auth-storage"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
})
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
type FormValues = z.infer<typeof schema>

export default function LoginForm() {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })
  const [loading, setLoading] = React.useState(false)

  const router = useRouter()
  const [show, setShow] = React.useState(false)

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const userDetails = {
        email: values.email,
        password: values.password
      }
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/signIn`, userDetails)
      if (response.data.token) {
        setToken(response.data.token)
        if (response.data.user) {
          setUser(response.data.user)
        }
        localStorage.setItem("email", values.email)
        toast({ title: "Login successful !!" })
        router.replace("/dashboard")
      }
    } catch (e: any) {
      if (e.response?.status === 403 && e.response?.data?.notVerified) {
        toast({
          title: "Email not verified",
          description: "Please verify your email to login.",
          variant: "destructive"
        })
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`)
        return
      }

      const errorMessage = e.response?.data?.error
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive" // Good practice to use a different style for errors
      });
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      noValidate
    >
      <FloatingInput
        label="Email"
        type="email"
        placeholder=" " // required for floating
        error={errors.email?.message}
        aria-invalid={!!errors.email}
        {...register("email")}
      />
      <div className="relative">
        <FloatingInput
          label="Password"
          type={show ? "text" : "password"}
          placeholder=" "
          error={errors.password?.message}
          aria-invalid={!!errors.password}
          {...register("password")}
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
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button variant="outline" type="button" className="w-full h-11" onClick={() => window.location.href = `${BACKEND_URL}/api/v1/user/auth/google`}>
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
        </svg>
        Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link className="text-primary underline underline-offset-4" href="/signup">
          Create one
        </Link>
      </p>
    </motion.form>
  )
}
