import { Calendar } from "@/components/ui/calendar"

interface CustomCalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
}

export function CustomCalendar({ 
  selected, 
  onSelect,
  className = ""
}: CustomCalendarProps) {
  return (
    <Calendar
      mode="single"
      selected={selected}
      captionLayout="dropdown"
      onSelect={onSelect}
      className={className}
      classNames={{
        week: "!flex !w-full !mt-2 !gap-2"
      }}
    />
  )
}