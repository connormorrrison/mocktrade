import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { Text4 } from "@/components/Text4";

interface CountdownProps {
  timeframe: "Day" | "Week" | "Month" | "All";
  className?: string;
  prefix?: string;
  onReset?: () => void;
}

export function Countdown({ timeframe, className = "", prefix = "Resets in", onReset }: CountdownProps) {
  const hasResetRef = useRef(false);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const calculateNextReset = (timeframe: string): Date => {
    const now = new Date();
    
    switch (timeframe) {
      case "Day":
        // Reset at midnight (next day)
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        return nextDay;
        
      case "Week":
        // Reset on Sunday at midnight
        const nextSunday = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7;
        const daysToAdd = daysUntilSunday === 0 ? 7 : daysUntilSunday;
        nextSunday.setDate(now.getDate() + daysToAdd);
        nextSunday.setHours(0, 0, 0, 0);
        return nextSunday;
        
      case "Month":
        // Reset on the first day of next month
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(0, 0, 0, 0);
        return nextMonth;
        
      default:
        // "All" timeframe - no reset, return far future date
        const farFuture = new Date(now);
        farFuture.setFullYear(now.getFullYear() + 100);
        return farFuture;
    }
  };

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = calculateNextReset(timeframe).getTime();
      const difference = target - now;

      if (difference > 0) {
        hasResetRef.current = false;
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!hasResetRef.current && onReset) {
          hasResetRef.current = true;
          onReset();
        }
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [timeframe]);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  // Don't show countdown for "All" timeframe
  if (timeframe === "All") {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="w-5 h-5" />
      <Text4>
        {prefix} {timeRemaining.days}d {formatTime(timeRemaining.hours)}h {formatTime(timeRemaining.minutes)}m {formatTime(timeRemaining.seconds)}s
      </Text4>
    </div>
  );
}