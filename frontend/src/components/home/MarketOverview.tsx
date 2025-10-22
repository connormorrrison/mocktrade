import React from 'react';
import { ArrowUp, ArrowDown } from "lucide-react";
import { MarketStatus } from "@/components/market-status";
import { Text2 } from "@/components/text-2";
import { Text3 } from "@/components/text-3";
import { Text5 } from "@/components/text-5";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { formatMoney } from "@/lib/format-money";
// updated import path for types
import type { MarketIndex } from "@/lib/types/market";

// component prop types
interface MarketOverviewProps {
  indices: MarketIndex[];
  isMarketOpen: boolean;
}

/**
 * displays the "market overview" section with index tiles.
 */
export const MarketOverview: React.FC<MarketOverviewProps> = ({ 
  indices, 
  isMarketOpen 
}) => {
  
  // helper function to render a single index tile
  const renderIndexTile = (index: MarketIndex) => {
    let priceClass: string;
    let changeVariant: "green" | "red";
    let changeIcon: React.ReactNode;
    let changeSign: string;
    let percentSign: string;

    if (isMarketOpen) {
      priceClass = "animate-pulse";
    } else {
      priceClass = "";
    }

    if (index.change >= 0) {
      changeVariant = "green";
      changeIcon = <ArrowUp className="h-5 w-5" />;
      changeSign = "+";
      percentSign = "+";
    } else {
      changeVariant = "red";
      changeIcon = <ArrowDown className="h-5 w-5" />;
      changeSign = ""; // minus sign is already on the number
      percentSign = "";
    }

    const changeText = changeSign + index.change.toFixed(2);
    const percentText = "(" + percentSign + index.percent.toFixed(2) + "%) Today";
    const fullChangeText = changeText + " " + percentText;

    return (
      <Tile key={index.ticker}>
        <div className="text-left">
          <Text3>{index.symbol} ({index.ticker})</Text3>
          <Text2 className={priceClass}>
            {formatMoney(index.value)}
          </Text2>
          <Text5 variant={changeVariant}>
            <div className="flex items-center gap-1">
              {changeIcon}
              <span>
                {fullChangeText}
              </span>
            </div>
          </Text5>
        </div>
      </Tile>
    );
  };
  
  return (
    <div>
      <Title2>Market Overview</Title2>
      <MarketStatus className="mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map(renderIndexTile)}
      </div>
    </div>
  );
};
