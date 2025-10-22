import React from 'react';
import { Leaderboard } from "@/components/leaderboard";
import { PopInOutEffect } from "@/components/pop-in-out-effect";
import { formatMoney } from "@/lib/format-money";
import type { TransformedUser } from "@/lib/types/leaderboard";

interface LeaderboardDisplayProps {
    profitLeaderboard: TransformedUser[];
    returnLeaderboard: TransformedUser[];
    isVisible: boolean;
}

// formatting helpers are co-located with the component that uses them
const formatReturn = (value: number) => "+" + value.toFixed(2) + "%";
const formatProfit = (value: number) => "+" + formatMoney(value);

/**
 * displays the two side-by-side leaderboards for profit and return.
 */
export const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({
    profitLeaderboard,
    returnLeaderboard,
    isVisible
}) => {
    return (
        <PopInOutEffect isVisible={isVisible} delay={150}>
          <div className="flex flex-col lg:flex-row gap-4 justify-center items-start">
            <Leaderboard
              title="Profit/Loss"
              users={profitLeaderboard}
              type="profit"
              formatValue={formatProfit}
            />
            <Leaderboard
              title="Return"
              users={returnLeaderboard}
              type="return"
              formatValue={formatReturn}
            />
          </div>
        </PopInOutEffect>
    );
};
