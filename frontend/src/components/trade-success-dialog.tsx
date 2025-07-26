import { CheckCircle } from "lucide-react";
import { Tile } from "@/components/tile";
import { Button1 } from "@/components/button-1";

interface TradeSuccessProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TradeSuccess = ({ isOpen, onClose }: TradeSuccessProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <Tile className="max-w-md w-full mx-4">
        <div className="flex items-center gap-4 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold">Order Confirmed</h3>
        </div>
        <p className="text-gray-400 mb-4">
          Your order has been executed. Please visit the Activity tab for details.
        </p>
        <Button1 onClick={onClose} className="w-full">
          Close
        </Button1>
      </Tile>
    </div>
  );
};