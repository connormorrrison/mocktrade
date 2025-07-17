import React from "react"
import { cn } from "@/lib/utils"

interface TertiaryTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

export const TertiaryText = ({ children, className, ...props }: TertiaryTextProps) => {
  return (
    <p
      className={cn(
        "block text-base font-normal text-zinc-400",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}