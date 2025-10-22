import { useState, useMemo } from "react";
import type { WatchlistStock } from "@/lib/types/watchlist";

export type WatchlistSortKey = "symbol" | "price" | "change" | "marketcapitalization";

// helper to get the display label for a sort key
export const getSortLabel = (sortKey: WatchlistSortKey) => {
    switch (sortKey) {
        case "symbol":
            return "Symbol";
        case "price":
            return "Current Price";
        case "change":
            return "Change (Daily)";
        case "marketcapitalization":
            return "Market Capitalization";
        default:
            return "Symbol";
    }
};

/**
 * this hook manages the sorting state and logic for the watchlist.
 */
export const useSortedWatchlist = (watchlist: WatchlistStock[]) => {
    const [sortBy, setSortBy] = useState<WatchlistSortKey>("symbol");

    const sortedWatchlist = useMemo(() => {
        // create a new array to avoid mutating the original
        const newSortedList = [...watchlist];

        // sort the new array based on the sort key
        newSortedList.sort((a, b) => {
            switch (sortBy) {
                case "symbol":
                    return a.symbol.localeCompare(b.symbol);
                case "price":
                    return b.current_price - a.current_price;
                case "change":
                    return b.change - a.change;
                case "marketcapitalization":
                    // assuming market_cap is a string like "1.2T"
                    // this is a very basic sort, a real one would parse "T", "B", "M"
                    return a.market_cap.localeCompare(b.market_cap);
                default:
                    return 0;
            }
        });
        
        return newSortedList;
    }, [watchlist, sortBy]);

    return { sortBy, setSortBy, sortedWatchlist, getSortLabel };
};
