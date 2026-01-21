import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at: string | null;
}

export function useWithdrawals() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      return data as Withdrawal[];
    },
    enabled: !!user,
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  const { user, refreshWallet } = useAuth();
  
  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Use the new function that deducts balance immediately
      const { data, error } = await supabase
        .rpc('create_withdrawal_with_deduction', {
          p_user_id: user.id,
          p_amount: amount,
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      refreshWallet();
    },
  });
}
