import React from "react"
import { cn } from "@/lib/utils"

interface TileProps {
  children: React.ReactNode
  className?: string
}

export const Tile = ({ children, className }: TileProps) => {
  return (
    <div className={cn(
      "w-full p-4 rounded-xl bg-background/30 dark:bg-input/30 border border-gray-300 dark:border-zinc-700 shadow-none",
      className
    )}>
      {children}
    </div>
  )
}