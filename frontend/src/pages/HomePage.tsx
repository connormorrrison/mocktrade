import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { Text3 } from "@/components/text-3";
import { Title3 } from "@/components/title-3";
import { Text4 } from "@/components/text-4";
import { Text2 } from "@/components/text-2";
import { PageLayout } from "@/components/page-layout";
import { MarketStatus } from "@/components/market-status";
import { TrendingUp, Wallet, FileText } from "lucide-react";
import { Button1 } from "@/components/button-1";

export default function HomePage() {
  // Mock market data
  const marketData = {
    isOpen: false,
    indices: [
      { symbol: "DOW", ticker: "^DJI", value: 34256.78, change: 89.12, percent: 0.26 },
      { symbol: "S&P 500", ticker: "^GSPC", value: 4456.24, change: 12.34, percent: 0.28 },
      { symbol: "NASDAQ", ticker: "^IXIC", value: 13567.89, change: -45.67, percent: -0.34 },
      { symbol: "VIX", ticker: "^VIX", value: 18.45, change: -0.67, percent: -3.5 }
    ]
  };

  const marketMovers = {
    gainers: [
      { symbol: "NVDA", change: 5.67 },
      { symbol: "AMD", change: 3.45 },
      { symbol: "TSLA", change: 2.89 }
    ],
    losers: [
      { symbol: "META", change: -2.34 },
      { symbol: "NFLX", change: -1.78 },
      { symbol: "PYPL", change: -1.45 }
    ]
  };

  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  return (
    <PageLayout title="Home">
      <div className="space-y-6">
            {/* Welcome Section */}
            <Tile>
              <Text3>Welcome back, Sam</Text3>
              <Text4>
                Today is {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text4>
            </Tile>

            {/* Quick Actions */}
            <div>
              <Title2>Quick Actions</Title2>
              <div className="flex flex-wrap gap-4">
                <Button1>
                  <TrendingUp />
                  Trade Now
                </Button1>
                <Button1>
                  <Wallet />
                  View Portfolio
                </Button1>
                <Button1>
                  <FileText />
                  View Transactions
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
                      <Text2>{formatMoney(index.value)}</Text2>
                      <Text4 className={`${index.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {index.change >= 0 ? "+" : ""}{index.change.toFixed(2)} ({index.percent >= 0 ? "+" : ""}{index.percent.toFixed(2)}%)
                      </Text4>
                    </div>
                  </Tile>
                ))}
              </div>
            </div>

            {/* Market Movers */}
            <div>
              <Title2>Market Movers</Title2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div>
                  <Title3>Top Gainers</Title3>
                  <div className="space-y-2">
                    {marketMovers.gainers.map((stock, i) => (
                      <Tile key={i}>
                        <div className="flex justify-between items-center">
                          <Text3>{stock.symbol}</Text3>
                          <span className="text-base text-green-600 font-medium">+{stock.change.toFixed(2)}%</span>
                        </div>
                      </Tile>
                    ))}
                  </div>
                </div>

                {/* Top Losers */}
                <div>
                  <Title3>Top Losers</Title3>
                  <div className="space-y-2">
                    {marketMovers.losers.map((stock, i) => (
                      <Tile key={i}>
                        <div className="flex justify-between items-center">
                          <Text3>{stock.symbol}</Text3>
                          <span className="text-base text-red-600 font-medium">{stock.change.toFixed(2)}%</span>
                        </div>
                      </Tile>
                    ))}
                  </div>
                </div>
              </div>
            </div>
      </div>
    </PageLayout>
  );
}