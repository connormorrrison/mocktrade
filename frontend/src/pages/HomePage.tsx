import { TrendingUp, Wallet, FileText, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

interface MarketIndex {
  symbol: string;
  ticker: string;
  value: number;
  change: number;
  percent: number;
}

interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

interface MarketData {
  isOpen: boolean;
  indices: MarketIndex[];
}

interface MarketMoversData {
  gainers: MarketMover[];
  losers: MarketMover[];
}

export default function HomePage() {
  const isMarketOpen = useMarketStatus();
  const navigate = useNavigate();
  
  const [marketData, setMarketData] = useState<MarketData>({
    isOpen: isMarketOpen,
    indices: []
  });
  const [marketMovers, setMarketMovers] = useState<MarketMoversData>({
    gainers: [],
    losers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch market indices and movers in parallel
      const [indicesResponse, moversResponse] = await Promise.all([
        fetch('http://localhost:8000/api/v1/stocks/market/indices', { headers }),
        fetch('http://localhost:8000/api/v1/stocks/market/movers', { headers })
      ]);

      if (!indicesResponse.ok || !moversResponse.ok) {
        throw new Error('Failed to fetch market data');
      }

      const indicesData = await indicesResponse.json();
      const moversData = await moversResponse.json();

      setMarketData({
        isOpen: isMarketOpen,
        indices: indicesData.indices || []
      });

      setMarketMovers({
        gainers: moversData.gainers || [],
        losers: moversData.losers || []
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isMarketOpen]);

  // Transform market movers data to match the expected format for StockCarousel
  const transformedGainers = marketMovers.gainers.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    change: stock.change,
    change_percent: stock.change_percent,
    price: stock.price
  }));

  const transformedLosers = marketMovers.losers.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    change: stock.change,
    change_percent: stock.change_percent,
    price: stock.price
  }));

  if (loading) {
    return (
      <PageLayout title="Home">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <Text3>Loading market data...</Text3>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Home">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Text3 className="text-red-500 mb-4">Error: {error}</Text3>
            <Button1 onClick={fetchMarketData}>Retry</Button1>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Home">
            {/* Quick Actions */}
            <div>
              <Title2>Quick Actions</Title2>
              <div className="flex flex-wrap gap-4">
                <Button1 onClick={() => navigate('/trade')}>
                  <TrendingUp />
                  New Trade
                </Button1>
                <Button1 onClick={() => navigate('/portfolio')}>
                  <Wallet />
                  View Portfolio
                </Button1>
                <Button1 onClick={() => navigate('/watchlist')}>
                  <Eye />
                  View Watchlist
                </Button1>
                <Button1 onClick={() => navigate('/activity')}>
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
                        <div className="flex items-center gap-1">
                          {index.change >= 0 ? (
                            <ArrowUp className="h-5 w-5" />
                          ) : (
                            <ArrowDown className="h-5 w-5" />
                          )}
                          <span>
                            {index.change >= 0 ? "+" : ""}{index.change.toFixed(2)} ({index.percent >= 0 ? "+" : ""}{index.percent.toFixed(2)}%) Today
                          </span>
                        </div>
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
                  {transformedGainers.length > 0 ? (
                    <StockCarousel stocks={transformedGainers} variant="green" />
                  ) : (
                    <div className="text-center py-8">
                      <Text3>No gainers data available</Text3>
                    </div>
                  )}
                </div>

                {/* Top Losers */}
                <div>
                  <Title3>Top Losers</Title3>
                  {transformedLosers.length > 0 ? (
                    <StockCarousel stocks={transformedLosers} variant="red" />
                  ) : (
                    <div className="text-center py-8">
                      <Text3>No losers data available</Text3>
                    </div>
                  )}
                </div>
              </div>
            </div>
    </PageLayout>
  );
}