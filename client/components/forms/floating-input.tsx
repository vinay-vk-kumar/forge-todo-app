"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  name: string
}

export function FloatingInput({ label, error, className, id, name, ...props }: Props) {
  const inputId = id || name
  return (
    <div className="relative">
      <Input
        id={inputId}
        name={name}
        className={cn("peer h-12 pt-5", error ? "ring-2 ring-destructive" : "", className)}
        aria-invalid={!!error}
        {...props}
      />
      <Label
        htmlFor={inputId}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-background px-1 text-muted-foreground transition-all
        peer-focus:top-2 peer-focus:text-xs peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </Label>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
