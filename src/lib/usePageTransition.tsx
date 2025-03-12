
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTransition() {
  const location = useLocation();
  const [isExiting, setIsExiting] = useState(false);
  const [currentOutlet, setCurrentOutlet] = useState(location.pathname);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // New route detected
    if (location.pathname !== currentOutlet) {
      setIsExiting(true);
      
      // After animation completes, update outlet
      timeoutId = setTimeout(() => {
        setCurrentOutlet(location.pathname);
        setIsExiting(false);
      }, 300); // Match this to your animation duration
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [location.pathname, currentOutlet]);
  
  return {
    isExiting,
    currentOutlet
  };
}
