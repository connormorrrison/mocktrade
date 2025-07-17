import { useState } from "react";
import { ChevronDown, Plus, X, TrendingUp } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";
import { PageLayout } from "@/components/page-layout";
import { Text2 } from "@/components/text-2";
import { Text4 } from "@/components/text-4";
import { TextField } from "@/components/text-field";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { Title3 } from "@/components/title-3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      market_cap: "2.15T",
    },
    {
      symbol: "AMD",
      name: "Advanced Micro Devices",
      current_price: 142.80,
      previous_price: 138.90,
      market_cap: "230.5B",
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc",
      current_price: 485.20,
      previous_price: 492.80,
      market_cap: "1.23T",
    },
  ]);

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  function addToWatchlist() {
    if (newSymbol.trim()) {
      // In a real app, you'd fetch the stock data
      const newStock = {
        symbol: newSymbol.toUpperCase(),
        name: `${newSymbol.toUpperCase()} Company`,
        current_price: 100.00,
        previous_price: 98.50,
        market_cap: "50.0B",
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
      <div className="space-y-6">
        {/* Add Stock Section */}
        <div>
          <Title2>Add Stock</Title2>
          <div className="flex gap-4 mt-4">
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
          <Title2 className="pb-2">Watchlist</Title2>
          <div className="flex flex-col mb-4 w-full sm:w-fit">
            <Title3 className="px-1">Sort By</Title3>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-between px-4 py-2 !text-lg !text-white !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 h-10 focus:!outline-none focus:!ring-0">
                {sortBy === "symbol" && "Symbol"}
                {sortBy === "price" && "Current Price"}
                {sortBy === "change" && "Daily Change"}
                {sortBy === "marketcap" && "Market Cap"}
                <ChevronDown className="h-5 w-5 ml-2" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => setSortBy("symbol")}
                  className="text-base"
                >
                  Symbol
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("price")}
                  className="text-base"
                >
                  Current Price
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("change")}
                  className="text-base"
                >
                  Daily Change
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("marketcap")}
                  className="text-base"
                >
                  Market Cap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  case "marketcap":
                    return a.market_cap.localeCompare(b.market_cap);
                  default:
                    return 0;
                }
              })
              .map((stock) => {
                const dailyChange = stock.current_price - stock.previous_price;
                const dailyPercent = stock.previous_price > 0 
                  ? ((stock.current_price - stock.previous_price) / stock.previous_price) * 100 
                  : 0;

                return (
                  <Tile key={stock.symbol}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="lg:text-left lg:ml-2">
                        <p className="text-lg font-medium">{stock.symbol}</p>
                        <Text4>{stock.name}</Text4>
                      </div>

                      <div>
                        <Text4>Current Price</Text4>
                        <Text2>{formatMoney(stock.current_price)}</Text2>
                      </div>

                      <div>
                        <Text4>Daily Change</Text4>
                        <p className={`text-xl font-semibold ${dailyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {dailyChange >= 0 ? "+" : ""}{formatMoney(dailyChange)}{" "}
                          <span className={`font-semibold ${dailyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ({dailyPercent >= 0 ? "+" : ""}{dailyPercent.toFixed(2)}%)
                          </span>
                        </p>
                      </div>

                      <div>
                        <Text4>Market Cap</Text4>
                        <p className="font-medium">{stock.market_cap}</p>
                      </div>

                      <div className="flex gap-4 lg:mr-2">
                        <Button1>
                          <TrendingUp />
                          Trade
                        </Button1>
                        <Button2 onClick={() => removeFromWatchlist(stock.symbol)}>
                          <X />
                          Remove
                        </Button2>
                      </div>
                    </div>
                  </Tile>
                );
              })}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}