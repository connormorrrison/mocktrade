import React from "react"
import { cn } from "@/lib/utils"

interface Text1Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export const Text1 = ({ children, className, ...props }: Text1Props) => {
  return (
    <h2
      className={cn(
        "!block !text-4xl !ont-semibold !text-white",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}