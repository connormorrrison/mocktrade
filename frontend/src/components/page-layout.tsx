import { ReactNode } from "react";
import { PrimaryTitle } from "@/components/primary-title";
import SlideUpAnimation from "@/components/slide-up-animation";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="w-full">
      <SlideUpAnimation>
        <div className="p-6">
          <PrimaryTitle>{title}</PrimaryTitle>
          {children}
        </div>
      </SlideUpAnimation>
    </div>
  );
}