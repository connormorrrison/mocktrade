import { Tile } from "@/components/tile";
import { PrimaryTitle } from "@/components/primary-title";
import { SecondaryTitle } from "@/components/secondary-title";
import { TertiaryTitle } from "@/components/tertiary-title";
import SlideUpAnimation from "@/components/slide-up-animation";
import { TrendingUp, Wallet, FileText } from "lucide-react";
import { PrimaryButton } from "@/components/primary-button";

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
    <div className="w-full" style={{ marginTop: '0px' }}>
      <SlideUpAnimation>
        <div className="p-6">
          <PrimaryTitle>Home</PrimaryTitle>
          
          <div className="space-y-8 mt-6">
            {/* Welcome Section */}
            <Tile className="!py-4">
              <SecondaryTitle>Welcome back, Sam</SecondaryTitle>
              <p className="text-sm text-zinc-400 -mt-1">
                Today is {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </Tile>

            {/* Quick Actions */}
            <div>
              <SecondaryTitle>Quick Actions</SecondaryTitle>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-4">
                <PrimaryButton>
                  <TrendingUp size={20} className="flex-shrink-0" />
                  Trade Now
                </PrimaryButton>
                <PrimaryButton>
                  <Wallet size={20} className="flex-shrink-0" />
                  View Portfolio
                </PrimaryButton>
                <PrimaryButton>
                  <FileText size={20} className="flex-shrink-0" />
                  View Transactions
                </PrimaryButton>
              </div>
            </div>

            {/* Market Overview */}
            <div>
              <SecondaryTitle>Market Overview</SecondaryTitle>
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-3 w-3 rounded-full ${marketData.isOpen ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`text-base ${marketData.isOpen ? "text-green-600" : "text-red-600"}`}>
                  {marketData.isOpen ? "Market Open" : "Market Closed"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketData.indices.map((index, i) => (
                  <Tile key={i}>
                    <div className="text-left">
                      <SecondaryTitle className="mb-2">{index.symbol} ({index.ticker})</SecondaryTitle>
                      <SecondaryTitle>{formatMoney(index.value)}</SecondaryTitle>
                      <p className={`text-base ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div>
                  <TertiaryTitle className="mb-2">Top Gainers</TertiaryTitle>
                  <div className="space-y-2">
                    {marketMovers.gainers.map((stock, i) => (
                      <Tile key={i}>
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-medium">{stock.symbol}</p>
                          <span className="text-base text-green-600 font-medium">+{stock.change.toFixed(2)}%</span>
                        </div>
                      </Tile>
                    ))}
                  </div>
                </div>

                {/* Top Losers */}
                <div>
                  <TertiaryTitle className="mb-2">Top Losers</TertiaryTitle>
                  <div className="space-y-2">
                    {marketMovers.losers.map((stock, i) => (
                      <Tile key={i}>
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-medium">{stock.symbol}</p>
                          <span className="text-base text-red-600 font-medium">{stock.change.toFixed(2)}%</span>
                        </div>
                      </Tile>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SlideUpAnimation>
    </div>
  );
}