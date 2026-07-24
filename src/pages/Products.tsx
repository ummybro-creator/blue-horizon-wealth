import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/* ── Design tokens (Warm Glass UI Kit) ─────────────────────────────── */
const OG4  = '#FF9A4D';   // orange-400
const OG5  = '#FF7A1A';   // orange-500
const OG6  = '#F5690A';   // orange-600
const GR5  = '#3FA84A';   // green-500
const GR6  = '#2E8C3B';   // green-600

const BTN_GRAD   = `linear-gradient(180deg, ${OG4} 0%, ${OG5} 60%, ${OG6} 100%)`;
const TAB_GRAD   = `linear-gradient(180deg, #FFA85C 0%, ${OG5} 100%)`;
const BADGE_GRAD = `linear-gradient(135deg, ${OG4}, ${OG5})`;
const GREEN_GRAD = `linear-gradient(135deg, #4FB85A, ${GR6})`;

const BTN_SHADOW   = `0 8px 20px rgba(255,122,26,0.45), inset 0 1px 2px rgba(255,255,255,0.4)`;
const GREEN_SHADOW = `0 4px 10px rgba(63,168,74,0.35)`;
const CARD_SHADOW  = `0 12px 24px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)`;

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
      {/* ── Page background: warm radial gradient ── */}
      <div
        className="min-h-screen"
        style={{
          background: 'radial-gradient(circle at top left, #FF9A4D 0%, #FDEDE6 40%)',
          fontFamily: "'Poppins', -apple-system, sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div className="pt-10 pb-4 text-center px-5">
          <h1
            className="text-[22px] font-extrabold tracking-tight"
            style={{ color: '#2B2B2B' }}
          >
            Plan Store
          </h1>
        </div>

        {/* ── Tab Bar ── */}
        <div className="px-5 mb-6">
          <div
            style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.7)',
              borderRadius: 28,
              padding: 6,
              height: 64,
              alignItems: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            {(['daily', 'vip'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 transition-all duration-200"
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    background: isActive ? TAB_GRAD : 'transparent',
                    color: isActive ? '#FFFFFF' : '#8A8A8A',
                    boxShadow: isActive ? '0 6px 14px rgba(255,122,26,0.45)' : 'none',
                    fontWeight: 700,
                    fontSize: 15,
                    fontFamily: "'Poppins', sans-serif",
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab === 'daily' ? 'Daily Plan' : 'Welfare Plan'}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="px-5 pb-10" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: OG5 }} />
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
                  badgeGrad={BADGE_GRAD}
                  greenGrad={GREEN_GRAD}
                  btnShadow={BTN_SHADOW}
                  greenShadow={GREEN_SHADOW}
                  cardShadow={CARD_SHADOW}
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

/* ── Product Card ─────────────────────────────────────────────────── */
interface CardProps {
  product: Product;
  label: string;
  isInvesting: boolean;
  onInvest: (p: Product) => void;
  btnGrad: string;
  badgeGrad: string;
  greenGrad: string;
  btnShadow: string;
  greenShadow: string;
  cardShadow: string;
}

function ProductCard({
  product, label, isInvesting, onInvest,
  btnGrad, badgeGrad, greenGrad, btnShadow, greenShadow, cardShadow,
}: CardProps) {
  return (
    /* outer wrapper for overflow-visible so ribbons can bleed outside card */
    <div className="relative" style={{ paddingTop: 0 }}>
      {/* ── Orange ribbon — top-left, bleeds 8px outside ── */}
      <div
        style={{
          position: 'absolute',
          top: -8,
          left: -8,
          background: badgeGrad,
          boxShadow: '0 4px 12px rgba(255,122,26,0.40)',
          borderRadius: '12px 12px 12px 0',
          padding: '8px 18px',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          fontFamily: "'Poppins', sans-serif",
          lineHeight: 1,
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>

      {/* ── Green ribbon — top-right, bleeds 8px outside ── */}
      <div
        style={{
          position: 'absolute',
          top: -8,
          right: -8,
          background: greenGrad,
          boxShadow: greenShadow,
          borderRadius: '12px 12px 0 12px',
          padding: '8px 18px',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          fontFamily: "'Poppins', sans-serif",
          lineHeight: 1,
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}
      >
        Days: {product.duration_days}
      </div>

      {/* ── Glass card ── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.7)',
          borderRadius: 28,
          boxShadow: cardShadow,
          overflow: 'hidden',
          paddingTop: 28, /* clearance for ribbons */
        }}
      >
        {/* ── Body: image + income stats ── */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 12px', gap: 8 }}>
          {/* Product image */}
          <div
            style={{
              flexShrink: 0,
              width: 130,
              height: 130,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.14))',
            }}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 20,
                  background: '#FFE3C5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: '#FF7A1A', textAlign: 'center', padding: '0 8px' }}>
                  {product.name}
                </span>
              </div>
            )}
          </div>

          {/* Income stats */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'stretch' }}>
            {/* Daily Income */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#FF7A1A', lineHeight: 1, fontFamily: "'Poppins', sans-serif" }}>
                ₹{product.daily_income.toLocaleString('en-IN')}
              </p>
              <p style={{ fontSize: 13, color: '#8A8A8A', textAlign: 'center', marginTop: 6, lineHeight: 1.3, fontFamily: "'Poppins', sans-serif" }}>
                Daily<br />Income
              </p>
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, background: '#E5E0DC', margin: '8px 0' }} />

            {/* Total Income */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#FF7A1A', lineHeight: 1, fontFamily: "'Poppins', sans-serif" }}>
                ₹{product.total_income.toLocaleString('en-IN')}
              </p>
              <p style={{ fontSize: 13, color: '#8A8A8A', textAlign: 'center', marginTop: 6, lineHeight: 1.3, fontFamily: "'Poppins', sans-serif" }}>
                Total<br />Income
              </p>
            </div>
          </div>
        </div>

        {/* ── Price ── */}
        <div style={{ padding: '4px 20px 12px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#2B2B2B', fontFamily: "'Poppins', sans-serif" }}>
            Price:{' '}
            <span style={{ color: '#FF7A1A' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </p>
        </div>

        {/* ── Buy Now button ── */}
        <div style={{ padding: '0 20px 20px' }}>
          <button
            onClick={() => onInvest(product)}
            disabled={isInvesting}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 999,
              border: 'none',
              background: isInvesting ? '#9CA3AF' : btnGrad,
              boxShadow: isInvesting ? 'none' : btnShadow,
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              fontFamily: "'Poppins', sans-serif",
              cursor: isInvesting ? 'not-allowed' : 'pointer',
              opacity: isInvesting ? 0.7 : 1,
              transition: 'transform 0.1s, filter 0.1s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseDown={e => { if (!isInvesting) (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            onTouchStart={e => { if (!isInvesting) (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'; }}
            onTouchEnd={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            {isInvesting ? (
              <>
                <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
                Investing...
              </>
            ) : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Products;
