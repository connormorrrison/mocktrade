import { useState } from "react";
import { ChevronDown, Trophy, Medal, Award } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { Title3 } from "@/components/title-3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState("1mo");

  // Mock leaderboard data
  const leaderboard = [
    {
      rank: 1,
      username: "TradeKing",
      return_percent: 23.45,
      portfolio_value: 145789.32,
      trades_count: 47,
    },
    {
      rank: 2,
      username: "StockNinja",
      return_percent: 19.87,
      portfolio_value: 128456.78,
      trades_count: 52,
    },
    {
      rank: 3,
      username: "BullMarket",
      return_percent: 18.92,
      portfolio_value: 134567.89,
      trades_count: 38,
    },
    {
      rank: 4,
      username: "OptionsMaster",
      return_percent: 16.34,
      portfolio_value: 112890.45,
      trades_count: 63,
    },
    {
      rank: 5,
      username: "DividendKing",
      return_percent: 15.78,
      portfolio_value: 156789.23,
      trades_count: 29,
    },
    {
      rank: 6,
      username: "TechInvestor",
      return_percent: 14.92,
      portfolio_value: 98765.43,
      trades_count: 41,
    },
    {
      rank: 7,
      username: "ValueHunter",
      return_percent: 13.56,
      portfolio_value: 87654.32,
      trades_count: 35,
    },
    {
      rank: 8,
      username: "GrowthSeeker",
      return_percent: 12.34,
      portfolio_value: 76543.21,
      trades_count: 28,
    },
    {
      rank: 9,
      username: "SwingTrader",
      return_percent: 11.89,
      portfolio_value: 65432.10,
      trades_count: 67,
    },
    {
      rank: 10,
      username: "LongTermWin",
      return_percent: 10.45,
      portfolio_value: 54321.09,
      trades_count: 19,
    },
  ];

  // Current user's position (mock data)
  const currentUserRank = {
    rank: 15,
    username: "You",
    return_percent: 8.76,
    portfolio_value: 42345.67,
    trades_count: 24,
  };

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-zinc-400 font-semibold">#{rank}</span>;
    }
  }

  return (
    <PageLayout title="Leaderboard">
      <div className="space-y-6">
        {/* Timeframe Filter */}
        <div>
          <Title2>Top Performers</Title2>
          <div className="flex flex-col mb-4 w-full sm:w-fit">
            <Title3 className="px-1">Timeframe</Title3>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-between px-4 py-2 !text-lg !text-white !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 h-10 focus:!outline-none focus:!ring-0">
                {timeframe === "1w" && "1 Week"}
                {timeframe === "1mo" && "1 Month"}
                {timeframe === "3mo" && "3 Months"}
                {timeframe === "6mo" && "6 Months"}
                {timeframe === "1y" && "1 Year"}
                <ChevronDown className="h-5 w-5 ml-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => setTimeframe("1w")}
                  className="text-base"
                >
                  1 Week
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeframe("1mo")}
                  className="text-base"
                >
                  1 Month
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeframe("3mo")}
                  className="text-base"
                >
                  3 Months
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeframe("6mo")}
                  className="text-base"
                >
                  6 Months
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeframe("1y")}
                  className="text-base"
                >
                  1 Year
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Your Rank */}
        <div>
          <Title2>Your Rank</Title2>
          <Tile className="bg-blue-900/20 border-blue-600/30">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4 lg:ml-2">
                {getRankIcon(currentUserRank.rank)}
                <div>
                  <p className="text-lg font-medium">{currentUserRank.username}</p>
                  <Text4>Rank #{currentUserRank.rank}</Text4>
                </div>
              </div>

              <div>
                <Text4>Return</Text4>
                <Text2 className="text-green-600">+{currentUserRank.return_percent.toFixed(2)}%</Text2>
              </div>

              <div>
                <Text4>Portfolio Value</Text4>
                <p className="font-medium">{formatMoney(currentUserRank.portfolio_value)}</p>
              </div>

              <div className="lg:mr-2">
                <Text4>Trades</Text4>
                <p className="font-medium">{currentUserRank.trades_count}</p>
              </div>
            </div>
          </Tile>
        </div>

        {/* Leaderboard */}
        <div>
          <Title2>Rankings</Title2>
          <div className="space-y-4">
            {leaderboard.map((user) => (
              <Tile key={user.rank}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4 lg:ml-2">
                    {getRankIcon(user.rank)}
                    <div>
                      <p className="text-lg font-medium">{user.username}</p>
                      <Text4>Rank #{user.rank}</Text4>
                    </div>
                  </div>

                  <div>
                    <Text4>Return</Text4>
                    <Text2 className={`${user.return_percent >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {user.return_percent >= 0 ? "+" : ""}{user.return_percent.toFixed(2)}%
                    </Text2>
                  </div>

                  <div>
                    <Text4>Portfolio Value</Text4>
                    <p className="font-medium">{formatMoney(user.portfolio_value)}</p>
                  </div>

                  <div className="lg:mr-2">
                    <Text4>Trades</Text4>
                    <p className="font-medium">{user.trades_count}</p>
                  </div>
                </div>
              </Tile>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}