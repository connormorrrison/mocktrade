// react and context
import { useUser } from "@/contexts/UserContext";

// layout and ui components
import { Button1 } from "@/components/button-1";
import { PageLayout } from "@/components/page-layout";
import { CustomSkeleton } from "@/components/custom-skeleton";
import { PopInOutEffect } from "@/components/pop-in-out-effect";
import { Text3 } from "@/components/text-3";

// hooks
import { useMarketStatus } from "@/components/market-status";
import { useMarketData } from "@/lib/hooks/useMarketData";

// home page components
import { QuickActions } from "@/components/home/QuickActions";
import { MarketOverview } from "@/components/home/MarketOverview";
import { MarketMovers } from "@/components/home/MarketMovers";

export default function HomePage() {
  // core hooks
  const { isLoading: userLoading, userData } = useUser();
  const isMarketOpen = useMarketStatus();

  // custom hook to fetch all page data
  const { 
    isLoading: marketLoading, 
    error, 
    marketIndices, 
    marketGainers, 
    marketLosers,
    retryFetch
  } = useMarketData(userLoading);

  // loading state
  let isLoading: boolean;
  if (marketLoading || userLoading) {
    isLoading = true;
  } else {
    isLoading = false;
  }
  
  if (isLoading) {
    return (
      <PageLayout title="Home">
        <CustomSkeleton />
      </PageLayout>
    );
  }

  // error state
  if (error && userData) {
    return (
      <PageLayout title="Home">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Text3 className="text-red-500 mb-4">Error: {error}</Text3>
            <Button1 onClick={retryFetch}>Retry</Button1>
          </div>
        </div>
      </PageLayout>
    );
  }

  // success state: render the page sections
  return (
    <PageLayout title="Home">
      
      {/* quick actions */}
      <PopInOutEffect isVisible={!isLoading} delay={50}>
        <QuickActions />
      </PopInOutEffect>

      {/* market overview */}
      <PopInOutEffect isVisible={!isLoading} delay={100}>
        <MarketOverview 
          indices={marketIndices} 
          isMarketOpen={isMarketOpen} 
        />
      </PopInOutEffect>

      {/* market movers */}
      <PopInOutEffect isVisible={!isLoading} delay={150}>
        <MarketMovers 
          gainers={marketGainers} 
          losers={marketLosers} 
          isMarketOpen={isMarketOpen} 
        />
      </PopInOutEffect>
      
    </PageLayout>
  );
}