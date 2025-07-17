import React from "react"
import { cn } from "@/lib/utils"

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
}

export const PrimaryButton = ({ children, className, variant = 'primary', disabled, ...props }: PrimaryButtonProps) => {
  return (
    <button 
      className={cn(
        "!px-4 !py-2 !text-lg !font-medium !rounded-xl transition-colors focus:!outline-none !h-10 !flex !items-center !justify-center !gap-2 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:flex-shrink-0",
        disabled 
          ? '!bg-zinc-900 !text-zinc-300 !cursor-not-allowed focus:!outline-none focus:!ring-0' 
          : variant === 'primary' 
            ? '!bg-blue-600 !text-white hover:!bg-blue-700' 
            : '!bg-zinc-800/55 !text-white !border !border-[oklch(1_0_0_/_10%)] hover:!bg-blue-600 hover:!text-white',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}