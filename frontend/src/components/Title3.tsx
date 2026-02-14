import React from "react"
import { cn } from "@/lib/utils"

interface Title3Props extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

export const Title3 = ({ children, className, ...props }: Title3Props) => {
  return (
    <p
      className={cn(
        "block text-base font-normal text-zinc-400 mb-2",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}