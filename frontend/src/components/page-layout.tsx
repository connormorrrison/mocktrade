import { type ReactNode } from "react";
import { Title1 } from "@/components/title-1";
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
          <Title1>{title}</Title1>
          {children}
        </div>
      </SlideUpAnimation>
    </div>
  );
}