import { useState } from "react";
import { Plus } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { PageLayout } from "@/components/page-layout";
import { TextField } from "@/components/text-field";
import { Title2 } from "@/components/title-2";
import { CustomDropdown } from "@/components/custom-dropdown";
import { WatchlistTile } from "@/components/watchlist-tile";

export default function WatchlistPage() {
    const [sortBy, setSortBy] = useState("symbol");
    const [newSymbol, setNewSymbol] = useState("");

    // Mock watchlist data
    const [watchlist, setWatchlist] = useState([
        {
            symbol: "NVDA",
            name: "NVIDIA Corporation",
            current_price: 875.30,
            previous_price: 862.15,
            market_capitalization: "2.15T",
        },
        {
            symbol: "AMD",
            name: "Advanced Micro Devices",
            current_price: 142.80,
            previous_price: 138.90,
            market_capitalization: "230.5B",
        },
        {
            symbol: "META",
            name: "Meta Platforms Inc",
            current_price: 485.20,
            previous_price: 492.80,
            market_capitalization: "1.23T",
        },
    ]);


    function addToWatchlist() {
        if (newSymbol.trim()) {
            // In a real app, you'd fetch the stock data
            const newStock = {
                symbol: newSymbol.toUpperCase(),
                name: `${newSymbol.toUpperCase()} Company`,
                current_price: 100.00,
                previous_price: 98.50,
                market_capitalization: "50.0B",
            };
            setWatchlist([...watchlist, newStock]);
            setNewSymbol("");
        }
    }

    function removeFromWatchlist(symbol: string) {
        setWatchlist(watchlist.filter(stock => stock.symbol !== symbol));
    }

    return (
        <PageLayout title="Watchlist">
                {/* Add Stock Section */}
                <div>
                    <Title2>Add Stock</Title2>
                    <div className="flex gap-4">
                        <TextField
                            placeholder="Enter symbol (e.g., AAPL)"
                            value={newSymbol}
                            onChange={(e) => setNewSymbol(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
                        />
                        <Button1 onClick={addToWatchlist}>
                            <Plus />
                            Add
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
                                        const aChange = a.current_price - a.previous_price;
                                        const bChange = b.current_price - b.previous_price;
                                        return bChange - aChange;
                                    case "marketcapitalization":
                                        return a.market_capitalization.localeCompare(b.market_capitalization);
                                    default:
                                        return 0;
                                }
                            })
                            .map((stock) => (
                                <WatchlistTile 
                                    key={stock.symbol}
                                    stock={stock}
                                    onRemove={removeFromWatchlist}
                                />
                            ))}
                    </div>
                </div>
        </PageLayout>
    );
}