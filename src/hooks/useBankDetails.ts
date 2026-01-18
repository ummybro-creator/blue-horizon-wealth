import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BankDetails {
  id: string;
  user_id: string;
  account_holder_name: string | null;
  bank_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  upi_id: string | null;
}

export function useBankDetails() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bank-details', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('bank_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as BankDetails | null;
    },
    enabled: !!user,
  });
}

export function useSaveBankDetails() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (details: Omit<BankDetails, 'id' | 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      // Try to update first
      const { data: existing } = await supabase
        .from('bank_details')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase
          .from('bank_details')
          .update(details)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('bank_details')
          .insert({
            user_id: user.id,
            ...details,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-details'] });
    },
  });
}
