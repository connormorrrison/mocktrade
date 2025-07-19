import React from "react"
import { cn } from "@/lib/utils"

interface Text6Props extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  className?: string
  variant?: "white" | "green" | "red"
}

export const Text6 = ({ children, className, variant = "white", ...props }: Text6Props) => {
  const variantStyles = {
    white: "text-white",
    green: "text-green-600",
    red: "text-red-600"
  }

  return (
    <span
      className={cn(
        "!block !text-lg !font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}