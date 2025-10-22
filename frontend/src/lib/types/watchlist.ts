// defines the structure of a stock in the watchlist
export interface WatchlistStock {
    id: number;
    symbol: string;
    name: string;
    current_price: number;
    previous_close: number;
    change: number;
    change_percent: number;
    market_cap: string;
    created_at: string;
}
