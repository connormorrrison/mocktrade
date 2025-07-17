import { useState } from "react";
import { Calendar22 } from "@/components/date-picker";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { TertiaryTitle } from "@/components/tertiary-title";
import { SecondaryButton } from "@/components/secondary-button";
import { PageLayout } from "@/components/page-layout";

export default function TransactionsPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
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
    <PageLayout title="Transactions">
      <div className="space-y-6">
            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* From Date */}
              <div>
                <Calendar22 label="From" placeholder="Select from date" />
              </div>

              {/* To Date */}
              <div>
                <Calendar22 label="To" placeholder="Select to date" />
              </div>

              {/* Transaction Type Filter */}
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <label className="text-base text-zinc-400 px-1">Filter</label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-between min-w-[120px] w-full sm:w-auto px-4 py-2 !text-lg !text-white !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 h-10 focus:!outline-none focus:!ring-0">
                    {selectedFilter}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedFilter("All")} className="text-base">
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFilter("Buy")} className="text-base">
                      Buy
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFilter("Sell")} className="text-base">
                      Sell
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Export Button */}
              <div className="flex flex-col gap-3 w-full sm:w-auto sm:mt-2 md:mt-0">
                <TertiaryTitle className="px-1">Export</TertiaryTitle>
                <SecondaryButton className="w-full sm:w-auto">
                  Export
                </SecondaryButton>
              </div>
            </div>

            {/* Transactions Table */}
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
      </div>
    </PageLayout>
  );
}