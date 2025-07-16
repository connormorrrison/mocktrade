import { useState } from "react";
import { Calendar22 } from "@/components/ui/date-picker";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { PrimaryTitle } from "@/components/primary-title";
import { SecondaryButton } from "@/components/secondary-button";
import SlideUpAnimation from "@/components/slide-up-animation";

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
    <div className="w-full" style={{ marginTop: '0px' }}>
      <SlideUpAnimation>
        <div className="p-6">
          <PrimaryTitle>Transactions</PrimaryTitle>
          
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
              <div className="flex flex-col gap-3">
                <label className="text-base text-zinc-400 px-1">Filter</label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-between min-w-[120px] px-4 py-2 !text-lg !text-white !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 h-10 focus:!outline-none focus:!ring-0">
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
              <div className="flex flex-col gap-3 mt-2 md:mt-0">
                <div className="px-1 text-base text-zinc-400 invisible">Export</div>
                <SecondaryButton>
                  Export
                </SecondaryButton>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-hidden rounded-xl border !border-[oklch(1_0_0_/_10%)]">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-input/30">
                  <tr>
                    <th className="px-4 py-2 text-left text-base font-semibold text-white">ID</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-white">Date</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-white">Type</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-white">Symbol</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-white">Shares</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-white">Price per Share</th>
                    <th className="px-4 py-2 text-left text-base font-semibold text-white">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-input/30">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-zinc-700">
                      <td className="px-4 py-2 text-base text-white">{tx.id}</td>
                      <td className="px-4 py-2 text-base text-white">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-base text-white">
                        {tx.transaction_type}
                      </td>
                      <td className="px-4 py-2 text-base text-white">{tx.symbol}</td>
                      <td className="px-4 py-2 text-base text-white">
                        {tx.shares.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-base text-white">
                        {formatMoney(tx.price)}
                      </td>
                      <td className="px-4 py-2 text-base text-white">
                        {formatMoney(tx.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SlideUpAnimation>
    </div>
  );
}