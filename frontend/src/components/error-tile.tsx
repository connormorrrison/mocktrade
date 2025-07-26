import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Tile } from "@/components/tile";

interface ErrorTileProps {
  description: string | null;
  className?: string;
}

export const ErrorTile = ({ description, className }: ErrorTileProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const shouldShow = !!description;

  useEffect(() => {
    if (shouldShow && !isVisible) {
      // Show with enter animation
      setIsVisible(true);
      setIsExiting(false);
    } else if (!shouldShow && isVisible) {
      // Hide with exit animation
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
      }, 200); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [shouldShow, isVisible]);

  if (!isVisible || !description) return null;

  return (
    <Tile 
      className={`
        !border-red-600 
        ${!isExiting 
          ? "animate-in zoom-in-95 fade-in duration-200 ease-out" 
          : "animate-out zoom-out-95 fade-out duration-200 ease-in"
        } 
        ${className || ""}
      `}
    >
      <div className="flex items-center text-red-500">
        <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
        <span>Error: {description}</span>
      </div>
    </Tile>
  );
};