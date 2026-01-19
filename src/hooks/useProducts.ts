import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  daily_income: number;
  total_income: number;
  duration_days: number;
  category: string;
  is_enabled: boolean;
  is_special_offer: boolean;
  description: string | null;
}

export function useProducts(category?: 'daily' | 'vip') {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_enabled', true)
        .order('price', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Product[];
    },
    staleTime: 0, // Always refetch to get latest admin changes
    refetchOnWindowFocus: true,
  });
}
