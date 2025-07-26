import { AlertCircle } from "lucide-react";
import { Tile } from "@/components/tile";

interface ErrorTileProps {
  description: string;
  className?: string;
}

export const ErrorTile = ({ description, className }: ErrorTileProps) => {
  return (
    <Tile className={`px-4 py-2 border-red-600 rounded-xl ${className || ""}`}>
      <div className="flex items-center text-red-600">
        <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
        <span>Error: {description}</span>
      </div>
    </Tile>
  );
};