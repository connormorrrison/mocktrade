import React from "react"
import { cn } from "@/lib/utils"

interface PrimaryTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export const PrimaryTitle = ({ children, className, ...props }: PrimaryTitleProps) => {
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