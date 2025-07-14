import { Tile } from "@/components/tile";

export default function PortfolioPage() {
  // Mock data to match the original structure
  const cashBalance = 12450.32;
  const totalPortfolioValue = 127450.32;
  const startingPortfolioValue = 100000;
  const cumulativeReturn = ((totalPortfolioValue - startingPortfolioValue) / startingPortfolioValue) * 100;
  const selectedRange = "1mo";

  const positions = [
    {
      symbol: "AAPL",
      shares: 50,
      current_price: 150.25,
      average_price: 145.00,
      previous_price: 148.50,
      created_at: "2024-12-15T00:00:00Z",
      price_at_selected_range: 142.80
    },
    {
      symbol: "GOOGL",
      shares: 25,
      current_price: 2750.80,
      average_price: 2650.00,
      previous_price: 2735.20,
      created_at: "2024-12-10T00:00:00Z",
      price_at_selected_range: 2680.50
    },
    {
      symbol: "TSLA",
      shares: 100,
      current_price: 245.60,
      average_price: 270.00,
      previous_price: 250.30,
      created_at: "2024-12-05T00:00:00Z",
      price_at_selected_range: 272.40
    }
  ];

  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  return (
    <div className="w-full" style={{ marginTop: '96px' }}>
      <Tile className="w-full shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6">
          <h1 className="text-3xl font-normal mb-6">Portfolio</h1>
          
          <div className="space-y-6">
            {/* Account Summary */}
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Account Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500">Total Portfolio Value</p>
                  <p className="text-4xl font-semibold">
                    {formatMoney(totalPortfolioValue)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Cash Balance</p>
                  <p className="text-2xl font-semibold">
                    {formatMoney(cashBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Cumulative Return ({selectedRange})</p>
                  <p className={`text-2xl font-semibold ${cumulativeReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {cumulativeReturn >= 0 ? `+${cumulativeReturn.toFixed(2)}%` : `${cumulativeReturn.toFixed(2)}%`}
                  </p>
                </div>
              </div>
            </div>

            {/* Portfolio History Section */}
            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-medium mr-4">Portfolio History</h3>
                <div className="flex items-center">
                  <label className="mr-2 text-gray-500">Range:</label>
                  <select className="border p-2 rounded-md" value={selectedRange} disabled>
                    <option value="1mo">1 Month</option>
                    <option value="3mo">3 Months</option>
                    <option value="6mo">6 Months</option>
                    <option value="1y">1 Year</option>
                    <option value="max">Max</option>
                  </select>
                </div>
              </div>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Portfolio History Chart (Mock)</p>
              </div>
              <p className="mt-2 text-base text-gray-500">
                Note: Historical data includes only completed trading days.
              </p>
            </div>

            {/* Holdings */}
            <div>
              <h3 className="text-xl font-medium pb-4">Holdings</h3>
              <div className="space-y-6">
                {positions.map((pos) => {
                  const effectivePurchasePrice = pos.price_at_selected_range || pos.average_price;
                  const gainSinceRange = (pos.current_price - effectivePurchasePrice) * pos.shares;
                  const gainPercentSinceRange = effectivePurchasePrice > 0 
                    ? ((pos.current_price - effectivePurchasePrice) / effectivePurchasePrice) * 100 
                    : 0;
                  
                  const dailyPL = (pos.current_price - pos.previous_price) * pos.shares;
                  const dailyPercent = pos.previous_price > 0 
                    ? ((pos.current_price - pos.previous_price) / pos.previous_price) * 100 
                    : 0;
                  
                  const currentValue = pos.shares * pos.current_price;

                  return (
                    <div key={pos.symbol} className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-center">
                        {/* Symbol & Shares */}
                        <div>
                          <p className="text-lg font-semibold ml-2">{pos.symbol}</p>
                          <p className="text-gray-500 ml-2">
                            {pos.shares} {pos.shares === 1 ? "share" : "shares"}
                          </p>
                        </div>

                        {/* Current Price */}
                        <div className="text-right">
                          <p className="text-gray-500">Current Price</p>
                          <p className="font-medium">{formatMoney(pos.current_price)}</p>
                        </div>

                        {/* Current Value */}
                        <div className="text-right">
                          <p className="text-gray-500">Current Value</p>
                          <p className="font-medium">{formatMoney(currentValue)}</p>
                        </div>

                        {/* Gain */}
                        <div className="text-right">
                          <p className="text-gray-500">Gain ({selectedRange})</p>
                          <p className={`font-medium ${gainSinceRange >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {gainSinceRange >= 0 ? "+" : ""}{formatMoney(gainSinceRange)}{" "}
                            <span className={`font-medium ${gainSinceRange >= 0 ? "text-green-600" : "text-red-600"}`}>
                              ({gainPercentSinceRange >= 0 ? "+" : ""}{gainPercentSinceRange.toFixed(2)}%)
                            </span>
                          </p>
                        </div>

                        {/* Daily P/L */}
                        <div className="text-right">
                          <p className="text-gray-500 mr-2">Daily P/L</p>
                          <p className={`font-medium mr-2 ${dailyPL >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {dailyPL >= 0 ? "+" : ""}{formatMoney(dailyPL)}{" "}
                            <span className={`font-medium ${dailyPL >= 0 ? "text-green-600" : "text-red-600"}`}>
                              ({dailyPercent >= 0 ? "+" : ""}{dailyPercent.toFixed(2)}%)
                            </span>
                          </p>
                        </div>

                        {/* Trade Button */}
                        <div className="text-right">
                          <button className="px-6 py-2 mr-2 bg-black text-white text-base hover:bg-gray-800">
                            Trade
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Tile>
    </div>
  );
}