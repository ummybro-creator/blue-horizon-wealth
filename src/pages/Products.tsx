import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Leaf } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ORANGE = '#FF6A1A';
const ORANGE_DARK = '#F25A00';
const BG_TOP = '#FFE4CC';
const BTN_GRAD = `linear-gradient(180deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`;

const Products = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'daily' | 'vip'>('daily');
  const [investingProductId, setInvestingProductId] = useState<string | null>(null);

  const { data: productsRaw, isLoading } = useProducts(activeTab);

  // Pin ₹294 plan to top for daily tab
  const products = productsRaw ? (() => {
    if (activeTab !== 'daily') return productsRaw;
    const pinned = productsRaw.find(p => Number(p.price) === 294);
    if (!pinned) return productsRaw;
    return [pinned, ...productsRaw.filter(p => p.id !== pinned.id)];
  })() : productsRaw;
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
      <div
        className="min-h-screen relative"
        style={{
          background: `linear-gradient(180deg, ${BG_TOP} 0%, #FFF3E6 22%, #FFFFFF 55%)`,
          fontFamily: "'Poppins', 'Inter', sans-serif",
        }}
      >
        {/* Decorative leaves top-left */}
        <div className="absolute top-4 left-0 w-24 h-20 pointer-events-none">
          <svg viewBox="0 0 100 80" fill="none">
            <ellipse cx="18" cy="18" rx="16" ry="9" fill="#2E7D32" transform="rotate(-25 18 18)" />
            <ellipse cx="38" cy="10" rx="12" ry="7" fill="#43A047" transform="rotate(-5 38 10)" />
            <ellipse cx="30" cy="32" rx="10" ry="6" fill="#388E3C" transform="rotate(20 30 32)" />
          </svg>
        </div>
        {/* Decorative half orange top-right */}
        <div className="absolute -top-2 -right-2 w-32 h-32 pointer-events-none">
          <svg viewBox="0 0 130 130" fill="none">
            <ellipse cx="55" cy="18" rx="14" ry="8" fill="#2E7D32" transform="rotate(-25 55 18)" />
            <ellipse cx="42" cy="28" rx="10" ry="6" fill="#43A047" transform="rotate(25 42 28)" />
            <circle cx="95" cy="60" r="42" fill="#FF6A1A" />
            <circle cx="95" cy="60" r="34" fill="#FFB27A" />
            <g stroke="#FFF3E6" strokeWidth="2" opacity="0.9">
              <line x1="95" y1="26" x2="95" y2="94" />
              <line x1="61" y1="60" x2="129" y2="60" />
              <line x1="71" y1="36" x2="119" y2="84" />
              <line x1="119" y1="36" x2="71" y2="84" />
            </g>
            <circle cx="95" cy="60" r="6" fill="#FFE0B2" />
          </svg>
        </div>

        {/* Header */}
        <div className="relative pt-12 pb-4 text-center">
          <h1 className="text-[26px] font-extrabold" style={{ color: ORANGE_DARK }}>Plan Store</h1>
        </div>

        {/* Tabs */}
        <div className="px-5">
          <div
            className="flex p-1.5 rounded-full"
            style={{ background: '#fff', boxShadow: '0 4px 14px rgba(242,90,0,0.12)' }}
          >
            {(['daily', 'vip'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3 rounded-full text-[16px] font-bold transition-all"
                  style={{
                    background: isActive ? BTN_GRAD : 'transparent',
                    color: isActive ? '#fff' : ORANGE_DARK,
                    boxShadow: isActive ? '0 6px 16px rgba(242,90,0,0.35)' : 'none',
                  }}
                >
                  {tab === 'daily' ? 'Daily Plan' : 'Welfare Plan'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards */}
        <div className="px-5 pt-6 pb-8 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-9 h-9 animate-spin" style={{ color: ORANGE }} />
            </div>
          ) : products && products.length > 0 ? (
            products.map((product, idx) => {
              const isSpecial = product.is_special_offer || idx === 0;
              const label = isSpecial ? 'Special plan' : (product.description || product.name);
              return (
                <div
                  key={product.id}
                  className="rounded-[24px] overflow-hidden bg-white"
                  style={{ boxShadow: '0 8px 24px rgba(242,90,0,0.10)' }}
                >
                  {/* Top badge row */}
                  <div className="flex items-start justify-between px-5 pt-5">
                    <div
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white font-bold text-[14px]"
                      style={{ background: BTN_GRAD }}
                    >
                      {isSpecial && <Leaf className="w-4 h-4" fill="#4CAF50" stroke="#4CAF50" />}
                      <span>{label}</span>
                    </div>
                    <div
                      className="px-4 py-2 rounded-full text-white font-bold text-[14px]"
                      style={{ background: BTN_GRAD }}
                    >
                      Days: {product.duration_days}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex items-center px-5 pt-3 pb-2 gap-3">
                    <div className="shrink-0 w-[130px] h-[130px] flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-2xl flex items-center justify-center"
                          style={{ background: '#FFE3C5' }}
                        >
                          <span className="text-xs font-bold text-center px-1" style={{ color: ORANGE }}>
                            {product.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex justify-around">
                      <div className="text-center">
                        <p className="text-[22px] font-extrabold leading-tight" style={{ color: ORANGE }}>
                          ₹{product.daily_income.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[12px] mt-1 text-gray-600 font-medium">Daily Income</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[22px] font-extrabold leading-tight" style={{ color: ORANGE }}>
                          ₹{product.total_income.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[12px] mt-1 text-gray-600 font-medium">Total Income</p>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="px-5 pb-4">
                    <p className="text-[20px] font-extrabold text-center text-gray-900">
                      Price: ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Buy Now button */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => handleInvest(product)}
                      disabled={investingProductId === product.id}
                      className="w-full text-white font-bold text-[18px] transition-all active:scale-[0.98] disabled:opacity-60"
                      style={{
                        height: 56,
                        borderRadius: 999,
                        background: investingProductId === product.id ? '#9CA3AF' : BTN_GRAD,
                        boxShadow: investingProductId === product.id ? 'none' : '0 8px 20px rgba(242,90,0,0.32)',
                      }}
                    >
                      {investingProductId === product.id ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" /> Investing...
                        </span>
                      ) : 'Buy Now'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-gray-500">No products available</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Products;
