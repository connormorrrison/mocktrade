import React from "react"
import { cn } from "@/lib/utils"

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const TextField = ({ className, ...props }: TextFieldProps) => {
  return (
    <input
      className={cn(
        "!w-full !px-4 !py-2 h-10 !text-lg !text-muted-foreground !bg-input/30 !border !border-zinc-700 !rounded-xl !focus:outline-none focus:ring",
        className
      )}
      {...props}
    />
  )
}