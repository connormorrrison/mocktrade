import { useState, useMemo } from "react";
import type { Position } from "@/lib/types/portfolio";

export type SortKey = "symbol" | "quantity" | "avgPrice" | "currentPrice" | "marketValue" | "portfolio";

// helper to get the display label for a sort key
export const getSortLabel = (sortKey: SortKey) => {
  switch (sortKey) {
    case "symbol":
      return "Symbol";
    case "quantity":
      return "Quantity";
    case "avgPrice":
      return "Average Price";
    case "currentPrice":
      return "Current Price";
    case "marketValue":
      return "Market Value";
    case "portfolio":
      return "% of Portfolio";
    default:
      return "Symbol";
  }
};

/**
 * this hook manages the sorting state and logic for the positions list.
 */
export const useSortedPositions = (
  positions: Position[],
  totalPortfolioValue: number
) => {
  const [sortBy, setSortBy] = useState<SortKey>("symbol");

  const sortedPositions = useMemo(() => {
    // create a new array to avoid mutating the original
    const newSortedPositions = [...positions];

    // sort the new array based on the sortBy key
    newSortedPositions.sort((a, b) => {
      switch (sortBy) {
        case "symbol":
          return a.symbol.localeCompare(b.symbol);
        case "quantity":
          return b.shares - a.shares;
        case "avgPrice":
          return b.average_price - a.average_price;
        case "currentPrice":
          return b.current_price - a.current_price;
        case "marketValue":
          return b.current_value - a.current_value;
        case "portfolio":
          let aPercent: number;
          if (totalPortfolioValue > 0) {
            aPercent = (a.current_value / totalPortfolioValue) * 100;
          } else {
            aPercent = 0;
          }
          
          let bPercent: number;
          if (totalPortfolioValue > 0) {
            bPercent = (b.current_value / totalPortfolioValue) * 100;
          } else {
            bPercent = 0;
          }
          return bPercent - aPercent;
        default:
          return 0;
      }
    });

    return newSortedPositions;
  }, [positions, sortBy, totalPortfolioValue]);

  return { sortBy, setSortBy, sortedPositions };
};
