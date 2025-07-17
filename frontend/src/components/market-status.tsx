import { Text4 } from "@/components/text-4";

interface MarketStatusProps {
  className?: string;
}

export function MarketStatus({ className }: MarketStatusProps) {
  // Check if market is open (9:30 AM - 4:00 PM ET, Monday-Friday)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const isWeekday = currentDay >= 1 && currentDay <= 5; // Monday to Friday
  const isMarketHours = (currentHour > 9 || (currentHour === 9 && currentMinute >= 30)) && currentHour < 16;
  
  const isOpen = isWeekday && isMarketHours;

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <div className={`h-3 w-3 rounded-full ${isOpen ? "bg-green-600 animate-pulse" : "bg-red-600"}`} />
      <Text4 className={`${isOpen ? "text-green-600 animate-pulse" : "text-red-600"}`}>
        {isOpen ? "Market Open" : "Market Closed"}
      </Text4>
    </div>
  );
}