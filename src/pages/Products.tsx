import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ORANGE       = '#FF6A00';
const BTN_GRAD     = 'linear-gradient(135deg, #FF8A00 0%, #FF6A00 100%)';
const GREEN_GRAD   = 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)';
const BTN_SHADOW   = '0 8px 20px rgba(255,106,0,0.38)';
const GREEN_SHADOW = '0 4px 12px rgba(46,125,50,0.35)';

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
        className="min-h-screen"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* ── Header ── */}
        <div className="pt-12 pb-4 text-center px-5">
          <h1
            className="text-[24px] font-extrabold"
            style={{ color: '#2B2B2B' }}
          >
            Plan Store
          </h1>
        </div>

        {/* ── Tab Bar ── */}
        <div className="px-5 mb-6">
          <div
            className="tab-glass-container flex p-1.5"
            style={{ padding: '6px' }}
          >
            {(['daily', 'vip'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3 rounded-full text-[15px] font-bold transition-all duration-250"
                  style={{
                    background: isActive ? BTN_GRAD : 'transparent',
                    color: isActive ? '#FFFFFF' : '#8A8A8A',
                    boxShadow: isActive ? BTN_SHADOW : 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {tab === 'daily' ? 'Daily Plan' : 'Welfare Plan'}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="px-4 pb-8 space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-9 h-9 animate-spin" style={{ color: ORANGE }} />
            </div>
          ) : products && products.length > 0 ? (
            products.map((product) => {
              const label = product.description || product.name;
              const isInvesting = investingProductId === product.id;
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  label={label}
                  isInvesting={isInvesting}
                  onInvest={handleInvest}
                  btnGrad={BTN_GRAD}
                  greenGrad={GREEN_GRAD}
                  btnShadow={BTN_SHADOW}
                  greenShadow={GREEN_SHADOW}
                  orange={ORANGE}
                />
              );
            })
          ) : (
            <div
              className="text-center py-16 text-base font-medium"
              style={{ color: '#8A8A8A' }}
            >
              No products available
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

/* ── Product Card ── */
interface CardProps {
  product: Product;
  label: string;
  isInvesting: boolean;
  onInvest: (p: Product) => void;
  btnGrad: string;
  greenGrad: string;
  btnShadow: string;
  greenShadow: string;
  orange: string;
}

function ProductCard({ product, label, isInvesting, onInvest, btnGrad, greenGrad, btnShadow, greenShadow, orange }: CardProps) {
  return (
    <div
      className="relative rounded-[24px] overflow-visible"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(255,106,0,0.12), 0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255,255,255,0.75)',
      }}
    >
      {/* ── Top badge row ── */}
      <div className="flex items-start justify-between px-5 pt-5">
        {/* Orange label badge */}
        <div
          className="px-4 py-2 rounded-full text-white font-bold text-[13px] leading-none"
          style={{ background: btnGrad, boxShadow: '0 4px 12px rgba(255,106,0,0.32)', fontFamily: "'Poppins', sans-serif" }}
        >
          {label}
        </div>

        {/* Green "Days" badge — top-right, slightly overflows card edge */}
        <div
          className="px-4 py-2 rounded-full text-white font-bold text-[13px] leading-none"
          style={{
            background: greenGrad,
            boxShadow: greenShadow,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Days: {product.duration_days}
        </div>
      </div>

      {/* ── Body: image + income stats ── */}
      <div className="flex items-center px-4 pt-4 pb-2 gap-2">
        {/* Product image */}
        <div className="shrink-0 w-[120px] h-[120px] flex items-center justify-center">
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
              <span className="text-xs font-bold text-center px-2" style={{ color: orange }}>
                {product.name}
              </span>
            </div>
          )}
        </div>

        {/* Income stats with vertical divider */}
        <div className="flex-1 flex items-stretch">
          {/* Daily Income */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <p
              className="text-[22px] font-extrabold leading-tight"
              style={{ color: orange, fontFamily: "'Poppins', sans-serif" }}
            >
              ₹{product.daily_income.toLocaleString('en-IN')}
            </p>
            <p
              className="text-[11px] mt-1 font-medium text-center"
              style={{ color: '#8A8A8A' }}
            >
              Daily<br />Income
            </p>
          </div>

          {/* Thin vertical divider */}
          <div
            className="w-px self-stretch"
            style={{ background: '#E5E7EB', margin: '4px 0' }}
          />

          {/* Total Income */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <p
              className="text-[22px] font-extrabold leading-tight"
              style={{ color: orange, fontFamily: "'Poppins', sans-serif" }}
            >
              ₹{product.total_income.toLocaleString('en-IN')}
            </p>
            <p
              className="text-[11px] mt-1 font-medium text-center"
              style={{ color: '#8A8A8A' }}
            >
              Total<br />Income
            </p>
          </div>
        </div>
      </div>

      {/* ── Price ── */}
      <div className="px-5 pb-3">
        <p
          className="text-[18px] font-extrabold text-center"
          style={{ color: '#2B2B2B', fontFamily: "'Poppins', sans-serif" }}
        >
          Price: ₹{product.price.toLocaleString('en-IN')}
        </p>
      </div>

      {/* ── Buy Now button ── */}
      <div className="px-4 pb-5">
        <button
          onClick={() => onInvest(product)}
          disabled={isInvesting}
          className="w-full text-white font-bold text-[17px] transition-all active:scale-[0.98] disabled:opacity-60"
          style={{
            height: 54,
            borderRadius: 999,
            background: isInvesting ? '#9CA3AF' : btnGrad,
            boxShadow: isInvesting ? 'none' : btnShadow,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {isInvesting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Investing...
            </span>
          ) : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}

export default Products;
