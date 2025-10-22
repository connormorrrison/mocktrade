import React from 'react';
import { StockCarousel } from "@/components/stock-carousel";
import { Title2 } from "@/components/title-2";
import { Title3 } from "@/components/title-3";
// updated import path for types
import type { MarketMover } from "@/lib/types/market";

// component prop types
interface MarketMoversProps {
  gainers: MarketMover[];
  losers: MarketMover[];
  isMarketOpen: boolean;
}

/**
 * displays the "market movers" section with top gainers and losers.
 */
export const MarketMovers: React.FC<MarketMoversProps> = ({ 
  gainers, 
  losers, 
  isMarketOpen 
}) => {

  let gainersCarousel: React.ReactNode = null;
  if (gainers.length > 0) {
    gainersCarousel = (
      <StockCarousel 
        stocks={gainers} 
        variant="green" 
        isMarketOpen={isMarketOpen} 
      />
    );
  }

  let losersCarousel: React.ReactNode = null;
  if (losers.length > 0) {
    losersCarousel = (
      <StockCarousel 
        stocks={losers} 
        variant="red" 
        isMarketOpen={isMarketOpen} 
      />
    );
  }

  return (
    <div>
      <Title2>Market Movers</Title2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* top gainers */}
        <div>
          <Title3>Top Gainers</Title3>
          {gainersCarousel}
        </div>

        {/* top losers */}
        <div>
          <Title3>Top Losers</Title3>
          {losersCarousel}
        </div>

      </div>
    </div>
  );
};
