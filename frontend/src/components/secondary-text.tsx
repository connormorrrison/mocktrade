import React from "react"
import { cn } from "@/lib/utils"

interface SecondaryTextProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  className?: string
}

export const SecondaryText = ({ children, className, ...props }: SecondaryTextProps) => {
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