import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

// Define your transaction data structure
interface Transaction {
  transaction_id: string;
  date: string;
  transaction_type: 'Buy' | 'Sell';
  symbol: string;
  company: string;
  shares: number;
  price: number;
  total: number;
}

export default function TransactionsPage() {
  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [filter, setFilter] = useState<'All' | 'Buy' | 'Sell'>('All');

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Example fetch function (replace with your actual API endpoint)
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/trading/transactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();

      // Validate/transform data as needed
      const validTransactions = (data.transactions || []).map((tx: any) => ({
        transaction_id: tx.transaction_id || '',
        date: tx.date || '',
        transaction_type: tx.transaction_type || '',
        symbol: tx.symbol || '',
        company: tx.company || '',
        shares: typeof tx.shares === 'number' ? tx.shares : 0,
        price: typeof tx.price === 'number' ? tx.price : 0,
        total: typeof tx.total === 'number' ? tx.total : 0,
      }));

      setTransactions(validTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Unable to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Filter transactions client-side based on date range and buy/sell
  const filteredTransactions = transactions.filter((tx) => {
    // Date filtering
    const txDate = new Date(tx.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from && txDate < from) return false;
    if (to && txDate > to) return false;

    // Type filtering
    if (filter !== 'All' && tx.transaction_type !== filter) return false;

    return true;
  });

  // Placeholder export function (CSV, Excel, PDF, etc.)
  const handleExport = () => {
    // Implement your export logic here
    alert('Export functionality is not yet implemented.');
  };

  // Optional money formatter
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="p-8 w-full mt-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-normal">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filters Section */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Date Range Pickers */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500">From:</label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500">To:</label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500">Filter:</label>
                  <select
                    className="border rounded-md px-2 py-1"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'All' | 'Buy' | 'Sell')}
                  >
                    <option value="All">All</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                  </select>
                </div>

                {/* Export Button */}
                <div className="flex items-center mt-2 md:mt-0">
                  <Button onClick={handleExport}>Export</Button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600">Transaction ID</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600">Type</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600">Symbol</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600">Company</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600">Shares</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600">Price</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4 text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.transaction_id} className="border-b">
                          <td className="px-4 py-2 text-sm text-gray-700">{tx.transaction_id}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {tx.transaction_type}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">{tx.symbol}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{tx.company}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {tx.shares.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {formatMoney(tx.price)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {formatMoney(tx.total)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
