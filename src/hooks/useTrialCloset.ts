import { useState, useEffect } from 'react';
import { ShoppingProduct } from '@/types/stylist';

/**
 * useTrialCloset Hook manages state for items placed in the client-side workspace.
 * Synchronizes with LocalStorage to persist selections across page reloads.
 */
export const useTrialCloset = () => {
  const [closetItems, setClosetItems] = useState<ShoppingProduct[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem('drip_trial_closet');
    if (cached) {
      try {
        setClosetItems(JSON.parse(cached));
      } catch (e) {
        console.error('Error loading trial closet from localStorage:', e);
      }
    }
  }, []);

  const addToCloset = (item: ShoppingProduct) => {
    setClosetItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      const updated = [...prev, item];
      localStorage.setItem('drip_trial_closet', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCloset = (productId: string) => {
    setClosetItems((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      localStorage.setItem('drip_trial_closet', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCloset = () => {
    setClosetItems([]);
    localStorage.removeItem('drip_trial_closet');
  };

  return {
    closetItems,
    addToCloset,
    removeFromCloset,
    clearCloset
  };
};
export default useTrialCloset;
