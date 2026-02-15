import { useState, useEffect, useCallback } from "react";
import type { WatchlistStock } from "@/lib/types/watchlist";

/**
 * this hook manages all watchlist data and api interactions.
 * it handles fetching, adding, and removing stocks, plus
 * all related loading, error, and animation states.
 * uses optimistic updates for removing. Waits for fetch on add.
 */
export const useWatchlist = () => {
    const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adding, setAdding] = useState(false); // keep this for button feedback
    const [hidingSymbols, setHidingSymbols] = useState<Set<string>>(new Set());

    // --- data fetching ---

    // fetch the complete watchlist from the api
    const fetchWatchlist = useCallback(async (showLoading = true) => {
        try {
            setError(null);
            if (showLoading) {
                setLoading(true); // only show full loading on initial fetch
            }
            const token = localStorage.getItem("access_token");

            if (!token) {
                setWatchlist([]);
                if (showLoading) setLoading(false);
                return;
            }

            const response = await fetch(import.meta.env.VITE_API_URL + "/trading/watchlist", {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch watchlist");
            }

            const data = await response.json();
            setWatchlist(data);
        } catch (err) {
            console.error("Error fetching watchlist:", err);
            let errorMessage: string;
            if (err instanceof Error) {
                errorMessage = err.message;
            } else {
                errorMessage = "Failed to load watchlist";
            }
            setError(errorMessage);
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, []);

    // effect to run the initial fetch on mount
    useEffect(() => {
        fetchWatchlist(true); // show loading on first load
    }, [fetchWatchlist]);

    // --- mutations (add/remove) ---

    // add a new stock to the watchlist (waits for api response then refetches)
    const addToWatchlist = useCallback(async (symbol: string) => {
        const trimmedSymbol = symbol.trim().toUpperCase();
        if (!trimmedSymbol) return;

        const token = localStorage.getItem("access_token");
        if (!token) {
            setError("Please log in to add stocks.");
            return;
        }

        // check if already exists to prevent duplicate api calls
        if (watchlist.some(stock => stock.symbol === trimmedSymbol)) {
            // setError(`${trimmedSymbol} is already in your watchlist.`);
            return; // exit silently if already present
        }

        setAdding(true); // start loading indicator for the button
        setError(null);
        
        // no optimistic update here

        try {
            // 1. make the POST api call to add the stock
            const response = await fetch(import.meta.env.VITE_API_URL + "/trading/watchlist", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ symbol: trimmedSymbol })
            });
            
            if (!response.ok) {
                // handle api error from the POST request
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to add stock.");
            }
            
            // 2. success: trigger a background refresh of the entire watchlist
            // this ensures we get the new stock with all its data
            await fetchWatchlist(false); // fetch without showing the main loading spinner

        } catch (err: any) {
            console.error("Error adding to watchlist:", err);
            setError(err.message || "Failed to add stock.");
            // no rollback needed
        } finally {
            setAdding(false); // stop loading indicator for the button
        }
    }, [watchlist, fetchWatchlist]); // depends on watchlist and fetchWatchlist

    // remove a stock from the watchlist
    const removeFromWatchlist = useCallback(async (symbol: string) => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            setError("Please log in to manage your watchlist.");
            return;
        }

        setError(null);

        // 1. mark as hiding (shows "Removing..." in button, starts fade animation)
        setHidingSymbols(prev => new Set(prev).add(symbol));

        const previousWatchlist = [...watchlist];

        try {
            // 2. make api call
            const response = await fetch(import.meta.env.VITE_API_URL + "/trading/watchlist/" + symbol, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to remove stock.");
            }

            // 3. success: remove from list after a brief delay so the user sees the feedback
            setTimeout(() => {
                setWatchlist(prev => prev.filter(stock => stock.symbol !== symbol));
                setHidingSymbols(prev => {
                    const next = new Set(prev);
                    next.delete(symbol);
                    return next;
                });
            }, 600);

        } catch (err: any) {
            console.error("Error removing from watchlist:", err);
            setError(err.message || "Failed to remove stock.");
            setWatchlist(previousWatchlist);
            // remove from hiding set on error
            setHidingSymbols(prev => {
                const next = new Set(prev);
                next.delete(symbol);
                return next;
            });
        }
    }, [watchlist]); 

    // --- return values ---

    return { 
        watchlist, 
        loading, 
        error, 
        adding, 
        hidingSymbols,
        addToWatchlist, 
        removeFromWatchlist,
        setError 
    };
};