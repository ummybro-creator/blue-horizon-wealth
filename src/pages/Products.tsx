import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/* ─── Exact spec tokens ─────────────────────────────────── */
const FONT       = "'Poppins', 'Nunito', sans-serif";
const BTN_GRAD   = 'linear-gradient(135deg, #FF9A2E 0%, #FF6A00 100%)';
const GREEN_GRAD = 'linear-gradient(135deg, #57C25C, #2E7D32)';

/* Tab container */
const TAB_WRAP: React.CSSProperties = {
  borderRadius: 32,
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 8px 24px rgba(255,138,0,0.15)',
  padding: 6,
  display: 'flex',
};

/* Card */
const CARD: React.CSSProperties = {
  borderRadius: 28,
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.9)',
  boxShadow: '0 20px 40px rgba(255,150,80,0.18)',
  padding: 24,
  paddingTop: 32,          /* extra headroom so content sits below the -14px badges */
  position: 'relative',
};

/* Top-left name badge */
const NAME_BADGE: React.CSSProperties = {
  position: 'absolute',
  top: -14,
  left: 16,
  borderRadius: 18,
  padding: '10px 20px',
  background: BTN_GRAD,
  color: '#FFFFFF',
  fontWeight: 700,
  fontSize: 15,
  boxShadow: '0 6px 12px rgba(255,106,0,0.35)',
  fontFamily: FONT,
  whiteSpace: 'nowrap',
};

/* Top-right days badge */
const DAYS_BADGE: React.CSSProperties = {
  position: 'absolute',
  top: -14,
  right: -6,
  borderRadius: '16px 16px 0 16px',
  padding: '10px 18px',
  background: GREEN_GRAD,
  color: '#FFFFFF',
  fontWeight: 700,
  fontSize: 15,
  boxShadow: '0 6px 12px rgba(46,125,50,0.3)',
  fontFamily: FONT,
  whiteSpace: 'nowrap',
};

const Products = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'daily' | 'vip'>('daily');
  const [investingProductId, setInvestingProductId] = useState<string | null>(null);

  const { data: productsRaw, isLoading } = useProducts(activeTab);

  /* Pin ₹294 plan to top for daily tab */
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
      {/* ── Screen background + orange top glow ── */}
      <div
        className="min-h-screen relative"
        style={{ background: 'linear-gradient(180deg, #FFEDE3 0%, #FDF2EC 100%)', fontFamily: FONT }}
      >
        {/* Orange blob: top-left + top-right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(255,138,0,0.55), transparent 60%), ' +
              'radial-gradient(circle at top right, rgba(255,138,0,0.38), transparent 55%)',
          }}
        />

        {/* ── Header ── */}
        <div className="relative z-10 pt-12 pb-4 text-center px-5">
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#2B2B2B', fontFamily: FONT }}>
            Plan Store
          </h1>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="relative z-10 px-5 mb-8">
          <div style={TAB_WRAP}>
            {(['daily', 'vip'] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 transition-all duration-200"
                  style={{
                    borderRadius: 26,
                    padding: '14px 28px',
                    background: active ? BTN_GRAD : 'transparent',
                    color: active ? '#FFFFFF' : '#8A8A8A',
                    fontWeight: active ? 700 : 600,
                    fontSize: 16,
                    fontFamily: FONT,
                    boxShadow: active ? '0 6px 14px rgba(255,106,0,0.4)' : 'none',
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

        {/* ── Product Cards ── */}
        <div className="relative z-10 px-4 pb-10">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-9 h-9 animate-spin" style={{ color: '#FF6A00' }} />
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
                />
              );
            })
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 64, color: '#8A8A8A', fontSize: 15, fontWeight: 500 }}>
              No products available
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

/* ── Product Card ──────────────────────────────────────────── */
interface CardProps {
  product: Product;
  label: string;
  isInvesting: boolean;
  onInvest: (p: Product) => void;
}

function ProductCard({ product, label, isInvesting, onInvest }: CardProps) {
  const FONT = "'Poppins', 'Nunito', sans-serif";

  return (
    /* Outer wrapper: margin-top gives vertical room so the -14px badge is fully visible */
    <div style={{ position: 'relative', marginTop: 24, marginBottom: 20 }}>
      <div style={CARD}>

        {/* ── Top-left badge: product name ── */}
        <div style={NAME_BADGE}>{label}</div>

        {/* ── Top-right badge: days ── */}
        <div style={DAYS_BADGE}>Days: {product.duration_days}</div>

        {/* ── Body: image (left) + income stats (right) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
          {/* Product image — plain cutout, no shadow, no container */}
          <div style={{ width: '40%', flexShrink: 0 }}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 16,
                  background: '#FFE3C5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', textAlign: 'center', padding: '0 6px' }}>
                  {product.name}
                </span>
              </div>
            )}
          </div>

          {/* Income columns */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            {/* Daily Income */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#FF6A00', fontFamily: FONT, lineHeight: 1.1 }}>
                ₹{product.daily_income.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#9B9B9B', marginTop: 4, lineHeight: 1.2, textAlign: 'center', fontFamily: FONT }}>
                Daily<br />Income
              </span>
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, height: 40, background: '#E0D5CD', flexShrink: 0 }} />

            {/* Total Income */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#FF6A00', fontFamily: FONT, lineHeight: 1.1 }}>
                ₹{product.total_income.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#9B9B9B', marginTop: 4, lineHeight: 1.2, textAlign: 'center', fontFamily: FONT }}>
                Total<br />Income
              </span>
            </div>
          </div>
        </div>

        {/* ── Price ── */}
        <p style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#2B2B2B',
          textAlign: 'center',
          margin: '20px 0',
          fontFamily: FONT,
        }}>
          Price: ₹{product.price.toLocaleString('en-IN')}
        </p>

        {/* ── Buy Now button ── */}
        <button
          onClick={() => onInvest(product)}
          disabled={isInvesting}
          style={{
            width: '100%',
            borderRadius: 999,
            padding: 16,
            background: isInvesting ? '#9CA3AF' : 'linear-gradient(135deg, #FF9A2E, #FF6A00)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 17,
            fontFamily: FONT,
            boxShadow: isInvesting ? 'none' : '0 10px 20px rgba(255,106,0,0.35)',
            border: 'none',
            cursor: isInvesting ? 'not-allowed' : 'pointer',
            opacity: isInvesting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
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
  );
}

export default Products;
