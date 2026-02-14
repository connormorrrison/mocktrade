import { CustomAlertDialog, AlertDialogHeader, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/CustomAlertDialog";
import { Text3 } from "@/components/Text3";
import { Text5 } from "@/components/Text5";
import confetti from "canvas-confetti";
import { formatMoney } from "@/lib/formatMoney";
import { formatShares } from "@/lib/formatShares";

interface TradeConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  symbol?: string;
  action?: string;
  quantity?: number;
  price?: number;
  onConfirm?: () => void;
}

export const TradeConfirm = ({ 
  isOpen, 
  onClose, 
  symbol = "AAPL",
  action = "BUY",
  quantity = 10,
  price = 150.00,
  onConfirm
}: TradeConfirmProps) => {
  const totalValue = quantity * price;

  const handleConfirm = () => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <CustomAlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogHeader>
        <Text3>Confirm Order</Text3>
      </AlertDialogHeader>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Text5 variant="white">Symbol:</Text5>
          <Text5 variant="white">{symbol}</Text5>
        </div>
        <div className="flex justify-between">
          <Text5 variant="white">Action:</Text5>
          <Text5 variant="white">{action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()}</Text5>
        </div>
        <div className="flex justify-between">
          <Text5 variant="white">Quantity:</Text5>
          <Text5 variant="white">{formatShares(quantity)}</Text5>
        </div>
        <div className="flex justify-between">
          <Text5 variant="white">Price per Share:</Text5>
          <Text5 variant="white">{formatMoney(price)}</Text5>
        </div>
        <div className="flex justify-between">
          <Text5 variant="white">Total Value:</Text5>
          <Text3>{formatMoney(totalValue)}</Text3>
        </div>
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleConfirm} className="!w-full">Confirm Order</AlertDialogAction>
      </AlertDialogFooter>
    </CustomAlertDialog>
  );
};