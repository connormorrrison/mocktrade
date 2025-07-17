import { useState } from "react";
import { ChevronDown, Trophy } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Text1 } from "@/components/text-1";
import { Text2 } from "@/components/text-2";
import { Text3 } from "@/components/text-3";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { Tile } from "@/components/tile";
import { Title1 } from "@/components/title-1";
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
      firstName: "Alex",
      lastName: "Johnson",
      username: "tradeking",
      return_percent: 23.45,
      portfolio_value: 145789.32,
      trades_count: 47,
    },
    {
      rank: 2,
      firstName: "Sarah",
      lastName: "Chen",
      username: "stockninja",
      return_percent: 19.87,
      portfolio_value: 128456.78,
      trades_count: 52,
    },
    {
      rank: 3,
      firstName: "Mike",
      lastName: "Rodriguez",
      username: "bullmarket",
      return_percent: 18.92,
      portfolio_value: 134567.89,
      trades_count: 38,
    },
    {
      rank: 4,
      firstName: "Emma",
      lastName: "Wilson",
      username: "optionsmaster",
      return_percent: 16.34,
      portfolio_value: 112890.45,
      trades_count: 63,
    },
    {
      rank: 5,
      firstName: "David",
      lastName: "Brown",
      username: "dividendking",
      return_percent: 15.78,
      portfolio_value: 156789.23,
      trades_count: 29,
    },
    {
      rank: 6,
      firstName: "Lisa",
      lastName: "Martinez",
      username: "techinvestor",
      return_percent: 14.92,
      portfolio_value: 98765.43,
      trades_count: 41,
    },
    {
      rank: 7,
      firstName: "Ryan",
      lastName: "Taylor",
      username: "valuehunter",
      return_percent: 13.56,
      portfolio_value: 87654.32,
      trades_count: 35,
    },
    {
      rank: 8,
      firstName: "Jennifer",
      lastName: "Anderson",
      username: "growthseeker",
      return_percent: 12.34,
      portfolio_value: 76543.21,
      trades_count: 28,
    },
    {
      rank: 9,
      firstName: "Kevin",
      lastName: "Thomas",
      username: "swingtrader",
      return_percent: 11.89,
      portfolio_value: 65432.10,
      trades_count: 67,
    },
    {
      rank: 10,
      firstName: "Amanda",
      lastName: "Garcia",
      username: "longtermwin",
      return_percent: 10.45,
      portfolio_value: 54321.09,
      trades_count: 19,
    },
  ];

  // Current user's position (mock data)
  const currentUserRank = {
    rank: 15,
    firstName: "Sam",
    lastName: "Davis",
    username: "you",
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
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <Text2 className="w-6 h-6 flex items-center justify-center">#{rank}</Text2>;
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:items-center">
              <div className="lg:text-left">
                <div className="flex items-center gap-4 ml-2">
                  {getRankIcon(currentUserRank.rank)}
                  <div>
                    <p className="text-lg font-medium">{currentUserRank.firstName} {currentUserRank.lastName}</p>
                    <Text4>@{currentUserRank.username}</Text4>
                  </div>
                </div>
              </div>

              <div>
                <Text4>Return</Text4>
                <Text5 variant="green">+{currentUserRank.return_percent.toFixed(2)}%</Text5>
              </div>

              <div>
                <Text4>Portfolio Value</Text4>
                <Text5>{formatMoney(currentUserRank.portfolio_value)}</Text5>
              </div>

              <div className="lg:mr-2">
                <Text4>Trades</Text4>
                <Text5>{currentUserRank.trades_count}</Text5>
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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:items-center">
                  <div className="lg:text-left">
                    <div className="flex items-center gap-4 ml-2">
                      {getRankIcon(user.rank)}
                      <div>
                        <p className="text-lg font-medium">{user.firstName} {user.lastName}</p>
                        <Text4>@{user.username}</Text4>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Text4>Return</Text4>
                    <Text5 variant={user.return_percent >= 0 ? "green" : "red"}>
                      {user.return_percent >= 0 ? "+" : ""}{user.return_percent.toFixed(2)}%
                    </Text5>
                  </div>

                  <div>
                    <Text4>Portfolio Value</Text4>
                    <Text5>{formatMoney(user.portfolio_value)}</Text5>
                  </div>

                  <div className="lg:mr-2">
                    <Text4>Trades</Text4>
                    <Text5>{user.trades_count}</Text5>
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