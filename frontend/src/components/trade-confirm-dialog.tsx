import { Tile } from "@/components/tile";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";
import { formatMoney } from "@/lib/format-money";

interface TradeConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  symbol: string;
  action: string;
  quantity: string;
  price: number;
}

export const TradeConfirm = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  symbol, 
  action, 
  quantity, 
  price 
}: TradeConfirmProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <Tile className="max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Confirm Order</h3>
        <p className="text-gray-400 mb-4">Please review your order.</p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Symbol:</span>
            <span className="font-semibold">{symbol}</span>
          </div>
          <div className="flex justify-between">
            <span>Action:</span>
            <span className="font-semibold capitalize">{action}</span>
          </div>
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span className="font-semibold">{Number(quantity).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Price per Share:</span>
            <span className="font-semibold">{formatMoney(price)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Value:</span>
            <span className="font-semibold text-lg">{formatMoney(price * Number(quantity))}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button2 onClick={onClose} className="flex-1">
            Cancel
          </Button2>
          <Button1 onClick={onConfirm} className="flex-1">
            Confirm Order
          </Button1>
        </div>
      </Tile>
    </div>
  );
};