import { useState, useEffect } from 'react';
import { ShoppingProduct } from '@/types/stylist';
import { useAuth } from '@/hooks/useAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * useTrialCloset Hook manages state for items placed in the client-side workspace.
 * Synchronizes with Supabase database when logged in, or LocalStorage in guest mode.
 */
export const useTrialCloset = () => {
  const [closetItems, setClosetItems] = useState<ShoppingProduct[]>([]);
  const { user } = useAuth();

  // Load initial trial closet state depending on Auth session
  useEffect(() => {
    const loadCloset = async () => {
      if (user) {
        if (!isSupabaseConfigured || !supabase) {
          const mockDbCloset = localStorage.getItem(`drip_mock_closet_${user.id}`);
          if (mockDbCloset) {
            try {
              setClosetItems(JSON.parse(mockDbCloset));
            } catch (e) {
              console.error(e);
            }
          } else {
            const cached = localStorage.getItem('drip_trial_closet');
            if (cached) {
              try {
                const items = JSON.parse(cached);
                setClosetItems(items);
                localStorage.setItem(`drip_mock_closet_${user.id}`, JSON.stringify(items));
              } catch (e) {
                console.error(e);
              }
            }
          }
          return;
        }

        try {
          const { data, error } = await supabase
            .from('saved_closets')
            .select('items')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error loading saved closet from Supabase:', error);
          } else if (data && data.items) {
            setClosetItems(data.items);
            localStorage.setItem('drip_trial_closet', JSON.stringify(data.items));
          } else {
            // No DB data exists yet, sync local storage up to cloud
            const cached = localStorage.getItem('drip_trial_closet');
            if (cached) {
              const items = JSON.parse(cached);
              setClosetItems(items);
              await supabase.from('saved_closets').upsert({
                user_id: user.id,
                items,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
            }
          }
        } catch (err) {
          console.error('Failed to resolve Supabase saved closet loading:', err);
        }
      } else {
        const cached = localStorage.getItem('drip_trial_closet');
        if (cached) {
          try {
            setClosetItems(JSON.parse(cached));
          } catch (e) {
            console.error(e);
          }
        } else {
          setClosetItems([]);
        }
      }
    };

    loadCloset();
  }, [user]);

  // Save changes helper
  const syncCloset = async (updated: ShoppingProduct[]) => {
    localStorage.setItem('drip_trial_closet', JSON.stringify(updated));

    if (user) {
      if (!isSupabaseConfigured || !supabase) {
        localStorage.setItem(`drip_mock_closet_${user.id}`, JSON.stringify(updated));
        return;
      }

      try {
        await supabase.from('saved_closets').upsert({
          user_id: user.id,
          items: updated,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      } catch (err) {
        console.error('Failed to sync updated closet with Supabase:', err);
      }
    }
  };

  const addToCloset = (item: ShoppingProduct) => {
    setClosetItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      const updated = [...prev, item];
      syncCloset(updated);
      return updated;
    });
  };

  const removeFromCloset = (productId: string) => {
    setClosetItems((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      syncCloset(updated);
      return updated;
    });
  };

  const clearCloset = () => {
    setClosetItems([]);
    syncCloset([]);
  };

  return {
    closetItems,
    addToCloset,
    removeFromCloset,
    clearCloset
  };
};
export default useTrialCloset;
