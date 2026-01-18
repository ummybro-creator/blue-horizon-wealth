import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppSettings {
  id: string;
  app_name: string;
  app_logo_url: string | null;
  payment_upi_id: string;
  payment_qr_code_url: string | null;
  support_whatsapp: string | null;
  support_email: string | null;
  support_phone: string | null;
  telegram_group_link: string | null;
  checkin_bonus_amount: number;
  minimum_withdrawal: number;
  minimum_recharge: number;
}

export function useAppSettings() {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as AppSettings | null;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
