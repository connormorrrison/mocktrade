import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { CustomSkeleton } from "@/components/CustomSkeleton";
import { CustomError } from "@/components/CustomError";

// import the new data hook
import { usePortfolio } from "@/lib/hooks/usePortfolio";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import type { Position } from "@/lib/types/portfolio";

// import the new presentational components
import { PortfolioOverview } from "@/components/portfolio/PortfolioOverview";
import { PortfolioPerformance } from "@/components/portfolio/PortfolioPerformance";
import { PortfolioPositions } from "@/components/portfolio/PortfolioPositions";

export default function PortfolioPage() {
  const navigate = useNavigate();

  // call the data hook to get all page data
  const { portfolioData, activityCount, loading, error, clearError } = usePortfolio();

  // watchlist hook for add/remove functionality
  const {
    watchlist: watchlistData,
    addToWatchlist,
    removeFromWatchlist
  } = useWatchlist();

  // handler for trade navigation
  const handleTrade = (symbol: string) => {
    navigate("/trade/" + symbol);
  };

  // check if a symbol is in the watchlist
  const isInWatchlist = (symbol: string) => {
    return watchlistData.some(stock => stock.symbol === symbol);
  };

  // --- render loading state ---
  if (loading) {
    return (
      <PageLayout title="Portfolio">
        <CustomSkeleton />
      </PageLayout>
    );
  }

  // --- render error state ---
  if (error && !portfolioData) {
    return (
      <PageLayout title="Portfolio">
        <CustomError error={error} onClose={clearError} />
      </PageLayout>
    );
  }

  // --- derive data for components ---
  let totalValue: number;
  let positionsValue: number;
  let cashBalance: number;
  let positions: Position[]; // default to empty array

  if (portfolioData) {
    totalValue = portfolioData.portfolio_value;
    positionsValue = portfolioData.positions_value;
    cashBalance = portfolioData.cash_balance;
    positions = portfolioData.positions;
  } else {
    totalValue = 0;
    positionsValue = 0;
    cashBalance = 0;
    positions = [];
  }

  // --- render success state ---
  return (
    <PageLayout title="Portfolio">
      
      {/* section 1: overview */}
      <PortfolioOverview
        totalValue={totalValue}
        positionsValue={positionsValue}
        cashBalance={cashBalance}
        activityCount={activityCount}
        isVisible={!loading}
      />
      
      {/* section 2: performance chart */}
      <PortfolioPerformance isVisible={!loading} />

      {/* section 3: positions list */}
      <PortfolioPositions
        positions={positions}
        totalPortfolioValue={totalValue}
        isVisible={!loading}
        onTrade={handleTrade}
        onAddToWatchlist={addToWatchlist}
        onRemoveFromWatchlist={removeFromWatchlist}
        isInWatchlist={isInWatchlist}
      />

    </PageLayout>
  );
}