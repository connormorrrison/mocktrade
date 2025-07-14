import { useState, useEffect } from "react";
import { Tile } from "@/components/tile";

export default function Profile() {
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <div className="fixed top-4 right-4 h-16">
      <div 
        className={`h-full transition-[width] duration-300 ${
          isScrolled ? 'w-16' : 'w-52'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.1, 0.9, 0.3, 1)' }}
      >
        <Tile className="h-full w-full">
          <div></div>
        </Tile>
      </div>
    </div>
  );
}