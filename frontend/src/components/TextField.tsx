import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Text4 } from "@/components/Text4"
import { Eye, EyeOff } from "lucide-react"

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
  uppercase?: boolean
  multiline?: boolean
  rows?: number
  formatType?: 'default' | 'currency' | 'number'
}

export const TextField = ({ label, className, type, uppercase = false, multiline = false, rows = 3, formatType = 'default', ...props }: TextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [displayValue, setDisplayValue] = useState(props.value as string || '')
  const [isFocused, setIsFocused] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  // Update display value when props.value changes (only when not focused)
  React.useEffect(() => {
    if (!isFocused) {
      if (formatType !== 'default') {
        setDisplayValue(formatValue(props.value as string || ''))
      } else {
        setDisplayValue(props.value as string || '')
      }
    }
  }, [props.value, formatType, isFocused])

  // Format value for display
  const formatValue = (value: string): string => {
    if (!value || formatType === 'default') return value
    
    const numValue = parseFloat(value.replace(/[,$]/g, ''))
    if (isNaN(numValue)) return value

    if (formatType === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numValue)
    }
    
    if (formatType === 'number') {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
      }).format(numValue)
    }
    
    return value
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    
    // For currency, remove $ and commas, keep only numbers and decimal
    if (formatType === 'currency') {
      inputValue = inputValue.replace(/[^0-9.]/g, '')
    }
    // For numbers, remove commas, keep numbers and decimal
    else if (formatType === 'number') {
      inputValue = inputValue.replace(/[^0-9.]/g, '')
    }
    
    // While focused, show raw value to avoid flicker (formats on blur)
    setDisplayValue(inputValue)
    
    // Call original onChange with raw value
    if (props.onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: inputValue
        }
      }
      props.onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>)
    }
  }

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    if (props.onFocus) {
      props.onFocus(e)
    }
  }

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
            type={formatType !== 'default' ? 'text' : inputType}
            className={cn(
              "!w-full !px-4 !py-2 h-10 !text-lg !font-normal !text-muted-foreground !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl !focus:outline-none focus:!ring-0",
              isPassword && "pr-12",
              uppercase && "[&:not(:placeholder-shown)]:uppercase"
            )}
            {...props}
            value={formatType !== 'default' ? displayValue : props.value}
            onChange={formatType !== 'default' ? handleChange : props.onChange}
            onBlur={formatType !== 'default' ? handleBlur : props.onBlur}
            onFocus={formatType !== 'default' ? handleFocus : props.onFocus}
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