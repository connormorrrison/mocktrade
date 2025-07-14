import { Tile } from "@/components/tile";
import { useState, useEffect } from "react";

export default function Profile() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Find the main scrollable container
      const mainElement = document.querySelector('main');
      if (mainElement) {
        const scrollTop = mainElement.scrollTop;
        setIsScrolled(scrollTop > 50);
      }
    };

    // Add scroll listener to the main container instead of window
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div 
      className={`fixed top-4 right-4 transition-all duration-400 ease-in-out ${
        isScrolled ? 'w-16 h-16' : 'w-auto h-16'
      }`}
    >
      <Tile className={`h-full flex items-center justify-center overflow-hidden transition-all duration-400 ease-in-out ${
        isScrolled ? 'w-16 px-0' : 'w-auto px-4'
      }`}>
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-base font-semibold">SM</span>
        </div>
        <div 
          className={`flex flex-col ml-3 transition-all duration-400 ease-in-out ${
            isScrolled ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto'
          }`}
        >
          <span className="text-base font-medium whitespace-nowrap text-gray-900 dark:text-white">Sam Smith</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">@samsmith</span>
        </div>
      </Tile>
    </div>
  );
}