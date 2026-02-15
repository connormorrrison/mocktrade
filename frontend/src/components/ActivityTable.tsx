import { Text4 } from "@/components/Text4";
import { Text5 } from "@/components/Text5";
import { formatMoney } from "@/lib/formatMoney";
import { formatShares } from "@/lib/formatShares";
import { CustomSkeleton } from "@/components/CustomSkeleton";

interface Activity {
  id: number
  symbol: string
  action: string
  quantity: number
  price: number
  total_amount: number
  created_at: string
}

interface ActivityTableProps {
  activities: Activity[]
  isLoading?: boolean
}

export const ActivityTable = ({ activities, isLoading = false }: ActivityTableProps) => {

  return (
    // critical: use relative positioning to establish a containing block
    <div className="relative w-full">
      {/* scrollable container */}
      <div className="overflow-x-auto rounded-xl border !border-[oklch(1_0_0_/_10%)]">
        {/* table with explicit minimum width to force scrolling */}
        <table className="w-full min-w-[700px] divide-y divide-zinc-800">
          <thead className="bg-zinc-800/55">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>ID</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Date</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Action</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Symbol</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Quantity</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Price per Share</Text5></th>
              <th className="px-4 py-2 text-left whitespace-nowrap"><Text5>Total</Text5></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-800/55">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-4">
                  <CustomSkeleton />
                </td>
              </tr>
            ) : !activities || activities.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-2">
                  <Text4>Nothing here yet.</Text4>
                </td>
              </tr>
            ) : (
              (activities || []).map(tx => (
                <tr key={tx.id} className="hover:bg-zinc-700">
                  <td className="px-4 py-2 whitespace-nowrap"><Text5>{tx.id}</Text5></td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Text5>{new Date(tx.created_at).toLocaleString()}</Text5>
                  </td>
                  <td className="px-4 whitespace-nowrap">
                    <Text5 className={`inline-block px-2 py-1 rounded-full ${
                      tx.action === 'BUY'
                        ? 'bg-green-900/50 !text-green-300'
                        : 'bg-red-900/50 !text-red-300'
                    }`}>
                      {tx.action}
                    </Text5>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap"><Text5>{tx.symbol}</Text5></td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Text5>{tx.quantity ? formatShares(tx.quantity) : 'N/A'}</Text5>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Text5>{formatMoney(tx.price)}</Text5>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Text5>{formatMoney(tx.total_amount)}</Text5>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}