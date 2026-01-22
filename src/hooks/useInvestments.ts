import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Investment {
  id: string;
  user_id: string;
  product_id: string;
  invested_amount: number;
  invested_at: string;
  expires_at: string;
  total_earned: number;
  status: string;
  last_credited_at: string | null;
}

export function useInvestments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('invested_at', { ascending: false });
      
      if (error) throw error;
      return data as Investment[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  const { user, refreshWallet } = useAuth();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('create_investment', {
          p_user_id: user.id,
          p_product_id: productId,
        });

      if (error) {
        if (error.message.includes('Insufficient balance')) {
          throw new Error('Insufficient balance');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      refreshWallet();
    },
  });
}

export function useCreditDailyIncome() {
  const queryClient = useQueryClient();
  const { user, refreshWallet } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('credit_all_daily_income', {
          p_user_id: user.id,
        });

      if (error) throw error;
      return data as number;
    },
    onSuccess: (creditedCount) => {
      if (creditedCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['investments'] });
        refreshWallet();
      }
    },
  });
}
