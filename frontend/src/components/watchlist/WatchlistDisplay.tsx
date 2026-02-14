import React from 'react';
import { Title2 } from "@/components/Title2";
import { Text4 } from "@/components/Text4";
import { CustomDropdown } from "@/components/CustomDropdown";
import { WatchlistTile } from "@/components/WatchlistTile";
import { PopInOutEffect } from "@/components/PopInOutEffect";
import type { WatchlistStock } from "@/lib/types/watchlist";
import type { WatchlistSortKey } from "@/lib/hooks/useSortedWatchlist";

interface WatchlistDisplayProps {
    stocks: WatchlistStock[];
    sortBy: WatchlistSortKey;
    getSortLabel: (key: WatchlistSortKey) => string;
    onSortChange: (key: WatchlistSortKey) => void;
    hidingSymbols: Set<string>;
    onRemove: (symbol: string) => void;
    onTrade: (symbol: string) => void;
    onAddToWatchlist: (symbol: string) => void;
}

export const WatchlistDisplay: React.FC<WatchlistDisplayProps> = ({
    stocks,
    sortBy,
    getSortLabel,
    onSortChange,
    hidingSymbols,
    onRemove,
    onTrade,
    onAddToWatchlist,
}) => {

    let content: React.ReactNode;

    if (stocks.length === 0) {
        content = (
            <div className="text-center">
                <Text4>Nothing here yet.</Text4>
            </div>
        );
    } else {
        content = (
            <div className="space-y-4">
                {stocks.map((stock, index) => (
                    <PopInOutEffect 
                        key={stock.symbol} 
                        isVisible={!hidingSymbols.has(stock.symbol)} 
                        delay={150 + (index * 50)}
                    >
                        <WatchlistTile
                            stock={{
                                symbol: stock.symbol,
                                name: stock.name,
                                current_price: stock.current_price,
                                previous_price: stock.previous_close,
                                market_capitalization: stock.market_cap
                            }}
                            onTrade={onTrade}
                            onRemove={onRemove}
                            onAddToWatchlist={onAddToWatchlist}
                            removing={hidingSymbols.has(stock.symbol)}
                        />
                    </PopInOutEffect>
                ))}
            </div>
        );
    }

    return (
        <PopInOutEffect isVisible={true} delay={100}>
            <div>
                <Title2>Watchlist</Title2>
                <div className="flex flex-col mb-4 w-full sm:w-fit">
                    <CustomDropdown
                        label="Sort By"
                        value={getSortLabel(sortBy)}
                        options={[
                            { value: "symbol", label: "Symbol" },
                            { value: "price", label: "Current Price" },
                            { value: "change", label: "Change (Daily)" },
                            { value: "marketcapitalization", label: "Market Capitalization" },
                        ]}
                        onValueChange={(value) => onSortChange(value as WatchlistSortKey)}
                    />
                </div>
                {content}
            </div>
        </PopInOutEffect>
    );
};
