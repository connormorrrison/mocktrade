import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/page-layout";
import { CustomSkeleton } from "@/components/custom-skeleton";
import { PopInOutEffect } from "@/components/pop-in-out-effect";
import { ErrorTile } from "@/components/error-tile";

// import the new data hook
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { useApi } from "@/lib/hooks/useApi";
import { useMarketStatus } from "@/components/market-status";
// import the new sorting hook
import {
    useSortedWatchlist,
    type WatchlistSortKey
} from "@/lib/hooks/useSortedWatchlist";

// import the new presentational components
import { StockSearchForm } from "@/components/trade/StockSearchForm";
import { StockPriceDisplay } from "@/components/stock-price-display";
import { WatchlistDisplay } from "@/components/watchlist/WatchlistDisplay";

// types
interface StockData {
  current_price: number;
  company_name: string;
}

interface PositionData {
  quantity: number;
}

export default function WatchlistPage() {
    const navigate = useNavigate();

    // core hooks
    const {
        execute: apiExecute,
        isLoading: isApiLoading,
        error: apiError,
        setError: setApiError
    } = useApi();
    const isMarketOpen = useMarketStatus();

    // search state
    const [symbolInput, setSymbolInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // stock data state
    const [price, setPrice] = useState<number | null>(null);
    const [companyName, setCompanyName] = useState("");
    const [sharesOwned, setSharesOwned] = useState(0);

    // data fetching hook
    const {
        watchlist,
        loading,
        hidingSymbols,
        addToWatchlist,
        removeFromWatchlist,
    } = useWatchlist();

    // sorting hook
    const {
        sortedWatchlist,
        sortBy,
        setSortBy,
        getSortLabel
    } = useSortedWatchlist(watchlist);

    // --- event handlers ---

    const fetchStockData = useCallback(async (symbolToFetch: string) => {
        if (!symbolToFetch) {
            return;
        }

        // reset state for a new search
        setApiError(null);
        setPrice(null);
        setCompanyName('');
        setSharesOwned(0);

        try {
            // fetch price and position in parallel
            const [priceData, positionData] = await Promise.all([
                apiExecute<StockData>("/stocks/" + symbolToFetch),
                apiExecute<PositionData>("/trading/positions/" + symbolToFetch).catch(() => ({ quantity: 0 })),
            ]);

            if (priceData.current_price === 0) {
                throw new Error('Invalid symbol');
            }

            setPrice(priceData.current_price);
            setCompanyName(priceData.company_name || symbolToFetch);
            setSharesOwned(positionData?.quantity || 0);
            setSearchQuery(symbolToFetch);

        } catch (err: any) {
            setApiError(err.message);
            setSearchQuery('');
        }
    }, [apiExecute, setApiError]);

    const handleSymbolInputChange = (newValue: string) => {
        setSymbolInput(newValue);

        if (newValue === '') {
            setSearchQuery('');
            setPrice(null);
            setCompanyName('');
            setSharesOwned(0);
            setApiError(null);
        }
    };

    const handleSearch = () => {
        fetchStockData(symbolInput);
    };

    // handler for navigating to the trade page
    const handleTrade = (symbol: string) => {
        navigate("/trade/" + symbol);
    };

    // handler for sort dropdown
    const handleSortChange = (value: string) => {
        setSortBy(value as WatchlistSortKey);
    };

    // handler for removing a stock
    const handleRemove = (symbol: string) => {
        removeFromWatchlist(symbol);
    };

    // check if symbol is in watchlist
    const isInWatchlist = (symbol: string) => {
        return watchlist.some(stock => stock.symbol === symbol);
    };

    // --- render logic ---

    if (loading) {
        return (
            <PageLayout title="Watchlist">
                <CustomSkeleton />
            </PageLayout>
        );
    }

    const showStockInfo = searchQuery && price && !apiError;

    return (
        <PageLayout title="Watchlist">

            {/* section 1: stock search */}
            <PopInOutEffect isVisible={!loading} delay={50}>
                <StockSearchForm
                    symbol={symbolInput}
                    onSymbolChange={handleSymbolInputChange}
                    onSearch={handleSearch}
                    isLoading={isApiLoading}
                />
            </PopInOutEffect>

            <ErrorTile
                description={apiError}
                className="mt-4"
            />

            {/* section 2: stock price display */}
            <PopInOutEffect isVisible={showStockInfo}>
                <StockPriceDisplay
                    symbol={searchQuery}
                    price={price}
                    companyName={companyName}
                    sharesOwned={sharesOwned}
                    isMarketOpen={isMarketOpen}
                    error={apiError}
                    onAddToWatchlist={addToWatchlist}
                    onRemoveFromWatchlist={removeFromWatchlist}
                    isInWatchlist={isInWatchlist(searchQuery)}
                />
            </PopInOutEffect>

            {/* section 3: watchlist display */}
            <WatchlistDisplay
                stocks={sortedWatchlist}
                sortBy={sortBy}
                getSortLabel={getSortLabel}
                onSortChange={handleSortChange}
                hidingSymbols={hidingSymbols}
                onRemove={handleRemove}
                onTrade={handleTrade}
                onAddToWatchlist={addToWatchlist}
            />

        </PageLayout>
    );
}