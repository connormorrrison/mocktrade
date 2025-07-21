import { useState } from "react";
import { Download } from "lucide-react";
import { Button2 } from "@/components/button-2";
import { PageLayout } from "@/components/page-layout";
import { TransactionsTable } from "@/components/transactions-table";
import { CustomDropdown } from "@/components/custom-dropdown";
import { CustomDatePicker } from "@/components/custom-date-picker";

export default function TransactionsPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

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
      {/* Add overflow-hidden wrapper to prevent page expansion */}
      <div className="overflow-hidden">
        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-4">
          {/* From Date */}
          <CustomDatePicker
            label="From"
            placeholder="Select from date"
            value={fromDate}
            onValueChange={setFromDate}
          />

          {/* To Date */}
          <CustomDatePicker
            label="To"
            placeholder="Select to date"
            value={toDate}
            onValueChange={setToDate}
          />

          {/* Transaction Type Filter */}
          <CustomDropdown
            label="Filter"
            value={selectedFilter}
            options={[
              { value: "All", label: "All" },
              { value: "Buy", label: "Buy" },
              { value: "Sell", label: "Sell" },
            ]}
            onValueChange={setSelectedFilter}
            className="min-w-[120px] w-full sm:w-auto"
          />

          {/* Export Button */}
          <Button2 label="Export">
            <Download />
            Export
          </Button2>
        </div>

        {/* Transactions Table - Now properly constrained */}
        <TransactionsTable transactions={transactions} />
      </div>
    </PageLayout>
  );
}