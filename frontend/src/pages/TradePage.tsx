import { Tile } from "@/components/tile";

export default function TradePage() {
  // Mock data
  const symbol = "AAPL";
  const price = 150.25;
  const sharesOwned = 50;
  const availableCash = 12450.32;
  const quantity = "10";

  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  return (
    <div className="w-full" style={{ marginTop: '0px' }}>
      <Tile className="w-full shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6">
          <h2 className="text-4xl font-normal mb-6">Trade</h2>
          
          <div className="space-y-6">
            {/* Search Section */}
            <div>
              <label className="block text-base text-gray-500 mb-2">Search</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter symbol (e.g., AAPL)"
                  value={symbol}
                  readOnly
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Search
                </button>
              </div>
            </div>

            {/* Stock Price Display */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow-md border-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-base text-gray-500 ml-2">
                    Market Price for {symbol}
                  </p>
                  <p className="text-2xl font-semibold ml-2">
                    {formatMoney(price)}
                  </p>
                  <p className="text-base text-gray-500 ml-2">
                    You own {sharesOwned.toLocaleString()} shares of {symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base text-gray-500 mr-4">Status</p>
                  <div className="flex items-center justify-end mr-4">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse mr-2" />
                    <p className="text-green-600 font-medium animate-pulse">
                      Live
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div>
              <label className="block text-base text-gray-500 mb-2">Action</label>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Buy
                </button>
                <button className="flex-1 px-4 py-2 bg-white text-blue-600 border border-gray-200 rounded-md hover:bg-blue-600 hover:text-white">
                  Sell
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-base text-gray-500 mb-2">Quantity</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-lg"
                value={quantity}
                readOnly
              />
            </div>

            {/* Order Summary */}
            <div className="space-y-1 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Order</span>
                <span className="font-medium">
                  Buy {Number(quantity).toLocaleString()} shares at Market
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Price per Share</span>
                <span className="font-medium">{formatMoney(price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Cash Available</span>
                <span className="font-medium">{formatMoney(availableCash)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Value</span>
                <span className="text-xl font-semibold">
                  {formatMoney(price * Number(quantity))}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mt-2">
              Submit Order
            </button>
          </div>
        </div>
      </Tile>
    </div>
  );
}