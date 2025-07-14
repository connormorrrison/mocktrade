import { useState, useEffect } from "react";

export default function BlackBox() {
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
      className={`fixed top-4 right-4 bg-zinc-950 rounded-xl transition-all duration-400 ease-in-out ${
        isScrolled ? 'w-16 h-16' : 'w-auto h-16'
      }`}
    >
      {/* Invisible content that matches the profile component structure */}
      <div className={`h-full flex items-center justify-center overflow-hidden transition-all duration-400 ease-in-out opacity-0 ${
        isScrolled ? 'w-16 px-0' : 'w-auto px-4'
      }`}>
        <div className="w-10 h-10 flex-shrink-0">
        </div>
        <div 
          className={`flex flex-col ml-3 transition-all duration-400 ease-in-out ${
            isScrolled ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto'
          }`}
        >
          <span className="text-base font-medium whitespace-nowrap">Sam Smith</span>
          <span className="text-sm whitespace-nowrap">@samsmith</span>
        </div>
      </div>
    </div>
  );
}