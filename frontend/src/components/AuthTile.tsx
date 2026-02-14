import { type ReactNode } from "react";
import { Tile } from "@/components/Tile";

interface AuthTileProps {
  children: ReactNode;
}

export function AuthTile({ children }: AuthTileProps) {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Tile className="w-full p-6">
          {children}
        </Tile>
      </div>
    </div>
  );
}