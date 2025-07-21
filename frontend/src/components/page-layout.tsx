import { type ReactNode } from "react";
import { Title1 } from "@/components/title-1";
import SlideUpAnimation from "@/components/slide-up-animation";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <SlideUpAnimation className="w-full">
      {/*
        Main container:
        - w-full: Takes full width of its parent.
        - flex flex-col: Makes container a flex container to arrange its children (title and content) vertically.
      */}
      <div className="w-full flex flex-col">
        {/*
          Header/Title section.
          - px-6 pt-6: Provides consistent horizontal and top padding around the title.
          - mb-6 on Title1 ensures space below the title.
        */}
        <div className="px-6 pt-6">
          <Title1 className="mb-6">{title}</Title1>
        </div>
        
        {/*
          Main content area.
          - px-6 pb-6: Provides consistent horizontal and bottom padding for the content.
          - space-y-6: Applies vertical spacing between direct children of this div (the elements passed via 'children').
          Note: Scrolling is handled by the parent Routes container in App.tsx
        */}
        <div className="px-6 pb-6 space-y-6">
          {children}
        </div>
      </div>
    </SlideUpAnimation>
  );
}