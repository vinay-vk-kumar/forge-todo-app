"use client"
import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FloatingInput } from "./floating-input"
import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { setToken } from "@/lib/auth-storage"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
})
const BACKNED_URL = process.env.BACKNED_URL
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
    try{
      const userDetails = {
        email: values.email,
        password: values.password
      }
      const response = await axios.post(`${BACKNED_URL}/api/v1/user/signIn`, userDetails)
      if(response.data.success){
        setToken(response.data.token)
        localStorage.setItem("email",response.data.email)
        toast({ title: "login successful !!" })
        router.replace("/dashboard")
      }
    } catch(e: any){
      const errorMessage = e.response?.data?.error
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive" // Good practice to use a different style for errors
      });
    }
    finally{
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

      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
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
