import React from "react"
import { cn } from "@/lib/utils"
import { Text4 } from "@/components/text-4"

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
}

export const TextField = ({ label, className, ...props }: TextFieldProps) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Text4 className="px-1">
          {label}
        </Text4>
      )}
      <input
        className={cn(
          "!w-full !px-4 !py-2 h-10 !text-lg !text-muted-foreground !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl !focus:outline-none focus:!ring-0"
        )}
        {...props}
      />
    </div>
  )
}