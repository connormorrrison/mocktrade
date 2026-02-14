import { AlertCircle } from "lucide-react";
import { CustomAlertDialog, AlertDialogHeader, AlertDialogFooter } from "@/components/CustomAlertDialog";
import { Button1 } from "@/components/Button1";
import { Text3 } from "@/components/Text3";
import { Text5 } from "@/components/Text5";

interface CustomErrorProps {
  error: string | null;
  onClose: () => void;
}

export const CustomError = ({ error, onClose }: CustomErrorProps) => {
  return (
    <CustomAlertDialog isOpen={!!error} onClose={onClose}>
      <AlertDialogHeader>
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <Text3 className="!text-red-500">Error</Text3>
        </div>
      </AlertDialogHeader>
      <Text5>{error}</Text5>
      <AlertDialogFooter>
        <Button1 variant="danger" onClick={onClose} className="!w-full">
          Dismiss
        </Button1>
      </AlertDialogFooter>
    </CustomAlertDialog>
  );
};
