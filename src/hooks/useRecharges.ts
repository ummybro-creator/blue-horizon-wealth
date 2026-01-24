import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Recharge {
  id: string;
  user_id: string;
  amount: number;
  utr_number: string | null;
  status: 'pending' | 'approved' | 'rejected';
  timer_started_at: string | null;
  requested_at: string;
  processed_at: string | null;
}

const MIN_RECHARGE_AMOUNT = 300;

/* =========================
   GET USER RECHARGES
========================= */
export function useRecharges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recharges', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('recharges')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as Recharge[];
    },
    enabled: !!user,
  });
}

/* =========================
   CREATE RECHARGE (₹300 MIN)
========================= */
export function useCreateRecharge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // 🔴 MINIMUM RECHARGE CHECK
      if (!amount || amount < MIN_RECHARGE_AMOUNT) {
        throw new Error(`Minimum recharge amount is ₹${MIN_RECHARGE_AMOUNT}`);
      }

      const { data, error } = await supabase
        .from('recharges')
        .insert({
          user_id: user.id,
          amount,
          status: 'pending',
          timer_started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recharges'] });
    },
  });
}

/* =========================
   UPDATE UTR NUMBER
========================= */
export function useUpdateRechargeUTR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rechargeId,
      utrNumber,
    }: {
      rechargeId: string;
      utrNumber: string;
    }) => {
      const { data, error } = await supabase
        .from('recharges')
        .update({ utr_number: utrNumber })
        .eq('id', rechargeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recharges'] });
    },
  });
}
