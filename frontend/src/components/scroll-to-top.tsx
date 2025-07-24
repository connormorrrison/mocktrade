import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Find the scrollable container (the main content area)
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    } else {
      // Fallback to window scroll
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}