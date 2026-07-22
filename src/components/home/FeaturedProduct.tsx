import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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
        ⭐ Featured Product
      </h3>

      {/* Card */}
      <div
        className="rounded-[24px] relative overflow-visible"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(255,106,0,0.12), 0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255,255,255,0.75)',
        }}
      >
        {/* Top badges */}
        <div className="flex items-start justify-between px-4 pt-4">
          <div
            className="px-4 py-1.5 rounded-full text-white font-bold text-[13px]"
            style={{ background: BTN_GRAD, boxShadow: '0 4px 10px rgba(255,106,0,0.30)' }}
          >
            {product.name}
          </div>
          <div
            className="px-4 py-1.5 rounded-full text-white font-bold text-[13px]"
            style={{ background: GREEN_GRAD, boxShadow: '0 4px 10px rgba(46,125,50,0.32)' }}
          >
            Days: {product.duration_days}
          </div>
        </div>

        {/* Body */}
        <div className="flex px-3 pt-3 pb-2 gap-2 items-center">
          {/* Image */}
          <div className="w-[42%] shrink-0 flex items-center justify-center">
            <img
              src="https://files.catbox.moe/9xmkkp.jpg"
              alt={product.name}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Stats */}
          <div className="flex-1 flex items-stretch">
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-[18px] font-extrabold leading-tight" style={{ color: ORANGE }}>
                ₹{Number(product.daily_income).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-center mt-0.5 font-medium" style={{ color: '#8A8A8A' }}>
                Daily<br />Income
              </p>
            </div>
            <div className="w-px self-stretch" style={{ background: '#E5E7EB', margin: '4px 0' }} />
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-[18px] font-extrabold leading-tight" style={{ color: ORANGE }}>
                ₹{Number(product.total_income).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-center mt-0.5 font-medium" style={{ color: '#8A8A8A' }}>
                Total<br />Revenue
              </p>
            </div>
          </div>
        </div>

        {/* Price + Invest */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1">
          <p className="text-[16px] font-extrabold" style={{ color: '#2B2B2B' }}>
            Price: <span style={{ color: ORANGE }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
          </p>
          <button
            onClick={handleInvest}
            disabled={investing}
            className="text-white font-bold text-[14px] transition-all active:scale-[0.98] disabled:opacity-60"
            style={{
              height: 40,
              minWidth: 110,
              borderRadius: 999,
              background: investing ? '#9CA3AF' : BTN_GRAD,
              boxShadow: investing ? 'none' : BTN_SHADOW,
              padding: '0 20px',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {investing ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Invest'}
          </button>
        </div>
      </div>
    </div>
  );
}
