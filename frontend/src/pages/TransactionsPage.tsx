import { useState, useEffect } from "react";
import { Download, AlertCircle } from "lucide-react";
import { Button2 } from "@/components/button-2";
import { PageLayout } from "@/components/page-layout";
import { TransactionsTable } from "@/components/transactions-table";
import { CustomDropdown } from "@/components/custom-dropdown";
import { CustomDatePicker } from "@/components/custom-date-picker";

interface Transaction {
  id: number;
  symbol: string;
  transaction_type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total_amount: number;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/v1/trading/transactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();

      const validTransactions = data.map((tx: any) => ({
        id: tx.id,
        symbol: tx.symbol,
        transaction_type: tx.transaction_type,
        shares: tx.shares,
        price: tx.price,
        total_amount: tx.total_amount,
        created_at: tx.created_at,
      }));

      setTransactions(validTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Unable to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get start of day
  const getStartOfDay = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  // Helper to get end of day
  const getEndOfDay = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  };

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.created_at);

    const from = fromDate ? getStartOfDay(fromDate) : null;
    const to = toDate ? getEndOfDay(toDate) : null;

    // If we have a fromDate, the transaction must be >= fromDate
    if (from && txDate < from) return false;

    // If we have a toDate, the transaction must be <= toDate
    if (to && txDate > to) return false;

    // If fromDate is after toDate, automatically exclude all
    if (from && to && from > to) return false;

    // Filter type if not 'All'
    const filterValue = selectedFilter === 'Buy' ? 'BUY' : selectedFilter === 'Sell' ? 'SELL' : 'All';
    if (filterValue !== 'All' && tx.transaction_type !== filterValue) return false;

    return true;
  });

  // CSV Export implementation
  const handleExport = () => {
    // Prepare the headers for CSV file
    const headers = ['ID', 'Date', 'Type', 'Symbol', 'Shares', 'Price per Share', 'Total'];
    
    // Build an array of CSV rows
    const csvRows = [headers.join(',')];
    
    filteredTransactions.forEach(tx => {
      const row = [
        tx.id,
        new Date(tx.created_at).toLocaleString(),
        tx.transaction_type,
        tx.symbol,
        tx.shares.toString(),
        tx.price.toString(),
        tx.total_amount.toString(),
      ];
      csvRows.push(row.join(','));
    });
    
    // Convert the array to a single CSV string
    const csvString = csvRows.join('\n');
    
    // Create a Blob object from the CSV string
    const blob = new Blob([csvString], { type: 'text/csv' });
    
    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'activity.csv';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <PageLayout title="Activity">
      {/* Add overflow-hidden wrapper to prevent page expansion */}
      <div className="overflow-hidden">
        {error && (
          <div className="flex items-center text-red-500 mb-4 p-4 bg-red-50 rounded-md">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

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

          {/* Activity Type Filter */}
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
          <Button2 label="Export" onClick={handleExport}>
            <Download />
            Export
          </Button2>
        </div>

        {/* Activity Table - Now properly constrained */}
        <TransactionsTable 
          transactions={filteredTransactions} 
          isLoading={isLoading}
        />
      </div>
    </PageLayout>
  );
}