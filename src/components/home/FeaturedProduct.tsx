import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, TrendingUp } from 'lucide-react';

export function FeaturedProduct() {
  const navigate = useNavigate();

  const { data: product } = useQuery({
    queryKey: ['featured-product'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_enabled', true)
        .eq('is_special_offer', true)
        .order('price', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) return data;
      // Fallback to any product
      const { data: fallback } = await supabase
        .from('products')
        .select('*')
        .eq('is_enabled', true)
        .order('price', { ascending: false })
        .limit(1)
        .maybeSingle();
      return fallback;
    },
  });

  if (!product) return null;

  return (
    <div className="px-4 mb-2">
      <h3 className="text-sm font-bold text-foreground mb-2 px-1">⭐ Featured Product</h3>
      <button
        onClick={() => navigate('/products')}
        className="w-full text-left overflow-hidden transition-all active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #fff 0%, #f0fdf4 100%)',
          borderRadius: '20px',
          boxShadow: '8px 8px 24px rgba(52,168,83,0.15), -4px -4px 12px rgba(255,255,255,0.9), 0 0 0 1px rgba(52,168,83,0.08)',
        }}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Product image */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(140,52%,43%) 0%, hsl(140,60%,55%) 100%)',
              boxShadow: '4px 4px 12px rgba(52,168,83,0.3), -2px -2px 8px rgba(255,255,255,0.7)',
            }}>
            {product.image_url && product.image_url !== '/placeholder.svg' ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Star className="w-7 h-7 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {product.is_special_offer && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(140,52%,43%), hsl(140,60%,38%))' }}>
                  Special Offer
                </span>
              )}
            </div>
            <p className="font-bold text-foreground text-sm truncate">{product.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {product.duration_days} days · Total ₹{Number(product.total_income).toLocaleString('en-IN')}
            </p>
          </div>

          {/* Price & Income */}
          <div className="shrink-0 text-right">
            <p className="text-lg font-extrabold text-primary">₹{Number(product.price).toLocaleString('en-IN')}</p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs font-bold text-green-600">+₹{Number(product.daily_income).toLocaleString('en-IN')}/day</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
