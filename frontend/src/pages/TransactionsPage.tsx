import { Tile } from "@/components/tile";

export default function TransactionsPage() {
  // Mock data
  const transactions = [
    {
      id: 1,
      symbol: "AAPL",
      transaction_type: "BUY",
      shares: 50,
      price: 145.00,
      total_amount: 7250.00,
      created_at: "2025-01-10T10:30:00Z"
    },
    {
      id: 2,
      symbol: "GOOGL",
      transaction_type: "BUY",
      shares: 25,
      price: 2680.50,
      total_amount: 67012.50,
      created_at: "2025-01-08T14:15:00Z"
    },
    {
      id: 3,
      symbol: "TSLA",
      transaction_type: "SELL",
      shares: 100,
      price: 272.40,
      total_amount: 27240.00,
      created_at: "2025-01-05T09:45:00Z"
    },
    {
      id: 4,
      symbol: "MSFT",
      transaction_type: "BUY",
      shares: 75,
      price: 415.30,
      total_amount: 31147.50,
      created_at: "2025-01-03T11:20:00Z"
    }
  ];

  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  return (
    <div className="w-full" style={{ marginTop: '32px' }}>
      <Tile className="w-full shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-6">
          <h1 className="text-3xl font-normal mb-6">Transactions</h1>
          
          <div className="space-y-6">
            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* From Date */}
              <div className="flex items-center gap-2">
                <label className="text-base text-gray-500">From:</label>
                <input
                  type="date"
                  className="border rounded-md px-2 py-1"
                  defaultValue="2025-01-01"
                />
              </div>

              {/* To Date */}
              <div className="flex items-center gap-2">
                <label className="text-base text-gray-500">To:</label>
                <input
                  type="date"
                  className="border rounded-md px-2 py-1"
                  defaultValue="2025-01-15"
                />
              </div>

              {/* Transaction Type Filter */}
              <div className="flex items-center gap-2">
                <label className="text-base text-gray-500">Filter:</label>
                <select className="border rounded-md px-2 py-1" defaultValue="All">
                  <option value="All">All</option>
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </select>
              </div>

              {/* Export Button */}
              <div className="flex items-center mt-2 md:mt-0">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Export
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border-4 border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-base font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-gray-700">Symbol</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-gray-700">Shares</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-gray-700">Price per Share</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-base text-gray-700">{tx.id}</td>
                      <td className="px-4 py-2 text-base text-gray-700">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-base text-gray-700">
                        {tx.transaction_type}
                      </td>
                      <td className="px-4 py-2 text-base text-gray-700">{tx.symbol}</td>
                      <td className="px-4 py-2 text-base text-gray-700">
                        {tx.shares.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-base text-gray-700">
                        {formatMoney(tx.price)}
                      </td>
                      <td className="px-4 py-2 text-base text-gray-700">
                        {formatMoney(tx.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Tile>
    </div>
  );
}