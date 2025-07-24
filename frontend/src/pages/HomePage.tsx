import { TrendingUp, Wallet, FileText, Eye } from "lucide-react";
import { Button1 } from "@/components/button-1";
import { MarketStatus, useMarketStatus } from "@/components/market-status";
import { PageLayout } from "@/components/page-layout";
import { StockCarousel } from "@/components/stock-carousel";
import { Text2 } from "@/components/text-2";
import { Text3 } from "@/components/text-3";
import { Text5 } from "@/components/text-5";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { Title3 } from "@/components/title-3";
import { formatMoney } from "@/lib/format-money";

export default function HomePage() {
  const isMarketOpen = useMarketStatus();

  // Mock market data
  const marketData = {
    isOpen: isMarketOpen,
    indices: [
      { symbol: "DOW", ticker: "^DJI", value: 34256.78, change: 89.12, percent: 0.26 },
      { symbol: "S&P 500", ticker: "^GSPC", value: 4456.24, change: 12.34, percent: 0.28 },
      { symbol: "NASDAQ", ticker: "^IXIC", value: 13567.89, change: -45.67, percent: -0.34 },
      { symbol: "VIX", ticker: "^VIX", value: 18.45, change: -0.67, percent: -3.5 }
    ]
  };

  const allGainers = [
    { symbol: "NVDA", change: 5.67, price: 875.30 },
    { symbol: "AMD", change: 3.45, price: 142.80 },
    { symbol: "TSLA", change: 2.89, price: 245.60 },
    { symbol: "AAPL", change: 2.45, price: 150.25 },
    { symbol: "MSFT", change: 2.12, price: 378.90 },
    { symbol: "GOOGL", change: 1.89, price: 2750.80 },
    { symbol: "AMZN", change: 1.56, price: 3234.50 },
    { symbol: "NFLX", change: 1.34, price: 456.78 },
    { symbol: "CRM", change: 1.23, price: 234.56 }
  ];


  const allLosers = [
    { symbol: "META", change: -2.34, price: 485.20 },
    { symbol: "NFLX", change: -1.78, price: 567.45 },
    { symbol: "PYPL", change: -1.45, price: 89.32 },
    { symbol: "UBER", change: -1.23, price: 45.67 },
    { symbol: "SNAP", change: -1.12, price: 23.45 },
    { symbol: "ROKU", change: -0.98, price: 78.90 },
    { symbol: "COIN", change: -0.87, price: 156.78 },
    { symbol: "ZOOM", change: -0.76, price: 123.45 },
    { symbol: "PELOTON", change: -0.65, price: 34.56 }
  ];


  return (
    <PageLayout title="Home">
            {/* Quick Actions */}
            <div>
              <Title2>Quick Actions</Title2>
              <div className="flex flex-wrap gap-4">
                <Button1>
                  <TrendingUp />
                  New Trade
                </Button1>
                <Button1>
                  <Wallet />
                  View Portfolio
                </Button1>
                <Button1>
                  <Eye />
                  View Watchlist
                </Button1>
                <Button1>
                  <FileText />
                  View Activity
                </Button1>
              </div>
            </div>

            {/* Market Overview */}
            <div>
              <Title2>Market Overview</Title2>
              <MarketStatus className="mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketData.indices.map((index, i) => (
                  <Tile key={i}>
                    <div className="text-left">
                      <Text3>{index.symbol} ({index.ticker})</Text3>
                      <Text2 className={marketData.isOpen ? "animate-pulse" : ""}>
                        {formatMoney(index.value)}
                      </Text2>
                      <Text5 variant={index.change >= 0 ? "green" : "red"}>
                        {index.change >= 0 ? "+" : ""}{index.change.toFixed(2)} ({index.percent >= 0 ? "+" : ""}{index.percent.toFixed(2)}%)
                      </Text5>
                    </div>
                  </Tile>
                ))}
              </div>
            </div>

            {/* Market Movers */}
            <div>
              <Title2>Market Movers</Title2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Gainers */}
                <div>
                  <Title3>Top Gainers</Title3>
                  <StockCarousel stocks={allGainers} variant="green" />
                </div>

                {/* Top Losers */}
                <div>
                  <Title3>Top Losers</Title3>
                  <StockCarousel stocks={allLosers} variant="red" />
                </div>
              </div>
            </div>
    </PageLayout>
  );
}