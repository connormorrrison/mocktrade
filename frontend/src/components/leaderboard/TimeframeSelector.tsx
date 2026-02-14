import React from 'react';
import { Button1 } from "@/components/Button1";
import { PopInOutEffect } from "@/components/PopInOutEffect";
import type { Timeframe } from "@/lib/types/leaderboard";

interface TimeframeSelectorProps {
    timeframe: Timeframe;
    setTimeframe: (timeframe: Timeframe) => void;
    isVisible: boolean;
}

type ButtonVariant = "primary" | "secondary";

/**
 * displays the timeframe selection buttons (day, week, month, all).
 */
export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
    timeframe,
    setTimeframe,
    isVisible
}) => {

    // determine button variants without ternaries
    let dayVariant: ButtonVariant;
    let weekVariant: ButtonVariant;
    let monthVariant: ButtonVariant;
    let allVariant: ButtonVariant;

    if (timeframe === "Day") {
        dayVariant = "primary";
    } else {
        dayVariant = "secondary";
    }

    if (timeframe === "Week") {
        weekVariant = "primary";
    } else {
        weekVariant = "secondary";
    }
    
    if (timeframe === "Month") {
        monthVariant = "primary";
    } else {
        monthVariant = "secondary";
    }
    
    if (timeframe === "All") {
        allVariant = "primary";
    } else {
        allVariant = "secondary";
    }

    return (
        <PopInOutEffect isVisible={isVisible} delay={50}>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button1 
              variant={dayVariant}
              onClick={() => setTimeframe("Day")}
            >
              Day
            </Button1>
            <Button1 
              variant={weekVariant}
              onClick={() => setTimeframe("Week")}
            >
              Week
            </Button1>
            <Button1 
              variant={monthVariant}
              onClick={() => setTimeframe("Month")}
            >
              Month
            </Button1>
            <Button1 
              variant={allVariant}
              onClick={() => setTimeframe("All")}
            >
              All
            </Button1>
          </div>
        </PopInOutEffect>
    );
};
