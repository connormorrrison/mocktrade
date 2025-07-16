import React from "react"
import { cn } from "@/lib/utils"

interface TileProps {
  children: React.ReactNode
  className?: string
}

export const Tile = ({ children, className }: TileProps) => {
  return (
    <div className={cn(
      "w-full p-4 rounded-xl !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] shadow-none",
      className
    )}>
      {children}
    </div>
  )
}