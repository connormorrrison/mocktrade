import React from "react"
import { cn } from "@/lib/utils"

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const TextField = ({ className, ...props }: TextFieldProps) => {
  return (
    <input
      className={cn(
        "!w-full !px-4 !py-2 h-10 !text-lg !text-muted-foreground !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl !focus:outline-none focus:!ring-0",
        className
      )}
      {...props}
    />
  )
}