import React from "react"
import { cn } from "@/lib/utils"
import { Text4 } from "@/components/text-4"

interface Button2Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  label?: string
  className?: string
}

export const Button2 = ({ children, label, className, ...props }: Button2Props) => {
  return (
    <div className="!flex !flex-col !gap-2">
      {label && (
        <Text4 className="px-1">
          {label}
        </Text4>
      )}
      <button 
        className={cn(
          "!flex !items-center !justify-center !px-4 !py-2 !text-white !text-lg !font-normal !h-10 !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 !focus:outline-none !focus:ring-0 !gap-2 !w-fit [&>svg]:w-5 [&>svg]:h-5 [&>svg]:flex-shrink-0 whitespace-nowrap",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  )
}