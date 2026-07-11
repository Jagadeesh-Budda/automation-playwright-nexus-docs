import { useEffect } from 'react';
import { useMasteryStore } from '../store/useMasteryStore';

export function useSessionTracker() {
  const { incrementTimeSpent } = useMasteryStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const interval = setInterval(() => {
      incrementTimeSpent(10); // add 10 seconds every 10 seconds
    }, 10000);
    
    return () => clearInterval(interval);
  }, [incrementTimeSpent]);
}
