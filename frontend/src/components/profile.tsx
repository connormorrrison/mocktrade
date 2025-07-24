import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tile } from "@/components/tile";
import { Text4 } from "@/components/text-4";
import { Text5 } from "@/components/text-5";
import { ProfilePicture } from "@/components/profile-picture";
import { useUser } from "@/contexts/UserContext";

export default function Profile() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedWidth, setExpandedWidth] = useState(192); // fallback width
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { userData, isLoading } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      const scrollElement = document.querySelector('main .overflow-y-auto');
      if (scrollElement) {
        setIsScrolled(scrollElement.scrollTop > 0);
      }
    };
    
    const scrollElement = document.querySelector('main .overflow-y-auto');
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
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

  // Only render if we have user data or are loading
  if (!isLoading && !userData) {
    return null;
  }

  return (
    <div className="fixed top-8 right-8 h-16 z-50">
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
        <div 
          className="h-full w-full cursor-pointer" 
          onClick={() => navigate('/profile')}
        >
          <Tile className="h-full w-full overflow-hidden flex items-center justify-center p-0 px-4 py-4 !bg-zinc-800/55 hover:!bg-zinc-700">
          <div ref={contentRef} className="flex items-center">
            <ProfilePicture size="md" className="flex-shrink-0" />
            <div 
              className={`text-content flex flex-col overflow-hidden transition-all duration-200 ease-out ${
                isScrolled ? 'w-0 opacity-0 ml-0 scale-95 group-hover:w-auto group-hover:opacity-100 group-hover:ml-3 group-hover:scale-100' : 'w-auto opacity-100 ml-3 scale-100'
              }`}
            >
              <Text5 className="whitespace-nowrap">
                {isLoading ? 'Loading...' : `${userData!.first_name} ${userData!.last_name}`}
              </Text5>
              <Text4 className="whitespace-nowrap">
                {isLoading ? '' : `@${userData!.username}`}
              </Text4>
            </div>
          </div>
          </Tile>
        </div>
      </div>
    </div>
  );
}