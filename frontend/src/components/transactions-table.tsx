import { Text5 } from "@/components/text-5";

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
    // CRITICAL: Use relative positioning to establish a containing block
    <div className="relative w-full">
      {/* Scrollable container */}
      <div className="overflow-x-auto rounded-xl border !border-[oklch(1_0_0_/_10%)]">
        {/* Table with explicit minimum width to force scrolling */}
        <table className="w-full min-w-[700px] divide-y divide-zinc-800">
          <thead className="bg-input/30">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>ID</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Date</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Type</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Symbol</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Shares</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Price per Share</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Total</Text5></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-input/30">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-zinc-700">
                <td className="px-4 py-2 whitespace-nowrap"><Text5>{tx.id}</Text5></td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Text5>{new Date(tx.created_at).toLocaleString()}</Text5>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Text5 className={`inline-block px-2 py-1 rounded-full ${
                    tx.transaction_type === 'BUY'
                      ? 'bg-green-900/50 !text-green-300'
                      : 'bg-red-900/50 !text-red-300'
                  }`}>
                    {tx.transaction_type}
                  </Text5>
                </td>
                <td className="px-4 py-2 whitespace-nowrap"><Text5>{tx.symbol}</Text5></td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Text5>{tx.shares.toLocaleString()}</Text5>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Text5>{formatMoney(tx.price)}</Text5>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <Text5>{formatMoney(tx.total_amount)}</Text5>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}