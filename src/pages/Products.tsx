import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/* ── Design tokens ── */
const D = {
  primary:     '#22C55E',
  primaryDark: '#16A34A',
  btnGrad:     'linear-gradient(135deg, #22C55E, #16A34A)',
  headerGrad:  'linear-gradient(180deg, #E8F8EE 0%, #F7FCF9 100%)',
  card:        '#FFFFFF',
  textPrimary: '#111827',
  textSec:     '#6B7280',
  border:      '#E5E7EB',
  shadowCard:  '0 2px 12px rgba(0,0,0,0.06)',
  shadowGreen: '0 8px 24px rgba(34,197,94,0.22)',
};

const Products = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'daily' | 'vip'>('daily');
  const [investingProductId, setInvestingProductId] = useState<string | null>(null);

  const { data: products, isLoading } = useProducts(activeTab);
  const { wallet } = useAuth();
  const createInvestment = useCreateInvestment();

  const handleInvest = async (product: Product) => {
    const currentBalance = wallet?.total_balance ?? 0;
    if (currentBalance < product.price) {
      toast.error('Insufficient Balance', { description: 'Please recharge your wallet to invest.' });
      navigate('/recharge');
      return;
    }
    setInvestingProductId(product.id);
    try {
      await createInvestment.mutateAsync(product.id);
      toast.success('Investment successful!', {
        description: `You invested ₹${product.price.toLocaleString('en-IN')} in ${product.name}`,
      });
    } catch (error: any) {
      if (error.message === 'Insufficient balance') {
        toast.error('Insufficient Balance', { description: 'Please recharge your wallet to invest.' });
        navigate('/recharge');
      } else {
        toast.error('Investment failed', { description: error.message || 'Please try again.' });
      }
    } finally {
      setInvestingProductId(null);
    }
  };

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div
        className="px-4 pt-12 pb-5 text-center"
        style={{
          background: 'linear-gradient(135deg, #D9040A, #B50309)',
          borderRadius: '0 0 30px 30px',
          boxShadow: '0 6px 20px rgba(217,4,10,0.25)',
        }}
      >
        <h1 className="text-[22px] font-extrabold text-white">Plan Store</h1>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="px-4 mt-4">
        <div
          className="flex p-1 gap-1 rounded-full"
          style={{ background: '#F3F4F6' }}
        >
          {(['daily', 'vip'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-200"
                style={{
                  background: isActive ? D.btnGrad : 'transparent',
                  color: isActive ? '#FFFFFF' : D.textSec,
                  boxShadow: isActive ? D.shadowGreen : 'none',
                }}
              >
                {tab === 'daily' ? 'Daily Plan' : 'Welfare Plan'}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product Cards ── */}
      <div className="px-4 pt-4 pb-8 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-9 h-9 animate-spin" style={{ color: D.primary }} />
          </div>
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="rounded-[20px] overflow-hidden"
              style={{ background: D.card, boxShadow: D.shadowCard }}
            >
              {/* Top Badge Row */}
              <div className="flex items-center justify-between px-4 pt-3 pb-0">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: '#DCFCE7', color: D.primary }}
                >
                  {product.description || product.name}
                </span>
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: '#F3F4F6', color: D.textSec }}
                >
                  <Clock className="w-3 h-3" />
                  {product.duration_days} Days
                </span>
              </div>

              {/* Image + Income */}
              <div className="flex items-center p-4 gap-4">
                <div className="shrink-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-20 h-[88px] rounded-2xl object-cover"
                    />
                  ) : (
                    <div
                      className="w-20 h-[88px] rounded-2xl flex items-center justify-center"
                      style={{ background: '#DCFCE7' }}
                    >
                      <span className="text-xs font-bold text-center px-1" style={{ color: D.primary }}>
                        {product.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex justify-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-0.5">
                      <TrendingUp className="w-3 h-3" style={{ color: D.primary }} />
                      <p className="text-lg font-extrabold" style={{ color: D.primary }}>
                        ₹{product.daily_income.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <p className="text-[10px] font-medium" style={{ color: D.textSec }}>Daily Income</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold mb-0.5" style={{ color: D.textPrimary }}>
                      ₹{product.total_income.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] font-medium" style={{ color: D.textSec }}>Total Income</p>
                  </div>
                </div>
              </div>

              {/* Price + Button */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderTop: `1px solid ${D.border}` }}
              >
                <p className="text-sm font-semibold" style={{ color: D.textSec }}>
                  Price:{' '}
                  <span className="text-lg font-extrabold" style={{ color: D.primary }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </p>
                <button
                  className="px-6 py-2.5 rounded-full text-sm font-extrabold text-white transition-all active:scale-[0.97]"
                  style={{
                    background: investingProductId === product.id ? '#9CA3AF' : D.btnGrad,
                    boxShadow: investingProductId === product.id ? 'none' : D.shadowGreen,
                    pointerEvents: investingProductId === product.id ? 'none' : 'auto',
                  }}
                  onClick={() => handleInvest(product)}
                  disabled={investingProductId === product.id}
                >
                  {investingProductId === product.id ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Investing...
                    </span>
                  ) : 'Buy Now'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16" style={{ color: D.textSec }}>
            No products available
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Products;
