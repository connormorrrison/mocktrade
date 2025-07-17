import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { Button2 } from "@/components/button-2";
import { Calendar22 } from "@/components/date-picker";
import { PageLayout } from "@/components/page-layout";
import { Title3 } from "@/components/title-3";
import { TransactionsTable } from "@/components/transactions-table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
              <div className="flex flex-col w-full sm:w-auto">
                <Title3 className="px-1">Filter</Title3>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-between min-w-[120px] w-full sm:w-auto px-4 py-2 !text-lg !text-white !bg-zinc-800/55 !border !border-[oklch(1_0_0_/_10%)] !rounded-xl hover:!bg-zinc-700 h-10 focus:!outline-none focus:!ring-0">
                    {selectedFilter}
                    <ChevronDown className="h-5 w-5 ml-2" />
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
              <div className="flex flex-col">
                <Title3 className="px-1">Export</Title3>
                <Button2>
                  <Download />
                  Export
                </Button2>
              </div>
            </div>

            {/* Transactions Table */}
            <TransactionsTable transactions={transactions} />
      </div>
    </PageLayout>
  );
}