import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TradePage() {
  return (
    <div className="p-8 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg-3 font-normal">Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Placeholder for Search Section */}
            <div id="search-section">
                <SearchSection />
            </div>

            {/* Placeholder for Action Section */}
            <div id="action-section">
                <ActionSection />
            </div>

            {/* Placeholder for Order Form */}
            <div id="order-form">
                <StockOrderForm />
            </div>

            {/* Placeholder for Confirmation Dialog */}
            <div id="confirmation-dialog"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchSection() {
  return (
    <div className="flex gap-2 mb-6">
      <Input placeholder="Enter symbol (e.g., AAPL)" />
      <Button>
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </div>
  );
}


export function ActionSection() {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-2">Action</label>
      <div className="flex gap-2">
        <Button className="flex-1 w-full bg-blue-600 hover:bg-blue-700 text-white">Buy</Button>
        <Button className="flex-1">Sell</Button>
      </div>
    </div>
  );
}



export function StockOrderForm() {
  return (
    <div className="space-y-4">
      {/* Quantity Input */}
      <div>
        <label className="block text-sm text-gray-500 mb-2">Quantity</label>
        <Input type="number" placeholder="0" className="text-lg" />
      </div>

      {/* Order Summary */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Market Price</span>
          <span className="font-medium">$0.00</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Total Value</span>
          <span className="text-xl font-bold">$0.00</span>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Submit Order</Button>
      </div>
    </div>
  );
}
