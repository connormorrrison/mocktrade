import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";
import { Button1 } from "@/components/button-1";
import { Countdown } from "@/components/countdown";
import { Leaderboard } from "@/components/leaderboard";
import { formatMoney } from "@/lib/format-money";

interface LeaderboardUser {
  rank: number;
  username: string;
  total_value: number;
  return_amount: number;
  return_percentage: number;
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"Day" | "Week" | "Month" | "All">("Day");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapTimeframeToAPI = (timeframe: string) => {
    switch (timeframe) {
      case "Day": return "day";
      case "Week": return "week";
      case "Month": return "month";
      case "All": return "all";
      default: return "all";
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(`http://localhost:8000/api/v1/portfolio/leaderboard?timeframe=${mapTimeframeToAPI(timeframe)}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      const data = await response.json();
      setLeaderboardData(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeframe]);

  // Transform API data for display
  const transformedUsers = leaderboardData.map(user => ({
    rank: user.rank,
    username: user.username,
    return: user.return_percentage,
    profit: user.return_amount
  }));

  // Sort users by return for Return leaderboard
  const returnLeaderboard = [...transformedUsers].sort((a, b) => b.return - a.return);

  // Sort users by profit for Profit leaderboard  
  const profitLeaderboard = [...transformedUsers].sort((a, b) => b.profit - a.profit);


  const formatReturn = (value: number) => `+${value.toFixed(2)}%`;
  const formatProfit = (value: number) => `+${formatMoney(value)}`;

  if (loading) {
    return (
      <PageLayout title="Leaderboard">
        <div className="flex justify-center items-center py-12">
          <div className="text-white">Loading leaderboard...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Leaderboard">
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Leaderboard">
        <div className="flex flex-wrap gap-4 justify-center">
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
    </PageLayout>
  );
}