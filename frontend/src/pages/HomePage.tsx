import { Tile } from "@/components/tile";
import { PrimaryTitle } from "@/components/primary-title";
import { SecondaryTitle } from "@/components/secondary-title";
import { TertiaryTitle } from "@/components/tertiary-title";
import { SecondaryButton } from "@/components/secondary-button";
import SlideUpAnimation from "@/components/slide-up-animation";
import { TrendingUp, Wallet, Receipt } from "lucide-react";

export default function HomePage() {
  // Mock market data
  const marketData = {
    isOpen: false,
    indices: [
      { symbol: "DOW", value: 34256.78, change: 89.12, percent: 0.26 },
      { symbol: "S&P 500", value: 4456.24, change: 12.34, percent: 0.28 },
      { symbol: "NASDAQ", value: 13567.89, change: -45.67, percent: -0.34 },
      { symbol: "VIX", value: 18.45, change: -0.67, percent: -3.5 }
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
    <div className="w-full" style={{ marginTop: '0px' }}>
      <SlideUpAnimation>
        <Tile className="w-full shadow-lg hover:shadow-xl transition-shadow">
          <div className="p-6">
            <PrimaryTitle>Home</PrimaryTitle>
            
            <div className="space-y-8 mt-6">
              {/* Welcome Section */}
              <div>
                <SecondaryTitle>Welcome back, Sam</SecondaryTitle>
              </div>

              {/* Market Overview */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <SecondaryTitle>Market Overview</SecondaryTitle>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${marketData.isOpen ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`text-sm ${marketData.isOpen ? "text-green-600" : "text-red-600"}`}>
                      {marketData.isOpen ? "Market Open" : "Market Closed"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketData.indices.map((index, i) => (
                    <Tile key={i}>
                      <div className="text-center">
                        <TertiaryTitle className="mb-2">{index.symbol}</TertiaryTitle>
                        <p className="text-xl font-semibold">{formatMoney(index.value)}</p>
                        <p className={`text-sm ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {index.change >= 0 ? "+" : ""}{index.change.toFixed(2)} ({index.percent >= 0 ? "+" : ""}{index.percent.toFixed(2)}%)
                        </p>
                      </div>
                    </Tile>
                  ))}
                </div>
              </div>

              {/* Market Movers */}
              <div>
                <SecondaryTitle>Market Movers</SecondaryTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {/* Top Gainers */}
                  <div>
                    <TertiaryTitle className="mb-3">Top Gainers</TertiaryTitle>
                    <div className="space-y-2">
                      {marketMovers.gainers.map((stock, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg">
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-green-600 font-medium">+{stock.change.toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Losers */}
                  <div>
                    <TertiaryTitle className="mb-3">Top Losers</TertiaryTitle>
                    <div className="space-y-2">
                      {marketMovers.losers.map((stock, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-zinc-800/30 rounded-lg">
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-red-600 font-medium">{stock.change.toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <SecondaryTitle>Quick Actions</SecondaryTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <SecondaryButton>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trade Now
                  </SecondaryButton>
                  <SecondaryButton>
                    <Wallet className="w-4 h-4 mr-2" />
                    View Portfolio
                  </SecondaryButton>
                  <SecondaryButton>
                    <Receipt className="w-4 h-4 mr-2" />
                    View Transactions
                  </SecondaryButton>
                </div>
              </div>
            </div>
          </div>
        </Tile>
      </SlideUpAnimation>
    </div>
  );
}