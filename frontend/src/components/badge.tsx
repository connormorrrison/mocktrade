import React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps {
  text: string
  icon?: React.ReactNode
  className?: string
}

export const Badge = ({ text, icon, className }: BadgeProps) => (
  <span className={cn(
    "px-3 py-1 rounded-xl text-lg font-normal text-foreground bg-background/30 dark:bg-input/30 border border-gray-300 dark:border-zinc-700 flex items-center gap-2 flex-shrink-0 h-10",
    className
  )}>
    {icon}
    {text}
  </span>
)