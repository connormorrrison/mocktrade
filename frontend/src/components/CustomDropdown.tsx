import { ChevronDown } from "lucide-react";
import { Text4 } from "@/components/Text4";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomDropdownProps {
  value: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  onValueChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function CustomDropdown({ value, options, onValueChange, label, className = "" }: CustomDropdownProps) {
  return (
    <div className="!flex !flex-col !gap-2">
      {label && (
        <Text4 className="px-1">
          {label}
        </Text4>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger className={`!flex !items-center !justify-between !px-4 !py-2 !text-white !text-lg !font-normal !h-10 !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 !focus:outline-none !focus:ring-0 !gap-2 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:flex-shrink-0 whitespace-nowrap ${className}`}>
          {value}
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onValueChange(option.value)}
              className="!text-base"
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}