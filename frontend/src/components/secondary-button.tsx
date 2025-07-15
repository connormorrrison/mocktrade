import React from "react"
import { cn } from "@/lib/utils"

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export const SecondaryButton = ({ children, className, ...props }: SecondaryButtonProps) => {
  return (
    <button 
      className={cn(
        "!px-4 !py-2 !text-white !text-lg !font-medium !flex !items-center !gap-2 !h-10 !bg-zinc-800 !border !border-zinc-700 !rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}