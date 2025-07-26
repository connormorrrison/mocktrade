import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button1 } from "@/components/button-1";
import { Button2 } from "@/components/button-2";
import React from "react";

interface CustomAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const CustomAlertDialog = ({ isOpen, onClose, children }: CustomAlertDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-xl bg-background !border-[oklch(1_0_0_/_10%)] [&_[data-slot=alert-dialog-action]]:hidden [&_[data-slot=alert-dialog-cancel]]:hidden">
        {children}
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Custom components with gap-4
const CustomAlertDialogFooter = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={`flex flex-col-reverse gap-4 sm:flex-row sm:justify-end ${className}`}
      {...props}
    />
  );
};

export { AlertDialogHeader, CustomAlertDialogFooter as AlertDialogFooter, AlertDialogTitle, Button1 as AlertDialogAction, Button2 as AlertDialogCancel };