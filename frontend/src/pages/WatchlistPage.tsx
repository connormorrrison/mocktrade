import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button1 } from "@/components/button-1";
import { PageLayout } from "@/components/page-layout";
import { TextField } from "@/components/text-field";
import { Title2 } from "@/components/title-2";
import { CustomDropdown } from "@/components/custom-dropdown";
import { WatchlistTile } from "@/components/watchlist-tile";

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
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState("symbol");
    const [newSymbol, setNewSymbol] = useState("");
    const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = "http://localhost:8000/api/v1";

    useEffect(() => {
        fetchWatchlist();
    }, []);

    async function fetchWatchlist() {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("token");
            
            const response = await fetch(`${API_BASE_URL}/watchlist/`, {
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
        
        try {
            setAdding(true);
            setError(null);
            const token = localStorage.getItem("token");
            
            const response = await fetch(`${API_BASE_URL}/watchlist/`, {
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
        try {
            setError(null);
            const token = localStorage.getItem("token");
            
            const response = await fetch(`${API_BASE_URL}/watchlist/${symbol}`, {
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

            // Update local state immediately for better UX
            setWatchlist(watchlist.filter(stock => stock.symbol !== symbol));
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
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading watchlist...</div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Watchlist">
                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                        {error}
                    </div>
                )}
                
                {/* Add Stock Section */}
                <div>
                    <Title2>Add Stock</Title2>
                    <div className="flex gap-4">
                        <TextField
                            placeholder="Enter symbol (e.g., AAPL)"
                            value={newSymbol}
                            onChange={(e) => setNewSymbol(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => e.key === "Enter" && !adding && addToWatchlist()}
                            disabled={adding}
                        />
                        <Button1 onClick={addToWatchlist} disabled={adding || !newSymbol.trim()}>
                            <Plus />
                            {adding ? "Adding..." : "Add"}
                        </Button1>
                    </div>
                </div>

                {/* Watchlist */}
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
                        {watchlist
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
                                .map((stock) => (
                                    <WatchlistTile 
                                        key={stock.symbol}
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
                                ))
                        }
                    </div>
                </div>
        </PageLayout>
    );
}