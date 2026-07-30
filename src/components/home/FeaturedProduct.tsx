import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { LazyImage } from '@/components/ui/LazyImage';

const ORANGE      = '#FF6A00';
const BTN_GRAD    = 'linear-gradient(135deg, #FF8A00 0%, #FF6A00 100%)';
const GREEN_GRAD  = 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)';
const BTN_SHADOW  = '0 8px 20px rgba(255,106,0,0.38)';

export function FeaturedProduct() {
  const navigate = useNavigate();
  const { wallet } = useAuth();
  const createInvestment = useCreateInvestment();
  const [investing, setInvesting] = useState(false);

  const { data: product } = useQuery({
    queryKey: ['featured-product'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_enabled', true)
        .eq('is_special_offer', true)
        .order('price', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data) return data;
      const { data: fallback } = await supabase
        .from('products')
        .select('*')
        .eq('is_enabled', true)
        .order('price', { ascending: true })
        .limit(1)
        .maybeSingle();
      return fallback;
    },
  });

  if (!product) return null;

  const handleInvest = async () => {
    const currentBalance = wallet?.total_balance ?? 0;
    if (currentBalance < Number(product.price)) {
      toast.error('Insufficient Balance', { description: 'Please recharge your wallet to invest.' });
      navigate('/recharge');
      return;
    }
    setInvesting(true);
    try {
      await createInvestment.mutateAsync(product.id);
      toast.success('Investment successful!', {
        description: `You invested ₹${Number(product.price).toLocaleString('en-IN')} in ${product.name}`,
      });
    } catch (error: any) {
      if (error.message === 'Insufficient balance') {
        toast.error('Insufficient Balance', { description: 'Please recharge your wallet to invest.' });
        navigate('/recharge');
      } else {
        toast.error('Investment failed', { description: error.message || 'Please try again.' });
      }
    } finally {
      setInvesting(false);
    }
  };

  return (
    <div className="px-4 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <h3
        className="text-sm font-bold mb-3 px-1"
        style={{ color: '#2B2B2B' }}
      >
        Featured Product
      </h3>

      {/* Card */}
      <div
        className="rounded-[20px] flex items-center gap-3 px-3 py-3"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 6px 20px rgba(255,106,0,0.10), 0 2px 6px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255,255,255,0.75)',
        }}
      >
        {/* Image */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0" style={{ background: '#FFF4EE' }}>
          <LazyImage
            src="https://files.catbox.moe/9xmkkp.jpg"
            alt={product.name}
            className="w-full h-full object-cover"
            wrapperClassName="w-full h-full"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-[13px] font-extrabold truncate" style={{ color: '#2B2B2B' }}>{product.name}</p>
            <span
              className="shrink-0 px-1.5 py-0.5 rounded-full text-white font-bold text-[9px]"
              style={{ background: GREEN_GRAD }}
            >
              {product.duration_days}d
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[12px] font-extrabold leading-tight" style={{ color: ORANGE }}>
                ₹{Number(product.daily_income).toLocaleString('en-IN')}
              </p>
              <p className="text-[9px] font-medium" style={{ color: '#8A8A8A' }}>Daily</p>
            </div>
            <div className="w-px h-6" style={{ background: '#E5E7EB' }} />
            <div>
              <p className="text-[12px] font-extrabold leading-tight" style={{ color: ORANGE }}>
                ₹{Number(product.total_income).toLocaleString('en-IN')}
              </p>
              <p className="text-[9px] font-medium" style={{ color: '#8A8A8A' }}>Total</p>
            </div>
            <div className="w-px h-6" style={{ background: '#E5E7EB' }} />
            <div>
              <p className="text-[12px] font-extrabold leading-tight" style={{ color: '#2B2B2B' }}>
                ₹{Number(product.price).toLocaleString('en-IN')}
              </p>
              <p className="text-[9px] font-medium" style={{ color: '#8A8A8A' }}>Price</p>
            </div>
          </div>
        </div>

        {/* Invest button */}
        <button
          onClick={handleInvest}
          disabled={investing}
          className="shrink-0 text-white font-bold text-[12px] transition-all active:scale-[0.97] disabled:opacity-60"
          style={{
            height: 34,
            minWidth: 70,
            borderRadius: 999,
            background: investing ? '#9CA3AF' : BTN_GRAD,
            boxShadow: investing ? 'none' : BTN_SHADOW,
            padding: '0 14px',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {investing ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Invest'}
        </button>
      </div>
    </div>
  );
}
