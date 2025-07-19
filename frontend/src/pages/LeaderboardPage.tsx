import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Title2 } from "@/components/title-2";
import { Text5 } from "@/components/text-5";
import { Tile } from "@/components/tile";
import { ProfilePicture } from "@/components/profile-picture";
import { Countdown } from "@/components/countdown";
import { CustomDropdown } from "@/components/custom-dropdown";

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

  return (
    <PageLayout title="Leaderboard">
      <div className="space-y-6">
        <div className="flex flex-col mb-4 w-full sm:w-fit">
          <CustomDropdown
            label="Timeframe"
            value={timeframe}
            options={[
              { value: "Day", label: "Day" },
              { value: "Week", label: "Week" },
              { value: "Month", label: "Month" },
              { value: "All", label: "All" },
            ]}
            onValueChange={(value) => setTimeframe(value as "Day" | "Week" | "Month" | "All")}
          />
          <Countdown timeframe={timeframe} className="px-1 mt-2" />
        </div>

        {/* Return and Profit Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Tile>
            <div className="py-2 px-2">
              <Title2>Return</Title2>
              <div className="space-y-2">
                {returnLeaderboard.map((user, index) => (
                  <div key={user.username} className="flex items-center justify-between hover:bg-zinc-700 p-2 rounded-xl cursor-pointer min-w-0">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <Text5 className="text-xs font-medium">{index + 1}</Text5>
                      </div>
                      <ProfilePicture size="sm" className="flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Text5 className="font-medium truncate">@{user.username}</Text5>
                      </div>
                    </div>
                    <Text5 className="text-green-500 font-medium flex-shrink-0 ml-2">+{user.return.toFixed(2)}%</Text5>
                  </div>
                ))}
              </div>
            </div>
          </Tile>
          <Tile>
            <div className="py-2 px-2">
              <Title2>Profit</Title2>
              <div className="space-y-2">
                {profitLeaderboard.map((user, index) => (
                  <div key={user.username} className="flex items-center justify-between hover:bg-zinc-700 p-2 rounded-xl cursor-pointer min-w-0">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <Text5 className="text-xs font-medium">{index + 1}</Text5>
                      </div>
                      <ProfilePicture size="sm" className="flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Text5 className="font-medium truncate">@{user.username}</Text5>
                      </div>
                    </div>
                    <Text5 className="text-green-500 font-medium flex-shrink-0 ml-2">+{formatMoney(user.profit)}</Text5>
                  </div>
                ))}
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </PageLayout>
  );
}