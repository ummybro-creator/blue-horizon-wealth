import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { toast } from 'sonner';
import { LazyImage } from '@/components/ui/LazyImage';

const ORANGE = '#FF6A00';
const ORANGE_GRAD = 'linear-gradient(180deg, #FF9A26 0%, #F97008 55%, #F26400 100%)';
const GREEN_GRAD = 'linear-gradient(180deg, #55B45A 0%, #35953C 100%)';
const BTN_SHADOW = '0 10px 22px rgba(249,112,8,0.42), inset 0 1px 0 rgba(255,255,255,0.45)';
const FONT = "'Poppins', sans-serif";

const Products = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'daily' | 'vip'>('daily');
  const [investingProductId, setInvestingProductId] = useState<string | null>(null);

  const { data: productsRaw, isLoading } = useProducts(activeTab);

  const products = productsRaw ? (() => {
    if (activeTab !== 'daily') return productsRaw;
    const pinned = productsRaw.find((p) => Number(p.price) === 294);
    if (!pinned) return productsRaw;
    return [pinned, ...productsRaw.filter((p) => p.id !== pinned.id)];
  })() : productsRaw;

  const createInvestment = useCreateInvestment();

  const handleInvest = async (product: Product) => {
    setInvestingProductId(product.id);
    try {
      await createInvestment.mutateAsync(product.id);
      toast.success('Investment successful!', {
        description: `You invested ₹${product.price.toLocaleString('en-IN')} in ${product.name}`,
      });
    } catch (error: any) {
      const msg: string = error?.message || 'Please try again.';
      if (msg.toLowerCase().includes('insufficient')) {
        toast.error('Insufficient Deposit Balance', { description: msg });
        navigate('/recharge');
      } else {
        toast.error('Investment failed', { description: msg });
      }
    } finally {
      setInvestingProductId(null);
    }
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: FONT, background: '#F6F2F0' }}>
        {/* Orange arc backdrop behind tab bar */}
        <div
          className="absolute left-0 right-0 top-0 pointer-events-none"
          style={{
            height: 150,
            background: 'linear-gradient(180deg, #FF7A00 0%, #F96A00 100%)',
            borderBottomLeftRadius: '46% 100%',
            borderBottomRightRadius: '46% 100%',
          }}
        />

        {/* ── Tab Bar ── */}
        <div className="relative px-4 pt-5">
          <div
            className="flex"
            style={{
              padding: 8,
              borderRadius: 30,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.86) 100%)',
              backdropFilter: 'blur(22px) saturate(150%)',
              WebkitBackdropFilter: 'blur(22px) saturate(150%)',
              border: '1.5px solid rgba(255,255,255,0.85)',
              boxShadow:
                '0 12px 30px rgba(249,112,8,0.20), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            {(['daily', 'vip'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 transition-all duration-300 active:scale-[0.985]"
                  style={{
                    height: 54,
                    borderRadius: 22,
                    fontSize: 19,
                    fontWeight: 700,
                    letterSpacing: '-0.2px',
                    color: isActive ? '#FFFFFF' : '#8A8A8A',
                    background: isActive ? ORANGE_GRAD : 'transparent',
                    border: isActive ? '1.5px solid rgba(255,255,255,0.75)' : '1.5px solid transparent',
                    boxShadow: isActive ? BTN_SHADOW : 'none',
                  }}
                >
                  {tab === 'daily' ? 'Daily Plan' : 'Welflare Plan'}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="relative px-4 pt-6 pb-8" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-9 h-9 animate-spin" style={{ color: ORANGE }} />
            </div>
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                label={product.description || product.name}
                isInvesting={investingProductId === product.id}
                onInvest={handleInvest}
              />
            ))
          ) : (
            <div className="text-center py-16 text-base font-medium" style={{ color: '#8A8A8A' }}>
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
}

function ProductCard({ product, label, isInvesting, onInvest }: CardProps) {
  return (
    <div
      className="relative"
      style={{
        borderRadius: 28,
        paddingTop: 62,
        background: 'linear-gradient(155deg, rgba(255,255,255,0.94) 0%, rgba(250,245,242,0.86) 100%)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        border: '1.5px solid rgba(255,255,255,0.9)',
        boxShadow:
          '0 18px 40px rgba(203,150,110,0.20), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)',
      }}
    >
      {/* Orange label badge — top-left, overlapping edge */}
      <div
        className="absolute text-white"
        style={{
          top: -6,
          left: -4,
          padding: '13px 20px',
          borderRadius: 22,
          fontSize: 20,
          fontWeight: 700,
          lineHeight: 1,
          background: ORANGE_GRAD,
          border: '1.5px solid rgba(255,255,255,0.6)',
          boxShadow: '0 10px 22px rgba(249,112,8,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
          maxWidth: '62%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>

      {/* Green Days badge — top-right, overlapping edge */}
      <div
        className="absolute text-white"
        style={{
          top: -6,
          right: -4,
          padding: '13px 18px',
          borderRadius: 22,
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1,
          background: GREEN_GRAD,
          border: '1.5px solid rgba(255,255,255,0.45)',
          boxShadow: '0 10px 22px rgba(53,149,60,0.35), inset 0 1px 0 rgba(255,255,255,0.35)',
        }}
      >
        Days: {product.duration_days}
      </div>

      {/* Body: image + income stats */}
      <div className="flex items-center gap-2 px-4">
        <div className="shrink-0" style={{ width: 130, height: 130 }}>
          {product.image_url ? (
            <LazyImage
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-contain"
              wrapperClassName="w-full h-full"
              wrapperStyle={{ filter: 'drop-shadow(0 14px 18px rgba(90,60,40,0.28))' }}
              fallback={<ImgFallback name={product.name} />}
            />
          ) : (
            <ImgFallback name={product.name} />
          )}
        </div>

        <div className="flex-1 flex items-stretch">
          <StatBlock value={product.daily_income} label="Daily Income" />
          <div className="w-px self-stretch" style={{ background: 'rgba(0,0,0,0.10)', margin: '10px 0' }} />
          <StatBlock value={product.total_income} label="Total Income" />
        </div>
      </div>

      {/* Price */}
      <div className="px-5" style={{ paddingTop: 14 }}>
        <p className="text-center" style={{ color: '#3A3A3A', fontSize: 27, fontWeight: 700, letterSpacing: '-0.4px' }}>
          Price: ₹{product.price.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Buy Now */}
      <div style={{ padding: '16px 22px 22px' }}>
        <button
          onClick={() => onInvest(product)}
          disabled={isInvesting}
          className="w-full text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{
            height: 62,
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 700,
            background: isInvesting ? '#9CA3AF' : ORANGE_GRAD,
            border: '1.5px solid rgba(255,255,255,0.5)',
            boxShadow: isInvesting ? 'none' : BTN_SHADOW,
          }}
        >
          {isInvesting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Investing...
            </span>
          ) : (
            'Buy Now'
          )}
        </button>
      </div>
    </div>
  );
}

function StatBlock({ value, label }: { value: number; label: string }) {
  const [first, second] = label.split(' ');
  return (
    <div className="flex-1 px-2">
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span style={{ color: ORANGE, fontSize: 27, fontWeight: 700, lineHeight: 1.1 }}>
          ₹{Number(value).toLocaleString('en-IN')}
        </span>
        <span style={{ color: '#8A8A8A', fontSize: 16, fontWeight: 500 }}>{first}</span>
      </div>
      <p style={{ color: '#8A8A8A', fontSize: 16, fontWeight: 500, marginTop: 6 }}>{second}</p>
    </div>
  );
}

function ImgFallback({ name }: { name: string }) {
  return (
    <div className="w-full h-full rounded-2xl flex items-center justify-center" style={{ background: '#FFE3C5' }}>
      <span className="text-xs font-bold text-center px-2" style={{ color: ORANGE }}>
        {name}
      </span>
    </div>
  );
}

export default Products;
