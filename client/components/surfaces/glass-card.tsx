"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export function GlassCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-lg",
        "border-border",
        className,
      )}
      {...props}
    />
  )
}
