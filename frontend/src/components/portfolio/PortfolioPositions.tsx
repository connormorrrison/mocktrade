import React from 'react';
import { Title2 } from "@/components/Title2";
import { CustomDropdown } from "@/components/CustomDropdown";
import { PositionTile } from "@/components/PositionTile";
import { Text4 } from "@/components/Text4";
import { PopInOutEffect } from "@/components/PopInOutEffect";
import { 
  useSortedPositions, 
  getSortLabel,
  type SortKey
} from "@/lib/hooks/useSortedPositions";
import type { Position } from "@/lib/types/portfolio";

interface PortfolioPositionsProps {
  positions: Position[];
  totalPortfolioValue: number;
  isVisible: boolean;
  onTrade: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
}

export const PortfolioPositions: React.FC<PortfolioPositionsProps> = ({
  positions,
  totalPortfolioValue,
  isVisible,
  onTrade,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist,
}) => {
  // use our sorting hook
  const { sortBy, setSortBy, sortedPositions } = useSortedPositions(
    positions,
    totalPortfolioValue
  );

  let content: React.ReactNode;
  
  if (!positions || positions.length === 0) {
    content = (
      <div className="text-center">
        <Text4>Nothing here yet.</Text4>
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        {sortedPositions.map((pos, index) => {
          
          let companyName: string;
          if (pos.company_name) {
            companyName = pos.company_name;
          } else {
            companyName = pos.symbol;
          }
          
          return (
            <PopInOutEffect 
              key={pos.symbol} 
              isVisible={isVisible} 
              delay={200 + (index * 50)}
            >
              <PositionTile
                position={{
                  symbol: pos.symbol,
                  shares: pos.shares,
                  current_price: pos.current_price,
                  average_price: pos.average_price,
                  previous_price: pos.current_price, // todo: api
                  company_name: companyName
                }}
                totalPortfolioValue={totalPortfolioValue}
                onTrade={onTrade}
                onAddToWatchlist={onAddToWatchlist}
                onRemoveFromWatchlist={onRemoveFromWatchlist}
                isInWatchlist={isInWatchlist(pos.symbol)}
                showWatchlistButton={true}
              />
            </PopInOutEffect>
          );
        })}
      </div>
    );
  }

  return (
    <PopInOutEffect isVisible={isVisible} delay={150}>
      <div>
        <Title2>Positions</Title2>
        <div className="flex flex-col mb-4 w-full sm:w-fit">
          <CustomDropdown
            label="Sort By"
            value={getSortLabel(sortBy)}
            options={[
              { value: "symbol", label: "Symbol" },
              { value: "quantity", label: "Quantity" },
              { value: "avgPrice", label: "Average Price" },
              { value: "currentPrice", label: "Current Price" },
              { value: "marketValue", label: "Market Value" },
              { value: "portfolio", label: "% of Portfolio" },
            ]}
            onValueChange={(value) => setSortBy(value as SortKey)}
          />
        </div>
        {content}
      </div>
    </PopInOutEffect>
  );
};
