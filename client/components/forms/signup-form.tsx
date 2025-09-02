"use client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FloatingInput } from "./floating-input"
import { useAuth } from "@/components/auth/auth-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { BACKNED_URL } from "@/config"
import { useState } from "react"

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
})

type FormValues = z.infer<typeof schema>

export default function SignupForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try{
      const userDetails = {
        name: values.name,
        email: values.email,
        password: values.password
      }
      // await signup(values.email, values.password, values.name)
      const response = await axios.post(`${BACKNED_URL}/api/v1/user/signup`, userDetails)
      if(response.data.email){
        toast({ title: "Signup successful — please login" })
        router.replace("/login")
      }
    } catch(e: any){
      const errorMessage = e.response?.data?.error
      toast({
        title: "Signup failed",
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
      <FloatingInput label="Name" placeholder=" " error={errors.name?.message} {...register("name")} />
      <FloatingInput label="Email" type="email" placeholder=" " error={errors.email?.message} {...register("email")} />
      <FloatingInput
        label="Password"
        type="password"
        placeholder=" "
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="text-primary underline underline-offset-4" href="/login">
          Sign in
        </Link>
      </p>
    </motion.form>
  )
}
