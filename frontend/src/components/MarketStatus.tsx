import { Text5 } from "@/components/Text5";

interface MarketStatusProps {
  className?: string;
}

// export function to check if market is open
export function useMarketStatus() {
  // get the current date object
  const now = new Date();

  // create a formatter for the 'america/new_york' timezone (et)
  // we need to extract the day of the week, hour, and minute
  const easternTimeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short', // 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'
    hour: 'numeric',    // e.g., '9', '16'
    hourCycle: 'h23', // use 24-hour clock (0-23)
    minute: 'numeric',  // e.g., '0', '30'
  });

  // format the date into its parts
  const parts = easternTimeFormatter.formatToParts(now);

  // helper function to find a specific part value
  const getPartValue = (type: string) => {
    const part = parts.find(p => p.type === type);

    if (part) {
      return part.value;
    }

    return undefined;
  };

  // extract the values
  const currentDayValue = getPartValue('weekday');
  const currentHourValue = getPartValue('hour');
  const currentMinuteValue = getPartValue('minute');

  // default to '0' if the value is undefined
  let hourString = '0';
  if (currentHourValue) {
    hourString = currentHourValue;
  }

  let minuteString = '0';
  if (currentMinuteValue) {
    minuteString = currentMinuteValue;
  }
  
  // we must parse them as integers
  const currentDay = currentDayValue; // "mon", "tue", etc.
  const currentHour = parseInt(hourString, 10);
  const currentMinute = parseInt(minuteString, 10);

  // 1. check if it's a weekday (monday to friday)
  const isWeekday = currentDay !== 'Sat' && currentDay !== 'Sun';

  // 2. check if it's within market hours (9:30 am to 4:00 pm et)
  // market opens at 9:30 am
  const isAfterOpen = currentHour > 9 || (currentHour === 9 && currentMinute >= 30);
  
  // market closes at 4:00 pm (16:00)
  // it is "open" *until* 16:00. at 16:00:00, it is closed.
  const isBeforeClose = currentHour < 16;

  const isMarketHours = isAfterOpen && isBeforeClose;

  // the market is open if it's a weekday and during market hours
  return isWeekday && isMarketHours;
}

export function MarketStatus({ className }: MarketStatusProps) {
  const isOpen = useMarketStatus();

  // define variables based on market status
  let statusText = "Market Closed";
  let indicatorColor = "bg-red-600";

  // --- THIS IS THE FIX ---
  // explicitly type the variable to match the 'variant' prop's expected type.
  // this tells typescript that this variable will only ever be "red" or "green".
  let textColorVariant: "red" | "green" = "red";
  
  let pulseClass = ""; // the animation class

  // use an if block to set values for when the market is open
  if (isOpen) {
    statusText = "Market Open";
    indicatorColor = "bg-green-600";
    textColorVariant = "green"; // this assignment is valid
    pulseClass = "animate-pulse"; // add pulse class only if open
  }

  // the indicator has color and pulse (if open)
  const indicatorClasses = `h-3 w-3 rounded-full ${indicatorColor} ${pulseClass}`;
  
  // the text *only* has the pulse (if open)
  const textClasses = pulseClass;

  // build the final class string without using ||
  let finalContainerClass = "flex items-center gap-2";
  if (className) {
    finalContainerClass = finalContainerClass + " " + className;
  }

  return (
    <div className={finalContainerClass}>
      <div className={indicatorClasses} />
      <Text5 variant={textColorVariant} className={textClasses}>
        {statusText}
      </Text5>
    </div>
  );
}