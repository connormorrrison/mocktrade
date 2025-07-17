import React from "react"
import { cn } from "@/lib/utils"

interface Text2Props extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  className?: string
}

export const Text2 = ({ children, className, ...props }: Text2Props) => {
  return (
    <label
      className={cn(
        "block text-2xl font-semibold text-white",
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}