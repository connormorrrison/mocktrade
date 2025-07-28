import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/page-layout";
import { PortfolioChart } from "@/components/portfolio-chart";
import { Tile } from "@/components/tile";
import { Text4 } from "@/components/text-4";
import { Title2 } from "@/components/title-2";
import { CustomDropdown } from "@/components/custom-dropdown";
import { PositionTile } from "@/components/position-tile";
import { UserProfileTiles } from "@/components/user-profile-tiles";
import { CustomSkeleton } from "@/components/custom-skeleton";
import { PopInOutEffect } from "@/components/pop-in-out-effect";

interface Position {
  symbol: string;
  company_name?: string;
  shares: number;
  current_price: number;
  average_price: number;
  current_value: number;
}

interface PortfolioData {
  portfolio_value: number;
  positions_value: number;
  cash_balance: number;
  positions_count: number;
  positions: Position[];
}

export default function PortfolioPage() {
  // Loading state first
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Other state
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("1mo");
  const [sortBy, setSortBy] = useState("symbol");
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [activityCount, setActivityCount] = useState(0);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        // No token means user is not logged in - show empty portfolio
        setPortfolioData({
          portfolio_value: 0,
          positions_value: 0,
          cash_balance: 0,
          positions_count: 0,
          positions: []
        });
        setActivityCount(0);
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/portfolio/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolioData(data);
        setError("");
      } else {
        throw new Error('Failed to fetch portfolio data');
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityCount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/trading/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivityCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching activity count:', error);
      // Keep default value of 0
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    fetchActivityCount();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Portfolio">
        <CustomSkeleton />
      </PageLayout>
    );
  }

  if (error && !portfolioData) {
    return (
      <PageLayout title="Portfolio">
        <div>Error: {error}</div>
      </PageLayout>
    );
  }




  return (
    <PageLayout title="Portfolio">
        <PopInOutEffect isVisible={!loading} delay={50}>
          <div className="space-y-2">
            <Title2>Overview</Title2>
            <UserProfileTiles
              totalValue={portfolioData?.portfolio_value || 0}
              positionsValue={portfolioData?.positions_value || 0}
              cashBalance={portfolioData?.cash_balance || 0}
              activityCount={activityCount}
            />
          </div>
        </PopInOutEffect>

        {/* Portfolio History Section */}
        <PopInOutEffect isVisible={!loading} delay={100}>
          <div>
            <Title2>Performance</Title2>
            <div className="flex flex-col mb-4 w-full sm:w-fit">
              <CustomDropdown
                label="Filter"
                value={selectedFilter === "1mo" ? "1 Month" : selectedFilter === "3mo" ? "3 Months" : selectedFilter === "6mo" ? "6 Months" : selectedFilter === "1y" ? "1 Year" : "Max"}
                options={[
                  { value: "1mo", label: "1 Month" },
                  { value: "3mo", label: "3 Months" },
                  { value: "6mo", label: "6 Months" },
                  { value: "1y", label: "1 Year" },
                  { value: "max", label: "Max" },
                ]}
                onValueChange={setSelectedFilter}
              />
            </div>
            <Tile>
              <PortfolioChart timeframe={selectedFilter} />
            </Tile>
          </div>
        </PopInOutEffect>

        {/* Positions */}
        <PopInOutEffect isVisible={!loading} delay={150}>
          <div>
            <Title2>Positions</Title2>
            <div className="flex flex-col mb-4 w-full sm:w-fit">
              <CustomDropdown
                label="Sort By"
                value={sortBy === "symbol" ? "Symbol" : sortBy === "quantity" ? "Quantity" : sortBy === "avgPrice" ? "Average Price" : sortBy === "currentPrice" ? "Current Price" : sortBy === "marketValue" ? "Market Value" : "% of Portfolio"}
                options={[
                  { value: "symbol", label: "Symbol" },
                  { value: "quantity", label: "Quantity" },
                  { value: "avgPrice", label: "Average Price" },
                  { value: "currentPrice", label: "Current Price" },
                  { value: "marketValue", label: "Market Value" },
                  { value: "portfolio", label: "% of Portfolio" },
                ]}
                onValueChange={setSortBy}
              />
            </div>
            <div className="space-y-4">
              {!portfolioData?.positions || portfolioData.positions.length === 0 ? (
                <div className="text-center">
                  <Text4>Nothing here yet.</Text4>
                </div>
              ) : (
                portfolioData.positions
                  .sort((a, b) => {
                    switch (sortBy) {
                      case "symbol":
                        return a.symbol.localeCompare(b.symbol);
                      case "quantity":
                        return b.shares - a.shares;
                      case "avgPrice":
                        return b.average_price - a.average_price;
                      case "currentPrice":
                        return b.current_price - a.current_price;
                      case "marketValue":
                        return b.current_value - a.current_value;
                      case "portfolio":
                        const aPercent = portfolioData.portfolio_value > 0 ? (a.current_value / portfolioData.portfolio_value) * 100 : 0;
                        const bPercent = portfolioData.portfolio_value > 0 ? (b.current_value / portfolioData.portfolio_value) * 100 : 0;
                        return bPercent - aPercent;
                      default:
                        return 0;
                    }
                  })
                  .map((pos, index) => (
                    <PopInOutEffect key={pos.symbol} isVisible={!loading} delay={200 + (index * 50)}>
                      <PositionTile
                        position={{
                          symbol: pos.symbol,
                          shares: pos.shares,
                          current_price: pos.current_price,
                          average_price: pos.average_price,
                          previous_price: pos.current_price, // TODO: Get previous price from API
                          company_name: pos.company_name || pos.symbol
                        }}
                        totalPortfolioValue={portfolioData.portfolio_value}
                        onTrade={(symbol) => navigate(`/trade/${symbol}`)}
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