"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { CustomCalendar } from "@/components/custom-calendar"
import { Text4 } from "@/components/text-4"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CustomDatePickerProps {
  label?: string
  placeholder?: string
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  className?: string
}

export function CustomDatePicker({ 
  label = "Date", 
  placeholder = "Select date", 
  value, 
  onValueChange,
  className = ""
}: CustomDatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    onValueChange?.(date)
    setOpen(false)
  }

  return (
    <div className="!flex !flex-col !gap-2">
      {label && (
        <Text4 className="px-1">
          {label}
        </Text4>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`!flex !items-center !justify-between !px-4 !py-2 !text-white !text-lg !font-medium !h-10 !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl !hover:bg-zinc-700 !focus:outline-none !focus:ring-0 !gap-2 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:flex-shrink-0 ${className}`}
          >
            {value ? value.toLocaleDateString() : placeholder}
            <ChevronDownIcon/>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <CustomCalendar
            selected={value}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}