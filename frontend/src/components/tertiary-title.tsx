import React from "react"
import { cn } from "@/lib/utils"

interface TertiaryTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

export const TertiaryTitle = ({ children, className, ...props }: TertiaryTitleProps) => {
  return (
    <p
      className={cn(
        "!block !text-base !font-normal !text-zinc-400",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}