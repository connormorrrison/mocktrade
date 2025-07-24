import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";
import { PortfolioChart } from "@/components/portfolio-chart";
import { Tile } from "@/components/tile";
import { Title2 } from "@/components/title-2";
import { CustomDropdown } from "@/components/custom-dropdown";
import { PortfolioTile } from "@/components/portfolio-tile";
import { UserProfileTiles } from "@/components/user-profile-tiles";
import { formatMoney } from "@/lib/format-money";

export default function PortfolioPage() {
  const [selectedFilter, setSelectedFilter] = useState("1mo");
  const [sortBy, setSortBy] = useState("symbol");
  const [portfolioData, setPortfolioData] = useState(null);
  const [transactionCount, setTransactionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/portfolio/summary', {
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
      // Fallback to mock data for development
      setPortfolioData({
        cash_balance: 12450.32,
        total_value: 127450.32,
        starting_value: 100000,
        return_percentage: 27.45,
        positions: [
          {
            symbol: "AAPL",
            shares: 50,
            current_price: 150.25,
            average_price: 145.0,
            current_value: 7512.5,
            unrealized_gain_loss: 262.5,
            unrealized_gain_loss_percent: 3.62
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/trading/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactionCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching transaction count:', error);
      // Keep default value of 0
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    fetchTransactionCount();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Portfolio">
        <div>Loading portfolio data...</div>
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
        <div className="space-y-2">
          <Title2>Overview</Title2>
          <UserProfileTiles
            totalValue={portfolioData?.total_value || 0}
            cashBalance={portfolioData?.cash_balance || 0}
            transactionCount={transactionCount}
          />
        </div>

        {/* Portfolio History Section */}
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
            <PortfolioChart />
          </Tile>
        </div>

        {/* Positions */}
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
            {portfolioData?.positions
              ?.sort((a, b) => {
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
                    const aPercent = portfolioData.total_value > 0 ? (a.current_value / portfolioData.total_value) * 100 : 0;
                    const bPercent = portfolioData.total_value > 0 ? (b.current_value / portfolioData.total_value) * 100 : 0;
                    return bPercent - aPercent;
                  default:
                    return 0;
                }
              })
              .map((pos) => (
                <PortfolioTile
                  key={pos.symbol}
                  position={{
                    symbol: pos.symbol,
                    shares: pos.shares,
                    current_price: pos.current_price,
                    average_price: pos.average_price,
                    previous_price: pos.current_price, // TODO: Get previous price from API
                    company_name: pos.symbol // TODO: Get company name from API
                  }}
                  totalPortfolioValue={portfolioData.total_value}
                />
              )) || []}
          </div>
        </div>
    </PageLayout>
  );
}