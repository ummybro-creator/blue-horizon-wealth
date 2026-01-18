import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CheckIn {
  id: string;
  user_id: string;
  checked_in_at: string;
  bonus_amount: number;
}

export function useCheckins() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('checked_in_at', { ascending: false })
        .limit(7);
      
      if (error) throw error;
      return data as CheckIn[];
    },
    enabled: !!user,
  });
}

export function useTodayCheckin() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['today-checkin', user?.id, today],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('checked_in_at', today)
        .maybeSingle();
      
      if (error) throw error;
      return data as CheckIn | null;
    },
    enabled: !!user,
  });
}

export function useCreateCheckin() {
  const queryClient = useQueryClient();
  const { user, refreshWallet } = useAuth();
  
  return useMutation({
    mutationFn: async ({ bonusAmount }: { bonusAmount: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: user.id,
          checked_in_at: today,
          bonus_amount: bonusAmount,
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Already checked in today');
        }
        throw error;
      }
      
      // Call RPC function to add bonus
      await supabase.rpc('add_bonus', {
        p_user_id: user.id,
        p_amount: bonusAmount
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      queryClient.invalidateQueries({ queryKey: ['today-checkin'] });
      refreshWallet();
    },
  });
}
