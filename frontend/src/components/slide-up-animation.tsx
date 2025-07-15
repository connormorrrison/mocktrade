import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SlideUpAnimationProps {
  children: React.ReactNode;
  className?: string;
}

export default function SlideUpAnimation({ 
  children, 
  className = "" 
}: SlideUpAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Reset animation state
    setIsVisible(false);
    
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, [location.pathname]); // Re-trigger when pathname changes

  const animationClass = `transition-all duration-300 ${
    isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
  }`;

  return (
    <div 
      className={`${animationClass} ${className}`}
      style={{ 
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {children}
    </div>
  );
}