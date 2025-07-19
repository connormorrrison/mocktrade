import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Button1 } from "@/components/button-1";
import { Countdown } from "@/components/countdown";
import { Leaderboard } from "@/components/leaderboard";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"Day" | "Week" | "Month" | "All">("Day");

  // Mock data for top 20 users
  const topUsers = [
    { rank: 1, username: "moonwalker2024", return: 23.45, profit: 4230.50 },
    { rank: 2, username: "cryptoninja47", return: 19.87, profit: 3890.25 },
    { rank: 3, username: "bullmarket_boss", return: 18.92, profit: 3450.75 },
    { rank: 4, username: "options_queen", return: 16.34, profit: 3200.40 },
    { rank: 5, username: "dividend_hunter", return: 15.78, profit: 2980.60 },
    { rank: 6, username: "tech_wizard92", return: 14.92, profit: 2750.30 },
    { rank: 7, username: "value_seeker", return: 13.56, profit: 2530.80 },
    { rank: 8, username: "growth_master", return: 12.34, profit: 2340.50 },
    { rank: 9, username: "swing_king", return: 11.89, profit: 2180.75 },
    { rank: 10, username: "hodl_forever", return: 10.45, profit: 1990.25 },
    { rank: 11, username: "momentum_trader", return: 9.87, profit: 1850.40 },
    { rank: 12, username: "smart_money23", return: 9.34, profit: 1720.60 },
    { rank: 13, username: "risk_taker_99", return: 8.92, profit: 1650.30 },
    { rank: 14, username: "tech_bull_run", return: 8.56, profit: 1580.80 },
    { rank: 15, username: "steady_eddie", return: 8.23, profit: 1520.50 },
    { rank: 16, username: "portfolio_pro", return: 7.89, profit: 1450.75 },
    { rank: 17, username: "chart_analyst", return: 7.56, profit: 1390.25 },
    { rank: 18, username: "day_trader_x", return: 7.23, profit: 1320.40 },
    { rank: 19, username: "longterm_gains", return: 6.92, profit: 1250.60 },
    { rank: 20, username: "trade_master", return: 6.67, profit: 1190.30 },
  ];

  // Sort users by return for Return leaderboard
  const returnLeaderboard = [...topUsers].sort((a, b) => b.return - a.return);

  // Sort users by profit for Profit leaderboard
  const profitLeaderboard = [...topUsers].sort((a, b) => b.profit - a.profit);

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  const formatReturn = (value: number) => `+${value.toFixed(2)}%`;
  const formatProfit = (value: number) => `+${formatMoney(value)}`;

  return (
    <PageLayout title="Leaderboard">
      <div className="space-y-6">
        <div className="flex gap-4 justify-center">
          <Button1 
            variant={timeframe === "Day" ? "primary" : "secondary"}
            onClick={() => setTimeframe("Day")}
          >
            Day
          </Button1>
          <Button1 
            variant={timeframe === "Week" ? "primary" : "secondary"}
            onClick={() => setTimeframe("Week")}
          >
            Week
          </Button1>
          <Button1 
            variant={timeframe === "Month" ? "primary" : "secondary"}
            onClick={() => setTimeframe("Month")}
          >
            Month
          </Button1>
          <Button1 
            variant={timeframe === "All" ? "primary" : "secondary"}
            onClick={() => setTimeframe("All")}
          >
            All
          </Button1>
        </div>
        
        {/* Countdown Timer */}
        <div className="flex justify-center">
          <Countdown timeframe={timeframe} />
        </div>

        {/* Return and Profit Leaderboards */}
        <div className="flex flex-col lg:flex-row gap-4 justify-center items-start">
          <Leaderboard
            title="Return"
            users={returnLeaderboard}
            type="return"
            formatValue={formatReturn}
          />
          <Leaderboard
            title="Profit"
            users={profitLeaderboard}
            type="profit"
            formatValue={formatProfit}
          />
        </div>
      </div>
    </PageLayout>
  );
}