import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, DollarSign } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function TradePage() {
  const [symbol, setSymbol] = useState('')
  const [stockData, setStockData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shares, setShares] = useState('')
  const [orderType, setOrderType] = useState('buy')
  const [orderLoading, setOrderLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [userBalance, setUserBalance] = useState<number>(0)

  // Calculate total cost
  const totalCost = stockData && shares ? 
    Number(shares) * stockData.current_price : 0

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:8000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        setUserBalance(data.cash_balance)
      } catch (err) {
        console.error('Failed to fetch balance:', err)
      }
    }
    fetchBalance()
  }, [])

  const handleSearch = async () => {
    if (!symbol) return
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8000/api/v1/stocks/quote/${symbol.toUpperCase()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch stock data')
      
      const data = await response.json()
      setStockData(data)
      setShares('')  // Reset shares input when new stock is selected
    } catch (err) {
      setError('Error fetching stock data. Please try again.')
      setStockData(null)
    } finally {
      setLoading(false)
    }
  }

  const validateAndShowConfirm = () => {
    if (orderType === 'buy' && totalCost > userBalance) {
      setError('Insufficient funds for this trade')
      return
    }
    setShowConfirmDialog(true)
  }

  const handleTrade = async () => {
    if (!stockData || !shares || Number(shares) <= 0) return
    
    setOrderLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/v1/trading/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbol: stockData.symbol,
          shares: Number(shares),
          transaction_type: orderType.toUpperCase()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Trade failed')
      }

      // Clear the form on success
      setShares('')
      setShowConfirmDialog(false)
      alert(`${orderType.toUpperCase()} order executed successfully!`)
    } catch (err: any) {
      setError(err.message || 'Failed to execute trade')
    } finally {
      setOrderLoading(false)
    }
  }

  return (
    <div className="p-8 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Stock Search */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Enter symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !symbol}
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Cash Balance</p>
            <p className="text-lg font-bold">
                ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(userBalance)}
            </p>
          </div>


          {/* Error Message */}
          {error && (
            <div className="text-red-500 mb-4">
              {error}
            </div>
          )}

          {/* Stock Quote Display */}
          {stockData && (
            <>
              <div className="border rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Symbol</p>
                    <p className="text-lg font-bold">{stockData.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Price</p>
                    <p className="text-lg font-bold">${stockData.current_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Change</p>
                    <p className={`text-lg font-bold ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Change %</p>
                    <p className={`text-lg font-bold ${stockData.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stockData.change_percent >= 0 ? '+' : ''}{stockData.change_percent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Trade Form */}
              <div className="border rounded-lg p-4">
                <Tabs value={orderType} onValueChange={setOrderType}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Number of Shares</label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={shares}
                        onChange={(e) => setShares(e.target.value)}
                        placeholder="Enter number of shares"
                      />
                    </div>

                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-gray-500">Estimated Total:</span>
                      <span className="font-bold">${totalCost.toFixed(2)}</span>
                    </div>

                    <Button
                      className="w-full"
                      onClick={validateAndShowConfirm}
                      disabled={orderLoading || !shares || Number(shares) <= 0}
                    >
                      {orderLoading ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <DollarSign className="mr-2 h-4 w-4" />
                          {orderType === 'buy' ? 'Buy' : 'Sell'} {stockData.symbol}
                        </>
                      )}
                    </Button>
                  </div>
                </Tabs>
              </div>
            </>
          )}

          {/* Confirmation Dialog */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm {orderType.toUpperCase()} Order</DialogTitle>
                <DialogDescription>
                  You are about to {orderType} {shares} shares of {stockData?.symbol} at ${stockData?.current_price.toFixed(2)} per share.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Shares:</span>
                  <span className="font-medium">{shares}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Price per Share:</span>
                  <span className="font-medium">${stockData?.current_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-500">Total {orderType === 'buy' ? 'Cost' : 'Proceeds'}:</span>
                  <span className="font-bold">${totalCost.toFixed(2)}</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTrade}>
                  Confirm {orderType.toUpperCase()}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}