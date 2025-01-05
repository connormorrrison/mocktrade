import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

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
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filter, setFilter] = useState<'All' | 'BUY' | 'SELL'>('All');

  useEffect(() => {
    fetchTransactions();
  }, []);

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

  // Helper to parse a date string (yyyy-mm-dd) into a Date at midnight
  const getStartOfDay = (dateStr: string) => {
    if (!dateStr) return null;
    // 'T00:00:00' ensures the time is at midnight
    return new Date(`${dateStr}T00:00:00`);
  };

  // Helper to parse a date string (yyyy-mm-dd) into a Date at 23:59:59
  const getEndOfDay = (dateStr: string) => {
    if (!dateStr) return null;
    // 'T23:59:59' ensures the time is end-of-day
    return new Date(`${dateStr}T23:59:59`);
  };

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.created_at);

    const from = getStartOfDay(fromDate);  
    const to = getEndOfDay(toDate);

    // If we have a fromDate, the transaction must be >= fromDate
    if (from && txDate < from) return false;

    // If we have a toDate, the transaction must be <= toDate
    if (to && txDate > to) return false;

    // If fromDate is after toDate, automatically exclude all
    if (from && to && from > to) return false;

    // Filter type if not 'All'
    if (filter !== 'All' && tx.transaction_type !== filter) return false;

    return true;
  });

  // -----------------------------
  // CSV Export implementation
  // -----------------------------
  const handleExport = () => {
    // Prepare the headers for your CSV file
    const headers = ['ID', 'Date', 'Type', 'Symbol', 'Shares', 'Price', 'Total'];
    
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
    link.download = 'transactions.csv'; // The filename for the downloaded file
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="p-8 w-full mt-8">
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
                {/* From Date */}
                <div className="flex items-center gap-2">
                  <label className="text-base text-gray-500">From:</label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                  />
                </div>

                {/* To Date */}
                <div className="flex items-center gap-2">
                  <label className="text-base text-gray-500">To:</label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                  />
                </div>

                {/* Transaction Type Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-base text-gray-500">Filter:</label>
                  <select
                    className="border rounded-md px-2 py-1"
                    value={filter}
                    onChange={e => setFilter(e.target.value as 'All' | 'BUY' | 'SELL')}
                  >
                    <option value="All">All</option>
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                  </select>
                </div>

                {/* Export Button */}
                <div className="flex items-center mt-2 md:mt-0">
                  <Button
                    className="text-base"
                    onClick={handleExport}>Export</Button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
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
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map(tx => (
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
