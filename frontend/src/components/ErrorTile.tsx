import { AlertCircle } from "lucide-react";
import { Tile } from "@/components/Tile";
import { PopInOutEffect } from "@/components/PopInOutEffect";

interface ErrorTileProps {
  description: string | null;
  className?: string;
}

export const ErrorTile = ({ description, className }: ErrorTileProps) => {
  const shouldShow = !!description;

  if (!description) return null;

  return (
    <PopInOutEffect isVisible={shouldShow} className={className}>
      <Tile className="!border-red-600">
        <div className="flex items-center text-red-500">
          <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
          <span>Error: {description}</span>
        </div>
      </Tile>
    </PopInOutEffect>
  );
};