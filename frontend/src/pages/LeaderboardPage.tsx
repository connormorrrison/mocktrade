import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Countdown } from "@/components/Countdown";
import { CustomSkeleton } from "@/components/CustomSkeleton";
import { CustomError } from "@/components/CustomError";
import { useUser } from "@/contexts/UserContext";
import { PopInOutEffect } from "@/components/PopInOutEffect";
import type { Timeframe } from "@/lib/types/leaderboard";

// import new hooks
import { useLeaderboardData } from "@/lib/hooks/useLeaderboardData";
import { useSortedLeaderboards } from "@/lib/hooks/useSortedLeaderboards";

// import new components
import { TimeframeSelector } from "@/components/leaderboard/TimeframeSelector";
import { LeaderboardDisplay } from "@/components/leaderboard/LeaderboardDisplay";

export default function LeaderboardPage() {
  // --- state ---
  const { userData } = useUser();
  // this is the only state this page is responsible for
  const [timeframe, setTimeframe] = useState<Timeframe>("Day");

  // --- data hooks ---
  // data fetching logic
  const { leaderboardData, loading, error, refetch } = useLeaderboardData(timeframe);
  // data transformation logic
  const { profitLeaderboard, returnLeaderboard } = useSortedLeaderboards(leaderboardData);

  // --- render loading ---
  if (loading) {
    return (
      <PageLayout title="Leaderboard">
        <CustomSkeleton />
      </PageLayout>
    );
  }

  // --- render error ---
  if (error && userData) {
    return (
      <PageLayout title="Leaderboard">
        <CustomError error={error} onClose={refetch} />
      </PageLayout>
    );
  }

  // --- render success ---
  return (
    <PageLayout title="Leaderboard">
        
        {/* section 1: timeframe buttons */}
        <TimeframeSelector
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            isVisible={!loading}
        />
        
        {/* section 2: countdown */}
        <PopInOutEffect isVisible={!loading} delay={100}>
          <div className="flex justify-center">
            <Countdown timeframe={timeframe} onReset={refetch} />
          </div>
        </PopInOutEffect>

        {/* section 3: leaderboards */}
        <LeaderboardDisplay
            profitLeaderboard={profitLeaderboard}
            returnLeaderboard={returnLeaderboard}
            isVisible={!loading}
        />
        
    </PageLayout>
  );
}
