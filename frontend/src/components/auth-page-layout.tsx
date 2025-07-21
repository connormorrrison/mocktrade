import { type ReactNode } from "react";
import { Tile } from "@/components/tile";
import SlideUpAnimation from "@/components/slide-up-animation";

interface AuthPageLayoutProps {
  children: ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="h-screen w-screen flex items-center justify-center p-8">
      <SlideUpAnimation className="w-full max-w-md">
        <Tile className="w-full p-8">
          {children}
        </Tile>
      </SlideUpAnimation>
    </div>
  );
}