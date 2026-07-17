import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const ORANGE = '#FF6A1A';
const ORANGE_DARK = '#F25A00';
const BTN_GRAD = `linear-gradient(180deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`;
const PRODUCT_IMG = 'https://files.catbox.moe/9xmkkp.jpg';

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
    <div className="px-4 mb-2" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>
      <h3 className="text-sm font-bold text-foreground mb-2 px-1">⭐ Featured Product</h3>
      <div
        className="rounded-[22px] bg-white overflow-hidden relative"
        style={{
          boxShadow: '0 8px 24px rgba(242,90,0,0.12)',
          border: '4px solid #FFE4CC',
        }}
      >
        {/* Days badge top-right */}
        <div
          className="absolute top-3 right-3 px-3 py-1.5 rounded-[12px] text-white font-extrabold text-[13px] leading-none"
          style={{ background: BTN_GRAD, boxShadow: '0 4px 10px rgba(242,90,0,0.28)' }}
        >
          Days: {product.duration_days}
        </div>

        <div className="flex px-3 pt-3 pb-2 gap-2">
          {/* Left: image */}
          <div className="w-[42%] shrink-0 flex items-center justify-center">
            <img src={PRODUCT_IMG} alt={product.name} className="w-full h-auto object-contain" />
          </div>

          {/* Right: info */}
          <div className="flex-1 flex flex-col pt-1">
            <h2 className="text-[20px] font-extrabold text-gray-900 leading-tight mb-3">
              {product.name}
            </h2>
            <div className="flex gap-3 mb-1">
              <div>
                <p className="text-[17px] font-extrabold leading-tight" style={{ color: ORANGE }}>
                  ₹{Number(product.daily_income).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Daily Income</p>
              </div>
              <div>
                <p className="text-[17px] font-extrabold leading-tight" style={{ color: ORANGE }}>
                  ₹{Number(product.total_income).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: Price + Invest */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          <p className="text-[18px] font-extrabold text-gray-900">
            Price: <span style={{ color: ORANGE }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
          </p>
          <button
            onClick={handleInvest}
            disabled={investing}
            className="text-white font-extrabold text-[15px] transition-all active:scale-[0.98] disabled:opacity-60"
            style={{
              height: 42,
              minWidth: 120,
              borderRadius: 999,
              background: investing ? '#9CA3AF' : BTN_GRAD,
              boxShadow: investing ? 'none' : '0 6px 14px rgba(242,90,0,0.32)',
              padding: '0 22px',
            }}
          >
            {investing ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Invest'}
          </button>
        </div>
      </div>
    </div>
  );
}
