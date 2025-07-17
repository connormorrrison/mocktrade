import React from "react"
import { cn } from "@/lib/utils"

interface Title2Props extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  className?: string
}

export const Title2 = ({ children, className, ...props }: Title2Props) => {
  return (
    <label
      className={cn(
        "block text-xl font-normal text-white mb-2",
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}