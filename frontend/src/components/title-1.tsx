import React from "react"
import { cn } from "@/lib/utils"

interface Title1Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export const Title1 = ({ children, className, ...props }: Title1Props) => {
  return (
    <h2
      className={cn(
        "block text-4xl font-normal mb-6",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}