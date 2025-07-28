import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button2 } from "@/components/button-2";
import { PageLayout } from "@/components/page-layout";
import { TextField } from "@/components/text-field";
import { Text4 } from "@/components/text-4";
import { Title2 } from "@/components/title-2";
import { CustomDropdown } from "@/components/custom-dropdown";
import { WatchlistTile } from "@/components/watchlist-tile";
import { CustomSkeleton } from "@/components/custom-skeleton";
import { PopInOutEffect } from "@/components/pop-in-out-effect";
import { ErrorTile } from "@/components/error-tile";

interface WatchlistStock {
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

export default function WatchlistPage() {
    // Loading state first
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Other state
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState("symbol");
    const [newSymbol, setNewSymbol] = useState("");
    const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
    const [adding, setAdding] = useState(false);
    const [hidingSymbols, setHidingSymbols] = useState<Set<string>>(new Set());


    useEffect(() => {
        fetchWatchlist();
    }, []);

    async function fetchWatchlist() {
        try {
            setError(null);
            const token = localStorage.getItem("access_token");
            
            if (!token) {
                // No token means user is not logged in - show empty watchlist
                setWatchlist([]);
                setLoading(false);
                return;
            }
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/trading/watchlist`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch watchlist");
            }

            const data = await response.json();
            setWatchlist(data);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
            setError("Failed to load watchlist");
        } finally {
            setLoading(false);
        }
    }

    async function addToWatchlist() {
        if (!newSymbol.trim()) return;
        
        const token = localStorage.getItem("access_token");
        if (!token) {
            setError("Please log in to add stocks to your watchlist");
            return;
        }
        
        try {
            setAdding(true);
            setError(null);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/trading/watchlist`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ symbol: newSymbol.toUpperCase() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to add stock to watchlist");
            }

            // Refresh the watchlist to show updated data
            await fetchWatchlist();
            setNewSymbol("");
        } catch (error: any) {
            console.error("Error adding to watchlist:", error);
            setError(error.message || "Failed to add stock to watchlist");
        } finally {
            setAdding(false);
        }
    }

    async function removeFromWatchlist(symbol: string) {
        const token = localStorage.getItem("access_token");
        if (!token) {
            setError("Please log in to manage your watchlist");
            return;
        }
        
        try {
            setError(null);
            
            // Start hiding animation
            setHidingSymbols(prev => new Set(prev).add(symbol));
            
            // Wait for animation to complete before removing from state
            setTimeout(async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/trading/watchlist/${symbol}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.detail || "Failed to remove stock from watchlist");
                    }

                    // Update local state after API success
                    setWatchlist(watchlist.filter(stock => stock.symbol !== symbol));
                    setHidingSymbols(prev => {
                        const next = new Set(prev);
                        next.delete(symbol);
                        return next;
                    });
                } catch (error: any) {
                    console.error("Error removing from watchlist:", error);
                    setError(error.message || "Failed to remove stock from watchlist");
                    // Reset hiding state on error
                    setHidingSymbols(prev => {
                        const next = new Set(prev);
                        next.delete(symbol);
                        return next;
                    });
                }
            }, 200); // Match animation duration
            
        } catch (error: any) {
            console.error("Error removing from watchlist:", error);
            setError(error.message || "Failed to remove stock from watchlist");
        }
    }

    function handleTrade(symbol: string) {
        navigate(`/trade?symbol=${symbol}`);
    }

    if (loading) {
        return (
            <PageLayout title="Watchlist">
                <CustomSkeleton />
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Watchlist">
                {/* Add Stock Section */}
                <PopInOutEffect isVisible={!loading} delay={50}>
                    <div>
                        <Title2>Add Stock</Title2>
                        <div className="flex gap-4">
                            <TextField
                                placeholder="Enter symbol (e.g., AAPL)"
                                value={newSymbol}
                                uppercase
                                onChange={(e) => {
                                    const value = e.target.value.toUpperCase();
                                    setNewSymbol(value);
                                    if (!value) {
                                        setError(null);
                                    }
                                }}
                                className="flex-1"
                                onKeyDown={(e) => e.key === "Enter" && !adding && addToWatchlist()}
                                disabled={adding}
                            />
                            <Button2 onClick={addToWatchlist} disabled={adding || !newSymbol.trim()}>
                                <Plus />
                                {adding ? "Adding..." : "Add"}
                            </Button2>
                        </div>
                        <ErrorTile description={error} className="mt-4" />
                    </div>
                </PopInOutEffect>

                {/* Watchlist */}
                <PopInOutEffect isVisible={!loading} delay={100}>
                    <div>
                        <Title2>Watchlist</Title2>
                        <div className="flex flex-col mb-4 w-full sm:w-fit">
                            <CustomDropdown
                                label="Sort By"
                                value={sortBy === "symbol" ? "Symbol" : sortBy === "price" ? "Current Price" : sortBy === "change" ? "Change (Daily)" : "Market Capitalization"}
                                options={[
                                    { value: "symbol", label: "Symbol" },
                                    { value: "price", label: "Current Price" },
                                    { value: "change", label: "Change (Daily)" },
                                    { value: "marketcapitalization", label: "Market Capitalization" },
                                ]}
                                onValueChange={setSortBy}
                            />
                        </div>
                        <div className="space-y-4">
                            {watchlist.length === 0 ? (
                                <div className="text-center">
                                    <Text4>Nothing here yet.</Text4>
                                </div>
                            ) : (
                                watchlist
                                    .sort((a, b) => {
                                        switch (sortBy) {
                                            case "symbol":
                                                return a.symbol.localeCompare(b.symbol);
                                            case "price":
                                                return b.current_price - a.current_price;
                                            case "change":
                                                return b.change - a.change;
                                            case "marketcapitalization":
                                                return a.market_cap.localeCompare(b.market_cap);
                                            default:
                                                return 0;
                                        }
                                    })
                                    .map((stock, index) => (
                                        <PopInOutEffect key={stock.symbol} isVisible={!hidingSymbols.has(stock.symbol)} delay={adding ? 0 : 150 + (index * 50)}>
                                            <WatchlistTile 
                                                stock={{
                                                    symbol: stock.symbol,
                                                    name: stock.name,
                                                    current_price: stock.current_price,
                                                    previous_price: stock.previous_close,
                                                    market_capitalization: stock.market_cap
                                                }}
                                                onTrade={handleTrade}
                                                onRemove={removeFromWatchlist}
                                            />
                                        </PopInOutEffect>
                                    ))
                            )}
                        </div>
                    </div>
                </PopInOutEffect>
        </PageLayout>
    );
}