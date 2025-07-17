import React from "react"
import { cn } from "@/lib/utils"

interface Text3Props extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  className?: string
}

export const Text3 = ({ children, className, ...props }: Text3Props) => {
  return (
    <label
      className={cn(
        "block text-xl font-normal text-white",
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}