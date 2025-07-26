import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Text4 } from "@/components/text-4"
import { Eye, EyeOff } from "lucide-react"

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
  uppercase?: boolean
  multiline?: boolean
  rows?: number
}

export const TextField = ({ label, className, type, uppercase = false, multiline = false, rows = 3, ...props }: TextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Text4 className="px-1">
          {label}
        </Text4>
      )}
      <div className="relative">
        {multiline ? (
          <textarea
            className={cn(
              "!w-full !px-4 !py-2 !text-lg !font-normal !text-muted-foreground !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl !focus:outline-none focus:!ring-0 resize-none",
              uppercase && "[&:not(:placeholder-shown)]:uppercase"
            )}
            rows={rows}
            {...(props as any)}
          />
        ) : (
          <input
            type={inputType}
            className={cn(
              "!w-full !px-4 !py-2 h-10 !text-lg !font-normal !text-muted-foreground !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl !focus:outline-none focus:!ring-0",
              isPassword && "pr-12",
              uppercase && "[&:not(:placeholder-shown)]:uppercase"
            )}
            {...props}
          />
        )}
        {isPassword && !multiline && (
          <div 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        )}
      </div>
    </div>
  )
}