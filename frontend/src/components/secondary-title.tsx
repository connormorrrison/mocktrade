import React from "react"
import { cn } from "@/lib/utils"

interface SecondaryTitleProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  className?: string
}

export const SecondaryTitle = ({ children, className, ...props }: SecondaryTitleProps) => {
  return (
    <label
      className={cn(
        "!block !text-xl !font-normal !text-white !mb-2",
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}