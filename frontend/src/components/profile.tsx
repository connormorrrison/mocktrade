import { useState, useEffect, useRef } from "react";
import { Tile } from "@/components/tile";

export default function Profile() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedWidth, setExpandedWidth] = useState(192); // fallback width
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        setIsScrolled(mainElement.scrollTop > 0);
      }
    };
    
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
      return () => mainElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    // Calculate width: profile picture (40px) + gap (12px) + text content + padding (24px each side)
    // Let's measure the text content specifically
    const measureWidth = () => {
      if (contentRef.current) {
        const textElement = contentRef.current.querySelector('.text-content') as HTMLElement;
        if (textElement) {
          const textWidth = textElement.offsetWidth;
          // 40px (profile) + 12px (gap) + textWidth + 32px (16px padding each side)
          setExpandedWidth(40 + 12 + textWidth + 32);
        } else {
          // Fallback: reasonable estimate
          setExpandedWidth(200);
        }
      }
    };
    
    setTimeout(measureWidth, 10);
  }, []);

  return (
    <div className="fixed top-4 right-4 h-16">
      <div 
        className={`h-full transition-[width] duration-300 ${isScrolled ? 'group' : ''}`}
        style={{ 
          transitionTimingFunction: 'cubic-bezier(0.1, 0.9, 0.3, 1)',
          width: isScrolled ? '64px' : `${expandedWidth}px`
        }}
        onMouseEnter={(e) => {
          if (isScrolled) {
            (e.currentTarget as HTMLElement).style.width = `${expandedWidth}px`;
          }
        }}
        onMouseLeave={(e) => {
          if (isScrolled) {
            (e.currentTarget as HTMLElement).style.width = '64px';
          }
        }}
      >
        <Tile className="h-full w-full overflow-hidden flex items-center justify-center p-0 px-4 py-4">
          <div ref={contentRef} className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-base font-semibold">SM</span>
            </div>
            <div 
              className={`text-content flex flex-col overflow-hidden transition-all duration-200 ease-out ${
                isScrolled ? 'w-0 opacity-0 ml-0 scale-95' : 'w-auto opacity-100 ml-3 scale-100'
              }`}
            >
              <span className="text-base font-medium whitespace-nowrap text-gray-900 dark:text-white">Sam Smith</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">@samsmith</span>
            </div>
          </div>
        </Tile>
      </div>
    </div>
  );
}