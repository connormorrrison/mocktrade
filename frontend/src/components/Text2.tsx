import React from "react"
import { cn } from "@/lib/utils"

interface Text2Props extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  className?: string
  variant?: "white" | "green" | "red"
}

export const Text2 = ({ children, className, variant = "white", ...props }: Text2Props) => {
  const variantStyles = {
    white: "text-white",
    green: "text-green-600",
    red: "text-red-600"
  }

  return (
    <label
      className={cn(
        "!block !text-2xl !font-normal",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}