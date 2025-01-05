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

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.created_at);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from && txDate < from) return false;
    if (to && txDate > to) return false;
    if (filter !== 'All' && tx.transaction_type !== filter) return false;

    return true;
  });

  const handleExport = () => {
    alert('Export functionality is not yet implemented.');
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-base text-gray-500">From:</label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-base text-gray-500">To:</label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                  />
                </div>
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
                <div className="flex items-center mt-2 md:mt-0">
                  <Button onClick={handleExport}>Export</Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-base font-semibold text-gray-600">ID</th>
                      <th className="px-4 py-2 text-base font-semibold text-gray-600">Date</th>
                      <th className="px-4 py-2 text-base font-semibold text-gray-600">Type</th>
                      <th className="px-4 py-2 text-base font-semibold text-gray-600">Symbol</th>
                      <th className="px-4 py-2 text-base font-semibold text-gray-600">Shares</th>
                      <th className="px-4 py-2 text-base font-semibold text-gray-600">Price</th>
                      <th className="px-4 py-2 text-base font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
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
                        <tr key={tx.id} className="border-b">
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