import { CustomAlertDialog, AlertDialogHeader, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/custom-alert-dialog";
import { Text3 } from "@/components/text-3";
import { Text5 } from "@/components/text-5";
import { Check } from "lucide-react";
import confetti from "canvas-confetti";

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
        <div className="flex items-center justify-center gap-2">
          <Text3>Confirm Order</Text3>
        </div>
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
          <Text5 variant="white">{quantity}</Text5>
        </div>
        <div className="flex justify-between">
          <Text5 variant="white">Price per Share:</Text5>
          <Text5 variant="white">${price.toFixed(2)}</Text5>
        </div>
        <div className="flex justify-between">
          <Text5 variant="white">Total Value:</Text5>
          <Text3>${totalValue.toFixed(2)}</Text3>
        </div>
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleConfirm} className="!w-full">Confirm Order</AlertDialogAction>
      </AlertDialogFooter>
    </CustomAlertDialog>
  );
};