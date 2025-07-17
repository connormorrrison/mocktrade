import React from "react"

interface Transaction {
  id: number
  symbol: string
  transaction_type: string
  shares: number
  price: number
  total_amount: number
  created_at: string
}

interface TransactionsTableProps {
  transactions: Transaction[]
}

export const TransactionsTable = ({ transactions }: TransactionsTableProps) => {
  function formatMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  return (
    <div className="w-full max-w-full overflow-x-auto overflow-y-hidden rounded-xl border !border-[oklch(1_0_0_/_10%)]">
      <table className="w-full divide-y divide-zinc-800">
        <thead className="bg-input/30">
          <tr>
            <th className="px-4 py-2 text-left text-base font-semibold text-white whitespace-nowrap">ID</th>
            <th className="px-4 py-2 text-left text-base font-semibold text-white whitespace-nowrap">Date</th>
            <th className="px-4 py-2 text-left text-base font-semibold text-white whitespace-nowrap">Type</th>
            <th className="px-4 py-2 text-left text-base font-semibold text-white whitespace-nowrap">Symbol</th>
            <th className="px-4 py-2 text-left text-base font-semibold text-white whitespace-nowrap">Shares</th>
            <th className="px-4 py-2 text-left text-base font-semibold text-white whitespace-nowrap">Price per Share</th>
            <th className="px-4 py-2 text-left text-base font-semibold text-white whitespace-nowrap">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-input/30">
          {transactions.map(tx => (
            <tr key={tx.id} className="hover:bg-zinc-700">
              <td className="px-4 py-2 text-base text-white whitespace-nowrap">{tx.id}</td>
              <td className="px-4 py-2 text-base text-white whitespace-nowrap">
                {new Date(tx.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-base text-white whitespace-nowrap">
                <span className={`px-2 py-1 text-base rounded-full ${tx.transaction_type === 'BUY' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                  {tx.transaction_type}
                </span>
              </td>
              <td className="px-4 py-2 text-base text-white whitespace-nowrap">{tx.symbol}</td>
              <td className="px-4 py-2 text-base text-white whitespace-nowrap">
                {tx.shares.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-base text-white whitespace-nowrap">
                {formatMoney(tx.price)}
              </td>
              <td className="px-4 py-2 text-base text-white whitespace-nowrap">
                {formatMoney(tx.total_amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}